import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { SectionHeader } from '../../../shared/components/SectionHeader/SectionHeader'
import { useResourceList } from '../../../shared/hooks/useResourceList'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { formatCurrency } from '../../../shared/utils/formatCurrency'
import { FreightInvoiceTable } from '../components/FreightInvoiceTable'
import { freightInvoicesMock } from '../mocks/freightInvoices.mock'
import type { FreightInvoice } from '../types/freightInvoice.types'
import styles from '../components/FreightInvoiceModule.module.css'

export function FreightInvoicesPage() {
  const { data: invoices, isLoading } = useResourceList<FreightInvoice>('/freight-invoices', freightInvoicesMock, {
    order: 'desc',
    sort: 'issueDate',
  })

  const receivable = invoices.filter((invoice) => invoice.status !== 'PAID' && invoice.status !== 'CANCELLED')
  const receivableAmount = receivable.reduce((total, invoice) => total + invoice.total, 0)
  const pendingApproval = invoices.filter((invoice) => invoice.status === 'SENT' || invoice.status === 'ISSUED')
  const overdue = invoices.filter((invoice) => invoice.status === 'OVERDUE')

  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.freightInvoiceNew}>
              <Button icon={<Plus size={18} />}>Emitir factura</Button>
            </Link>
          }
          description="Cuentas por cobrar de fletes: factura electronica (consolidada por periodo), envio con respaldos, aprobacion del cliente y pago."
          title="Facturacion de fletes"
        />
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <MetricCard label="Por cobrar" tone="info" value={formatCurrency(receivableAmount)} helper={`${receivable.length} factura(s)`} />
          <MetricCard label="Por aprobar" tone="warning" value={pendingApproval.length} helper="emitidas o enviadas" />
          <MetricCard label="Vencidas" tone={overdue.length > 0 ? 'danger' : 'success'} value={overdue.length} helper="fuera de plazo" />
          <MetricCard label="Facturas" tone="neutral" value={invoices.length} helper="en el periodo" />
        </div>
        <Card>
          <div className="stack">
            <SectionHeader
              description="Cada factura consolida uno o varios fletes. Abrela para enviarla, registrar la aprobacion del cliente o el pago."
              title="Facturas a clientes"
            />
            <FreightInvoiceTable invoices={invoices} isLoading={isLoading} />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
