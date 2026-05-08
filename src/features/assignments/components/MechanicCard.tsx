import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import type { WorkshopCase } from '../../workshop-cases/types/workshopCase.types'
import { MechanicAvailabilityBadge } from '../../mechanics/components/MechanicAvailabilityBadge'
import type { Mechanic } from '../../mechanics/types/mechanic.types'
import { WorkloadIndicator } from './WorkloadIndicator'
import styles from './MechanicCard.module.css'

interface MechanicCardProps {
  mechanic: Mechanic
  activeCases?: number
  visibleCases?: WorkshopCase[]
  recommended?: boolean
  fitReason?: string
  selectedCaseCode?: string
  onAssign?: () => void
}

export function MechanicCard({
  mechanic,
  activeCases = mechanic.activeCases,
  visibleCases = [],
  recommended = false,
  fitReason,
  selectedCaseCode,
  onAssign,
}: MechanicCardProps) {
  const isAtCapacity = activeCases >= mechanic.maxCases

  return (
    <Card className={[styles.card, recommended ? styles.recommended : ''].filter(Boolean).join(' ')}>
      <div className={styles.stack}>
        <div className={styles.header}>
          <span className={styles.icon}>
            <Wrench size={18} />
          </span>
          <div>
            <strong>{mechanic.name}</strong>
            <p className="muted-text">{mechanic.specialty}</p>
          </div>
          <MechanicAvailabilityBadge availability={mechanic.availability} />
        </div>

        <div className={styles.metaRow}>
          <span>{mechanic.shift}</span>
          {recommended ? <Badge tone="success">Sugerido</Badge> : null}
        </div>

        <WorkloadIndicator activeCases={activeCases} maxCases={mechanic.maxCases} />

        {fitReason ? <p className={styles.reason}>{fitReason}</p> : null}

        <div className={styles.caseBlock}>
          <span className={styles.caseBlockTitle}>Casos visibles</span>
          {visibleCases.length > 0 ? (
            visibleCases.slice(0, 3).map((workshopCase) => (
              <Link className={styles.caseLink} key={workshopCase.id} to={ROUTES.caseDetail(workshopCase.id)}>
                <strong>{workshopCase.caseNumber}</strong>
                <span>{workshopCase.title}</span>
              </Link>
            ))
          ) : (
            <span className="muted-text">Sin casos visibles en esta cola</span>
          )}
        </div>

        {onAssign ? (
          <Button
            disabled={mechanic.availability === 'off-shift' || isAtCapacity}
            fullWidth
            onClick={onAssign}
            size="sm"
            variant={recommended ? 'primary' : 'secondary'}
          >
            {isAtCapacity ? 'Sin capacidad' : `Asignar ${selectedCaseCode || 'caso'}`}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}
