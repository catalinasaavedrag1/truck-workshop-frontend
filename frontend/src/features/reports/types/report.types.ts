import type { BadgeTone } from '../../../shared/components/Badge/Badge'

export type ReportSection =
  | 'overview'
  | 'workshop'
  | 'fleet'
  | 'documents'
  | 'driverSheets'
  | 'finance'
  | 'inventory'
  | 'tires'

export interface ReportMetric {
  id: string
  label: string
  value: string
  helper: string
  tone: BadgeTone
}

export interface ReportBarItem {
  id: string
  label: string
  value: number
  helper?: string
  tone?: BadgeTone
}

export interface ReportCatalogItem {
  id: ReportSection
  label: string
  description: string
  kpi: string
  tone: BadgeTone
}

export interface OperationalAlert {
  id: string
  title: string
  description: string
  owner: string
  tone: BadgeTone
}

export interface CasesReportRow {
  status: string
  label: string
  cases: number
  averageHours: number
  estimatedCost: number
  slaRiskCases: number
  blockedPartsCases: number
}

export interface MechanicPerformanceRow {
  mechanicName: string
  specialty: string
  activeCases: number
  capacity: number
  utilization: number
  criticalCases: number
  averageRepairHours: number
  reworkRate: number
}

export interface FleetRiskRow {
  truckId: string
  plate: string
  model: string
  status: string
  healthScore: number
  blocker: string
  costPerKm?: number
  documentRisk: string
  maintenanceRisk: string
}

export type DocumentExpirationPriority = 'blocked' | 'urgent' | 'warning' | 'planned'

export interface TechnicalInspectionExpirationRow {
  assignedDriverName?: string
  blocker?: string
  daysUntilExpiration: number | null
  documentId?: string | null
  documentNumber?: string | null
  documentType: string
  expiresAt?: string | null
  model: string
  notes?: string
  operationalStatus?: string
  plate: string
  priority: DocumentExpirationPriority
  recommendedAction: string
  status: string
  truckId: string
}

export interface TechnicalInspectionExpirationSummary {
  due15: number
  due30: number
  expired: number
  horizonDays: number
  missing: number
  planned: number
  total: number
}

export interface TechnicalInspectionExpirationReportData {
  rows: TechnicalInspectionExpirationRow[]
  summary: TechnicalInspectionExpirationSummary
}

export interface PurchaseInventoryRow {
  sku: string
  name: string
  stock: number
  minStock: number
  status: string
  activePurchaseOrder?: string
  activeCases: number
  estimatedAmount: number
}

export interface FreightProfitabilityReportRow {
  freightId: string
  customerName: string
  truckPlate: string
  revenue: number
  totalCost: number
  marginPercentage: number
  grossMargin: number
  km: number
  costPerKm: number
}

