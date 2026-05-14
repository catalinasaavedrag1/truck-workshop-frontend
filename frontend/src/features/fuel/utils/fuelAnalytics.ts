import type { FuelDeviationStatus, FuelRecord } from '../types/fuel.types'

export function getAverageKmPerLiter(records: FuelRecord[]) {
  const recordsWithEfficiency = records.filter((record) => record.kmPerLiter)

  return (
    recordsWithEfficiency.reduce((sum, record) => sum + (record.kmPerLiter || 0), 0) /
    Math.max(recordsWithEfficiency.length, 1)
  )
}

export function getTotalLiters(records: FuelRecord[]) {
  return records.reduce((sum, record) => sum + record.liters, 0)
}

export function getTotalFuelCost(records: FuelRecord[]) {
  return records.reduce((sum, record) => sum + record.totalAmount, 0)
}

export function getDeviationCount(records: FuelRecord[], status: FuelDeviationStatus) {
  return records.filter((record) => record.deviationStatus === status).length
}

export function getFuelDeviationAction(status: FuelDeviationStatus) {
  if (status === 'SUSPICIOUS') {
    return 'Investigar carga, odometro y comprobante.'
  }

  if (status === 'WARNING') {
    return 'Comparar ruta, peso y rendimiento historico.'
  }

  return 'Sin accion inmediata.'
}
