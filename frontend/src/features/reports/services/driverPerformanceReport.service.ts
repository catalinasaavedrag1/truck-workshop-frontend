import { casesMock } from '../../../mocks/cases.mock'
import { fleetTrucksMock, truckHealthScoresMock } from '../../fleet/mocks/fleet.mock'
import { fuelRecordsMock } from '../../fuel/mocks/fuel.mock'
import { incidentsMock } from '../../incidents/mocks/incidents.mock'
import { telematicsMock } from '../../telematics/mocks/telematics.mock'
import { arrivalChecklistsMock, departureChecklistsMock } from '../../trip-checklists/mocks/tripChecklists.mock'
import { driverTripSheetsMock } from '../../driver-trip-sheets/mocks/driverTripSheets.mock'
import { driverDocumentsMock, driverFinesMock } from '../../drivers/mocks/driverDocuments.mock'
import { driversMock } from '../../drivers/mocks/drivers.mock'
import { freightAssignmentsMock } from '../../freight/mocks/freight.mock'
import { httpClient } from '../../../shared/services/httpClient'
import { shouldUseMockFallback } from '../../../shared/services/resourceApi'
import type { ApiResponse } from '../../../shared/types/api.types'
import { getRutSearchText } from '../../../shared/utils/rut'
import type {
  DriverPerformanceReportData,
  DriverPerformanceReportFilters,
  DriverPerformanceRiskLevel,
  DriverPerformanceRow,
} from '../types/report.types'

export interface DriverPerformanceReportParams {
  driverId?: string
  periodDays?: number
  risk?: string
  search?: string
  status?: string
}

const riskWeight: Record<DriverPerformanceRiskLevel, number> = {
  BLOCKED: 0,
  REVIEW: 1,
  READY: 2,
}

export async function getDriverPerformanceReport(params: DriverPerformanceReportParams = {}) {
  try {
    const response = await httpClient.get<ApiResponse<DriverPerformanceReportData>>('/reports/driver-performance', {
      params,
    })

    return response.data.data
  } catch (error) {
    if (!shouldUseMockFallback()) {
      throw error
    }

    return buildDriverPerformanceFallbackReport(params)
  }
}

