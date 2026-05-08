import { asyncHandler } from '../../shared/http/async-handler.js'
import { sendResponse } from '../../shared/http/send-response.js'
import { PermissionsService } from './permissions.service.js'

const service = new PermissionsService()

export const roleController = {
  create: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.createRole(request.body) }, 201)
  }),
  get: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.getRole(request.params.id) })
  }),
  list: asyncHandler(async (request, response) => {
    sendResponse(response, await service.listRoles(request.query))
  }),
  remove: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.deleteRole(request.params.id) })
  }),
  update: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.updateRole(request.params.id, request.body) })
  }),
}

export const userRoleController = {
  create: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.createUserRole(request.body) }, 201)
  }),
  get: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.getUserRole(request.params.id) })
  }),
  list: asyncHandler(async (request, response) => {
    sendResponse(response, await service.listUserRoles(request.query))
  }),
  remove: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.deleteUserRole(request.params.id) })
  }),
  update: asyncHandler(async (request, response) => {
    sendResponse(response, { data: await service.updateUserRole(request.params.id, request.body) })
  }),
}
