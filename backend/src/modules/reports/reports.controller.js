import { resources, workshopCaseResource } from '../../config/resources.js'
import { createRepository } from '../../shared/data/repository-factory.js'
import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { buildDriverPerformanceReport } from './driver-performance-report.service.js'

const repositories = {
  cases: createRepository(workshopCaseResource),
  driverTripSheets: createRepository(resourceByName('driver-trip-sheets')),
  fleetTrucks: createRepository(resourceByName('fleet-trucks')),
  freightProfitability: createRepository(resourceByName('freight-profitability')),
  fuelRecords: createRepository(resourceByName('fuel-records')),
  incidents: createRepository(resourceByName('incidents')),
  parts: createRepository(resourceByName('parts')),
  purchaseOrders: createRepository(resourceByName('purchase-orders')),
  tireLifecycles: createRepository(resourceByName('tire-lifecycles')),
  truckCosts: createRepository(resourceByName('truck-costs')),
  truckDocuments: createRepository(resourceByName('truck-documents')),
  warehouseStock: createRepository(resourceByName('warehouse-stock')),
}

export const getReportsOverview = asyncHandler(async (request, response) => {
  const [workshop, fleet, finance, inventory, tires] = await Promise.all([
    buildWorkshopReport(),
    buildFleetReport(),
    buildFinanceReport(),
    buildInventoryReport(),
    buildTireReport(),
  ])

  sendResponse(response, {
    data: {
      finance,
      fleet,
      inventory,
      tires,
      workshop,
    },
  })
})

export const getWorkshopReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildWorkshopReport() })
})

export const getFleetReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildFleetReport() })
})

export const getFinanceReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildFinanceReport() })
})

export const getInventoryReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildInventoryReport() })
})

export const getTireReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildTireReport() })
})

export const getDocumentExpirationsReport = asyncHandler(async (request, response) => {
  const days = clampNumber(request.query.days, 1, 365, 90)
  const documentType = String(request.query.documentType || 'TECHNICAL_INSPECTION')

  sendResponse(response, { data: await buildDocumentExpirationsReport({ days, documentType }) })
})

export const getDriverTripSheetsReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildDriverTripSheetsReport(request.query) })
})

export const getDriverPerformanceReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildDriverPerformanceReport(request.query) })
})

async function buildWorkshopReport() {
  const [total, closed, critical, slaAtRisk, slaBreached, incidents] = await Promise.all([
    repositories.cases.countBy(),
    repositories.cases.countBy({ status: 'closed' }),
    repositories.cases.countBy({ priority: 'critical' }),
    repositories.cases.countBy({ slaStatus: 'AT_RISK' }),
    repositories.cases.countBy({ slaStatus: 'BREACHED' }),
    repositories.incidents.countBy(),
  ])

  return {
    cases: {
      closed,
      critical,
      open: Math.max(total - closed, 0),
      slaAtRisk,
      slaBreached,
      total,
    },
    incidents: {
      total: incidents,
    },
  }
}

async function buildFleetReport() {
  const [total, available, onRoute, inWorkshop, blocked] = await Promise.all([
    repositories.fleetTrucks.countBy(),
    repositories.fleetTrucks.countBy({ operationalStatus: 'AVAILABLE' }),
    repositories.fleetTrucks.countBy({ operationalStatus: 'ON_ROUTE' }),
    repositories.fleetTrucks.countBy({ operationalStatus: 'IN_WORKSHOP' }),
    repositories.fleetTrucks.countBy({ operationalStatus: 'BLOCKED' }),
  ])

  return {
    trucks: {
      available,
      blocked,
      inWorkshop,
      onRoute,
      total,
    },
  }
}

async function buildFinanceReport() {
  const [fuelRecords, truckCosts, freightItems, purchaseOrders] = await Promise.all([
    repositories.fuelRecords.findAll({ limit: 100 }),
    repositories.truckCosts.findAll({ limit: 100 }),
    repositories.freightProfitability.findAll({ limit: 100 }),
    repositories.purchaseOrders.findAll({ limit: 100 }),
  ])

  return {
    freightMargin: sum(freightItems.data, 'grossMargin'),
    fuelSpend: sum(fuelRecords.data, 'totalAmount'),
    purchaseSpend: sum(purchaseOrders.data, 'totalEstimated'),
    truckCost: sum(truckCosts.data, 'amount'),
  }
}