export interface DriverTripSheetPerformanceRow {
  approvedSheets: number
  averageCostPerKm: number
  averageRevenuePerKm: number
  driverId: string
  driverName: string
  marginPercentage: number
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

export interface DriverTripSheetReportSummary {
  averageScore: number
  drivers: number
  netMargin: number
  revenue: number
  sheets: number
  totalExpenses: number
  waitingHours: number
}

export interface DriverTripSheetReportData {
  rows: DriverTripSheetPerformanceRow[]
  summary: DriverTripSheetReportSummary
}

export type DriverPerformanceRiskLevel = 'BLOCKED' | 'READY' | 'REVIEW'

export type DriverPerformanceBand = 'BLOCKED' | 'EXCELLENT' | 'REVIEW' | 'RISK' | 'STRONG'

export interface DriverPerformanceScores {
  checklistScore: number
  complianceScore: number
  fuelScore: number
  operationalScore: number
  profitabilityScore: number
  punctualityScore: number
  safetyScore: number
  telemetryScore: number
  tripScore: number
}

export interface DriverPerformanceTruck {
  healthScore: number | null
  id: string
  operationalStatus: string
  plate: string
}

export interface DriverPerformanceTripMetrics {
  approvedSheets: number
  assignments: number
  cancelledAssignments: number
  deliveredAssignments: number
  deliveredTrips: number
  draftSheets: number
  inTransitAssignments: number
  onTimeRate: number | null
  paidSheets: number
  rejectedSheets: number
  scheduledAssignments: number
  sheets: number
  submittedSheets: number
}

export interface DriverPerformanceFinance {
  averageCostPerKm: number
  averageRevenuePerKm: number
  grossMargin: number
  marginPercentage: number
  netMargin: number
  revenue: number
  totalExpenses: number
}

export interface DriverPerformanceRoute {
  fuelCost: number
  kmDeviationPercent: number
  kmPlanned: number
  kmReal: number
  lodgingCost: number
  mealCost: number
  otherCost: number
  parkingCost: number
  tipCost: number
  tollCost: number
  waitingCost: number
  waitingHours: number
}

export interface DriverPerformanceFuel {
  averageKmPerLiter: number
  fuelSpend: number
  liters: number
  records: number
  suspiciousRecords: number
  warningRecords: number
}

export interface DriverPerformanceCompliance {
  activeFineAmount: number
  activeFines: number
  criticalFines: number
  documents: number
  expiredDocuments: number
  expiringDocuments: number
  hardDocumentIssues: number
  missingDocuments: number
  overdueFines: number
  paidFines: number
  status: string
}

export interface DriverPerformanceSafety {
  arrivalDamages: number
  blockedChecklists: number
  checklistObservations: number
  criticalIncidents: number
  estimatedIncidentCost: number
  openCases: number
  openIncidents: number
  routeDeviationAlerts: number
  speedingAlerts: number
  telemetryAlerts: number
  totalIncidents: number
}

export interface DriverPerformanceChecklist {
  arrivals: number
  blocked: number
  completed: number
  departures: number
  observations: number
  total: number
}

export interface DriverPerformanceRecentTrip {
  id: string
  netMargin: number
  performanceScore: number
  route: string
  sheetNumber: string
  status: string
  totalExpenses: number
  tripDate: string
}

export interface DriverPerformanceRecentFuel {
  date: string
  deviationStatus: string
  id: string
  kmPerLiter: number
  liters: number
  totalAmount: number
}

export interface DriverPerformanceRecentIncident {
  estimatedCost: number
  id: string
  incidentNumber: string
  occurredAt: string
  severity: string
  status: string
  type: string
}

export interface DriverPerformanceRecentChecklist {
  freightId: string
  id: string
  kind: string
  occurredAt: string
  status: string
  summary: string
}

export interface DriverPerformanceRecent {
  checklists: DriverPerformanceRecentChecklist[]
  documents: unknown[]
  fines: unknown[]
  fuelRecords: DriverPerformanceRecentFuel[]
  incidents: DriverPerformanceRecentIncident[]
  trips: DriverPerformanceRecentTrip[]
}

export interface DriverPerformanceRow {
  assignedTruck: DriverPerformanceTruck | null
  blockers: string[]
  checklist: DriverPerformanceChecklist
  compliance: DriverPerformanceCompliance
  decision: string
  document: string
  driverId: string
  driverName: string
  finance: DriverPerformanceFinance
  fuel: DriverPerformanceFuel
  highlights: string[]
  lastActivityAt: string | null
  license: string
  nextAction: string
  performanceBand: DriverPerformanceBand
  recent: DriverPerformanceRecent
  riskLevel: DriverPerformanceRiskLevel
  route: DriverPerformanceRoute
  safety: DriverPerformanceSafety
  scores: DriverPerformanceScores
  status: string
  tripMetrics: DriverPerformanceTripMetrics
}

export interface DriverPerformanceReportSummary {
  activeDrivers: number
  averageFuelEfficiency: number
  averageOperationalScore: number
  blockedDrivers: number
  driversWithTrips: number
  readyDrivers: number
  reviewDrivers: number
  totalActiveFines: number
  totalDriverDocumentsIssues: number
  totalExpenses: number
  totalIncidentCost: number
  totalKm: number
  totalNetMargin: number
  totalOpenIncidents: number
  totalRevenue: number
  totalSheets: number
  totalWaitingHours: number
}

export interface DriverPerformanceReportFilters {
  driverId: string
  from: string
  periodDays: number
  risk: string
  status: string
  to: string
}

export interface DriverPerformanceReportData {
  filters: DriverPerformanceReportFilters
  generatedAt: string
  rows: DriverPerformanceRow[]
  summary: DriverPerformanceReportSummary
}

export interface FuelDeviationReportRow {
  id: string
  truckPlate: string
  driverName: string
  liters: number
  totalAmount: number
  kmPerLiter: number
  deviationStatus: string
}

export interface TireEconomicsRow {
  tireType: string
  averagePurchaseCost: number
  averageKmUsed: number
  averageCostPerKm: number
  bestSupplier: string
  installed: number
  sampleSize: number
}

export interface ReportsDashboard {
  metrics: ReportMetric[]
  catalog: ReportCatalogItem[]
  alerts: OperationalAlert[]
  caseStatusRows: CasesReportRow[]
  repairStageRows: ReportBarItem[]
  slaRows: ReportBarItem[]
  mechanicRows: MechanicPerformanceRow[]
  fleetRiskRows: FleetRiskRow[]
  technicalInspectionExpirations: TechnicalInspectionExpirationReportData
  fleetStatusRows: ReportBarItem[]
  purchaseInventoryRows: PurchaseInventoryRow[]
  purchaseStatusRows: ReportBarItem[]
  driverTripSheetReport: DriverTripSheetReportData
  freightProfitabilityRows: FreightProfitabilityReportRow[]
  fuelDeviationRows: FuelDeviationReportRow[]
  tireEconomicsRows: TireEconomicsRow[]
}
