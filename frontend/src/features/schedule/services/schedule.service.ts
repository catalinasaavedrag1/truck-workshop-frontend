import { httpClient } from '../../../shared/services/httpClient'
import type { ApiResponse } from '../../../shared/types/api.types'
import type { SchedulePlanRequest, SchedulePlanResponse } from '../types/schedule.types'

export async function planScheduleEvent(payload: SchedulePlanRequest) {
  const response = await httpClient.post<ApiResponse<SchedulePlanResponse>>('/schedule/events', payload)

  return response.data.data
}
