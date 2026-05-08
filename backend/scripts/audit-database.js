import { allCrudResources } from '../src/config/resources.js'
import { env } from '../src/config/env.js'
import { closePool, getPool } from '../src/db/pool.js'
import { toSnakeCase } from '../src/shared/utils/case-converters.js'

const numberHints = [
  'amount',
  'atRiskHours',
  'cost',
  'costPerKm',
  'creditLimit',
  'creditUsed',
  'estimatedCost',
  'estimatedHours',
  'estimatedKm',
  'everyDays',
  'everyKm',
  'estimatedMinutes',
  'fuelLevel',
  'grossMargin',
  'hourlyRate',
  'km',
  'kmPerLiter',
  'kmRate',
  'kmUsed',
  'laborHours',
  'latitude',
  'liters',
  'loadCapacityKg',
  'longitude',
  'marginPercent',
  'marginPercentage',
  'monthlyCost',
  'netMargin',
  'odometer',
  'price',
  'pricePerLiter',
  'purchaseCost',
  'quantity',
  'rating',
  'rate',
  'revenue',
  'revenuePerKm',
  'score',
  'speed',
  'stock',
  'subtotal',
  'taxAmount',
  'targetHours',
  'total',
  'unitCost',
  'unitPrice',
  'volumeM3',
  'waitingHours',
  'weightKg',
  'percent',
]

const integerHints = [
  'activeCases',
  'averageDeliveryDays',
  'capacity',
  'deliveryTimeDays',
  'everyDays',
  'everyKm',
  'fuelLevel',
  'idleMinutes',
  'maxCases',
  'minStock',
  'odometer',
  'quantity',
  'score',
  'stock',
  'paymentTermsDays',
  'year',
]

async function auditDatabase() {
  const pool = await getPool()
  const [tableResult, columnResult, indexResult] = await Promise.all([
    pool.request().query(`
      SELECT tables.name AS table_name
      FROM sys.tables tables
      JOIN sys.schemas schemas ON tables.schema_id = schemas.schema_id
      WHERE schemas.name = N'dbo';
    `),
    pool.request().query(`
      SELECT
        tables.name AS table_name,
        columns.name AS column_name,
        types.name AS data_type,
        columns.max_length,
        columns.precision,
        columns.scale,
        columns.is_nullable
      FROM sys.columns columns
      JOIN sys.tables tables ON columns.object_id = tables.object_id
      JOIN sys.schemas schemas ON tables.schema_id = schemas.schema_id
      JOIN sys.types types ON columns.user_type_id = types.user_type_id
      WHERE schemas.name = N'dbo';
    `),
    pool.request().query(`
      SELECT
        tables.name AS table_name,
        indexes.name AS index_name
      FROM sys.indexes indexes
      JOIN sys.tables tables ON indexes.object_id = tables.object_id
      JOIN sys.schemas schemas ON tables.schema_id = schemas.schema_id
      WHERE schemas.name = N'dbo' AND indexes.name IS NOT NULL;
    `),
  ])

  const actualTables = new Set(tableResult.recordset.map((row) => row.table_name))
  const actualColumns = new Map()
  const actualIndexes = new Map()

  for (const row of columnResult.recordset) {
    actualColumns.set(`${row.table_name}.${row.column_name}`, row)
  }

  for (const row of indexResult.recordset) {
    const list = actualIndexes.get(row.table_name) || []
    list.push(row.index_name)
    actualIndexes.set(row.table_name, list)
  }

  const issues = []
  const duplicateTables = allCrudResources
    .map((resource) => resource.table)
    .filter((table, index, tables) => tables.indexOf(table) !== index)

  for (const table of new Set(duplicateTables)) {
    issues.push({ severity: 'error', type: 'DUPLICATE_RESOURCE_TABLE', table })
  }

  for (const resource of allCrudResources) {
    if (!actualTables.has(resource.table)) {
      issues.push({ resource: resource.name, severity: 'error', table: resource.table, type: 'MISSING_TABLE' })
      continue
    }

    if (!actualColumns.has(`${resource.table}.deleted_at`)) {
      issues.push({ resource: resource.name, severity: 'error', table: resource.table, column: 'deleted_at', type: 'MISSING_SOFT_DELETE_COLUMN' })
    }

    for (const field of resource.fields) {
      const column = resource.fieldMap?.[field] || toSnakeCase(field)
      const actual = actualColumns.get(`${resource.table}.${column}`)

      if (!actual) {
        issues.push({ resource: resource.name, severity: 'error', table: resource.table, column, field, type: 'MISSING_COLUMN' })
        continue
      }

      const expected = inferColumnType(field, resource)
      const typeIssue = compareType(expected, actual)

      if (typeIssue) {
        issues.push({
          actual: describeActualType(actual),
          column,
          expected,
          field,
          resource: resource.name,
          severity: typeIssue.safeToAutoFix ? 'warning' : 'info',
          table: resource.table,
          type: typeIssue.type,
        })
      }
    }

    const indexes = new Set(actualIndexes.get(resource.table) || [])

    for (const field of [...new Set([...(resource.filterFields || []), ...(resource.sortFields || [])])].filter((field) => resource.fields.includes(field)).slice(0, 8)) {
      const column = resource.fieldMap?.[field] || toSnakeCase(field)
      const indexName = `IX_${resource.table}_${column}`.slice(0, 120)

      if (!indexes.has(indexName)) {
        issues.push({ resource: resource.name, severity: 'warning', table: resource.table, index: indexName, type: 'MISSING_INDEX' })
      }
    }
  }

  const resourceTables = new Set(allCrudResources.map((resource) => resource.table))
  const extraTables = [...actualTables].filter((table) => !resourceTables.has(table))

  const dataIssues = await auditDataConsistency(pool, actualTables, actualColumns)
  const rowCounts = await getRowCounts(pool, [...resourceTables].filter((table) => actualTables.has(table)))

  return {
    database: env.sql.database,
    extraTables,
    issues: [...issues, ...dataIssues],
    resources: allCrudResources.length,
    rowCounts,
    tables: actualTables.size,
  }
}

