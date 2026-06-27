import { casesMock } from '../../frontend/src/mocks/cases.mock'
import { mechanicsMock } from '../../frontend/src/mocks/mechanics.mock'
import { partsMock } from '../../frontend/src/mocks/parts.mock'
import { trucksMock } from '../../frontend/src/mocks/trucks.mock'
import { approvalsMock } from '../../frontend/src/features/approvals/mocks/approvals.mock'
import {
  communicationConversationsMock,
  communicationMessagesMock,
  communicationProviderConfigsMock,
  communicationProfilesMock,
  communicationQuoteLinksMock,
} from '../../frontend/src/features/communications/mocks/communications.mock'
import { customersMock } from '../../frontend/src/features/customers/mocks/customers.mock'
import { diagnosticChecklistsMock } from '../../frontend/src/features/diagnostic-checklists/mocks/diagnosticChecklists.mock'
import { driverDocumentsMock, driverFinesMock } from '../../frontend/src/features/drivers/mocks/driverDocuments.mock'
import { driversMock } from '../../frontend/src/features/drivers/mocks/drivers.mock'
import { driverTripSheetsMock } from '../../frontend/src/features/driver-trip-sheets/mocks/driverTripSheets.mock'
import { escalationHistoryMock } from '../../frontend/src/features/escalation/mocks/escalation.mock'
import {
  fleetAvailabilityMock,
  fleetTrucksMock,
  truckHealthScoresMock,
  truckTimelineMock,
} from '../../frontend/src/features/fleet/mocks/fleet.mock'
import { freightAssignmentsMock, freightQuotesMock, freightRequestsMock } from '../../frontend/src/features/freight/mocks/freight.mock'
import { freightProfitabilityMock } from '../../frontend/src/features/freight-profitability/mocks/freightProfitability.mock'
import { fuelRecordsMock } from '../../frontend/src/features/fuel/mocks/fuel.mock'
import { incidentsMock } from '../../frontend/src/features/incidents/mocks/incidents.mock'
import { laborTasksMock } from '../../frontend/src/features/labor/mocks/labor.mock'
import { mechanicSpecialtiesMock } from '../../frontend/src/features/mechanics/mocks/mechanicSpecialties.mock'
import { alertSubscriptionsMock, notificationsMock } from '../../frontend/src/features/notifications/mocks/notifications.mock'
import { rolesMock, userRoleAssignmentsMock } from '../../frontend/src/features/permissions/mocks/permissions.mock'
import { preventiveMaintenanceMock } from '../../frontend/src/features/preventive-maintenance/mocks/preventiveMaintenance.mock'
import { purchaseOrdersMock, purchaseRequestsMock } from '../../frontend/src/features/purchase-orders/mocks/purchaseOrders.mock'
import { purchaseInvoicesMock } from '../../frontend/src/features/purchase-invoices/mocks/purchaseInvoices.mock'
import { freightInvoicesMock } from '../../frontend/src/features/freight-invoices/mocks/freightInvoices.mock'
import { quotesMock } from '../../frontend/src/features/quotes/mocks/quotes.mock'
import { scheduleEventsMock, waitingQueueMock } from '../../frontend/src/features/schedule/mocks/schedule.mock'
import { slaConfigsMock } from '../../frontend/src/features/sla/mocks/sla.mock'
import { suppliersMock } from '../../frontend/src/features/suppliers/mocks/suppliers.mock'
import { telematicsMock } from '../../frontend/src/features/telematics/mocks/telematics.mock'
import { tirePerformanceMock } from '../../frontend/src/features/tire-performance/mocks/tirePerformance.mock'
import { arrivalChecklistsMock, departureChecklistsMock } from '../../frontend/src/features/trip-checklists/mocks/tripChecklists.mock'
import { truckCostsMock, truckCostSummariesMock } from '../../frontend/src/features/truck-costs/mocks/truckCosts.mock'
import { truckDocumentsMock } from '../../frontend/src/features/truck-documents/mocks/truckDocuments.mock'
import {
  warehouseLocationsMock,
  warehouseManagersMock,
  warehouseMovementsMock,
  warehouseStockMock,
} from '../../frontend/src/features/warehouse/mocks/warehouse.mock'
import { workshopBaysMock } from '../../frontend/src/features/workshop-bays/mocks/workshopBays.mock'

const now = '2026-05-06T12:00:00.000Z'
const developmentPasswordHash = 'pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI'

function withTimestamps<T extends Record<string, unknown>>(record: T) {
  return {
    ...record,
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? record.createdAt ?? now,
  }
}

function deriveAssignments() {
  return casesMock
    .filter((workshopCase) => workshopCase.mechanicId || workshopCase.assignedMechanicId)
    .map((workshopCase) => ({
      assignedAt: workshopCase.updatedAt || workshopCase.createdAt || now,
      caseCode: workshopCase.caseNumber,
      caseId: workshopCase.id,
      createdAt: workshopCase.createdAt || now,
      id: `assignment-${workshopCase.id}`,
      mechanicId: workshopCase.mechanicId || workshopCase.assignedMechanicId,
      mechanicName: workshopCase.mechanicName || 'Taller',
      status: workshopCase.status === 'closed' ? 'completed' : 'active',
      updatedAt: workshopCase.updatedAt || now,
    }))
}

function deriveDiagnostics() {
  return casesMock.map((workshopCase) => ({
    caseId: workshopCase.id,
    category: workshopCase.title.toLowerCase().includes('freno') ? 'brakes' : 'engine',
    createdAt: workshopCase.createdAt,
    id: `diagnostic-${workshopCase.id}`,
    rootCause: workshopCase.failureDescription,
    severity: workshopCase.priority,
    symptoms: [workshopCase.title, workshopCase.failureDescription],
  }))
}