export function buildDriverPerformanceFallbackReport(params: DriverPerformanceReportParams = {}): DriverPerformanceReportData {
  const periodDays = params.periodDays || 90
  const to = new Date()
  const from = new Date(to.getTime() - periodDays * 24 * 60 * 60 * 1000)
  const filters: DriverPerformanceReportFilters = {
    driverId: params.driverId || 'all',
    from: from.toISOString(),
    periodDays,
    risk: params.risk || 'all',
    status: params.status || 'all',
    to: to.toISOString(),
  }
  const rows = driversMock
    .map((driver): DriverPerformanceRow => {
      const trips = driverTripSheetsMock.filter((sheet) => sheet.driverId === driver.id && inRange(sheet.tripDate, from, to))
      const assignments = freightAssignmentsMock.filter(
        (assignment) => assignment.driverId === driver.id && inRange(assignment.pickupDate || assignment.createdAt, from, to),
      )
      const fuelRecords = fuelRecordsMock.filter((record) => record.driverId === driver.id && inRange(record.date, from, to))
      const incidents = incidentsMock.filter((incident) => incident.driverId === driver.id && inRange(incident.occurredAt, from, to))
      const documents = driverDocumentsMock.filter((document) => document.driverId === driver.id)
      const fines = driverFinesMock.filter((fine) => fine.driverId === driver.id)
      const departures = departureChecklistsMock.filter((item) => item.driverId === driver.id && inRange(item.departureAt, from, to))
      const arrivals = arrivalChecklistsMock.filter((item) => item.driverId === driver.id && inRange(item.arrivalAt, from, to))
      const assignedTruck = fleetTrucksMock.find((truck) => truck.assignedDriverId === driver.id)
      const health = assignedTruck ? truckHealthScoresMock.find((item) => item.truckId === assignedTruck.id) : undefined
      const telemetry = assignedTruck ? telematicsMock.find((item) => item.truckId === assignedTruck.id) : undefined
      const openCases = casesMock.filter((item) => item.driverId === driver.id && item.status !== 'closed').length
      const revenue = sum(trips.map((item) => item.revenue))
      const totalExpenses = sum(trips.map((item) => item.totalExpenses))
      const netMargin = sum(trips.map((item) => item.netMargin))
      const kmReal = sum(trips.map((item) => item.kmReal))
      const kmPlanned = sum(trips.map((item) => item.kmPlanned))
      const hardDocumentIssues = documents.filter((item) => item.status === 'EXPIRED' || item.status === 'MISSING').length
      const expiringDocuments = documents.filter((item) => item.status === 'EXPIRES_SOON').length
      const activeFines = fines.filter((item) => ['OPEN', 'UNDER_REVIEW', 'DISPUTED'].includes(item.status))
      const openIncidents = incidents.filter((item) => item.status === 'OPEN' || item.status === 'UNDER_REVIEW').length
      const criticalIncidents = incidents.filter((item) => item.severity === 'CRITICAL' || item.severity === 'HIGH').length
      const suspiciousRecords = fuelRecords.filter((item) => item.deviationStatus === 'SUSPICIOUS').length
      const averageKmPerLiter = average(fuelRecords.map((item) => item.kmPerLiter || 0).filter(Boolean))
      const marginPercentage = revenue > 0 ? round((netMargin / revenue) * 100) : 0
      const tripAverageScore = trips.length ? Math.round(average(trips.map((item) => item.performanceScore))) : 70
      const complianceScore = clamp(100 - hardDocumentIssues * 25 - expiringDocuments * 8 - activeFines.length * 12)
      const safetyScore = clamp(100 - criticalIncidents * 24 - openIncidents * 12 - suspiciousRecords * 10)
      const profitabilityScore = revenue > 0 ? clamp(marginPercentage >= 28 ? 92 : marginPercentage >= 18 ? 78 : 55) : 72
      const fuelScore = fuelRecords.length ? clamp((averageKmPerLiter >= 3 ? 90 : averageKmPerLiter >= 2.3 ? 76 : 58) - suspiciousRecords * 14) : 72
      const checklistTotal = departures.length + arrivals.length
      const checklistBlocked = [...departures, ...arrivals].filter((item) => item.status === 'BLOCKED').length
      const checklistScore = checklistTotal ? clamp((([...departures, ...arrivals].filter((item) => item.status === 'COMPLETED').length / checklistTotal) * 100) - checklistBlocked * 20) : 70
      const telemetryScore = telemetry ? clamp(100 - (telemetry.alerts?.length || 0) * 10) : 70
      const waitingHours = sum(trips.map((item) => item.waitingHours))
      const punctualityScore = clamp(80 - Math.max(waitingHours - trips.length * 2, 0) * 4)
      const operationalScore = Math.round(
        tripAverageScore * 0.18 +
          complianceScore * 0.18 +
          safetyScore * 0.16 +
          profitabilityScore * 0.14 +
          fuelScore * 0.12 +
          punctualityScore * 0.12 +
          checklistScore * 0.06 +
          telemetryScore * 0.04,
      )
      const riskLevel = getRiskLevel(driver.status, operationalScore, hardDocumentIssues, activeFines.length, criticalIncidents)
      const blockers = [
        ...(driver.status !== 'active' ? ['Chofer inactivo'] : []),
        ...(hardDocumentIssues ? [`${hardDocumentIssues} documento(s) bloqueantes`] : []),
        ...(activeFines.length ? [`${activeFines.length} multa(s) activas`] : []),
        ...(criticalIncidents ? [`${criticalIncidents} incidente(s) criticos`] : []),
        ...(suspiciousRecords ? [`${suspiciousRecords} carga(s) sospechosas`] : []),
      ]

      return {
        assignedTruck: assignedTruck
          ? {
              healthScore: health?.score ?? null,
              id: assignedTruck.id,
              operationalStatus: assignedTruck.operationalStatus,
              plate: assignedTruck.plate,
            }
          : null,
        blockers,
        checklist: {
          arrivals: arrivals.length,
          blocked: checklistBlocked,
          completed: [...departures, ...arrivals].filter((item) => item.status === 'COMPLETED').length,
          departures: departures.length,
          observations: [...departures, ...arrivals].filter((item) => item.observations).length,
          total: checklistTotal,
        },
        compliance: {
          activeFineAmount: sum(activeFines.map((item) => item.amount || 0)),
          activeFines: activeFines.length,
          criticalFines: activeFines.filter((item) => item.severity === 'HIGH' || item.severity === 'CRITICAL').length,
          documents: documents.length,
          expiredDocuments: documents.filter((item) => item.status === 'EXPIRED').length,
          expiringDocuments,
          hardDocumentIssues,
          missingDocuments: documents.filter((item) => item.status === 'MISSING').length,
          overdueFines: activeFines.filter((item) => item.dueAt && new Date(item.dueAt) < new Date()).length,
          paidFines: fines.filter((item) => item.status === 'PAID' || item.status === 'CLOSED').length,
          status: driver.status,
        },
        decision: riskLevel === 'READY' ? 'Apto para ruta' : riskLevel === 'REVIEW' ? 'Revisar antes de asignar' : 'Bloquear asignacion',
        document: driver.document,
        driverId: driver.id,
        driverName: driver.name,
        finance: {
          averageCostPerKm: kmReal ? round(totalExpenses / kmReal) : 0,
          averageRevenuePerKm: kmReal ? round(revenue / kmReal) : 0,
          grossMargin: netMargin,
          marginPercentage,
          netMargin,
          revenue,
          totalExpenses,
        },
        fuel: {
          averageKmPerLiter,
          fuelSpend: sum(fuelRecords.map((item) => item.totalAmount)),
          liters: sum(fuelRecords.map((item) => item.liters)),
          records: fuelRecords.length,
          suspiciousRecords,
          warningRecords: fuelRecords.filter((item) => item.deviationStatus === 'WARNING').length,
        },
        highlights: [`${operationalScore}/100 score`, `${trips.length} viaje(s)`, `${round(kmReal)} km`, `${marginPercentage}% margen`],
        lastActivityAt: [trips[0]?.tripDate, fuelRecords[0]?.date, incidents[0]?.occurredAt].filter(Boolean).sort().at(-1) || null,
        license: driver.license,
        nextAction: blockers[0] || (trips.length ? 'Mantener asignable y monitorear proxima ruta.' : 'Cargar viaje o planilla para medir rendimiento.'),
        performanceBand: operationalScore >= 90 ? 'EXCELLENT' : operationalScore >= 82 ? 'STRONG' : operationalScore >= 70 ? 'REVIEW' : operationalScore >= 55 ? 'RISK' : 'BLOCKED',
        recent: {
          checklists: [
            ...departures.map((item) => ({
              freightId: item.freightId,
              id: item.id,
              kind: 'Salida',
              occurredAt: item.departureAt,
              status: item.status,
              summary: item.observations || 'Salida registrada',
            })),
            ...arrivals.map((item) => ({
              freightId: item.freightId,
              id: item.id,
              kind: 'Llegada',
              occurredAt: item.arrivalAt,
              status: item.status,
              summary: item.cargoStatus || 'Llegada registrada',
            })),
          ],
          documents: documents.filter((item) => item.status !== 'VALID'),
          fines: activeFines,
          fuelRecords: fuelRecords.slice(0, 5).map((item) => ({
            date: item.date,
            deviationStatus: item.deviationStatus,
            id: item.id,
            kmPerLiter: item.kmPerLiter || 0,
            liters: item.liters,
            totalAmount: item.totalAmount,
          })),
          incidents: incidents.slice(0, 5).map((item) => ({
            estimatedCost: item.estimatedCost || 0,
            id: item.id,
            incidentNumber: item.incidentNumber,
            occurredAt: item.occurredAt,
            severity: item.severity,
            status: item.status,
            type: item.incidentType,
          })),
          trips: trips.slice(0, 6).map((item) => ({
            id: item.id,
            netMargin: item.netMargin,
            performanceScore: item.performanceScore,
            route: [item.originAddress, item.destinationAddress].filter(Boolean).join(' -> '),
            sheetNumber: item.sheetNumber,
            status: item.status,
            totalExpenses: item.totalExpenses,
            tripDate: item.tripDate,
          })),
        },
        riskLevel,
        route: {
          fuelCost: sum(trips.map((item) => item.fuelCost)),
          kmDeviationPercent: kmPlanned ? round(((kmReal - kmPlanned) / kmPlanned) * 100) : 0,
          kmPlanned,
          kmReal,
          lodgingCost: sum(trips.map((item) => item.lodgingCost)),
          mealCost: sum(trips.map((item) => item.mealCost)),
          otherCost: sum(trips.map((item) => item.otherCost)),
          parkingCost: sum(trips.map((item) => item.parkingCost)),
          tipCost: sum(trips.map((item) => item.tipCost)),
          tollCost: sum(trips.map((item) => item.tollCost)),
          waitingCost: sum(trips.map((item) => item.waitingCost)),
          waitingHours,
        },
        safety: {
          arrivalDamages: arrivals.filter((item) => item.newDamages).length,
          blockedChecklists: checklistBlocked,
          checklistObservations: [...departures, ...arrivals].filter((item) => item.observations).length,
          criticalIncidents,
          estimatedIncidentCost: sum(incidents.map((item) => item.estimatedCost || 0)),
          openCases,
          openIncidents,
          routeDeviationAlerts: telemetry?.alerts?.filter((item) => item === 'ROUTE_DEVIATION').length || 0,
          speedingAlerts: telemetry?.alerts?.filter((item) => item === 'SPEEDING').length || 0,
          telemetryAlerts: telemetry?.alerts?.length || 0,
          totalIncidents: incidents.length,
        },
        scores: {
          checklistScore,
          complianceScore,
          fuelScore,
          operationalScore,
          profitabilityScore,
          punctualityScore,
          safetyScore,
          telemetryScore,
          tripScore: tripAverageScore,
        },
        status: driver.status,
        tripMetrics: {
          approvedSheets: trips.filter((item) => item.status === 'APPROVED').length,
          assignments: assignments.length,
          cancelledAssignments: assignments.filter((item) => item.status === 'CANCELLED').length,
          deliveredAssignments: assignments.filter((item) => item.status === 'DELIVERED').length,
          deliveredTrips: trips.filter((item) => item.deliveredAt).length,
          draftSheets: trips.filter((item) => item.status === 'DRAFT').length,
          inTransitAssignments: assignments.filter((item) => item.status === 'IN_TRANSIT').length,
          onTimeRate: null,
          paidSheets: trips.filter((item) => item.status === 'PAID').length,
          rejectedSheets: trips.filter((item) => item.status === 'REJECTED').length,
          scheduledAssignments: assignments.filter((item) => item.status === 'SCHEDULED').length,
          sheets: trips.length,
          submittedSheets: trips.filter((item) => item.status === 'SUBMITTED' || item.status === 'REVIEWED').length,
        },
      }
    })
    .filter((row) => matchesFilters(row, params))
    .sort((first, second) => riskWeight[first.riskLevel] - riskWeight[second.riskLevel] || second.scores.operationalScore - first.scores.operationalScore)

  return {
    filters,
    generatedAt: new Date().toISOString(),
    rows,
    summary: {
      activeDrivers: rows.filter((row) => row.status === 'active').length,
      averageFuelEfficiency: round(average(rows.map((row) => row.fuel.averageKmPerLiter).filter(Boolean))),
      averageOperationalScore: rows.length ? Math.round(average(rows.map((row) => row.scores.operationalScore))) : 0,
      blockedDrivers: rows.filter((row) => row.riskLevel === 'BLOCKED').length,
      driversWithTrips: rows.filter((row) => row.tripMetrics.sheets > 0).length,
      readyDrivers: rows.filter((row) => row.riskLevel === 'READY').length,
      reviewDrivers: rows.filter((row) => row.riskLevel === 'REVIEW').length,
      totalActiveFines: sum(rows.map((row) => row.compliance.activeFines)),
      totalDriverDocumentsIssues: sum(rows.map((row) => row.compliance.hardDocumentIssues + row.compliance.expiringDocuments)),
      totalExpenses: sum(rows.map((row) => row.finance.totalExpenses)),
      totalIncidentCost: sum(rows.map((row) => row.safety.estimatedIncidentCost)),
      totalKm: sum(rows.map((row) => row.route.kmReal)),
      totalNetMargin: sum(rows.map((row) => row.finance.netMargin)),
      totalOpenIncidents: sum(rows.map((row) => row.safety.openIncidents)),
      totalRevenue: sum(rows.map((row) => row.finance.revenue)),
      totalSheets: sum(rows.map((row) => row.tripMetrics.sheets)),
      totalWaitingHours: sum(rows.map((row) => row.route.waitingHours)),
    },
  }
}