async function auditDataConsistency(pool, actualTables, actualColumns) {
  const issues = []
  const jsonChecks = allCrudResources.flatMap((resource) =>
    (resource.jsonFields || []).map((field) => ({
      column: resource.fieldMap?.[field] || toSnakeCase(field),
      field,
      resource: resource.name,
      table: resource.table,
    })),
  )

  for (const check of jsonChecks) {
    if (!actualTables.has(check.table) || !actualColumns.has(`${check.table}.${check.column}`)) {
      continue
    }

    const result = await pool.request().query(`
      SELECT TOP 5 [id], [${check.column}] AS value
      FROM [dbo].[${check.table}]
      WHERE [deleted_at] IS NULL
        AND [${check.column}] IS NOT NULL
        AND [${check.column}] <> N''
        AND ISJSON([${check.column}]) <> 1;
    `)

    for (const row of result.recordset) {
      issues.push({
        column: check.column,
        id: row.id,
        resource: check.resource,
        severity: 'error',
        table: check.table,
        type: 'INVALID_JSON',
      })
    }
  }

  for (const relation of relationships) {
    if (!actualTables.has(relation.table) || !actualColumns.has(`${relation.table}.${relation.column}`)) {
      continue
    }

    const availableTargetTables = relation.targetTables.filter((table) => actualTables.has(table))

    if (!availableTargetTables.length) {
      issues.push({ ...relation, severity: 'error', type: 'MISSING_RELATION_TARGET_TABLE' })
      continue
    }

    const existsExpression = availableTargetTables
      .map((table) => `EXISTS (SELECT 1 FROM [dbo].[${table}] target WHERE target.[id] = source.[${relation.column}] AND target.[deleted_at] IS NULL)`)
      .join(' OR ')

    const result = await pool.request().query(`
      SELECT TOP 10 source.[id], source.[${relation.column}] AS value
      FROM [dbo].[${relation.table}] source
      WHERE source.[deleted_at] IS NULL
        AND source.[${relation.column}] IS NOT NULL
        AND source.[${relation.column}] <> N''
        AND NOT (${existsExpression});
    `)

    for (const row of result.recordset) {
      issues.push({
        column: relation.column,
        id: row.id,
        referencedValue: row.value,
        resource: relation.resource,
        severity: relation.required ? 'error' : 'warning',
        table: relation.table,
        targetTables: availableTargetTables,
        type: 'ORPHAN_REFERENCE',
      })
    }
  }

  for (const uniqueCheck of uniqueChecks) {
    if (!actualTables.has(uniqueCheck.table) || !actualColumns.has(`${uniqueCheck.table}.${uniqueCheck.column}`)) {
      continue
    }

    const result = await pool.request().query(`
      SELECT [${uniqueCheck.column}] AS value, COUNT(1) AS total
      FROM [dbo].[${uniqueCheck.table}]
      WHERE [deleted_at] IS NULL
        AND [${uniqueCheck.column}] IS NOT NULL
        AND [${uniqueCheck.column}] <> N''
      GROUP BY [${uniqueCheck.column}]
      HAVING COUNT(1) > 1;
    `)

    for (const row of result.recordset) {
      issues.push({
        column: uniqueCheck.column,
        referencedValue: row.value,
        resource: uniqueCheck.resource,
        severity: 'warning',
        table: uniqueCheck.table,
        total: Number(row.total || 0),
        type: 'DUPLICATE_OPERATIONAL_KEY',
      })
    }
  }

  if (actualTables.has('user_role_assignments') && actualTables.has('roles')) {
    const result = await pool.request().query(`
      SELECT TOP 10 users.[id], users.[role_code] AS value
      FROM [dbo].[user_role_assignments] users
      WHERE users.[deleted_at] IS NULL
        AND users.[role_code] IS NOT NULL
        AND users.[role_code] <> N''
        AND NOT EXISTS (
          SELECT 1
          FROM [dbo].[roles] roles
          WHERE roles.[code] = users.[role_code]
            AND roles.[deleted_at] IS NULL
        );
    `)

    for (const row of result.recordset) {
      issues.push({
        column: 'role_code',
        id: row.id,
        referencedValue: row.value,
        resource: 'user-role-assignments',
        severity: 'error',
        table: 'user_role_assignments',
        targetTables: ['roles'],
        type: 'ORPHAN_ROLE_CODE',
      })
    }
  }

  return issues
}

