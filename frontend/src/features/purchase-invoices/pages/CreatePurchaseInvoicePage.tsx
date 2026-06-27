import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { SupplierInvoiceForm } from '../components/SupplierInvoiceForm'
import styles from '../components/PurchaseInvoiceModule.module.css'

export function CreatePurchaseInvoicePage() {
  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          description="Registra la factura del proveedor desde su orden de compra para iniciar la conciliacion."
          title="Registrar factura de compra"
        />
        <Card>
          <SupplierInvoiceForm />
        </Card>
      </div>
    </PageContainer>
  )
}
