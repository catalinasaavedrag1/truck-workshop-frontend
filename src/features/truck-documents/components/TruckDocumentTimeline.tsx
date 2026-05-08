import { Card } from '../../../shared/components/Card/Card'
import { formatDate } from '../../../shared/utils/formatDate'
import { truckDocumentTypeLabels } from '../constants/truckDocuments.constants'
import type { TruckDocument } from '../types/truckDocuments.types'
import { DocumentExpirationBadge } from './DocumentExpirationBadge'

interface TruckDocumentTimelineProps {
  documents: TruckDocument[]
}

export function TruckDocumentTimeline({ documents }: TruckDocumentTimelineProps) {
  return (
    <Card>
      <h2 className="section-title">Historial documental</h2>
      <div className="timeline">
        {documents.map((document, index) => (
          <div className="timeline-step" key={document.id}>
            <span className="timeline-dot">{index + 1}</span>
            <div>
              <div className="split-row">
                <strong>{truckDocumentTypeLabels[document.documentType]}</strong>
                <DocumentExpirationBadge status={document.status} />
              </div>
              <p className="muted-text">
                {document.expiresAt ? `Vence ${formatDate(document.expiresAt)}` : document.notes || 'Sin vencimiento'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