async function getRowCounts(pool, tables) {
  const counts = []

  for (const table of tables) {
    const request = pool.request()
    const result = await request.query(`SELECT COUNT(1) AS total FROM [dbo].[${table}] WHERE [deleted_at] IS NULL;`)
    counts.push({ table, total: Number(result.recordset[0]?.total || 0) })
  }

  return counts
}

function compareType(expected, actual) {
  const normalizedExpected = expected.toLowerCase()
  const actualType = String(actual.data_type).toLowerCase()

  if (normalizedExpected.startsWith('nvarchar')) {
    if (actualType !== 'nvarchar') {
      return { safeToAutoFix: false, type: 'TYPE_MISMATCH_TEXT' }
    }

    return null
  }

  if (normalizedExpected === 'datetime2') {
    return actualType === 'datetime2' ? null : { safeToAutoFix: false, type: 'TYPE_MISMATCH_DATE' }
  }

  if (normalizedExpected === 'bit') {
    return actualType === 'bit' ? null : { safeToAutoFix: false, type: 'TYPE_MISMATCH_BOOLEAN' }
  }

  if (normalizedExpected === 'int') {
    return actualType === 'int' ? null : { safeToAutoFix: false, type: 'TYPE_MISMATCH_INTEGER' }
  }

  if (normalizedExpected.startsWith('decimal')) {
    if (!['decimal', 'numeric', 'int', 'bigint', 'smallint', 'tinyint', 'float', 'real', 'money', 'smallmoney'].includes(actualType)) {
      return { safeToAutoFix: false, type: 'TYPE_MISMATCH_NUMBER' }
    }

    return null
  }

  return null
}

function describeActualType(actual) {
  if (actual.data_type === 'nvarchar') {
    return actual.max_length === -1 ? 'NVARCHAR(MAX)' : `NVARCHAR(${actual.max_length / 2})`
  }

  if (actual.data_type === 'decimal' || actual.data_type === 'numeric') {
    return `${actual.data_type.toUpperCase()}(${actual.precision}, ${actual.scale})`
  }

  return String(actual.data_type).toUpperCase()
}

