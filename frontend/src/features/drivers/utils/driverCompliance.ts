import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import type { Driver, DriverDocument, DriverFine } from '../types/driver.types'

export interface DriverComplianceSummary {
  activeFineAmount: number
  activeFineCount: number
  decision: string
  documentIssueCount: number
  helper: string
  overdueFineCount: number
  tone: BadgeTone
}

const blockingFineStatuses = new Set(['OPEN', 'UNDER_REVIEW', 'DISPUTED'])

export function getDriverComplianceSummary(
  driver: Driver,
  documents: DriverDocument[],
  fines: DriverFine[],
): DriverComplianceSummary {
  const documentIssueCount = documents.filter((document) =>
    ['EXPIRED', 'EXPIRES_SOON', 'MISSING'].includes(document.status),
  ).length
  const hardDocumentIssues = documents.filter((document) => ['EXPIRED', 'MISSING'].includes(document.status)).length
  const activeFines = fines.filter((fine) => blockingFineStatuses.has(fine.status))
  const severeActiveFines = activeFines.filter((fine) => ['HIGH', 'CRITICAL'].includes(fine.severity))
  const overdueFineCount = activeFines.filter((fine) => fine.dueAt && new Date(fine.dueAt) < new Date()).length
  const activeFineAmount = activeFines.reduce((total, fine) => total + (fine.amount || 0), 0)

  if (driver.status !== 'active') {
    return {
      activeFineAmount,
      activeFineCount: activeFines.length,
      decision: 'No asignar',
      documentIssueCount,
      helper: 'Chofer inactivo para operacion.',
      overdueFineCount,
      tone: 'danger',
    }
  }

  if (hardDocumentIssues > 0 || severeActiveFines.length > 0 || overdueFineCount > 0) {
    return {
      activeFineAmount,
      activeFineCount: activeFines.length,
      decision: 'Bloquear salida',
      documentIssueCount,
      helper: 'Requiere regularizacion antes de asignar a ruta.',
      overdueFineCount,
      tone: 'danger',
    }
  }

  if (documentIssueCount > 0 || activeFines.length > 0) {
    return {
      activeFineAmount,
      activeFineCount: activeFines.length,
      decision: 'Revisar antes de salir',
      documentIssueCount,
      helper: 'Puede operar solo con validacion del supervisor.',
      overdueFineCount,
      tone: 'warning',
    }
  }

  return {
    activeFineAmount,
    activeFineCount: 0,
    decision: 'Apto para ruta',
    documentIssueCount: 0,
    helper: 'Documentos y multas sin bloqueos.',
    overdueFineCount: 0,
    tone: 'success',
  }
}
