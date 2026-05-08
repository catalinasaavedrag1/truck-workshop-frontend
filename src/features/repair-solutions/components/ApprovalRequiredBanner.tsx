import { AlertTriangle } from 'lucide-react'
import { Card } from '../../../shared/components/Card/Card'

export function ApprovalRequiredBanner() {
  return (
    <Card>
      <div className="split-row">
        <div className="inline-actions">
          <AlertTriangle aria-hidden color="var(--color-warning)" size={22} />
          <div>
            <strong>Aprobacion requerida</strong>
            <p className="muted-text">El costo estimado supera el umbral operativo definido.</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
