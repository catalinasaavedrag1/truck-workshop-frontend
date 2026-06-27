import { Router } from 'express'
import { gpsController } from './gps.controller.js'

export const gpsRouter = Router()

gpsRouter.get('/last-position', gpsController.lastPositions)
gpsRouter.get('/history', gpsController.history)
