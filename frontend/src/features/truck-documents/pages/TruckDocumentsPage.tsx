import { useMemo, useState } from 'react'
import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { fleetTrucksMock } from '../../fleet/mocks/fleet.mock'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { DocumentAlertCard } from '../components/DocumentAlertCard'
import { TruckDocumentForm } from '../components/TruckDocumentForm'
import { TruckDocumentTable } from '../components/TruckDocumentTable'
import { truckDocumentsMock } from '../mocks/truckDocuments.mock'
import type { TruckDocument } from '../types/truckDocuments.types'

export function TruckDocumentsPage() {
  const { data: fetchedDocuments } = useResourceList<TruckDocument>('/truck-documents', truckDocumentsMock, {
    order: 'asc',
    sort: 'expiresAt',
  })
  const { data: fleetTrucks } = useResourceList<FleetTruck>('/fleet/trucks', fleetTrucksMock, {
    order: 'asc',
    sort: 'plate',
  })
  const [localDocuments, setLocalDocuments] = useState<TruckDocument[]>([])
  const truckDocuments = useMemo(() => {
    const localIds = new Set(localDocuments.map((document) => document.id))

    return [...localDocuments, ...fetchedDocuments.filter((document) => !localIds.has(document.id))]
  }, [fetchedDocuments, localDocuments])

  return (
    <PageContainer>
      <PageHeader
        description="Control documental de permisos, revision tecnica, seguros y contratos que afectan disponibilidad."
        title="Documentos de flota"
      />
      <DocumentAlertCard documents={truckDocuments} />
      <Card>
        <TruckDocumentTable documents={truckDocuments} trucks={fleetTrucks} />
      </Card>
      <TruckDocumentForm
        onSaved={(document) => setLocalDocuments((current) => [document, ...current.filter((item) => item.id !== document.id)])}
        trucks={fleetTrucks}
      />
    </PageContainer>
  )
}
