import { ROUTES } from '../../config/routes'

export type EntityType =
  | 'case'
  | 'workshopCase'
  | 'truck'
  | 'workshopTruck'
  | 'driver'
  | 'mechanic'
  | 'supplier'
  | 'part'
  | 'sku'
  | 'purchaseOrder'
  | 'quote'
  | 'freightRequest'
  | 'freightQuote'
  | 'customer'
  | 'incident'
  | 'truckDocument'
  | 'truckCost'
  | 'maintenancePlan'
  | 'warehouseLocation'

const routeBuilders: Record<EntityType, (id: string) => string> = {
  case: ROUTES.caseDetail,
  customer: ROUTES.customerDetail,
  driver: ROUTES.driverDetail,
  freightQuote: ROUTES.freightQuoteDetail,
  freightRequest: ROUTES.freightRequestDetail,
  incident: ROUTES.incidentDetail,
  maintenancePlan: ROUTES.preventiveMaintenanceDetail,
  mechanic: ROUTES.mechanicDetail,
  part: ROUTES.partDetail,
  purchaseOrder: ROUTES.purchaseOrderDetail,
  quote: ROUTES.quoteDetail,
  sku: (sku) => `${ROUTES.parts}?sku=${encodeURIComponent(sku)}`,
  supplier: ROUTES.supplierDetail,
  truck: ROUTES.fleetTruckDetail,
  truckCost: ROUTES.truckCostDetail,
  truckDocument: ROUTES.truckDocumentDetail,
  warehouseLocation: () => ROUTES.warehouseLocations,
  workshopCase: ROUTES.caseDetail,
  workshopTruck: ROUTES.truckDetail,
}

export function getEntityPath(type: EntityType, id?: string | null) {
  if (!id) {
    return undefined
  }

  return routeBuilders[type]?.(id)
}

export function getEntityListPath(type: EntityType) {
  const listRoutes: Partial<Record<EntityType, string>> = {
    case: ROUTES.cases,
    customer: ROUTES.customers,
    driver: ROUTES.drivers,
    freightQuote: ROUTES.freightQuotes,
    freightRequest: ROUTES.freightRequests,
    incident: ROUTES.incidents,
    maintenancePlan: ROUTES.preventiveMaintenance,
    mechanic: ROUTES.mechanics,
    part: ROUTES.parts,
    purchaseOrder: ROUTES.purchaseOrders,
    quote: ROUTES.quotes,
    sku: ROUTES.parts,
    supplier: ROUTES.suppliers,
    truck: ROUTES.fleetTrucks,
    truckCost: ROUTES.truckCosts,
    truckDocument: ROUTES.truckDocuments,
    warehouseLocation: ROUTES.warehouseLocations,
    workshopCase: ROUTES.cases,
    workshopTruck: ROUTES.trucks,
  }

  return listRoutes[type]
}
