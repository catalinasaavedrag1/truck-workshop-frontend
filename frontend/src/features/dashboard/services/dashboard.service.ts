import {
  casesByStatusMock,
  dashboardMetricsMock,
  mechanicWorkloadMock,
} from '../../../mocks/dashboard.mock'
import { casesMock } from '../../../mocks/cases.mock'
import { httpClient } from '../../../shared/services/httpClient'
import { shouldUseMockFallback } from '../../../shared/services/resourceApi'
import type { ApiResponse } from '../../../shared/types/api.types'

interface DashboardApiSummary {
  assignments: {
    active: number
  }
  cases: {
    critical: number
    slaAtRisk: number
    slaBreached: number
    total: number
  }
}

export async function getDashboardSummary() {
  try {
    const response = await httpClient.get<ApiResponse<DashboardApiSummary>>('/dashboard/summary')
    const summary = response.data.data

    return {
      casesByStatus: casesByStatusMock,
      metrics: dashboardMetricsMock.map((metric) => {
        if (metric.label === 'Casos abiertos') {
          return { ...metric, value: String(summary.cases.total) }
        }

        if (metric.label === 'SLA en riesgo') {
          return { ...metric, value: String(summary.cases.slaAtRisk) }
        }

        if (metric.label === 'SLA vencido') {
          return { ...metric, value: String(summary.cases.slaBreached) }
        }

        return metric
      }),
      mechanicWorkload: mechanicWorkloadMock,
      urgentCases: casesMock.filter((item) => item.priority === 'critical' || item.priority === 'high'),
    }
  } catch (error) {
    if (!shouldUseMockFallback()) {
      throw error
    }

    return {
      casesByStatus: casesByStatusMock,
      metrics: dashboardMetricsMock,
      mechanicWorkload: mechanicWorkloadMock,
      urgentCases: casesMock.filter((item) => item.priority === 'critical' || item.priority === 'high'),
    }
  }
}
