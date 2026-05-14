import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { formatDate } from '../../../shared/utils/formatDate'
import { formatRut } from '../../../shared/utils/rut'
import { PurchaseOrderTable } from '../../purchase-orders/components/PurchaseOrderTable'
import { purchaseOrdersMock } from '../../purchase-orders/mocks/purchaseOrders.mock'
import type { PurchaseOrder } from '../../purchase-orders/types/purchaseOrder.types'
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import styles from '../../warehouse/components/InventoryModule.module.css'
import { SupplierForm } from '../components/SupplierForm'
import { SupplierRatingBadge } from '../components/SupplierRatingBadge'
import { suppliersMock } from '../mocks/suppliers.mock'
import { deleteSupplier } from '../services/suppliers.service'

export function SupplierDetailPage() {
  const { supplierId } = useParams()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const { data: supplier } = useResourceItem('/suppliers', supplierId, suppliersMock)
  const { data: allPurchaseOrders } = useResourceList<PurchaseOrder>('/purchase-orders', purchaseOrdersMock, {
    order: 'desc',
    sort: 'createdAt',
  })

  if (!supplier) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de proveedores."
          icon={<AlertCircle size={22} />}
          title="Proveedor no encontrado"
        />
      </PageContainer>
    )
  }

  const purchaseOrders = allPurchaseOrders.filter((order) =>
    (supplier.activePurchaseOrderIds ?? []).includes(order.id),
  )

  const handleDelete = async () => {
    if (!supplier) {
      return
    }

    setIsDeleting(true)
    setErrorMessage('')

    try {
      await deleteSupplier(supplier.id)
      navigate(ROUTES.suppliers)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error))
      setIsDeleting(false)
    }
  }

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <div className="inline-actions">
              <Link to={ROUTES.suppliers}>
                <Button icon={<ArrowLeft size={18} />} variant="secondary">
                  Volver
                </Button>
              </Link>
              <Button
                disabled={isDeleting}
                icon={<Trash2 size={18} />}
                onClick={() => setIsDeleteConfirmOpen(true)}
                type="button"
                variant="danger"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          }
          description={supplier.categories?.join(', ') || 'Sin categorias registradas'}
          title={supplier.name}
        />
        <InventoryModuleNav />
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudo eliminar el proveedor" /> : null}
        <div className="two-column-grid">
          <Card>
            <PurchaseOrderTable purchaseOrders={purchaseOrders} />
          </Card>
          <div className="stack">
            <Card>
              <dl className="detail-list">
                <div>
                  <dt>RUT</dt>
                  <dd>{formatRut(supplier.rut)}</dd>
                </div>
                <div>
                  <dt>Contacto</dt>
                  <dd>{supplier.contactName}</dd>
                </div>
                <div>
                  <dt>Telefono</dt>
                  <dd>{supplier.phone}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{supplier.email}</dd>
                </div>
                <div>
                  <dt>Entrega promedio</dt>
                  <dd>{supplier.averageDeliveryDays} dias</dd>
                </div>
                <div>
                  <dt>Rating</dt>
                  <dd>
                    <SupplierRatingBadge rating={supplier.rating} />
                  </dd>
                </div>
                <div>
                  <dt>Creado por</dt>
                  <dd>
                    {supplier.createdBy || 'Sistema'}
                    {supplier.createdAt ? ` - ${formatDate(supplier.createdAt)}` : ''}
                  </dd>
                </div>
                <div>
                  <dt>Ultima modificacion</dt>
                  <dd>
                    {supplier.updatedBy || supplier.createdBy || 'Sistema'}
                    {supplier.updatedAt ? ` - ${formatDate(supplier.updatedAt)}` : ''}
                  </dd>
                </div>
              </dl>
            </Card>
            <Card>
              <div className="stack">
                <h2 className="section-title">Editar proveedor</h2>
                <SupplierForm supplier={supplier} />
              </div>
            </Card>
          </div>
        </div>
        <ConfirmModal
          confirmLabel="Eliminar proveedor"
          description={`El proveedor ${supplier.name} dejara de estar disponible para nuevas ordenes.`}
          isConfirming={isDeleting}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
          open={isDeleteConfirmOpen}
          title="Eliminar proveedor"
          tone="danger"
        />
      </div>
    </PageContainer>
  )
}
