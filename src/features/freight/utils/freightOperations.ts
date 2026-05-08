import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { FreightAssignment, FreightQuote, FreightRequest } from '../types/freight.types'

export type FreightFlowStage =
  | 'request'
  | 'quote'
  | 'approval'
  | 'assignment'
  | 'dispatch'
  | 'tracking'
  | 'closure'

export interface FreightFlowStep {
  key: FreightFlowStage
  label: string
  shortLabel: string
  description: string
}

export interface FreightPriority {
  label: string
  level: 'normal' | 'attention' | 'critical'
  reason: string
  tone: BadgeTone
}

export const FREIGHT_FLOW_STEPS: FreightFlowStep[] = [
  {
    key: 'request',
    label: 'Solicitud',
    shortLabel: 'Solicitud',
    description: 'Cliente, ruta y carga',
  },
  {
    key: 'quote',
    label: 'Cotizacion',
    shortLabel: 'Cotiza',
    description: 'Tarifa y validez',
  },
  {
    key: 'approval',
    label: 'Aprobacion',
    shortLabel: 'Aprueba',
    description: 'Decision cliente',
  },
  {
    key: 'assignment',
    label: 'Asignacion',
    shortLabel: 'Asigna',
    description: 'Camion y chofer',
  },
  {
    key: 'dispatch',
    label: 'Despacho',
    shortLabel: 'Despacho',
    description: 'Salida programada',
  },
  {
    key: 'tracking',
    label: 'Seguimiento',
    shortLabel: 'Ruta',
    description: 'En transito',
  },
  {
    key: 'closure',
    label: 'Cierre',
    shortLabel: 'Cierre',
    description: 'Entrega final',
  },
]

export function getFreightStageIndex(stage: FreightFlowStage) {
  return FREIGHT_FLOW_STEPS.findIndex((step) => step.key === stage)
}

export function getFreightRequestStage(request: FreightRequest): FreightFlowStage {
  switch (request.status) {
    case 'NEW':
      return 'request'
    case 'QUOTING':
      return 'quote'
    case 'QUOTE_SENT':
      return 'approval'
    case 'APPROVED':
      return 'assignment'
    case 'ASSIGNED':
      return 'dispatch'
    case 'IN_TRANSIT':
      return 'tracking'
    case 'DELIVERED':
      return 'closure'
    case 'CANCELLED':
    case 'REJECTED':
      return 'approval'
    default:
      return 'request'
  }
}

export function getFreightPriority(request: FreightRequest, now = new Date()): FreightPriority {
  const pickupTime = request.requestedPickupDate ? new Date(request.requestedPickupDate).getTime() : undefined
  const hoursToPickup = pickupTime ? (pickupTime - now.getTime()) / 36e5 : undefined
  const isClosed = ['CANCELLED', 'DELIVERED', 'REJECTED'].includes(request.status)

  if (!isClosed && hoursToPickup !== undefined && hoursToPickup < 0) {
    return {
      label: 'Atrasado',
      level: 'critical',
      reason: 'Retiro vencido',
      tone: 'danger',
    }
  }

  if (!isClosed && hoursToPickup !== undefined && hoursToPickup <= 24) {
    return {
      label: '24 h',
      level: 'critical',
      reason: 'Retiro dentro de 24 h',
      tone: 'danger',
    }
  }

  if (['HAZARDOUS', 'OVERSIZED', 'REFRIGERATED'].includes(request.cargoType) && !request.assignedTruckId) {
    return {
      label: 'Especial',
      level: 'attention',
      reason: 'Carga requiere validacion operacional',
      tone: 'warning',
    }
  }

  if (request.status === 'APPROVED' && !request.assignedTruckId) {
    return {
      label: 'Asignar',
      level: 'attention',
      reason: 'Flete aprobado pendiente de camion y chofer',
      tone: 'warning',
    }
  }

  return {
    label: 'Normal',
    level: 'normal',
    reason: 'Sin alertas operacionales',
    tone: 'neutral',
  }
}

export function getFreightQuotePriority(quote: FreightQuote, now = new Date()): FreightPriority {
  const hoursToExpiry = (new Date(quote.validUntil).getTime() - now.getTime()) / 36e5

  if (quote.status === 'SENT' && hoursToExpiry < 0) {
    return {
      label: 'Expirada',
      level: 'critical',
      reason: 'Validez comercial vencida',
      tone: 'danger',
    }
  }

  if (quote.status === 'SENT' && hoursToExpiry <= 24) {
    return {
      label: 'Vence hoy',
      level: 'attention',
      reason: 'Cotizacion enviada con decision pendiente',
      tone: 'warning',
    }
  }

  if (quote.status === 'APPROVED') {
    return {
      label: 'Aprobada',
      level: 'normal',
      reason: 'Lista para asignacion',
      tone: 'success',
    }
  }

  return {
    label: 'Seguimiento',
    level: 'normal',
    reason: 'Sin alerta comercial critica',
    tone: 'neutral',
  }
}

export function findAssignmentForRequest(assignments: FreightAssignment[], requestId: string) {
  return assignments.find((assignment) => assignment.requestId === requestId)
}

export function findQuoteForRequest(quotes: FreightQuote[], request: FreightRequest) {
  return quotes.find((quote) => quote.id === request.quoteId || quote.requestId === request.id)
}
