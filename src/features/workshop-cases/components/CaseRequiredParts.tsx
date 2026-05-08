import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Badge } from '../../../shared/components/Badge/Badge'
import type { BadgeTone } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { Table } from '../../../shared/components/Table/Table'
import type { TableColumn } from '../../../shared/components/Table/Table'
import type { CaseRequiredPart, RequiredPartStatus, WorkshopCase } from '../types/workshopCase.types'

const PART_STATUS_LABELS: Record<RequiredPartStatus, string> = {
  available: 'Disponible en bodega',
  low_stock: 'Bajo stock',
  out_of_stock: 'Sin stock',
  po_created: 'Orden de compra creada',
  purchase_required: 'Compra requerida',
  waiting_reception: 'Esperando recepcion',
}

const PART_STATUS_TONES: Record<RequiredPartStatus, BadgeTone> = {
  available: 'success',
  low_stock: 'warning',
  out_of_stock: 'danger',
  po_created: 'info',
  purchase_required: 'warning',
  waiting_reception: 'warning',
}

interface CaseRequiredPartsProps {
  workshopCase: WorkshopCase
}

export function CaseRequiredParts({ workshopCase }: CaseRequiredPartsProps) {
  const [requestedPartIds, setRequestedPartIds] = useState<string[]>([])
  const isBlocked = workshopCase.requiredParts.some((part) => part.requiresPurchase)

  const columns: TableColumn<CaseRequiredPart>[] = [
    {
      header: 'Repuesto',
      key: 'name',
      render: (item) => (
        <div>
          <strong>{item.name}</strong>
          <p className="muted-text">{item.sku}</p>
        </div>
      ),
    },
    { align: 'right', header: 'Requerido', key: 'quantity', render: (item) => item.quantity },
    { align: 'right', header: 'Stock', key: 'stockAvailable', render: (item) => item.stockAvailable },
    {
      header: 'Estado',
      key: 'status',
      render: (item) => <Badge tone={PART_STATUS_TONES[item.status]}>{PART_STATUS_LABELS[item.status]}</Badge>,
    },
    {
      align: 'right',
      header: '',
      key: 'actions',
      render: (item) =>
        item.purchaseOrderId ? (
          <Link to={ROUTES.purchaseOrderDetail(item.purchaseOrderId)}>
            <Button size="sm" variant="secondary">
              Ver OC
            </Button>
          </Link>
        ) : (
          <Button
            icon={<ShoppingCart size={16} />}
            onClick={() => setRequestedPartIds((current) => [...new Set([...current, item.partId])])}
            size="sm"
            type="button"
            variant={item.requiresPurchase ? 'secondary' : 'ghost'}
          >
            {requestedPartIds.includes(item.partId) ? 'Solicitud creada' : 'Requiere compra'}
          </Button>
        ),
    },
  ]

  return (
    <Card>
      <div className="stack">
        <div className="split-row">
          <div>
            <h2 className="section-title">Repuestos requeridos</h2>
            <p className="muted-text">Disponibilidad de bodega y solicitudes de compra del caso.</p>
          </div>
          {isBlocked ? <Badge tone="danger">Bloqueado por repuestos</Badge> : <Badge tone="success">Stock disponible</Badge>}
        </div>
        <Table
          columns={columns}
          data={workshopCase.requiredParts}
          getRowHref={(item) => ROUTES.partDetail(item.partId)}
          getRowKey={(item) => item.partId}
          getRowLabel={(item) => `Abrir repuesto ${item.sku}`}
        />
      </div>
    </Card>
  )
}
