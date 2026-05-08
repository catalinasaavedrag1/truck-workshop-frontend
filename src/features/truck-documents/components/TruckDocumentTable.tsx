import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/formatDate'
import type { FleetTruck } from '../../fleet/types/fleet.types'
import { truckDocumentTypeLabels } from '../constants/truckDocuments.constants'
import type { TruckDocument } from '../types/truckDocuments.types'
import { DocumentExpirationBadge } from './DocumentExpirationBadge'

interface TruckDocumentTableProps {
  documents: TruckDocument[]
  trucks: FleetTruck[]
}

export function TruckDocumentTable({ documents, trucks }: TruckDocumentTableProps) {
  const columns: TableColumn<TruckDocument>[] = [
    {
      header: 'Camion',
      key: 'truck',
      render: (item) => trucks.find((truck) => truck.id === item.truckId)?.plate || item.truckId,
      searchableValue: (item) => trucks.find((truck) => truck.id === item.truckId)?.plate || item.truckId,
    },
    {
      header: 'Documento',
      key: 'type',
      render: (item) => truckDocumentTypeLabels[item.documentType],
      searchableValue: (item) => truckDocumentTypeLabels[item.documentType],
    },
    { header: 'Numero', key: 'number', render: (item) => item.documentNumber || '-' },
    {
      header: 'Vence',
      key: 'expiresAt',
      render: (item) => (item.expiresAt ? formatDate(item.expiresAt) : '-'),
      sortValue: (item) => item.expiresAt || '',
    },
    { header: 'Estado', key: 'status', render: (item) => <DocumentExpirationBadge status={item.status} /> },
    { header: 'Actualizado por', key: 'updatedBy', render: (item) => item.updatedBy || item.createdBy || 'Sistema' },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) => (
        <Link to={ROUTES.truckDocumentDetail(item.id)}>
          <Button size="sm" variant="secondary">
            Ver
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={documents}
      emptyDescription="Carga el primer documento del camion para activar control documental."
      emptyLabel="Sin documentos registrados"
      enableSearch
      getRowHref={(item) => ROUTES.truckDocumentDetail(item.id)}
      getRowKey={(item) => item.id}
      getRowLabel={(item) => `Abrir documento ${truckDocumentTypeLabels[item.documentType]}`}
      searchPlaceholder="Buscar camion, documento, numero o estado"
    />
  )
}