function inferColumnType(field, resource) {
  if (resource.jsonFields?.includes(field)) {
    return 'NVARCHAR(MAX)'
  }

  if (field.endsWith('At') || field.endsWith('Date') || field === 'date' || field === 'validUntil' || field === 'expiresAt') {
    return 'DATETIME2'
  }

  if (
    field.startsWith('is') ||
    field.startsWith('has') ||
    field.startsWith('requires') ||
    field.endsWith('Enabled') ||
    field.endsWith('Ok') ||
    field === 'active' ||
    field === 'newDamages' ||
    field === 'approvalRequired' ||
    field === 'safetyImpact' ||
    field === 'immobilized' ||
    field === 'outlookSaveToSentItems' ||
    field === 'sentByIntegration'
  ) {
    return 'BIT'
  }

  if (field.endsWith('Type')) {
    return 'NVARCHAR(255)'
  }

  if (field === 'unreadCount') {
    return 'INT'
  }

  if (integerHints.some((hint) => field.toLowerCase().includes(hint.toLowerCase()))) {
    return 'INT'
  }

  if (numberHints.some((hint) => field.toLowerCase().includes(hint.toLowerCase()))) {
    return 'DECIMAL(18, 4)'
  }

  if (field.endsWith('Id') || field === 'id') {
    return 'NVARCHAR(80)'
  }

  if (field.endsWith('Email')) {
    return 'NVARCHAR(180)'
  }

  if (field.endsWith('Number') || field.endsWith('Code') || field === 'code' || field === 'sku') {
    return 'NVARCHAR(80)'
  }

  if (field === 'description' || field === 'notes' || field === 'comment' || field === 'failureDescription' || field === 'closureSummary' || field === 'observations' || field === 'body' || field === 'message' || field === 'signature' || field === 'lastMessagePreview' || field === 'errorMessage') {
    return 'NVARCHAR(MAX)'
  }

  return 'NVARCHAR(255)'
}

