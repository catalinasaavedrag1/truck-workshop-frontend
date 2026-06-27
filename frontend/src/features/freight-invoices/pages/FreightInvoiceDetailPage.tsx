import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, BadgeCheck, FileCheck2, Send, Wallet } from 'lucide-react'
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
import { FreightInvoiceLinesTable } from '../components/FreightInvoiceLinesTable'
import { FreightInvoiceStatusBadge } from '../components/FreightInvoiceStatusBadge'
import { freightInvoicesMock } from '../mocks/freightInvoices.mock'
import { updateFreightInvoice } from '../services/freightInvoices.service'
import type { FreightInvoice, FreightInvoiceStatus } from '../types/freightInvoice.types'
import styles from '../components/FreightInvoiceModule.module.css'

const FLOW: { key: FreightInvoiceStatus; label: string }[] = [
  { key: 'ISSUED', label: 'Emitida' },
  { key: 'SENT', label: 'Enviada' },
  { key: 'APPROVED', label: 'Aprobada cliente' },
  { key: 'PAID', label: 'Pagada' },
]

function stepIndex(status: FreightInvoiceStatus): number {
  switch (status) {
    case 'ISSUED':
      return 0
    case 'SENT':
    case 'OVERDUE':
      return 1
    case 'APPROVED':
      return 2
    case 'PAID':
      return 3
    default:
      return 0
  }
}

export function FreightInvoiceDetailPage() {
  const { invoiceId } = useParams()
  const { data: invoice, isLoading } = useResourceItem<FreightInvoice>('/freight-invoices', invoiceId, freightInvoicesMock)
  const [localInvoice, setLocalInvoice] = useState<FreightInvoice | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const current = localInvoice?.id === invoiceId ? localInvoice : invoice

  if (isLoading && !current) {
    return (
      <PageContainer>
        <LoadingState label="Cargando factura de fletes" />
      </PageContainer>
    )
  }

  if (!current) {
    return (
      <PageContainer>
        <EmptyState
          description="Revisa el identificador o vuelve al listado de facturacion de fletes."
          icon={<AlertCircle size={22} />}
          title="Factura no encontrada"
        />
      </PageContainer>
    )
  }

  const advance = async (nextStatus: FreightInvoiceStatus, patch: Partial<FreightInvoice>, message: string) => {
    setActionError('')
    setIsSaving(true)

    try {
      const updated = await updateFreightInvoice(current.id, { status: nextStatus, ...patch })
      setLocalInvoice({ ...current, status: nextStatus, ...patch, ...updated })
      toast.success(message, `${current.invoiceNumber}`)
    } catch (error) {
      setActionError(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = () => advance('SENT', { sentAt: new Date().toISOString() }, 'Factura enviada al cliente')
  const handleApprove = () =>
    advance('APPROVED', { approvedAt: new Date().toISOString(), approvedBy: `${current.customerName}` }, 'Cliente aprobo la factura')
  const handlePay = () =>
    advance(
      'PAID',
      { paidAt: new Date().toISOString(), paymentReference: `TRF-${String(Math.floor(Math.random() * 900000) + 100000)}` },
      'Pago registrado',
    )

  const activeStep = stepIndex(current.status)

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={<FreightInvoiceStatusBadge status={current.status} />}
          description={`${current.customerName} - ${current.lines.length} servicio(s) consolidado(s)`}
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
              <SectionHeader description="Fletes y servicios adicionales del periodo" title="Detalle consolidado" />
              <FreightInvoiceLinesTable lines={current.lines} />
            </div>
          </Card>

          <div className="stack">
            <Card>
              <div className="stack">
                <SectionHeader title="Datos de la factura" />
                <dl className="detail-list">
                  <div>
                    <dt>Cliente</dt>
                    <dd>
                      {current.customerId ? (
                        <EntityLink id={current.customerId} type="customer">
                          {current.customerName}
                        </EntityLink>
                      ) : (
                        current.customerName
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Emision</dt>
                    <dd>{formatDate(current.issueDate)}</dd>
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
                <SectionHeader description="Respaldos del servicio" title="Documentacion" />
                <div className={styles.backups}>
                  {current.backupDocuments.map((doc) => (
                    <span className={styles.backup} key={doc}>
                      <FileCheck2 aria-hidden size={14} /> {doc}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <div className="stack">
                <SectionHeader title="Siguiente paso" />
                {current.status === 'ISSUED' ? (
                  <Button icon={<Send size={18} />} loading={isSaving} onClick={handleSend} type="button">
                    Enviar al cliente (con respaldos)
                  </Button>
                ) : null}
                {current.status === 'SENT' || current.status === 'OVERDUE' ? (
                  <Button icon={<BadgeCheck size={18} />} loading={isSaving} onClick={handleApprove} type="button">
                    Registrar aprobacion del cliente
                  </Button>
                ) : null}
                {current.status === 'APPROVED' ? (
                  <Button icon={<Wallet size={18} />} loading={isSaving} onClick={handlePay} type="button">
                    Registrar pago
                  </Button>
                ) : null}
                {current.status === 'PAID' ? <Badge tone="success">Factura cobrada y cerrada</Badge> : null}
                {current.status === 'CANCELLED' ? <Badge tone="danger">Factura anulada</Badge> : null}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
