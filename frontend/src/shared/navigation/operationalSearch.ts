import { ROUTES } from '../../config/routes'
import { customersMock } from '../../features/customers/mocks/customers.mock'
import { driversMock } from '../../features/drivers/mocks/drivers.mock'
import { fleetTrucksMock } from '../../features/fleet/mocks/fleet.mock'
import { freightRequestsMock } from '../../features/freight/mocks/freight.mock'
import { incidentsMock } from '../../features/incidents/mocks/incidents.mock'
import { purchaseOrdersMock } from '../../features/purchase-orders/mocks/purchaseOrders.mock'
import { tirePerformanceMock } from '../../features/tire-performance/mocks/tirePerformance.mock'
import { truckDocumentsMock } from '../../features/truck-documents/mocks/truckDocuments.mock'
import { casesMock } from '../../mocks/cases.mock'
import { formatRut, getRutSearchText } from '../utils/rut'

export type OperationalSignalTone = 'danger' | 'warning' | 'success' | 'info' | 'neutral'

export interface OperationalSearchItem {
  group: 'accion' | 'entidad' | 'prioridad'
  id: string
  keywords: string
  label: string
  meta: string
  path: string
  tone?: OperationalSignalTone
  type: string
}

export function getOperationalSearchItems(): OperationalSearchItem[] {
  const trucksById = new Map(fleetTrucksMock.map((truck) => [truck.id, truck]))

  return [
    ...casesMock.map((workshopCase) => ({
      group: 'entidad' as const,
      id: workshopCase.id,
      keywords: [
        workshopCase.caseNumber,
        workshopCase.truckPlate,
        workshopCase.customerName,
        workshopCase.driverName,
        workshopCase.failureDescription,
        workshopCase.status,
        workshopCase.priority,
        workshopCase.slaStatus,
      ].join(' '),
      label: workshopCase.caseNumber,
      meta: `${workshopCase.customerName} · ${workshopCase.truckPlate} · ${workshopCase.status}`,
      path: ROUTES.caseDetail(workshopCase.id),
      tone: (workshopCase.slaStatus === 'BREACHED' || workshopCase.priority === 'critical'
        ? 'danger'
        : workshopCase.slaStatus === 'AT_RISK' || workshopCase.priority === 'high'
          ? 'warning'
          : 'info') as OperationalSignalTone,
      type: 'Caso',
    })),
    ...fleetTrucksMock.map((truck) => ({
      group: 'entidad' as const,
      id: truck.id,
      keywords: [truck.plate, truck.brand, truck.model, truck.operationalStatus, truck.mainBlocker || '', truck.assignedDriverName || ''].join(' '),
      label: truck.plate,
      meta: `${truck.brand} ${truck.model} · ${truck.operationalStatus}`,
      path: ROUTES.fleetTruckDetail(truck.id),
      tone: (['BLOCKED', 'OUT_OF_SERVICE', 'WAITING_PARTS'].includes(truck.operationalStatus) ? 'danger' : 'success') as OperationalSignalTone,
      type: 'Camion',
    })),
    ...driversMock.map((driver) => ({
      group: 'entidad' as const,
      id: driver.id,
      keywords: [driver.name, getRutSearchText(driver.document), driver.company, driver.phone, driver.status].join(' '),
      label: driver.name,
      meta: `${driver.company} · ${formatRut(driver.document) || driver.document}`,
      path: ROUTES.driverDetail(driver.id),
      tone: (driver.status === 'active' ? 'success' : 'neutral') as OperationalSignalTone,
      type: 'Chofer',
    })),
    ...customersMock.map((customer) => ({
      group: 'entidad' as const,
      id: customer.id,
      keywords: [
        customer.name,
        getRutSearchText(customer.rut),
        customer.contactName || '',
        customer.email || '',
        customer.preferredOrigins.join(' '),
        customer.preferredDestinations.join(' '),
        customer.status,
        customer.riskLevel,
      ].join(' '),
      label: customer.name,
      meta: `${customer.contactName || 'Sin contacto'}${customer.rut ? ` · ${formatRut(customer.rut)}` : ''}`,
      path: ROUTES.customerDetail(customer.id),
      tone: (customer.riskLevel === 'high' ? 'warning' : customer.status === 'active' ? 'success' : 'neutral') as OperationalSignalTone,
      type: 'Cliente',
    })),
    ...purchaseOrdersMock.map((purchaseOrder) => ({
      group: 'entidad' as const,
      id: purchaseOrder.id,
      keywords: [
        purchaseOrder.purchaseOrderNumber,
        purchaseOrder.supplierName,
        purchaseOrder.relatedCaseId || '',
        purchaseOrder.status,
      ].join(' '),
      label: purchaseOrder.purchaseOrderNumber,
      meta: `${purchaseOrder.supplierName} · ${purchaseOrder.status}`,
      path: ROUTES.purchaseOrderDetail(purchaseOrder.id),
      tone: (['RECEIVED', 'CANCELLED'].includes(purchaseOrder.status) ? 'neutral' : 'warning') as OperationalSignalTone,
      type: 'OC',
    })),
    ...freightRequestsMock.map((request) => ({
      group: 'entidad' as const,
      id: request.id,
      keywords: [
        request.requestNumber,
        request.customerName,
        request.originAddress,
        request.destinationAddress,
        request.cargoDescription,
        request.status,
      ].join(' '),
      label: request.requestNumber,
      meta: `${request.customerName} · ${request.estimatedKm} km · ${request.status}`,
      path: ROUTES.freightRequestDetail(request.id),
      tone: (request.status === 'CANCELLED' ? 'neutral' : request.status === 'DELIVERED' ? 'success' : 'info') as OperationalSignalTone,
      type: 'Flete',
    })),
    ...tirePerformanceMock.map((tire) => ({
      group: 'entidad' as const,
      id: tire.id,
      keywords: [
        tire.skuCode,
        tire.skuName,
        tire.brand,
        tire.model || '',
        tire.truckPlate || '',
        tire.supplierName,
        tire.status,
      ].join(' '),
      label: tire.skuCode,
      meta: `${tire.brand} · ${tire.truckPlate || 'en stock'} · ${tire.status}`,
      path: `${ROUTES.tirePerformance}?sku=${encodeURIComponent(tire.skuCode)}`,
      tone: (tire.status === 'INSTALLED' ? 'success' : 'info') as OperationalSignalTone,
      type: 'Neumatico',
    })),
    ...truckDocumentsMock.map((document) => {
      const truck = trucksById.get(document.truckId)

      return {
        group: 'entidad' as const,
        id: document.id,
        keywords: [truck?.plate || document.truckId, document.documentType, document.documentNumber || '', document.status].join(' '),
        label: document.documentNumber || document.documentType,
        meta: `${truck?.plate || document.truckId} · ${document.status}`,
        path: ROUTES.truckDocumentDetail(document.id),
        tone: (document.status === 'EXPIRED' || document.status === 'MISSING' ? 'danger' : document.status === 'EXPIRES_SOON_15' ? 'warning' : 'success') as OperationalSignalTone,
        type: 'Documento',
      }
    }),
    ...incidentsMock.map((incident) => ({
      group: 'entidad' as const,
      id: incident.id,
      keywords: [
        incident.incidentNumber,
        incident.truckId,
        trucksById.get(incident.truckId)?.plate || '',
        incident.description,
        incident.location,
        incident.incidentType,
        incident.severity,
        incident.status,
      ].join(' '),
      label: incident.incidentNumber,
      meta: `${trucksById.get(incident.truckId)?.plate || incident.truckId} · ${incident.severity}`,
      path: ROUTES.incidentDetail(incident.id),
      tone: (incident.severity === 'CRITICAL' || incident.severity === 'HIGH' ? 'danger' : 'warning') as OperationalSignalTone,
      type: 'Incidente',
    })),
  ]
}

