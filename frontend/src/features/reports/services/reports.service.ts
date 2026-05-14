import { casesMock } from '../../../mocks/cases.mock'
import { mechanicsMock } from '../../../mocks/mechanics.mock'
import { fleetTrucksMock, truckHealthScoresMock } from '../../fleet/mocks/fleet.mock'
import { freightProfitabilityMock } from '../../freight-profitability/mocks/freightProfitability.mock'
import { fuelRecordsMock } from '../../fuel/mocks/fuel.mock'
import { incidentsMock } from '../../incidents/mocks/incidents.mock'
import { preventiveMaintenanceMock } from '../../preventive-maintenance/mocks/preventiveMaintenance.mock'
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import { scheduleEventsMock, waitingQueueMock } from '../../schedule/mocks/schedule.mock'
import { tirePerformanceMock } from '../../tire-performance/mocks/tirePerformance.mock'
import { truckCostSummariesMock } from '../../truck-costs/mocks/truckCosts.mock'
import { truckDocumentsMock } from '../../truck-documents/mocks/truckDocuments.mock'
import { warehouseStockMock } from '../../warehouse/mocks/warehouse.mock'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { driverTripSheetsMock } from '../../driver-trip-sheets/mocks/driverTripSheets.mock'
import { httpClient } from '../../../shared/services/httpClient'
import { shouldUseMockFallback } from '../../../shared/services/resourceApi'
import type { ApiResponse } from '../../../shared/types/api.types'
import type {
  CasesReportRow,
  DriverTripSheetReportData,
  DocumentExpirationPriority,
  FleetRiskRow,
  FreightProfitabilityReportRow,
  FuelDeviationReportRow,
  MechanicPerformanceRow,
  OperationalAlert,
  PurchaseInventoryRow,
  ReportBarItem,
  ReportCatalogItem,
  ReportMetric,
  ReportsDashboard,
  TechnicalInspectionExpirationReportData,
  TechnicalInspectionExpirationRow,
  TireEconomicsRow,
} from '../types/report.types'

const caseStatusLabels = {
  assigned: 'Asignado',
  closed: 'Cerrado',
  diagnosis: 'Diagnostico',
  new: 'Nuevo',
  repairing: 'Reparacion',
  solution: 'Solucion',
  testing: 'Prueba',
}

const caseStageHours = {
  assigned: 6,
  closed: 0,
  diagnosis: 16,
  new: 2,
  repairing: 22,
  solution: 12,
  testing: 8,
}

const truckStatusLabels = {
  ASSIGNED_TO_FREIGHT: 'Asignado a flete',
  AVAILABLE: 'Disponible',
  BLOCKED: 'Bloqueado',
  IN_WORKSHOP: 'En taller',
  ON_ROUTE: 'En ruta',
  OUT_OF_SERVICE: 'Fuera de servicio',
  SOLD: 'Vendido',
  WAITING_PARTS: 'Esperando repuesto',
}

