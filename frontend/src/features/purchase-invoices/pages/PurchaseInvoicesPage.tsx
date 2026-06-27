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
import { InventoryModuleNav } from '../../warehouse/components/InventoryModuleNav'
import warehouseStyles from '../../warehouse/components/InventoryModule.module.css'
import { SupplierInvoiceTable } from '../components/SupplierInvoiceTable'
import { purchaseInvoicesMock } from '../mocks/purchaseInvoices.mock'
import type { SupplierInvoice } from '../types/supplierInvoice.types'

export function PurchaseInvoicesPage() {
  const { data: invoices, isLoading } = useResourceList<SupplierInvoice>('/purchase-invoices', purchaseInvoicesMock, {
    order: 'desc',
    sort: 'invoiceDate',
  })

  const toReconcile = invoices.filter((invoice) => invoice.status === 'REGISTERED' || invoice.status === 'WITH_DIFFERENCE')
  const toPay = invoices.filter((invoice) => invoice.status === 'APPROVED' || invoice.status === 'ACCOUNTED')
  const payableAmount = toPay.reduce((total, invoice) => total + invoice.total, 0)
  const withDifference = invoices.filter((invoice) => invoice.status === 'WITH_DIFFERENCE')

  return (
    <PageContainer>
      <div className={warehouseStyles.pageStack}>
        <PageHeader
          actions={
            <Link to={ROUTES.purchaseInvoiceNew}>
              <Button icon={<Plus size={18} />}>Registrar factura</Button>
            </Link>
          }
          description="Cuentas por pagar: factura del proveedor, conciliacion OC + Recepcion + Factura, aprobacion, registro contable y pago."
          title="Facturas de compra"
        />
        <InventoryModuleNav />
        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <MetricCard label="Por conciliar" tone="warning" value={toReconcile.length} helper="registradas o con diferencia" to={ROUTES.purchaseInvoices} />
          <MetricCard label="Con diferencia" tone={withDifference.length > 0 ? 'danger' : 'success'} value={withDifference.length} helper="3-way no calza" />
          <MetricCard label="Por pagar" tone="info" value={toPay.length} helper="aprobadas o contabilizadas" />
          <MetricCard label="Monto por pagar" tone="neutral" value={formatCurrency(payableAmount)} helper="comprometido" />
        </div>
        <Card>
          <div className="stack">
            <SectionHeader
              description="Cada factura avanza por conciliacion, aprobacion, registro contable y pago. Abre una para gestionar el flujo."
              title="Facturas de proveedores"
            />
            <SupplierInvoiceTable invoices={invoices} isLoading={isLoading} />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
