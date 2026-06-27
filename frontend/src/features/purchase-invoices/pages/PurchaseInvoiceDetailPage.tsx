import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, BadgeCheck, BookCheck, CheckCircle2, Wallet } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { EntityLink } from '../../../shared/components/EntityLink'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceItem } from '../../../shared/hooks/useResourceItem'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { getApiErrorMessage } from '../../../shared/services/apiErrorHandler'
import { toast } from '../../../shared/services/toastStore'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { formatDate } from '../../../shared/utils/formatDate'
import { ReconciliationPanel } from '../components/ReconciliationPanel'
import { SupplierInvoiceStatusBadge } from '../components/SupplierInvoiceStatusBadge'
import { purchaseInvoicesMock } from '../mocks/purchaseInvoices.mock'
import { getCurrentActorName, updateSupplierInvoice } from '../services/purchaseInvoices.service'
import type { SupplierInvoice, SupplierInvoiceStatus } from '../types/supplierInvoice.types'
import { reconcileInvoice } from '../utils/reconciliation'
import styles from '../components/PurchaseInvoiceModule.module.css'

const FLOW: { key: SupplierInvoiceStatus; label: string }[] = [
  { key: 'REGISTERED', label: 'Registrada' },
  { key: 'RECONCILED', label: 'Conciliada' },
  { key: 'APPROVED', label: 'Aprobada' },
  { key: 'ACCOUNTED', label: 'Contabilizada' },
  { key: 'PAID', label: 'Pagada' },
]

function stepIndex(status: SupplierInvoiceStatus): number {
  switch (status) {
    case 'REGISTERED':
      return 0
    case 'RECONCILED':
    case 'WITH_DIFFERENCE':
      return 1
    case 'APPROVED':
      return 2
    case 'ACCOUNTED':
      return 3
    case 'PAID':
      return 4
    default:
      return 0
  }
}