const relationships = [
  { column: 'case_id', resource: 'assignments', table: 'assignments', targetTables: ['workshop_cases'], required: true },
  { column: 'mechanic_id', resource: 'assignments', table: 'assignments', targetTables: ['mechanics'], required: true },
  { column: 'case_id', resource: 'escalation-events', table: 'escalation_events', targetTables: ['workshop_cases'], required: true },
  { column: 'case_id', resource: 'diagnostics', table: 'diagnostics', targetTables: ['workshop_cases'], required: true },
  { column: 'driver_id', resource: 'driver-documents', table: 'driver_documents', targetTables: ['drivers'], required: true },
  { column: 'driver_id', resource: 'driver-fines', table: 'driver_fines', targetTables: ['drivers'], required: true },
  { column: 'truck_id', resource: 'driver-fines', table: 'driver_fines', targetTables: ['fleet_trucks', 'trucks'], required: false },
  { column: 'incident_id', resource: 'driver-fines', table: 'driver_fines', targetTables: ['incidents'], required: false },
  { column: 'freight_id', resource: 'driver-fines', table: 'driver_fines', targetTables: ['freight_requests'], required: false },
  { column: 'specialty_id', resource: 'mechanics', table: 'mechanics', targetTables: ['mechanic_specialties'], required: false },
  { column: 'assigned_driver_id', resource: 'fleet-trucks', table: 'fleet_trucks', targetTables: ['drivers'], required: false },
  { column: 'next_freight_id', resource: 'fleet-trucks', table: 'fleet_trucks', targetTables: ['freight_requests'], required: false },
  { column: 'truck_id', resource: 'fleet-availability', table: 'fleet_availability', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'truck_id', resource: 'truck-health-scores', table: 'truck_health_scores', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'truck_id', resource: 'truck-timeline-events', table: 'truck_timeline_events', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'customer_id', resource: 'freight-requests', table: 'freight_requests', targetTables: ['customers'], required: false },
  { column: 'quote_id', resource: 'freight-requests', table: 'freight_requests', targetTables: ['freight_quotes'], required: false },
  { column: 'assigned_truck_id', resource: 'freight-requests', table: 'freight_requests', targetTables: ['fleet_trucks', 'trucks'], required: false },
  { column: 'assigned_driver_id', resource: 'freight-requests', table: 'freight_requests', targetTables: ['drivers'], required: false },
  { column: 'request_id', resource: 'freight-quotes', table: 'freight_quotes', targetTables: ['freight_requests'], required: false },
  { column: 'customer_id', resource: 'freight-quotes', table: 'freight_quotes', targetTables: ['customers'], required: false },
  { column: 'request_id', resource: 'freight-assignments', table: 'freight_assignments', targetTables: ['freight_requests'], required: true },
  { column: 'quote_id', resource: 'freight-assignments', table: 'freight_assignments', targetTables: ['freight_quotes'], required: false },
  { column: 'truck_id', resource: 'freight-assignments', table: 'freight_assignments', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'driver_id', resource: 'freight-assignments', table: 'freight_assignments', targetTables: ['drivers'], required: true },
  { column: 'freight_id', resource: 'freight-profitability', table: 'freight_profitability', targetTables: ['freight_requests'], required: true },
  { column: 'truck_id', resource: 'freight-profitability', table: 'freight_profitability', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'driver_id', resource: 'freight-profitability', table: 'freight_profitability', targetTables: ['drivers'], required: true },
  { column: 'truck_id', resource: 'fuel-records', table: 'fuel_records', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'driver_id', resource: 'fuel-records', table: 'fuel_records', targetTables: ['drivers'], required: false },
  { column: 'truck_id', resource: 'incidents', table: 'incidents', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'driver_id', resource: 'incidents', table: 'incidents', targetTables: ['drivers'], required: false },
  { column: 'freight_id', resource: 'incidents', table: 'incidents', targetTables: ['freight_requests'], required: false },
  { column: 'workshop_case_id', resource: 'incidents', table: 'incidents', targetTables: ['workshop_cases'], required: false },
  { column: 'case_id', resource: 'labor-tasks', table: 'labor_tasks', targetTables: ['workshop_cases'], required: true },
  { column: 'mechanic_id', resource: 'labor-tasks', table: 'labor_tasks', targetTables: ['mechanics'], required: false },
  { column: 'related_case_id', resource: 'purchase-orders', table: 'purchase_orders', targetTables: ['workshop_cases'], required: false },
  { column: 'case_id', resource: 'purchase-requests', table: 'purchase_requests', targetTables: ['workshop_cases'], required: true },
  { column: 'part_id', resource: 'purchase-requests', table: 'purchase_requests', targetTables: ['parts'], required: true },
  { column: 'purchase_order_id', resource: 'purchase-requests', table: 'purchase_requests', targetTables: ['purchase_orders'], required: false },
  { column: 'case_id', resource: 'quotes', table: 'quotes', targetTables: ['workshop_cases'], required: true },
  { column: 'case_id', resource: 'repair-solutions', table: 'repair_solutions', targetTables: ['workshop_cases'], required: true },
  { column: 'case_id', resource: 'schedule-events', table: 'schedule_events', targetTables: ['workshop_cases'], required: true },
  { column: 'mechanic_id', resource: 'schedule-events', table: 'schedule_events', targetTables: ['mechanics'], required: false },
  { column: 'bay_id', resource: 'schedule-events', table: 'schedule_events', targetTables: ['workshop_bays'], required: false },
  { column: 'case_id', resource: 'waiting-queue', table: 'waiting_queue', targetTables: ['workshop_cases'], required: true },
  { column: 'truck_id', resource: 'telematics', table: 'truck_telemetry', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'sku_id', resource: 'tire-lifecycles', table: 'tire_lifecycles', targetTables: ['parts'], required: false },
  { column: 'purchase_order_id', resource: 'tire-lifecycles', table: 'tire_lifecycles', targetTables: ['purchase_orders'], required: false },
  { column: 'supplier_id', resource: 'tire-lifecycles', table: 'tire_lifecycles', targetTables: ['suppliers'], required: false },
  { column: 'truck_id', resource: 'tire-lifecycles', table: 'tire_lifecycles', targetTables: ['fleet_trucks', 'trucks'], required: false },
  { column: 'case_id', resource: 'tire-lifecycles', table: 'tire_lifecycles', targetTables: ['workshop_cases'], required: false },
  { column: 'freight_id', resource: 'departure-checklists', table: 'trip_departure_checklists', targetTables: ['freight_requests'], required: true },
  { column: 'truck_id', resource: 'departure-checklists', table: 'trip_departure_checklists', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'driver_id', resource: 'departure-checklists', table: 'trip_departure_checklists', targetTables: ['drivers'], required: true },
  { column: 'freight_id', resource: 'arrival-checklists', table: 'trip_arrival_checklists', targetTables: ['freight_requests'], required: true },
  { column: 'truck_id', resource: 'arrival-checklists', table: 'trip_arrival_checklists', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'driver_id', resource: 'arrival-checklists', table: 'trip_arrival_checklists', targetTables: ['drivers'], required: true },
  { column: 'truck_id', resource: 'truck-costs', table: 'truck_costs', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'truck_id', resource: 'truck-cost-summaries', table: 'truck_cost_summaries', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'truck_id', resource: 'truck-documents', table: 'truck_documents', targetTables: ['fleet_trucks', 'trucks'], required: true },
  { column: 'part_id', resource: 'warehouse-stock', table: 'warehouse_stock', targetTables: ['parts'], required: true },
  { column: 'location_id', resource: 'warehouse-stock', table: 'warehouse_stock', targetTables: ['warehouse_locations'], required: true },
  { column: 'related_case_id', resource: 'warehouse-movements', table: 'warehouse_movements', targetTables: ['workshop_cases'], required: false },
  { column: 'current_case_id', resource: 'workshop-bays', table: 'workshop_bays', targetTables: ['workshop_cases'], required: false },
  { column: 'truck_id', resource: 'workshop-cases', table: 'workshop_cases', targetTables: ['fleet_trucks', 'trucks'], required: false },
  { column: 'driver_id', resource: 'workshop-cases', table: 'workshop_cases', targetTables: ['drivers'], required: false },
  { column: 'customer_id', resource: 'workshop-cases', table: 'workshop_cases', targetTables: ['customers'], required: false },
  { column: 'assigned_mechanic_id', resource: 'workshop-cases', table: 'workshop_cases', targetTables: ['mechanics'], required: false },
  { column: 'mechanic_id', resource: 'workshop-cases', table: 'workshop_cases', targetTables: ['mechanics'], required: false },
  { column: 'warehouse_manager_id', resource: 'workshop-cases', table: 'workshop_cases', targetTables: ['warehouse_managers'], required: false },
  { column: 'sla_id', resource: 'workshop-cases', table: 'workshop_cases', targetTables: ['sla_configs'], required: false },
]

