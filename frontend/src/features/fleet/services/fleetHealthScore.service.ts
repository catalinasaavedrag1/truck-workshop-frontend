import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { FleetHealthScoreOverview, FleetHealthScoreRow, FleetTruck, TruckHealthScore } from '../types/fleet.types'

export async function getFleetHealthScoreOverview() {
  const response = await httpClient.get<ApiResponse<FleetHealthScoreOverview>>('/fleet/health-scores/overview')

  return response.data.data
}

export async function recalculateFleetHealthScores(actorName = 'Sistema') {
  const response = await httpClient.post<ApiResponse<FleetHealthScoreOverview>>('/fleet/health-scores/recalculate', {
    actorName,
  })

  return response.data.data
}

export function buildFleetHealthFallbackOverview(trucks: FleetTruck[], scores: TruckHealthScore[]): FleetHealthScoreOverview {
  const generatedAt = new Date().toISOString()
  const rows = scores
    .map((score): FleetHealthScoreRow => {
      const truck = trucks.find((item) => item.id === score.truckId)
      const actionState = score.score >= 85 ? 'DISPATCH_READY' : score.score >= 50 ? 'REVIEW_BEFORE_ASSIGNMENT' : 'BLOCKED'

      return {
        ...score,
        actionState,
        assignedDriverName: truck?.assignedDriverName,
        brand: truck?.brand,
        costPerKm: 0,
        mainBlocker: truck?.mainBlocker,
        model: truck?.model,
        monthlyCost: 0,
        nextAction:
          actionState === 'DISPATCH_READY'
            ? 'Apto para despacho. Mantener monitoreo normal.'
            : 'Revisar descuentos principales antes de asignar.',
        operationalStatus: truck?.operationalStatus || 'AVAILABLE',
        plate: truck?.plate || score.truckId,
        previousScore: score.score,
        scoreDelta: 0,
        statusLabel: score.status,
        topRiskCategory: score.deductions[0]?.category || 'NONE',
        truckLabel: truck ? `${truck.plate} - ${truck.brand} ${truck.model}` : score.truckId,
        updatedAt: generatedAt,
      }
    })
    .sort((first, second) => first.score - second.score)

  return {
    generatedAt,
    rows,
    rules: {
      CRITICAL: '0-49: no asignar sin resolver bloqueo o riesgo critico.',
      HEALTHY: '85-100: apto para despacho.',
      RISK: '50-69: requiere gestion antes de asignar.',
      WARNING: '70-84: revisar antes de rutas largas o criticas.',
    },
    summary: {
      averageScore: rows.length > 0 ? Math.round(rows.reduce((total, row) => total + row.score, 0) / rows.length) : 0,
      blocked: rows.filter((row) => row.actionState === 'BLOCKED').length,
      critical: rows.filter((row) => row.status === 'CRITICAL').length,
      dispatchReady: rows.filter((row) => row.actionState === 'DISPATCH_READY').length,
      healthy: rows.filter((row) => row.status === 'HEALTHY').length,
      reviewRequired: rows.filter((row) => row.actionState === 'REVIEW_BEFORE_ASSIGNMENT').length,
      risk: rows.filter((row) => row.status === 'RISK').length,
      total: rows.length,
      warning: rows.filter((row) => row.status === 'WARNING').length,
      worstTruck: rows[0] ? { plate: rows[0].plate, score: rows[0].score, truckId: rows[0].truckId } : undefined,
    },
  }
}