const purchaseStatusLabels = {
  APPROVED: 'Aprobada',
  CANCELLED: 'Cancelada',
  DRAFT: 'Borrador',
  ORDERED: 'Pedida',
  PARTIALLY_RECEIVED: 'Recepcion parcial',
  RECEIVED: 'Recibida',
  REQUESTED: 'Solicitada',
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('es-CL', {
    currency: 'CLP',
    maximumFractionDigits: 0,
    notation: 'compact',
    style: 'currency',
  }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(value)
}

function getCaseStatusRows(): CasesReportRow[] {
  return Object.entries(caseStatusLabels)
    .map(([status, label]) => {
      const cases = casesMock.filter((item) => item.status === status)

      return {
        averageHours: caseStageHours[status as keyof typeof caseStageHours],
        blockedPartsCases: cases.filter((item) => item.requiredParts.some((part) => part.requiresPurchase)).length,
        cases: cases.length,
        estimatedCost: cases.reduce((total, item) => total + item.estimatedCost, 0),
        label,
        slaRiskCases: cases.filter((item) => item.slaStatus === 'AT_RISK' || item.slaStatus === 'BREACHED').length,
        status,
      }
    })
    .filter((item) => item.cases > 0)
}

function getRepairStageRows(): ReportBarItem[] {
  const rows = [
    {
      id: 'scheduled',
      label: 'Horas agendadas',
      value: scheduleEventsMock.reduce((total, item) => total + item.estimatedHours, 0),
      helper: 'Carga de estaciones planificada',
      tone: 'info' as const,
    },
    {
      id: 'queue',
      label: 'Horas en cola',
      value: waitingQueueMock.reduce((total, item) => total + item.estimatedHours, 0),
      helper: 'Trabajo esperando estacion o repuesto',
      tone: 'warning' as const,
    },
    {
      id: 'parts',
      label: 'Horas bloqueadas por repuesto',
      value: scheduleEventsMock
        .filter((item) => item.hasPartsBlock)
        .reduce((total, item) => total + item.estimatedHours, 0),
      helper: 'Capacidad atrapada por falta de stock',
      tone: 'danger' as const,
    },
    {
      id: 'testing',
      label: 'Horas en prueba/cierre',
      value: scheduleEventsMock
        .filter((item) => item.status === 'blocked' || item.status === 'in_progress')
        .reduce((total, item) => total + item.estimatedHours, 0),
      helper: 'Casos cerca de entrega',
      tone: 'success' as const,
    },
  ]

  return rows.filter((row) => row.value > 0)
}

function getSlaRows(): ReportBarItem[] {
  return ['OK', 'AT_RISK', 'BREACHED'].map((status) => ({
    helper: status === 'OK' ? 'Dentro de plazo' : status === 'AT_RISK' ? 'Requiere seguimiento' : 'Vencido',
    id: status,
    label: status === 'OK' ? 'SLA OK' : status === 'AT_RISK' ? 'SLA en riesgo' : 'SLA vencido',
    tone: status === 'OK' ? 'success' : status === 'AT_RISK' ? 'warning' : 'danger',
    value: casesMock.filter((item) => item.slaStatus === status).length,
  }))
}

function getMechanicRows(): MechanicPerformanceRow[] {
  return mechanicsMock.map((mechanic, index) => {
    const assignedCases = casesMock.filter((item) => item.mechanicId === mechanic.id || item.assignedMechanicId === mechanic.id)
    const utilization = mechanic.maxCases > 0 ? Math.round((mechanic.activeCases / mechanic.maxCases) * 100) : 0

    return {
      activeCases: mechanic.activeCases,
      averageRepairHours: 12 + index * 2,
      capacity: mechanic.maxCases,
      criticalCases: assignedCases.filter((item) => item.priority === 'critical' || item.slaStatus === 'BREACHED').length,
      mechanicName: mechanic.name,
      reworkRate: index + 2,
      specialty: mechanic.specialty,
      utilization,
    }
  })
}

function getFleetStatusRows(): ReportBarItem[] {
  return Object.entries(truckStatusLabels)
    .map(([status, label]) => ({
      helper: status === 'AVAILABLE' ? 'Listos para despacho' : 'Estado operacional',
      id: status,
      label,
      tone:
        status === 'AVAILABLE'
          ? ('success' as const)
          : status === 'BLOCKED' || status === 'OUT_OF_SERVICE'
            ? ('danger' as const)
            : status === 'WAITING_PARTS' || status === 'IN_WORKSHOP'
              ? ('warning' as const)
              : ('info' as const),
      value: fleetTrucksMock.filter((truck) => truck.operationalStatus === status).length,
    }))
    .filter((item) => item.value > 0)
}

function getFleetRiskRows(): FleetRiskRow[] {
  return fleetTrucksMock
    .map((truck) => {
      const health = truckHealthScoresMock.find((item) => item.truckId === truck.id)
      const cost = truckCostSummariesMock.find((item) => item.truckId === truck.id)
      const document = truckDocumentsMock.find(
        (item) => item.truckId === truck.id && ['EXPIRED', 'EXPIRES_SOON_15', 'MISSING'].includes(item.status),
      )
      const maintenance = preventiveMaintenanceMock.find(
        (item) => item.truckId === truck.id && ['CRITICAL', 'OVERDUE', 'WARNING'].includes(item.riskStatus),
      )

      return {
        blocker: truck.mainBlocker || health?.summary || 'Sin bloqueo operativo declarado',
        costPerKm: cost?.costPerKm,
        documentRisk: document?.status || 'VALID',
        healthScore: health?.score || 0,
        maintenanceRisk: maintenance?.riskStatus || 'OK',
        model: `${truck.brand} ${truck.model}`,
        plate: truck.plate,
        status: truckStatusLabels[truck.operationalStatus],
        truckId: truck.id,
      }
    })
    .sort((a, b) => a.healthScore - b.healthScore)
}

function getTechnicalInspectionExpirationReportRows(days = 90): TechnicalInspectionExpirationReportData {
  const now = new Date()
  const rows = fleetTrucksMock
    .map<TechnicalInspectionExpirationRow>((truck) => {
      const document = truckDocumentsMock
        .filter((item) => item.truckId === truck.id && item.documentType === 'TECHNICAL_INSPECTION')
        .sort((first, second) => dateValue(first.expiresAt) - dateValue(second.expiresAt))[0]

      if (!document) {
        return {
          assignedDriverName: truck.assignedDriverName,
          blocker: truck.mainBlocker,
          daysUntilExpiration: null,
          documentId: null,
          documentNumber: null,
          documentType: 'TECHNICAL_INSPECTION',
          expiresAt: null,
          model: `${truck.brand} ${truck.model}`,
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
        documentType: document.documentType,
        expiresAt: document.expiresAt,
        model: `${truck.brand} ${truck.model}`,
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

function getPurchaseStatusRows(): ReportBarItem[] {
  return Object.entries(purchaseStatusLabels)
    .map(([status, label]) => ({
      helper: status === 'RECEIVED' ? 'Cerradas' : 'Flujo de compra',
      id: status,
      label,
      tone:
        status === 'RECEIVED'
          ? ('success' as const)
          : status === 'REQUESTED' || status === 'ORDERED' || status === 'PARTIALLY_RECEIVED'
            ? ('warning' as const)
            : ('neutral' as const),
      value: purchaseOrdersMock.filter((order) => order.status === status).length,
    }))
    .filter((item) => item.value > 0)
}

function getPurchaseInventoryRows(): PurchaseInventoryRow[] {
  return warehouseStockMock
    .filter((item) => item.status !== 'available' || item.quantity <= item.minStock)
    .map((stock) => {
      const activePo = purchaseOrdersMock.find(
        (order) =>
          !['RECEIVED', 'CANCELLED'].includes(order.status) && order.items.some((item) => item.sku === stock.sku),
      )
      const impactedCases = casesMock.filter((item) => item.requiredParts.some((part) => part.sku === stock.sku))

      return {
        activeCases: impactedCases.length,
        activePurchaseOrder: activePo?.purchaseOrderNumber,
        estimatedAmount: activePo?.items
          .filter((item) => item.sku === stock.sku)
          .reduce((total, item) => total + item.quantity * item.estimatedUnitCost, 0) || 0,
        minStock: stock.minStock,
        name: stock.name,
        sku: stock.sku,
        status: stock.status,
        stock: stock.quantity,
      }
    })
}

function getFreightProfitabilityRows(): FreightProfitabilityReportRow[] {
  return freightProfitabilityMock
    .map((item) => {
      const truck = fleetTrucksMock.find((fleetTruck) => fleetTruck.id === item.truckId)

      return {
        costPerKm: item.costPerKm,
        customerName: item.customerName,
        freightId: item.freightId,
        grossMargin: item.grossMargin,
        km: item.km,
        marginPercentage: item.marginPercentage,
        revenue: item.revenue,
        totalCost: item.totalCost,
        truckPlate: truck?.plate || item.truckId,
      }
    })
    .sort((a, b) => a.marginPercentage - b.marginPercentage)
}

function getDriverTripSheetReportRows(): DriverTripSheetReportData {
  const groups = driverTripSheetsMock.reduce<
    Record<
      string,
      {
        approvedSheets: number
        driverId: string
        driverName: string
        netMargin: number
        paidSheets: number
        parkingCost: number
        performanceScore: number
        revenue: number
        sheets: number
        submittedSheets: number
        tipCost: number
        tollCost: number
        totalExpenses: number
        totalKm: number
        waitingHours: number
      }
    >
  >((accumulator, sheet) => {
    const key = sheet.driverId || 'sin-chofer'
    const current = accumulator[key] || {
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

    current.approvedSheets += sheet.status === 'APPROVED' ? 1 : 0
    current.netMargin += sheet.netMargin
    current.paidSheets += sheet.status === 'PAID' ? 1 : 0
    current.parkingCost += sheet.parkingCost
    current.performanceScore += sheet.performanceScore
    current.revenue += sheet.revenue
    current.sheets += 1
    current.submittedSheets += sheet.status === 'SUBMITTED' || sheet.status === 'REVIEWED' ? 1 : 0
    current.tipCost += sheet.tipCost
    current.tollCost += sheet.tollCost
    current.totalExpenses += sheet.totalExpenses
    current.totalKm += sheet.kmReal
    current.waitingHours += sheet.waitingHours
    accumulator[key] = current

    return accumulator
  }, {})

  const rows = Object.values(groups)
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
      sheets: driverTripSheetsMock.length,
      totalExpenses: rows.reduce((total, row) => total + row.totalExpenses, 0),
      waitingHours: rows.reduce((total, row) => total + row.waitingHours, 0),
    },
  }
}

function getFuelDeviationRows(): FuelDeviationReportRow[] {
  return fuelRecordsMock
    .map((record) => {
      const truck = fleetTrucksMock.find((item) => item.id === record.truckId)
      const driver = driversMock.find((item) => item.id === record.driverId)

      return {
        deviationStatus: record.deviationStatus,
        driverName: driver?.name || record.driverId,
        id: record.id,
        kmPerLiter: record.kmPerLiter,
        liters: record.liters,
        totalAmount: record.totalAmount,
        truckPlate: truck?.plate || record.truckId,
      }
    })
    .sort((a, b) => a.kmPerLiter - b.kmPerLiter)
}

function getTireEconomicsRows(): TireEconomicsRow[] {
  return ['NEW', 'RETREADED'].map((tireType) => {
    const tires = tirePerformanceMock.filter((item) => item.tireType === tireType)
    const finished = tires.filter((item) => item.costPerKm && item.kmUsed)
    const supplierGroups = finished.reduce<Record<string, { costPerKm: number; count: number }>>((groups, item) => {
      const current = groups[item.supplierName] || { costPerKm: 0, count: 0 }
      groups[item.supplierName] = {
        costPerKm: current.costPerKm + (item.costPerKm || 0),
        count: current.count + 1,
      }
      return groups
    }, {})
    const bestSupplier = Object.entries(supplierGroups)
      .map(([supplier, value]) => ({ supplier, average: value.costPerKm / value.count }))
      .sort((a, b) => a.average - b.average)[0]

    return {
      averageCostPerKm: finished.length
        ? finished.reduce((total, item) => total + (item.costPerKm || 0), 0) / finished.length
        : 0,
      averageKmUsed: finished.length ? finished.reduce((total, item) => total + (item.kmUsed || 0), 0) / finished.length : 0,
      averagePurchaseCost: tires.length ? tires.reduce((total, item) => total + item.purchaseCost, 0) / tires.length : 0,
      bestSupplier: bestSupplier?.supplier || 'Sin datos cerrados',
      installed: tires.filter((item) => item.status === 'INSTALLED').length,
      sampleSize: finished.length,
      tireType: tireType === 'NEW' ? 'Nuevo' : 'Recauchado',
    }
  })
}

function getAlerts(): OperationalAlert[] {
  const breachedCases = casesMock.filter((item) => item.slaStatus === 'BREACHED')
  const criticalIncident = incidentsMock.find((item) => item.severity === 'CRITICAL' && item.status !== 'CLOSED')
  const outOfStock = warehouseStockMock.find((item) => item.status === 'out-of-stock')
  const suspiciousFuel = fuelRecordsMock.find((item) => item.deviationStatus === 'SUSPICIOUS')
  const technicalInspectionRisk = getTechnicalInspectionExpirationReportRows(60).rows[0]

  const alerts: Array<OperationalAlert | null> = [
    ...breachedCases.map((item) => ({
      description: `${item.caseNumber} vence o ya vencio con prioridad ${item.priority}.`,
      id: `case-${item.id}`,
      owner: item.mechanicName || 'Jefe taller',
      title: 'SLA vencido en taller',
      tone: 'danger' as const,
    })),
    criticalIncident
      ? {
          description: `${criticalIncident.incidentNumber} mantiene camion bloqueado por seguridad.`,
          id: criticalIncident.id,
          owner: 'Operaciones',
          title: 'Incidente critico abierto',
          tone: 'danger' as const,
        }
      : null,
    outOfStock
      ? {
          description: `${outOfStock.sku} sin stock, afecta casos y compras.`,
          id: outOfStock.partId,
          owner: 'Bodega',
          title: 'Repuesto critico sin stock',
          tone: 'warning' as const,
        }
      : null,
    suspiciousFuel
      ? {
          description: `${suspiciousFuel.kmPerLiter} km/l detectado en ultima carga.`,
          id: suspiciousFuel.id,
          owner: 'Flota',
          title: 'Consumo sospechoso',
          tone: 'warning' as const,
        }
      : null,
    technicalInspectionRisk
      ? {
          description:
            technicalInspectionRisk.daysUntilExpiration === null
              ? `${technicalInspectionRisk.plate} no tiene revision tecnica registrada.`
              : `${technicalInspectionRisk.plate} vence en ${technicalInspectionRisk.daysUntilExpiration} dias.`,
          id: `technical-inspection-${technicalInspectionRisk.truckId}`,
          owner: 'Flota',
          title: 'Revision tecnica requiere planificacion',
          tone: technicalInspectionRisk.priority === 'blocked' ? 'danger' : 'warning',
        }
      : null,
  ]

  return alerts.filter((item): item is OperationalAlert => Boolean(item))
}

function getMetrics(): ReportMetric[] {
  const openCases = casesMock.filter((item) => item.status !== 'closed').length
  const slaRisk = casesMock.filter((item) => item.slaStatus === 'AT_RISK' || item.slaStatus === 'BREACHED').length
  const blockedParts = casesMock.filter((item) => item.requiredParts.some((part) => part.requiresPurchase)).length
  const availableTrucks = fleetTrucksMock.filter((item) => item.operationalStatus === 'AVAILABLE').length
  const pendingPurchaseAmount = purchaseOrdersMock
    .filter((item) => !['RECEIVED', 'CANCELLED'].includes(item.status))
    .reduce((total, item) => total + item.totalEstimated, 0)
  const freightRevenue = freightProfitabilityMock.reduce((total, item) => total + item.revenue, 0)
  const averageMargin = freightProfitabilityMock.length
    ? freightProfitabilityMock.reduce((total, item) => total + item.marginPercentage, 0) / freightProfitabilityMock.length
    : 0
  const fuelSpend = fuelRecordsMock.reduce((total, item) => total + item.totalAmount, 0)
  const technicalInspectionSummary = getTechnicalInspectionExpirationReportRows(60).summary
  const driverTripSheetReport = getDriverTripSheetReportRows()

  return [
    {
      helper: 'Casos activos en taller',
      id: 'open-cases',
      label: 'Casos abiertos',
      tone: openCases > 3 ? 'warning' : 'info',
      value: String(openCases),
    },
    {
      helper: 'En riesgo o vencidos',
      id: 'sla-risk',
      label: 'SLA criticos',
      tone: slaRisk > 0 ? 'danger' : 'success',
      value: String(slaRisk),
    },
    {
      helper: 'Bloquean avance por stock/compra',
      id: 'blocked-parts',
      label: 'Bloqueos por repuesto',
      tone: blockedParts > 0 ? 'warning' : 'success',
      value: String(blockedParts),
    },
    {
      helper: 'Camiones listos para flete',
      id: 'available-trucks',
      label: 'Flota disponible',
      tone: availableTrucks > 0 ? 'success' : 'danger',
      value: `${availableTrucks}/${fleetTrucksMock.length}`,
    },
    {
      helper: `Revision tecnica en 60 dias: ${technicalInspectionSummary.expired} vencidas, ${technicalInspectionSummary.missing} faltantes`,
      id: 'technical-inspections-due',
      label: 'RT por vencer',
      tone: technicalInspectionSummary.expired + technicalInspectionSummary.missing > 0
        ? 'danger'
        : technicalInspectionSummary.total > 0
          ? 'warning'
          : 'success',
      value: String(technicalInspectionSummary.total),
    },
    {
      helper: 'Ordenes no cerradas',
      id: 'pending-purchases',
      label: 'Compras pendientes',
      tone: pendingPurchaseAmount > 0 ? 'warning' : 'success',
      value: formatCurrencyCompact(pendingPurchaseAmount),
    },
    {
      helper: `Margen promedio ${formatNumber(averageMargin)}%`,
      id: 'freight-revenue',
      label: 'Ingresos fletes',
      tone: averageMargin >= 25 ? 'success' : 'warning',
      value: formatCurrencyCompact(freightRevenue),
    },
    {
      helper: `Score choferes ${driverTripSheetReport.summary.averageScore}/100, espera ${formatNumber(driverTripSheetReport.summary.waitingHours)} h`,
      id: 'driver-trip-sheets',
      label: 'Planillas viaje',
      tone: driverTripSheetReport.summary.averageScore >= 85 ? 'success' : 'warning',
      value: String(driverTripSheetReport.summary.sheets),
    },
    {
      helper: 'Ultimas cargas registradas',
      id: 'fuel-spend',
      label: 'Gasto combustible',
      tone: fuelRecordsMock.some((item) => item.deviationStatus === 'SUSPICIOUS') ? 'warning' : 'neutral',
      value: formatCurrencyCompact(fuelSpend),
    },
  ]
}

function getCatalog(): ReportCatalogItem[] {
  const tireRows = getTireEconomicsRows()
  const retread = tireRows.find((item) => item.tireType === 'Recauchado')
  const technicalInspectionSummary = getTechnicalInspectionExpirationReportRows(60).summary
  const driverTripSheetReport = getDriverTripSheetReportRows()

  return [
    {
      description: 'Casos, SLA, bloqueos por repuesto, carga de estaciones y mecanicos.',
      id: 'workshop',
      kpi: `${casesMock.length} casos`,
      label: 'Taller y SLA',
      tone: 'danger',
    },
    {
      description: 'Disponibilidad real, health score, documentos, mantenciones e incidentes.',
      id: 'fleet',
      kpi: `${fleetTrucksMock.filter((item) => item.operationalStatus === 'AVAILABLE').length} disponibles`,
      label: 'Flota',
      tone: 'warning',
    },
    {
      description: 'Revision tecnica vencida, faltante o proxima a vencer para coordinar con anticipacion.',
      id: 'documents',
      kpi: `${technicalInspectionSummary.total} alertas RT`,
      label: 'Vencimientos RT',
      tone: technicalInspectionSummary.expired + technicalInspectionSummary.missing > 0 ? 'danger' : 'warning',
    },
    {
      description: 'Rentabilidad de fletes, costos por camion, combustible y margen.',
      id: 'finance',
      kpi: `${formatNumber(
        freightProfitabilityMock.reduce((total, item) => total + item.marginPercentage, 0) /
          freightProfitabilityMock.length,
      )}% margen`,
      label: 'Costos y rentabilidad',
      tone: 'success',
    },
    {
      description: 'Rendicion por chofer: peajes, comida, propinas, estacionamiento, espera, costo/km y score.',
      id: 'driverSheets',
      kpi: `${driverTripSheetReport.summary.averageScore}/100 score`,
      label: 'Rendimiento choferes',
      tone: driverTripSheetReport.summary.averageScore >= 85 ? 'success' : 'warning',
    },
    {
      description: 'Stock critico, ordenes pendientes y compras asociadas a casos.',
      id: 'inventory',
      kpi: `${warehouseStockMock.filter((item) => item.status !== 'available').length} alertas`,
      label: 'Inventario y compras',
      tone: 'warning',
    },
    {
      description: 'Costo real por kilometro, nuevo vs recauchado, proveedor y rendimiento.',
      id: 'tires',
      kpi: `$${formatNumber(retread?.averageCostPerKm || 0)}/km recauchado`,
      label: 'Neumaticos',
      tone: 'info',
    },
  ]
}

export function getReportsDashboard(): ReportsDashboard {
  return {
    alerts: getAlerts(),
    caseStatusRows: getCaseStatusRows(),
    catalog: getCatalog(),
    driverTripSheetReport: getDriverTripSheetReportRows(),
    fleetRiskRows: getFleetRiskRows(),
    fleetStatusRows: getFleetStatusRows(),
    freightProfitabilityRows: getFreightProfitabilityRows(),
    fuelDeviationRows: getFuelDeviationRows(),
    mechanicRows: getMechanicRows(),
    metrics: getMetrics(),
    purchaseInventoryRows: getPurchaseInventoryRows(),
    purchaseStatusRows: getPurchaseStatusRows(),
    repairStageRows: getRepairStageRows(),
    slaRows: getSlaRows(),
    technicalInspectionExpirations: getTechnicalInspectionExpirationReportRows(90),
    tireEconomicsRows: getTireEconomicsRows(),
  }
}

export async function getTechnicalInspectionExpirationReport(days = 90) {
  try {
    const response = await httpClient.get<ApiResponse<TechnicalInspectionExpirationReportData>>(
      '/reports/document-expirations',
      {
        params: {
          days,
          documentType: 'TECHNICAL_INSPECTION',
        },
      },
    )

    return response.data.data
  } catch (error) {
    if (!shouldUseMockFallback()) {
      throw error
    }

    return getTechnicalInspectionExpirationReportRows(days)
  }
}

export async function getDriverTripSheetReport() {
  try {
    const response = await httpClient.get<ApiResponse<DriverTripSheetReportData>>('/reports/driver-trip-sheets')

    return response.data.data
  } catch (error) {
    if (!shouldUseMockFallback()) {
      throw error
    }

    return getDriverTripSheetReportRows()
  }
}

function dateValue(value?: string) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER
  }

  return new Date(value).getTime()
}

function daysBetween(start: Date, end: Date) {
  const dayMs = 24 * 60 * 60 * 1000

  return Math.ceil((startOfDay(end).getTime() - startOfDay(start).getTime()) / dayMs)
}

function startOfDay(value: Date) {
  const date = new Date(value)

  date.setHours(0, 0, 0, 0)

  return date
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function getDocumentStatus(daysUntilExpiration: number | null, currentStatus: string) {
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

function getDocumentPriority(status: string, daysUntilExpiration: number | null): DocumentExpirationPriority {
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

function getDocumentAction(status: string, daysUntilExpiration: number | null) {
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

function compareExpirationRows(first: TechnicalInspectionExpirationRow, second: TechnicalInspectionExpirationRow) {
  const priorityWeight: Record<DocumentExpirationPriority, number> = {
    blocked: 0,
    urgent: 1,
    warning: 2,
    planned: 3,
  }

  if (priorityWeight[first.priority] !== priorityWeight[second.priority]) {
    return priorityWeight[first.priority] - priorityWeight[second.priority]
  }

  return (first.daysUntilExpiration ?? -9999) - (second.daysUntilExpiration ?? -9999)
}