export function PurchaseInvoiceDetailPage() {
  const { invoiceId } = useParams()
  const { data: invoice, isLoading } = useResourceItem<SupplierInvoice>(
    '/purchase-invoices',
    invoiceId,
    purchaseInvoicesMock,
  )
  const [localInvoice, setLocalInvoice] = useState<SupplierInvoice | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const current = localInvoice?.id === invoiceId ? localInvoice : invoice

  const reconciliation = useMemo(() => (current ? reconcileInvoice(current.items) : null), [current])

  if (isLoading && !current) {
    return (
      <PageContainer>
        <LoadingState label="Cargando factura de compra" />
      </PageContainer>
    )
  }

  if (!current) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de facturas de compra."
          icon={<AlertCircle size={22} />}
          title="Factura no encontrada"
        />
      </PageContainer>
    )
  }

  const advance = async (nextStatus: SupplierInvoiceStatus, patch: Partial<SupplierInvoice>, message: string) => {
    setActionError('')
    setIsSaving(true)

    try {
      const updated = await updateSupplierInvoice(current.id, { status: nextStatus, ...patch })
      setLocalInvoice({ ...current, status: nextStatus, ...patch, ...updated })
      toast.success(message, `${current.invoiceNumber}`)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleReconcile = () => {
    if (!reconciliation) {
      return
    }
    if (reconciliation.hasDifference) {
      void advance('WITH_DIFFERENCE', {}, 'Conciliada con diferencias')
    } else {
      void advance('RECONCILED', {}, 'Factura conciliada')
    }
  }

  const handleApprove = () =>
    advance('APPROVED', { approvedBy: getCurrentActorName(), approvedAt: new Date().toISOString() }, 'Factura aprobada')

  const handleAccount = () =>
    advance(
      'ACCOUNTED',
      { accountingEntry: `AS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`, accountedAt: new Date().toISOString() },
      'Registro contable creado',
    )

  const handlePay = () =>
    advance(
      'PAID',
      { paidAt: new Date().toISOString(), paymentReference: `TRF-${String(Math.floor(Math.random() * 900000) + 100000)}` },
      'Factura pagada',
    )

  const activeStep = stepIndex(current.status)

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={<SupplierInvoiceStatusBadge status={current.status} />}
          description={`${current.supplierName} - ${current.purchaseOrderNumber || 'sin OC'}`}
          title={`Factura ${current.invoiceNumber}`}
        />

        <Card>
          <div className={styles.flow} aria-label="Flujo de la factura">
            {FLOW.map((step, index) => (
              <span className={styles.flow} key={step.key}>
                <span
                  className={[
                    styles.flowStep,
                    index < activeStep ? styles.flowStepDone : '',
                    index === activeStep ? styles.flowStepCurrent : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.label}
                </span>
                {index < FLOW.length - 1 ? <span className={styles.flowArrow}>{'>'}</span> : null}
              </span>
            ))}
          </div>
        </Card>

        {actionError ? <ErrorState description={actionError} title="No se pudo avanzar la factura" /> : null}

        <div className="two-column-grid">
          <Card>
            <div className="stack">
              <SectionHeader description="OC + Recepcion + Factura" title="Conciliacion 3-way" />
              <ReconciliationPanel items={current.items} />
            </div>
          </Card>

          <div className="stack">
            <Card>
              <div className="stack">
                <SectionHeader title="Datos de la factura" />
                <dl className="detail-list">
                  <div>
                    <dt>Proveedor</dt>
                    <dd>{current.supplierName}</dd>
                  </div>
                  <div>
                    <dt>Orden de compra</dt>
                    <dd>
                      {current.purchaseOrderId ? (
                        <EntityLink id={current.purchaseOrderId} type="purchaseOrder">
                          {current.purchaseOrderNumber || current.purchaseOrderId}
                        </EntityLink>
                      ) : (
                        'Sin OC'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Emision</dt>
                    <dd>{formatDate(current.invoiceDate)}</dd>
                  </div>
                  <div>
                    <dt>Vencimiento</dt>
                    <dd>{formatDate(current.dueDate)}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>
                      <strong>{formatCurrency(current.total)}</strong>
                    </dd>
                  </div>
                  {current.approvedBy ? (
                    <div>
                      <dt>Aprobada por</dt>
                      <dd>{current.approvedBy}</dd>
                    </div>
                  ) : null}
                  {current.accountingEntry ? (
                    <div>
                      <dt>Asiento contable</dt>
                      <dd>{current.accountingEntry}</dd>
                    </div>
                  ) : null}
                  {current.paymentReference ? (
                    <div>
                      <dt>Pago</dt>
                      <dd>{current.paymentReference}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </Card>

            <Card>
              <div className="stack">
                <SectionHeader title="Siguiente paso" />
                {current.status === 'REGISTERED' ? (
                  <Button icon={<CheckCircle2 size={18} />} loading={isSaving} onClick={handleReconcile} type="button">
                    Conciliar (OC + Recepcion + Factura)
                  </Button>
                ) : null}
                {current.status === 'WITH_DIFFERENCE' ? (
                  <>
                    <Badge tone="warning">Hay diferencias en la conciliacion</Badge>
                    <Button icon={<BadgeCheck size={18} />} loading={isSaving} onClick={handleApprove} type="button" variant="secondary">
                      Aprobar con diferencia
                    </Button>
                  </>
                ) : null}
                {current.status === 'RECONCILED' ? (
                  <Button icon={<BadgeCheck size={18} />} loading={isSaving} onClick={handleApprove} type="button">
                    Aprobar para pago
                  </Button>
                ) : null}
                {current.status === 'APPROVED' ? (
                  <Button icon={<BookCheck size={18} />} loading={isSaving} onClick={handleAccount} type="button">
                    Registrar contablemente
                  </Button>
                ) : null}
                {current.status === 'ACCOUNTED' ? (
                  <Button icon={<Wallet size={18} />} loading={isSaving} onClick={handlePay} type="button">
                    Marcar como pagada
                  </Button>
                ) : null}
                {current.status === 'PAID' ? <Badge tone="success">Factura pagada y cerrada</Badge> : null}
                {current.status === 'CANCELLED' ? <Badge tone="danger">Factura anulada</Badge> : null}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
