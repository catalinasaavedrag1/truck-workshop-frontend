import {
  calculateCostPerKm,
  calculateKmUsed,
} from '../constants/tirePerformance.constants'
import type { TireLifecycle, TireLifecycleStatus } from '../types/tirePerformance.types'

type StepTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface TireWorkflowStep {
  id: 'intake' | 'stock' | 'install' | 'monitor' | 'close' | 'report'
  actionLabel: string
  blockers: string[]
  count: number
  description: string
  label: string
  progress: number
  tone: StepTone
}

export interface TireOperationalAlert {
  description: string
  id: string
  severity: 'danger' | 'warning' | 'info'
  title: string
}

export interface TireOperationalReport {
  averageCostPerKm?: number
  averageKmUsed?: number
  averageNewCostPerKm?: number
  averageRetreadCostPerKm?: number
  closedCycles: TireLifecycle[]
  dataGaps: TireLifecycle[]
  installed: TireLifecycle[]
  operationalAlerts: TireOperationalAlert[]
  readyForReport: TireLifecycle[]
  reportReadiness: number
  riskTires: TireLifecycle[]
  savingPer100k?: number
  steps: TireWorkflowStep[]
  stock: TireLifecycle[]
  total: number
}

const CLOSED_STATUSES = new Set<TireLifecycleStatus>([
  'DISCARDED',
  'REMOVED',
  'RETREADED',
  'WARRANTY_CLAIM',
])

function average(values: number[]) {
  if (values.length === 0) {
    return undefined
  }

  return values.reduce((total, value) => total + value, 0) / values.length
}

function getKmUsed(tire: TireLifecycle) {
  return tire.kmUsed ?? calculateKmUsed(tire)
}

function getCostPerKm(tire: TireLifecycle) {
  return tire.costPerKm ?? calculateCostPerKm(tire.purchaseCost, getKmUsed(tire))
}

function hasInstallData(tire: TireLifecycle) {
  return Boolean(tire.installedAt && tire.truckId && tire.truckPlate && tire.odometerAtInstall !== undefined)
}

function hasRemovalData(tire: TireLifecycle) {
  return Boolean(tire.removedAt && tire.odometerAtRemoval !== undefined && tire.removalReason)
}

function hasReportData(tire: TireLifecycle) {
  const kmUsed = getKmUsed(tire)
  const costPerKm = getCostPerKm(tire)

  return Boolean(CLOSED_STATUSES.has(tire.status) && kmUsed && kmUsed > 0 && costPerKm)
}

function getProgress(current: number, expected: number) {
  if (expected <= 0) {
    return current > 0 ? 100 : 0
  }

  return Math.min(100, Math.round((current / expected) * 100))
}

function buildAlerts(tires: TireLifecycle[], dataGaps: TireLifecycle[], riskTires: TireLifecycle[]) {
  const alerts: TireOperationalAlert[] = []

  dataGaps.slice(0, 4).forEach((tire) => {
    const missingInstall = !hasInstallData(tire)
    const missingRemoval = CLOSED_STATUSES.has(tire.status) && !hasRemovalData(tire)

    alerts.push({
      description: [
        tire.truckPlate || 'Sin camion',
        missingInstall ? 'falta instalacion/km inicial' : '',
        missingRemoval ? 'falta retiro/km final/motivo' : '',
        !getKmUsed(tire) ? 'sin km rendidos' : '',
      ]
        .filter(Boolean)
        .join(' - '),
      id: `gap-${tire.id}`,
      severity: 'warning',
      title: `${tire.skuCode} no cierra el reporte`,
    })
  })

  riskTires.slice(0, 4).forEach((tire) => {
    const costPerKm = getCostPerKm(tire)

    alerts.push({
      description: `${tire.supplierName} - ${tire.truckPlate || 'sin camion'} - $${costPerKm?.toFixed(2)}/km`,
      id: `risk-${tire.id}`,
      severity: 'danger',
      title: `${tire.skuCode} costo/km alto`,
    })
  })

  const installedWithoutPosition = tires.filter((tire) => tire.status === 'INSTALLED' && !tire.tirePosition)

  installedWithoutPosition.slice(0, 3).forEach((tire) => {
    alerts.push({
      description: `${tire.truckPlate || 'Sin camion'} - falta posicion para comparar desgaste por eje.`,
      id: `position-${tire.id}`,
      severity: 'info',
      title: `${tire.skuCode} requiere posicion`,
    })
  })

  return alerts.slice(0, 8)
}