async function buildInventoryReport() {
  const [parts, lowStock, outOfStock, stock] = await Promise.all([
    repositories.parts.countBy(),
    repositories.warehouseStock.countBy({ status: 'low-stock' }),
    repositories.warehouseStock.countBy({ status: 'out-of-stock' }),
    repositories.warehouseStock.findAll({ limit: 100 }),
  ])

  return {
    parts: {
      total: parts,
    },
    stock: {
      lowStock,
      outOfStock,
      totalUnits: sum(stock.data, 'quantity'),
    },
  }
}

async function buildTireReport() {
  const [total, installed, removed, discarded] = await Promise.all([
    repositories.tireLifecycles.countBy(),
    repositories.tireLifecycles.countBy({ status: 'INSTALLED' }),
    repositories.tireLifecycles.countBy({ status: 'REMOVED' }),
    repositories.tireLifecycles.countBy({ status: 'DISCARDED' }),
  ])

  return {
    tires: {
      discarded,
      installed,
      removed,
      total,
    },
  }
}

async function buildDocumentExpirationsReport({ days, documentType }) {
  const [documents, trucks] = await Promise.all([
    repositories.truckDocuments.findAll({ documentType, limit: 100, sort: 'expiresAt', order: 'asc' }),
    repositories.fleetTrucks.findAll({ limit: 100, sort: 'plate', order: 'asc' }),
  ])
  const now = new Date()
  const rows = trucks.data
    .map((truck) => {
      const document = documents.data
        .filter((item) => item.truckId === truck.id && item.documentType === documentType)
        .sort((first, second) => dateValue(first.expiresAt) - dateValue(second.expiresAt))[0]

      if (!document) {
        return {
          assignedDriverName: truck.assignedDriverName,
          blocker: truck.mainBlocker,
          daysUntilExpiration: null,
          documentId: null,
          documentNumber: null,
          documentType,
          expiresAt: null,
          model: `${truck.brand || ''} ${truck.model || ''}`.trim(),
          notes: 'No existe revision tecnica cargada para esta unidad.',
          operationalStatus: truck.operationalStatus,
          plate: truck.plate,
          priority: 'blocked',
          recommendedAction: 'Cargar documento o bloquear despacho hasta regularizar.',
          status: 'MISSING',
          truckId: truck.id,
        }
      }

      const daysUntilExpiration = document.expiresAt ? daysBetween(now, new Date(document.expiresAt)) : null
      const status = getDocumentStatus(daysUntilExpiration, document.status)

      return {
        assignedDriverName: truck.assignedDriverName,
        blocker: truck.mainBlocker,
        daysUntilExpiration,
        documentId: document.id,
        documentNumber: document.documentNumber,
        documentType,
        expiresAt: document.expiresAt,
        model: `${truck.brand || ''} ${truck.model || ''}`.trim(),
        notes: document.notes,
        operationalStatus: truck.operationalStatus,
        plate: truck.plate,
        priority: getDocumentPriority(status, daysUntilExpiration),
        recommendedAction: getDocumentAction(status, daysUntilExpiration),
        status,
        truckId: truck.id,
      }
    })
    .filter((row) => row.status === 'MISSING' || row.daysUntilExpiration === null || row.daysUntilExpiration <= days)
    .sort(compareExpirationRows)

  return {
    rows,
    summary: {
      due15: rows.filter((row) => row.status === 'EXPIRES_SOON_15').length,
      due30: rows.filter((row) => row.status === 'EXPIRES_SOON_30').length,
      expired: rows.filter((row) => row.status === 'EXPIRED').length,
      horizonDays: days,
      missing: rows.filter((row) => row.status === 'MISSING').length,
      planned: rows.filter((row) => row.status === 'VALID').length,
      total: rows.length,
    },
  }
}

