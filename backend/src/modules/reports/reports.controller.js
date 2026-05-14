import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { buildDriverPerformanceReport } from './driver-performance-report.service.js'
import {
  buildDocumentExpirationsReport,
  buildDriverTripSheetsReport,
  buildFleetReport,
  buildFinanceReport,
  buildInventoryReport,
  buildReportsOverview,
  buildTireReport,
  buildWorkshopReport,
} from './reports.service.js'

export const getReportsOverview = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildReportsOverview() })
})

export const getWorkshopReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildWorkshopReport() })
})

export const getFleetReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildFleetReport() })
})

export const getFinanceReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildFinanceReport() })
})

export const getInventoryReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildInventoryReport() })
})

export const getTireReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildTireReport() })
})

export const getDocumentExpirationsReport = asyncHandler(async (request, response) => {
  const days = clampNumber(request.query.days, 1, 365, 90)
  const documentType = String(request.query.documentType || 'TECHNICAL_INSPECTION')

  sendResponse(response, { data: await buildDocumentExpirationsReport({ days, documentType }) })
})

export const getDriverTripSheetsReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildDriverTripSheetsReport(request.query) })
})

export const getDriverPerformanceReport = asyncHandler(async (request, response) => {
  sendResponse(response, { data: await buildDriverPerformanceReport(request.query) })
})

function clampNumber(value, min, max, fallback) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return fallback
  }

  return Math.min(Math.max(Math.trunc(number), min), max)
}