export function getOperationalPriorityItems(): OperationalSearchItem[] {
  const breachedCase = casesMock.find((item) => item.slaStatus === 'BREACHED')
  const blockedByParts = casesMock.filter((item) => item.requiredParts.some((part) => part.requiresPurchase))
  const expiredDocuments = truckDocumentsMock.filter((document) => document.status === 'EXPIRED' || document.status === 'MISSING')
  const blockedTrucks = fleetTrucksMock.filter((truck) => ['BLOCKED', 'OUT_OF_SERVICE', 'WAITING_PARTS'].includes(truck.operationalStatus))
  const pendingOrders = purchaseOrdersMock.filter((order) => ['REQUESTED', 'APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status))
  const items: OperationalSearchItem[] = []

  if (breachedCase) {
    items.push({
      group: 'prioridad',
      id: breachedCase.id,
      keywords: `${breachedCase.caseNumber} ${breachedCase.truckPlate} SLA vencido`,
      label: `SLA vencido · ${breachedCase.caseNumber}`,
      meta: `${breachedCase.truckPlate} · ${breachedCase.driverName}`,
      path: ROUTES.caseDetail(breachedCase.id),
      tone: 'danger',
      type: 'Prioridad',
    })
  }

  if (blockedByParts.length > 0) {
    items.push({
      group: 'prioridad',
      id: 'parts-blocked',
      keywords: 'repuestos bloqueos compra bodega stock',
      label: `${blockedByParts.length} casos bloqueados por repuestos`,
      meta: 'Convertir solicitud en OC o revisar recepcion',
      path: ROUTES.warehouse,
      tone: 'danger',
      type: 'Bloqueo',
    })
  }

  if (expiredDocuments.length > 0) {
    items.push({
      group: 'prioridad',
      id: 'expired-documents',
      keywords: 'documentos vencidos faltantes flota camion chofer',
      label: `${expiredDocuments.length} documentos vencidos/faltantes`,
      meta: 'Bloquean despacho o asignacion',
      path: `${ROUTES.truckDocuments}?status=EXPIRED`,
      tone: 'warning',
      type: 'Riesgo',
    })
  }

  if (blockedTrucks.length > 0) {
    items.push({
      group: 'prioridad',
      id: 'blocked-trucks',
      keywords: 'camiones bloqueados disponibilidad flota',
      label: `${blockedTrucks.length} camiones no disponibles`,
      meta: 'Revisar bloqueos y disponibilidad',
      path: ROUTES.fleetAvailability,
      tone: 'warning',
      type: 'Flota',
    })
  }

  if (pendingOrders.length > 0) {
    items.push({
      group: 'prioridad',
      id: 'pending-orders',
      keywords: 'ordenes compra pendientes proveedores recepcion',
      label: `${pendingOrders.length} OC pendientes`,
      meta: 'Seguimiento de compra y entrega',
      path: ROUTES.purchaseOrders,
      tone: 'info',
      type: 'Compras',
    })
  }

  return items
}

export function normalizeOperationalSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
