import type {
  CasesByStatus,
  DashboardMetric,
  MechanicWorkloadItem,
} from '../features/dashboard/types/dashboard.types'
import { approvalsMock } from '../features/approvals/mocks/approvals.mock'
import { fleetTrucksMock, truckHealthScoresMock } from '../features/fleet/mocks/fleet.mock'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../features/freight/mocks/freight.mock'
import { fuelRecordsMock } from '../features/fuel/mocks/fuel.mock'
import { incidentsMock } from '../features/incidents/mocks/incidents.mock'
import { preventiveMaintenanceMock } from '../features/preventive-maintenance/mocks/preventiveMaintenance.mock'
import { purchaseOrdersMock } from '../features/purchase-orders/mocks/purchaseOrders.mock'
import { quotesMock } from '../features/quotes/mocks/quotes.mock'
import { tirePerformanceMock } from '../features/tire-performance/mocks/tirePerformance.mock'
import { truckCostSummariesMock } from '../features/truck-costs/mocks/truckCosts.mock'
import { truckDocumentsMock } from '../features/truck-documents/mocks/truckDocuments.mock'
import { warehouseStockMock } from '../features/warehouse/mocks/warehouse.mock'
import { workshopBaysMock } from '../features/workshop-bays/mocks/workshopBays.mock'
import { casesMock } from './cases.mock'
import { mechanicsMock } from './mechanics.mock'

const openCases = casesMock.filter((item) => item.status !== 'closed')
const blockedByParts = casesMock.filter((item) => item.requiredParts.some((part) => part.requiresPurchase))
const pendingPurchaseOrders = purchaseOrdersMock.filter((item) =>
  ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED', 'REQUESTED'].includes(item.status),
)
const completedTires = tirePerformanceMock.filter((item) => item.costPerKm && item.kmUsed)
const averageTireCostPerKm =
  completedTires.reduce((total, tire) => total + (tire.costPerKm || 0), 0) / Math.max(completedTires.length, 1)
const averageHealthScore =
  truckHealthScoresMock.reduce((total, score) => total + score.score, 0) / Math.max(truckHealthScoresMock.length, 1)
const monthlyFleetCost = truckCostSummariesMock.reduce((total, summary) => total + summary.monthlyCost, 0)

