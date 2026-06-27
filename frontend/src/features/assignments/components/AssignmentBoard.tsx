import type { ReactNode } from 'react'
import { AlertTriangle, CalendarClock, ClipboardList, PackageSearch, Truck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { CasePriorityBadge } from '../../workshop-cases/components/CasePriorityBadge'
import { CaseStatusBadge } from '../../workshop-cases/components/CaseStatusBadge'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import { MechanicCard } from './MechanicCard'
import type { Assignment } from '../types/assignment.types'
import styles from './AssignmentBoard.module.css'

interface AssignmentBoardProps {
  assignments: Assignment[]
  mechanics: Mechanic[]
  selectedCaseId: string
  onSelectCase: (caseId: string) => void
  onAssignRequest: (caseId: string, mechanicId?: string) => void
  workshopCases: WorkshopCase[]
}

interface CaseWithAssignment extends WorkshopCase {
  effectiveMechanicId?: string
  effectiveMechanicName?: string
  assignedAt?: string
}

const priorityWeight: Record<WorkshopCase['priority'], number> = {
  critical: 4,
  high: 3,
  low: 1,
  medium: 2,
}

const specialtyKeywords: Record<string, string[]> = {
  diesel: ['motor', 'potencia', 'combustible', 'consumo'],
  frenos: ['freno', 'frenos', 'aire', 'presion', 'suspension'],
  tren: ['vibracion', 'tren delantero', 'direccion', 'estabilizadora'],
  transmision: ['embrague', 'transmision'],
}

export function AssignmentBoard({
  assignments,
  mechanics,
  selectedCaseId,
  onSelectCase,
  onAssignRequest,
  workshopCases,
}: AssignmentBoardProps) {
  const activeCases = workshopCases
    .filter((workshopCase) => workshopCase.status !== 'closed')
    .map((workshopCase) => enrichCaseWithAssignment(workshopCase, assignments))
    .sort(sortCasesByOperationalPriority)

  const selectedCase = activeCases.find((workshopCase) => workshopCase.id === selectedCaseId) || activeCases[0]
  const recommendations = selectedCase
    ? mechanics
        .map((mechanic) => getMechanicRecommendation(mechanic, selectedCase, assignments))
        .sort((first, second) => second.score - first.score)
    : []
  const recommendedMechanic = recommendations[0]
  const slaRiskCases = activeCases.filter((workshopCase) => workshopCase.slaStatus === 'BREACHED' || workshopCase.slaStatus === 'AT_RISK')
  const blockedPartsCases = activeCases.filter((workshopCase) => workshopCase.requiredParts.some((part) => part.requiresPurchase))
  const unassignedCases = activeCases.filter((workshopCase) => !workshopCase.effectiveMechanicId)

  return (
    <div className={styles.board}>
      <section className={styles.metrics} aria-label="Resumen de asignaciones">
        <AssignmentMetric icon={<ClipboardList size={18} />} label="Casos activos" value={activeCases.length} />
        <AssignmentMetric icon={<AlertTriangle size={18} />} label="SLA critico" tone="warning" value={slaRiskCases.length} />
        <AssignmentMetric icon={<PackageSearch size={18} />} label="Con bloqueo de repuestos" value={blockedPartsCases.length} />
        <AssignmentMetric icon={<UserRound size={18} />} label="Sin responsable" tone={unassignedCases.length ? 'warning' : 'success'} value={unassignedCases.length} />
      </section>

      <div className={styles.workspace}>
        <section className={styles.caseQueue} aria-label="Cola de casos de taller">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className="section-title">Cola operativa</h2>
              <p className="muted-text">Selecciona un caso para revisar que se esta asignando.</p>
            </div>
          </div>

          <div className={styles.caseList}>
            {activeCases.map((workshopCase) => (
              <button
                aria-pressed={workshopCase.id === selectedCase?.id}
                className={[styles.caseCard, workshopCase.id === selectedCase?.id ? styles.caseCardActive : ''].filter(Boolean).join(' ')}
                key={workshopCase.id}
                onClick={() => onSelectCase(workshopCase.id)}
                type="button"
              >
                <span className={styles.caseCardHeader}>
                  <span>
                    <strong>{workshopCase.caseNumber}</strong>
                    <small>{workshopCase.truckPlate} - {workshopCase.driverName}</small>
                  </span>
                  <span className={styles.badgeStack}>
                    <CasePriorityBadge priority={workshopCase.priority} />
                    <CaseStatusBadge status={workshopCase.status} />
                  </span>
                </span>
                <span className={styles.caseTitle}>{workshopCase.title}</span>
                <span className={styles.caseMetaGrid}>
                  <span>
                    <Truck size={15} />
                    {workshopCase.driverName}
                  </span>
                  <span>
                    <CalendarClock size={15} />
                    {formatDate(workshopCase.slaDueAt)}
                  </span>
                </span>
                <span className={styles.caseFooter}>
                  <span>{workshopCase.currentStep}</span>
                  <strong>{workshopCase.effectiveMechanicName || 'Sin asignar'}</strong>
                </span>
              </button>
            ))}
          </div>
        </section>

        {selectedCase ? (
          <aside className={styles.caseDetail} aria-label="Detalle del caso seleccionado">
            <Card>
              <div className={styles.detailStack}>
                <div className={styles.detailHeader}>
                  <div>
                    <span className={styles.eyebrow}>Caso seleccionado</span>
                    <h2>{selectedCase.caseNumber}</h2>
                    <p className="muted-text">{selectedCase.failureDescription}</p>
                  </div>
                  <div className={styles.badgeStack}>
                    <CasePriorityBadge priority={selectedCase.priority} />
                    <CaseStatusBadge status={selectedCase.status} />
                  </div>
                </div>

                <dl className={styles.detailGrid}>
                  <div>
                    <dt>Camion</dt>
                    <dd>{selectedCase.truckPlate}</dd>
                  </div>
                  <div>
                    <dt>Chofer</dt>
                    <dd>{selectedCase.driverName}</dd>
                  </div>
                  <div>
                    <dt>Operacion</dt>
                    <dd>{selectedCase.customerName}</dd>
                  </div>
                  <div>
                    <dt>Responsable</dt>
                    <dd>{selectedCase.effectiveMechanicName || 'Sin asignar'}</dd>
                  </div>
                  <div>
                    <dt>Entrega estimada</dt>
                    <dd>{selectedCase.estimatedDeliveryAt ? formatDate(selectedCase.estimatedDeliveryAt) : 'Sin fecha'}</dd>
                  </div>
                  <div>
                    <dt>Costo estimado</dt>
                    <dd>{formatCurrency(selectedCase.estimatedCost)}</dd>
                  </div>
                </dl>

                <div className={styles.partsPanel}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Repuestos requeridos</h3>
                      <p className="muted-text">Evita asignar trabajo bloqueado sin contexto de bodega.</p>
                    </div>
                  </div>
                  <div className={styles.partList}>
                    {selectedCase.requiredParts.map((part) => (
                      <div className={styles.partRow} key={part.partId}>
                        <span>
                          <strong>{part.sku}</strong>
                          <small>{part.name} x{part.quantity}</small>
                        </span>
                        <Badge tone={part.requiresPurchase ? 'warning' : 'success'}>
                          {part.requiresPurchase ? 'Gestion compra' : `Stock ${part.stockAvailable}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.recommendation}>
                  <div>
                    <span className={styles.eyebrow}>Sugerencia</span>
                    <strong>{recommendedMechanic?.mechanic.name || 'Sin mecanico sugerido'}</strong>
                    <p className="muted-text">{recommendedMechanic?.reason || 'No hay capacidad disponible para recomendar.'}</p>
                  </div>
                  {recommendedMechanic ? (
                    <Button onClick={() => onAssignRequest(selectedCase.id, recommendedMechanic.mechanic.id)} size="sm">
                      Usar sugerencia
                    </Button>
                  ) : null}
                </div>

                <div className={styles.detailActions}>
                  <Link className={styles.textLink} to={ROUTES.caseDetail(selectedCase.id)}>
                    Ver ficha completa del caso
                  </Link>
                  <Button onClick={() => onAssignRequest(selectedCase.id, selectedCase.effectiveMechanicId)} size="sm">
                    {selectedCase.effectiveMechanicId ? 'Reasignar caso' : 'Asignar caso'}
                  </Button>
                </div>
              </div>
            </Card>
          </aside>
        ) : null}
      </div>

      <section className={styles.mechanicsPanel} aria-label="Capacidad de mecanicos">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className="section-title">Capacidad del taller</h2>
            <p className="muted-text">Compara especialidad, turno, carga y casos activos antes de asignar.</p>
          </div>
        </div>
        <div className={styles.mechanicGrid}>
          {mechanics.map((mechanic) => {
            const recommendation = recommendations.find((item) => item.mechanic.id === mechanic.id)
            const visibleCases = activeCases.filter((workshopCase) => workshopCase.effectiveMechanicId === mechanic.id)
            const projectedLoad = getProjectedLoad(mechanic, assignments, workshopCases)

            return (
              <MechanicCard
                activeCases={projectedLoad}
                fitReason={recommendation?.reason}
                key={mechanic.id}
                mechanic={mechanic}
                onAssign={selectedCase ? () => onAssignRequest(selectedCase.id, mechanic.id) : undefined}
                recommended={recommendedMechanic?.mechanic.id === mechanic.id}
                selectedCaseCode={selectedCase?.caseNumber}
                visibleCases={visibleCases}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

function AssignmentMetric({
  icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: ReactNode
  label: string
  value: number
  tone?: 'neutral' | 'success' | 'warning'
}) {
  return (
    <Card className={styles.metricCard}>
      <span className={[styles.metricIcon, styles[tone]].join(' ')}>{icon}</span>
      <span>
        <strong>{value}</strong>
        <small>{label}</small>
      </span>
    </Card>
  )
}

function enrichCaseWithAssignment(workshopCase: WorkshopCase, assignments: Assignment[]): CaseWithAssignment {
  const assignment = assignments.find((item) => item.caseId === workshopCase.id)

  return {
    ...workshopCase,
    assignedAt: assignment?.assignedAt,
    effectiveMechanicId: assignment?.mechanicId || workshopCase.mechanicId || workshopCase.assignedMechanicId,
    effectiveMechanicName: assignment?.mechanicName || workshopCase.mechanicName,
  }
}

function sortCasesByOperationalPriority(first: CaseWithAssignment, second: CaseWithAssignment) {
  const priorityDiff = priorityWeight[second.priority] - priorityWeight[first.priority]

  if (priorityDiff !== 0) {
    return priorityDiff
  }

  return new Date(first.slaDueAt).getTime() - new Date(second.slaDueAt).getTime()
}

function getProjectedLoad(mechanic: Mechanic, assignments: Assignment[], workshopCases: WorkshopCase[]) {
  return assignments.reduce((load, assignment) => {
    const originalCase = workshopCases.find((workshopCase) => workshopCase.id === assignment.caseId)
    const originalMechanicId = originalCase?.mechanicId || originalCase?.assignedMechanicId

    if (originalMechanicId === mechanic.id && assignment.mechanicId !== mechanic.id) {
      return Math.max(0, load - 1)
    }

    if (originalMechanicId !== mechanic.id && assignment.mechanicId === mechanic.id) {
      return load + 1
    }

    return load
  }, mechanic.activeCases)
}

function getMechanicRecommendation(mechanic: Mechanic, workshopCase: WorkshopCase, assignments: Assignment[]) {
  const projectedLoad = mechanic.activeCases + assignments.filter((assignment) => assignment.mechanicId === mechanic.id).length
  const remainingCapacity = Math.max(0, mechanic.maxCases - projectedLoad)
  const caseText = `${workshopCase.title} ${workshopCase.failureDescription} ${workshopCase.requiredParts.map((part) => part.name).join(' ')}`.toLowerCase()
  const keywords = getKeywordsForSpecialty(mechanic.specialty)
  const matchesSpecialty = keywords.some((keyword) => caseText.includes(keyword))
  const availabilityScore = mechanic.availability === 'available' ? 4 : mechanic.availability === 'busy' ? 1 : -4
  const specialtyScore = matchesSpecialty ? 5 : 0
  const capacityScore = remainingCapacity * 2
  const priorityScore = workshopCase.priority === 'critical' && remainingCapacity > 0 ? 1 : 0
  const score = availabilityScore + specialtyScore + capacityScore + priorityScore
  const reason = matchesSpecialty
    ? `Coincide con ${mechanic.specialty.toLowerCase()}`
    : remainingCapacity > 0
      ? 'Mejor balance de capacidad disponible'
      : 'Carga al limite; asignar solo si se libera trabajo'

  return { mechanic, reason, score }
}

function getKeywordsForSpecialty(specialty: string) {
  const normalizedSpecialty = specialty.toLowerCase()

  if (normalizedSpecialty.includes('diesel')) {
    return specialtyKeywords.diesel
  }

  if (normalizedSpecialty.includes('freno') || normalizedSpecialty.includes('suspension')) {
    return specialtyKeywords.frenos
  }

  if (normalizedSpecialty.includes('tren')) {
    return specialtyKeywords.tren
  }

  if (normalizedSpecialty.includes('transmision')) {
    return specialtyKeywords.transmision
  }

  return []
}