const uniqueChecks = [
  { column: 'code', resource: 'roles', table: 'roles' },
  { column: 'email', resource: 'user-role-assignments', table: 'user_role_assignments' },
  { column: 'user_id', resource: 'user-role-assignments', table: 'user_role_assignments' },
  { column: 'case_number', resource: 'workshop-cases', table: 'workshop_cases' },
  { column: 'code', resource: 'workshop-cases', table: 'workshop_cases' },
  { column: 'plate', resource: 'trucks', table: 'trucks' },
  { column: 'plate', resource: 'fleet-trucks', table: 'fleet_trucks' },
  { column: 'document', resource: 'drivers', table: 'drivers' },
  { column: 'code', resource: 'mechanic-specialties', table: 'mechanic_specialties' },
  { column: 'rut', resource: 'customers', table: 'customers' },
  { column: 'request_number', resource: 'freight-requests', table: 'freight_requests' },
  { column: 'quote_number', resource: 'freight-quotes', table: 'freight_quotes' },
  { column: 'sku', resource: 'parts', table: 'parts' },
  { column: 'purchase_order_number', resource: 'purchase-orders', table: 'purchase_orders' },
  { column: 'quote_number', resource: 'quotes', table: 'quotes' },
  { column: 'rut', resource: 'suppliers', table: 'suppliers' },
  { column: 'code', resource: 'warehouse-locations', table: 'warehouse_locations' },
]

auditDatabase()
  .then((report) => {
    console.log(JSON.stringify(report, null, 2))
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closePool()
  })