function deriveRepairSolutions() {
  return casesMock.map((workshopCase) => ({
    approvalRequired: workshopCase.estimatedCost >= 500000,
    caseId: workshopCase.id,
    createdAt: workshopCase.createdAt,
    estimatedCost: workshopCase.estimatedCost,
    id: `repair-solution-${workshopCase.id}`,
    laborHours: Math.max(2, workshopCase.requiredParts.length * 2),
    requiredParts: workshopCase.requiredParts,
    summary: workshopCase.currentStep,
    updatedAt: workshopCase.updatedAt,
  }))
}

export const seedRecordsByResource = {
  approvals: approvalsMock.map(withTimestamps),
  'alert-subscriptions': alertSubscriptionsMock.map(withTimestamps),
  'communication-conversations': communicationConversationsMock.map(withTimestamps),
  'communication-messages': communicationMessagesMock.map(withTimestamps),
  'communication-profiles': communicationProfilesMock.map(withTimestamps),
  'communication-provider-configs': communicationProviderConfigsMock.map(withTimestamps),
  'communication-quote-links': communicationQuoteLinksMock.map(withTimestamps),
  customers: customersMock.map(withTimestamps),
  assignments: deriveAssignments(),
  'diagnostic-checklists': diagnosticChecklistsMock.map(withTimestamps),
  diagnostics: deriveDiagnostics(),
  'driver-documents': driverDocumentsMock.map(withTimestamps),
  'driver-fines': driverFinesMock.map(withTimestamps),
  'driver-trip-sheets': driverTripSheetsMock.map(withTimestamps),
  drivers: driversMock.map(withTimestamps),
  'escalation-events': escalationHistoryMock.map(withTimestamps),
  'fleet-availability': fleetAvailabilityMock.map(withTimestamps),
  'fleet-trucks': fleetTrucksMock.map(withTimestamps),
  'freight-assignments': freightAssignmentsMock.map(withTimestamps),
  'freight-profitability': freightProfitabilityMock.map(withTimestamps),
  'freight-quotes': freightQuotesMock.map(withTimestamps),
  'freight-requests': freightRequestsMock.map(withTimestamps),
  'fuel-records': fuelRecordsMock.map(withTimestamps),
  incidents: incidentsMock.map(withTimestamps),
  'labor-tasks': laborTasksMock.map(withTimestamps),
  'mechanic-specialties': mechanicSpecialtiesMock.map(withTimestamps),
  mechanics: mechanicsMock.map(withTimestamps),
  notifications: notificationsMock.map(withTimestamps),
  parts: partsMock.map(withTimestamps),
  'preventive-maintenance-plans': preventiveMaintenanceMock.map(withTimestamps),
  'purchase-orders': purchaseOrdersMock.map(withTimestamps),
  'purchase-invoices': purchaseInvoicesMock.map(withTimestamps),
  'freight-invoices': freightInvoicesMock.map(withTimestamps),
  'purchase-requests': purchaseRequestsMock.map(withTimestamps),
  quotes: quotesMock.map(withTimestamps),
  'repair-solutions': deriveRepairSolutions(),
  roles: rolesMock.map(withTimestamps),
  'schedule-events': scheduleEventsMock.map(withTimestamps),
  'sla-configs': slaConfigsMock.map((config) => ({
    ...withTimestamps(config),
    escalationLevel: 'LEVEL_0_NORMAL',
    isActive: true,
  })),
  suppliers: suppliersMock.map((supplier) => ({ ...withTimestamps(supplier), status: 'active' })),
  telematics: telematicsMock.map((telemetry) => withTimestamps({ ...telemetry, id: `telemetry-${telemetry.truckId}` })),
  'tire-lifecycles': tirePerformanceMock.map(withTimestamps),
  'arrival-checklists': arrivalChecklistsMock.map(withTimestamps),
  'departure-checklists': departureChecklistsMock.map(withTimestamps),
  'truck-costs': truckCostsMock.map(withTimestamps),
  'truck-cost-summaries': truckCostSummariesMock.map((summary) =>
    withTimestamps({ ...summary, id: `truck-cost-summary-${summary.truckId}` }),
  ),
  'truck-documents': truckDocumentsMock.map(withTimestamps),
  'truck-health-scores': truckHealthScoresMock.map((score) =>
    withTimestamps({ ...score, id: `truck-health-score-${score.truckId}` }),
  ),
  'truck-timeline-events': truckTimelineMock.map(withTimestamps),
  trucks: trucksMock.map(withTimestamps),
  'user-role-assignments': userRoleAssignmentsMock.map((assignment) =>
    withTimestamps({
      ...assignment,
      id: `user-role-${assignment.userId}`,
      isActive: true,
      passwordHash: developmentPasswordHash,
      passwordUpdatedAt: '2026-05-13T00:00:00.000Z',
    }),
  ),
  'waiting-queue': waitingQueueMock.map(withTimestamps),
  'warehouse-locations': warehouseLocationsMock.map(withTimestamps),
  'warehouse-managers': warehouseManagersMock.map(withTimestamps),
  'warehouse-movements': warehouseMovementsMock.map(withTimestamps),
  'warehouse-stock': warehouseStockMock.map((stockItem) =>
    withTimestamps({ ...stockItem, id: `warehouse-stock-${stockItem.partId}` }),
  ),
  'workshop-bays': workshopBaysMock.map(withTimestamps),
  'workshop-cases': casesMock.map(withTimestamps),
}