function getRiskLevel(
  status: string,
  score: number,
  hardDocumentIssues: number,
  activeFines: number,
  criticalIncidents: number,
): DriverPerformanceRiskLevel {
  if (status !== 'active' || hardDocumentIssues > 0 || criticalIncidents > 0 || score < 55) {
    return 'BLOCKED'
  }

  if (activeFines > 0 || score < 76) {
    return 'REVIEW'
  }

  return 'READY'
}

function matchesFilters(row: DriverPerformanceRow, params: DriverPerformanceReportParams) {
  const search = normalize(params.search)

  if (params.driverId && params.driverId !== 'all' && row.driverId !== params.driverId) return false
  if (params.status && params.status !== 'all' && row.status !== params.status) return false
  if (params.risk && params.risk !== 'all' && row.riskLevel !== params.risk) return false
  if (!search) return true

  return normalize(`${row.driverName} ${getRutSearchText(row.document)} ${row.license} ${row.assignedTruck?.plate || ''} ${row.nextAction}`).includes(search)
}

function inRange(value: string | undefined, from: Date, to: Date) {
  if (!value) return false

  const date = new Date(value)

  return date >= from && date <= to
}

function average(values: number[]) {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0
}

function sum(values: number[]) {
  return round(values.reduce((total, value) => total + Number(value || 0), 0))
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

function clamp(value: number) {
  return Math.min(Math.max(Math.round(Number.isFinite(value) ? value : 0), 0), 100)
}

function normalize(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
