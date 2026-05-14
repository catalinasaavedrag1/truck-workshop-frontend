import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Trash2 } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatDate } from '../../../shared/utils/formatDate'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { truckDocumentTypeLabels } from '../constants/truckDocuments.constants'
import { DocumentExpirationBadge } from '../components/DocumentExpirationBadge'
import { TruckDocumentForm } from '../components/TruckDocumentForm'
import { TruckDocumentTimeline } from '../components/TruckDocumentTimeline'
import { truckDocumentsMock } from '../mocks/truckDocuments.mock'
import { deleteTruckDocument } from '../services/truckDocuments.service'
import type { TruckDocument } from '../types/truckDocuments.types'

export function TruckDocumentDetailPage() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const { data: document } = useResourceItem('/truck-documents', documentId, truckDocumentsMock)
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const { data: truckDocuments } = useResourceList<TruckDocument>('/truck-documents', truckDocumentsMock, {
    order: 'asc',
    sort: 'expiresAt',
  })
  const [localDocument, setLocalDocument] = useState<TruckDocument | undefined>()
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const visibleDocument = localDocument?.id === documentId ? localDocument : document
  const visibleDocuments = useMemo(
    () => truckDocuments.map((item) => (item.id === visibleDocument?.id ? visibleDocument : item)),
    [truckDocuments, visibleDocument],
  )

  if (!visibleDocument) {
    return (
      <PageContainer>
        <EmptyState icon={<AlertCircle size={22} />} title="Documento no encontrado" />
      </PageContainer>
    )
  }

  const truck = fleetTrucks.find((item) => item.id === visibleDocument.truckId)
  const relatedTruckDocuments = visibleDocuments.filter((item) => item.truckId === visibleDocument.truckId)

  const handleDelete = async () => {
    setErrorMessage('')
    setIsDeleting(true)

    try {
      await deleteTruckDocument(visibleDocument.id)
      navigate(ROUTES.truckDocuments)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        description={`${truck?.plate || visibleDocument.truckId} - ${truckDocumentTypeLabels[visibleDocument.documentType]}`}
        title="Detalle documento"
      />
      <div className="two-column-grid">
        <Card>
          <div className="stack">
            {errorMessage ? <ErrorState description={errorMessage} title="No se pudo eliminar el documento" /> : null}
            <dl className="detail-list">
              <div>
                <dt>Estado</dt>
                <dd>
                  <DocumentExpirationBadge status={visibleDocument.status} />
                </dd>
              </div>
              <div>
                <dt>Numero</dt>
                <dd>{visibleDocument.documentNumber || '-'}</dd>
              </div>
              <div>
                <dt>Emision</dt>
                <dd>{visibleDocument.issuedAt ? formatDate(visibleDocument.issuedAt) : '-'}</dd>
              </div>
              <div>
                <dt>Vencimiento</dt>
                <dd>{visibleDocument.expiresAt ? formatDate(visibleDocument.expiresAt) : '-'}</dd>
              </div>
              <div>
                <dt>Archivo</dt>
                <dd>{visibleDocument.attachmentUrl || 'Pendiente'}</dd>
              </div>
              <div>
                <dt>Creado por</dt>
                <dd>{visibleDocument.createdBy || 'Sistema'}</dd>
              </div>
              <div>
                <dt>Ultima modificacion</dt>
                <dd>{visibleDocument.updatedBy || visibleDocument.createdBy || 'Sistema'}</dd>
              </div>
            </dl>
            <Button
              disabled={isDeleting}
              icon={<Trash2 size={18} />}
              onClick={() => void handleDelete()}
              type="button"
              variant="danger"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar documento'}
            </Button>
          </div>
        </Card>
        <TruckDocumentTimeline documents={relatedTruckDocuments} />
      </div>
      <TruckDocumentForm document={visibleDocument} onSaved={setLocalDocument} trucks={fleetTrucks} />
    </PageContainer>
  )
}