async function buildDriverTripSheetsReport(query = {}) {
  const status = String(query.status || 'all')
  const driverId = String(query.driverId || 'all')
  const result = await repositories.driverTripSheets.findAll({
    driverId,
    limit: 100,
    sort: 'tripDate',
    status,
  })
  const rowsByDriver = result.data.reduce((groups, sheet) => {
    const key = sheet.driverId || 'sin-chofer'
    const current = groups.get(key) || {
      approvedSheets: 0,
      driverId: key,
      driverName: sheet.driverName || 'Sin chofer',
      netMargin: 0,
      paidSheets: 0,
      parkingCost: 0,
      performanceScore: 0,
      revenue: 0,
      sheets: 0,
      submittedSheets: 0,
      tipCost: 0,
      tollCost: 0,
      totalExpenses: 0,
      totalKm: 0,
      waitingHours: 0,
    }

    current.sheets += 1
    current.approvedSheets += sheet.status === 'APPROVED' ? 1 : 0
    current.paidSheets += sheet.status === 'PAID' ? 1 : 0
    current.submittedSheets += sheet.status === 'SUBMITTED' || sheet.status === 'REVIEWED' ? 1 : 0
    current.revenue += Number(sheet.revenue || 0)
    current.totalExpenses += Number(sheet.totalExpenses || 0)
    current.netMargin += Number(sheet.netMargin || 0)
    current.tollCost += Number(sheet.tollCost || 0)
    current.tipCost += Number(sheet.tipCost || 0)
    current.parkingCost += Number(sheet.parkingCost || 0)
    current.waitingHours += Number(sheet.waitingHours || 0)
    current.totalKm += Number(sheet.kmReal || 0)
    current.performanceScore += Number(sheet.performanceScore || 0)
    groups.set(key, current)

    return groups
  }, new Map())
  const rows = [...rowsByDriver.values()]
    .map((row) => ({
      ...row,
      averageCostPerKm: row.totalKm > 0 ? round(row.totalExpenses / row.totalKm) : 0,
      averageRevenuePerKm: row.totalKm > 0 ? round(row.revenue / row.totalKm) : 0,
      marginPercentage: row.revenue > 0 ? round((row.netMargin / row.revenue) * 100) : 0,
      performanceScore: row.sheets > 0 ? Math.round(row.performanceScore / row.sheets) : 0,
    }))
    .sort((first, second) => second.netMargin - first.netMargin)

  return {
    rows,
    summary: {
      averageScore: rows.length ? Math.round(rows.reduce((total, row) => total + row.performanceScore, 0) / rows.length) : 0,
      drivers: rows.length,
      netMargin: rows.reduce((total, row) => total + row.netMargin, 0),
      revenue: rows.reduce((total, row) => total + row.revenue, 0),
      sheets: result.data.length,
      totalExpenses: rows.reduce((total, row) => total + row.totalExpenses, 0),
      waitingHours: rows.reduce((total, row) => total + row.waitingHours, 0),
    },
  }
}

function resourceByName(name) {
  return resources.find((resource) => resource.name === name)
}

function sum(items, field) {
  return items.reduce((total, item) => total + Number(item[field] || 0), 0)
}

function round(value) {
  return Math.round(value * 100) / 100
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return fallback
  }

  return Math.min(Math.max(Math.trunc(number), min), max)
}

function dateValue(value) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER
  }

  return new Date(value).getTime()
}

function daysBetween(start, end) {
  const dayMs = 24 * 60 * 60 * 1000

  return Math.ceil((startOfDay(end).getTime() - startOfDay(start).getTime()) / dayMs)
}

function startOfDay(value) {
  const date = new Date(value)

  date.setHours(0, 0, 0, 0)

  return date
}

function getDocumentStatus(daysUntilExpiration, currentStatus) {
  if (currentStatus === 'MISSING' || daysUntilExpiration === null) {
    return 'MISSING'
  }

  if (daysUntilExpiration < 0 || currentStatus === 'EXPIRED') {
    return 'EXPIRED'
  }

  if (daysUntilExpiration <= 15) {
    return 'EXPIRES_SOON_15'
  }

  if (daysUntilExpiration <= 30) {
    return 'EXPIRES_SOON_30'
  }

  return 'VALID'
}

function getDocumentPriority(status, daysUntilExpiration) {
  if (status === 'MISSING' || status === 'EXPIRED') {
    return 'blocked'
  }

  if (daysUntilExpiration !== null && daysUntilExpiration <= 15) {
    return 'urgent'
  }

  if (daysUntilExpiration !== null && daysUntilExpiration <= 30) {
    return 'warning'
  }

  return 'planned'
}

function getDocumentAction(status, daysUntilExpiration) {
  if (status === 'MISSING') {
    return 'Cargar revision tecnica y validar disponibilidad antes de asignar fletes.'
  }

  if (status === 'EXPIRED') {
    return 'Bloquear despacho y agendar regularizacion hoy.'
  }

  if (daysUntilExpiration !== null && daysUntilExpiration <= 15) {
    return 'Reservar cupo de revision esta semana y avisar a operaciones.'
  }

  if (daysUntilExpiration !== null && daysUntilExpiration <= 30) {
    return 'Coordinar agenda, chofer y documentos con anticipacion.'
  }

  return 'Planificar ventana preventiva sin afectar fletes comprometidos.'
}

function compareExpirationRows(first, second) {
  const priorityWeight = {
    blocked: 0,
    urgent: 1,
    warning: 2,
    planned: 3,
  }
  const firstPriority = priorityWeight[first.priority] ?? 4
  const secondPriority = priorityWeight[second.priority] ?? 4

  if (firstPriority !== secondPriority) {
    return firstPriority - secondPriority
  }

  return (first.daysUntilExpiration ?? -9999) - (second.daysUntilExpiration ?? -9999)
}