export const dashboardMetricsMock: DashboardMetric[] = [
  { group: 'Taller', label: 'Casos abiertos', value: String(openCases.length), trend: '+2 hoy' },
  { group: 'Taller', label: 'SLA en riesgo', value: String(casesMock.filter((item) => item.slaStatus === 'AT_RISK').length), trend: 'menos de 6 h' },
  { group: 'Taller', label: 'SLA vencido', value: String(casesMock.filter((item) => item.slaStatus === 'BREACHED').length), trend: 'requiere gestion' },
  { group: 'Taller', label: 'Casos escalados', value: String(casesMock.filter((item) => item.escalationLevel !== 'LEVEL_0_NORMAL').length), trend: 'supervisor o superior' },
  { group: 'Taller', label: 'Esperando diagnostico', value: String(casesMock.filter((item) => item.status === 'diagnosis').length), trend: 'cola tecnica' },
  { group: 'Capacidad', label: 'Mecanicos ocupados', value: String(mechanicsMock.filter((item) => item.availability === 'busy').length), trend: 'al limite de carga' },
  { group: 'Capacidad', label: 'Estaciones ocupadas', value: String(workshopBaysMock.filter((item) => item.status === 'occupied').length), trend: 'espacio fisico usado' },
  { group: 'Capacidad', label: 'Camiones disponibles', value: String(fleetTrucksMock.filter((item) => item.operationalStatus === 'AVAILABLE').length), trend: 'aptos para flete' },
  { group: 'Capacidad', label: 'Camiones bloqueados', value: String(fleetTrucksMock.filter((item) => item.operationalStatus === 'BLOCKED' || item.operationalStatus === 'WAITING_PARTS').length), trend: 'documentos, taller o repuestos' },
  { group: 'Capacidad', label: 'Health score prom.', value: `${averageHealthScore.toFixed(0)}/100`, trend: 'riesgo flota' },
  { group: 'Capacidad', label: 'Neumaticos instalados', value: String(tirePerformanceMock.filter((item) => item.status === 'INSTALLED').length), trend: 'en camiones activos' },
  { group: 'Capacidad', label: 'Costo/km neumaticos', value: `$${averageTireCostPerKm.toFixed(2)}`, trend: 'promedio retirados' },
  { group: 'Bodega y compras', label: 'Bloqueados por repuestos', value: String(blockedByParts.length), trend: 'compra o recepcion pendiente' },
  { group: 'Bodega y compras', label: 'OC pendientes', value: String(pendingPurchaseOrders.length), trend: 'solicitadas u ordenadas' },
  { group: 'Bodega y compras', label: 'Cotizaciones pendientes', value: String(quotesMock.filter((item) => item.status === 'SENT' || item.status === 'DRAFT').length), trend: 'cliente o taller' },
  { group: 'Bodega y compras', label: 'Aprobaciones pendientes', value: String(approvalsMock.filter((item) => item.status === 'pending').length), trend: 'requieren decision' },
  { group: 'Bodega y compras', label: 'Repuestos bajo stock', value: String(warehouseStockMock.filter((item) => item.status !== 'available').length), trend: 'bajo o sin stock' },
  { group: 'Flota', label: 'Docs vencidos/faltantes', value: String(truckDocumentsMock.filter((item) => item.status === 'EXPIRED' || item.status === 'MISSING').length), trend: 'bloquean despacho' },
  { group: 'Flota', label: 'Mantenciones criticas', value: String(preventiveMaintenanceMock.filter((item) => item.riskStatus === 'CRITICAL' || item.riskStatus === 'OVERDUE').length), trend: 'vencidas o cercanas' },
  { group: 'Flota', label: 'Incidentes abiertos', value: String(incidentsMock.filter((item) => item.status === 'OPEN' || item.status === 'UNDER_REVIEW').length), trend: 'seguimiento activo' },
  { group: 'Flota', label: 'Costo mensual flota', value: `$${(monthlyFleetCost / 1000000).toFixed(1)}M`, trend: 'costos consolidados' },
  { group: 'Flota', label: 'Cargas sospechosas', value: String(fuelRecordsMock.filter((item) => item.deviationStatus === 'SUSPICIOUS').length), trend: 'combustible' },
  { group: 'Fletes', label: 'Solicitudes nuevas', value: String(freightRequestsMock.filter((item) => item.status === 'NEW').length), trend: 'solicitudes comerciales' },
  { group: 'Fletes', label: 'Cotizaciones sin enviar', value: String(freightQuotesMock.filter((item) => item.status === 'DRAFT').length), trend: 'borradores' },
  { group: 'Fletes', label: 'Cotizaciones enviadas', value: String(freightQuotesMock.filter((item) => item.status === 'SENT').length), trend: 'esperando decision' },
  { group: 'Fletes', label: 'Cotizaciones aprobadas', value: String(freightQuotesMock.filter((item) => item.status === 'APPROVED').length), trend: 'listas para asignar' },
  { group: 'Fletes', label: 'Por asignar', value: String(freightRequestsMock.filter((item) => item.status === 'APPROVED').length), trend: 'requieren camion' },
  { group: 'Fletes', label: 'Programados', value: String(freightAssignmentsMock.filter((item) => item.status === 'SCHEDULED').length), trend: 'con camion y chofer' },
  { group: 'Fletes', label: 'En ruta', value: String(freightAssignmentsMock.filter((item) => item.status === 'IN_TRANSIT').length), trend: 'seguimiento activo' },
]

export const casesByStatusMock: CasesByStatus[] = [
  { label: 'Diagnostico', value: casesMock.filter((item) => item.status === 'diagnosis').length },
  { label: 'Asignado', value: casesMock.filter((item) => item.status === 'assigned').length },
  { label: 'Reparacion', value: casesMock.filter((item) => item.status === 'repairing').length },
  { label: 'Prueba', value: casesMock.filter((item) => item.status === 'testing').length },
]

export const mechanicWorkloadMock: MechanicWorkloadItem[] = mechanicsMock.map((mechanic) => ({
  assignedCases: mechanic.activeCases,
  maxCases: mechanic.maxCases,
  mechanicId: mechanic.id,
  mechanicName: mechanic.name,
}))