export function buildTireOperationalReport(tires: TireLifecycle[]): TireOperationalReport {
  const stock = tires.filter((tire) => tire.status === 'IN_STOCK' || tire.status === 'PURCHASED')
  const installed = tires.filter((tire) => tire.status === 'INSTALLED')
  const closedCycles = tires.filter((tire) => CLOSED_STATUSES.has(tire.status))
  const readyForReport = tires.filter(hasReportData)
  const dataGaps = tires.filter((tire) => {
    if (tire.status === 'PURCHASED' || tire.status === 'IN_STOCK') {
      return false
    }

    if (!hasInstallData(tire)) {
      return true
    }

    if (CLOSED_STATUSES.has(tire.status)) {
      return !hasRemovalData(tire) || !hasReportData(tire)
    }

    return false
  })
  const costValues = readyForReport.map((tire) => getCostPerKm(tire)).filter((value): value is number => value !== undefined)
  const kmValues = readyForReport.map((tire) => getKmUsed(tire)).filter((value): value is number => value !== undefined)
  const averageCostPerKm = average(costValues)
  const averageKmUsed = average(kmValues)
  const averageNewCostPerKm = average(
    readyForReport
      .filter((tire) => tire.tireType === 'NEW')
      .map((tire) => getCostPerKm(tire))
      .filter((value): value is number => value !== undefined),
  )
  const averageRetreadCostPerKm = average(
    readyForReport
      .filter((tire) => tire.tireType === 'RETREADED')
      .map((tire) => getCostPerKm(tire))
      .filter((value): value is number => value !== undefined),
  )
  const savingPer100k =
    averageNewCostPerKm !== undefined && averageRetreadCostPerKm !== undefined
      ? (averageNewCostPerKm - averageRetreadCostPerKm) * 100_000
      : undefined
  const riskTires = readyForReport.filter((tire) => {
    const costPerKm = getCostPerKm(tire)

    return costPerKm !== undefined && costPerKm > 2.8
  })
  const installable = stock.length
  const installedWithData = installed.filter(hasInstallData).length
  const closedWithData = closedCycles.filter((tire) => hasRemovalData(tire) && hasReportData(tire)).length
  const reportBase = Math.max(1, closedCycles.length)
  const reportReadiness = getProgress(readyForReport.length, reportBase)

  const steps: TireWorkflowStep[] = [
    {
      actionLabel: 'Ingresar compra',
      blockers: tires.length === 0 ? ['No hay unidades registradas para iniciar el control de rendimiento.'] : [],
      count: tires.length,
      description: 'Alta de cada unidad recibida para que el rendimiento no quede como dato agregado.',
      id: 'intake',
      label: 'Ingreso',
      progress: tires.length > 0 ? 100 : 0,
      tone: tires.length > 0 ? 'success' : 'warning',
    },
    {
      actionLabel: 'Instalar desde stock',
      blockers: installable === 0 ? ['No hay unidades compradas/en stock para instalar en camion.'] : [],
      count: installable,
      description: 'Unidades disponibles en bodega antes de asociar camion, eje y km inicial.',
      id: 'stock',
      label: 'Stock',
      progress: getProgress(installable, Math.max(1, stock.length)),
      tone: installable > 0 ? 'success' : 'neutral',
    },
    {
      actionLabel: 'Registrar instalacion',
      blockers: installedWithData < installed.length ? ['Hay instalaciones sin camion, posicion o km inicial.'] : [],
      count: installedWithData,
      description: 'Camion, posicion y kilometraje inicial quedan amarrados al neumatico.',
      id: 'install',
      label: 'Instalacion',
      progress: getProgress(installedWithData, Math.max(1, installed.length)),
      tone: installedWithData === installed.length ? 'success' : 'warning',
    },
    {
      actionLabel: 'Preparar retiro',
      blockers: installed.length === 0 ? ['No hay neumaticos activos en camion para cerrar rendimiento.'] : [],
      count: installed.length,
      description: 'Neumaticos actualmente en uso que deben monitorearse por camion/eje.',
      id: 'monitor',
      label: 'Seguimiento',
      progress: installed.length > 0 ? 100 : 0,
      tone: installed.length > 0 ? 'info' : 'neutral',
    },
    {
      actionLabel: 'Retirar y cerrar',
      blockers: closedCycles.length > closedWithData ? ['Existen retiros sin km final, motivo o costo/km calculado.'] : [],
      count: closedWithData,
      description: 'Retiro con km final y motivo operacional para cerrar el ciclo.',
      id: 'close',
      label: 'Retiro / cierre',
      progress: getProgress(closedWithData, Math.max(1, closedCycles.length)),
      tone: closedCycles.length === closedWithData ? 'success' : 'warning',
    },
    {
      actionLabel: 'Comparar decision',
      blockers: readyForReport.length === 0 ? ['Aun no hay ciclos cerrados con km y costo/km.'] : [],
      count: readyForReport.length,
      description: 'Ciclos completos que sirven para comparar proveedor, marca y recauchado.',
      id: 'report',
      label: 'Reporte usable',
      progress: reportReadiness,
      tone: reportReadiness >= 85 ? 'success' : reportReadiness >= 50 ? 'warning' : 'danger',
    },
  ]

  return {
    averageCostPerKm,
    averageKmUsed,
    averageNewCostPerKm,
    averageRetreadCostPerKm,
    closedCycles,
    dataGaps,
    installed,
    operationalAlerts: buildAlerts(tires, dataGaps, riskTires),
    readyForReport,
    reportReadiness,
    riskTires,
    savingPer100k,
    steps,
    stock,
    total: tires.length,
  }
}
