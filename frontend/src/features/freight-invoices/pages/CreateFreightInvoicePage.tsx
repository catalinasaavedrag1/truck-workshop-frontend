import { Card } from '../../../shared/components/Card/Card'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FreightInvoiceForm } from '../components/FreightInvoiceForm'
import styles from '../components/FreightInvoiceModule.module.css'

export function CreateFreightInvoicePage() {
  return (
    <PageContainer>
      <div className={styles.pageStack}>
        <PageHeader
          description="Consolida los fletes facturables de un cliente en una factura electronica por periodo."
          title="Emitir factura de fletes"
        />
        <Card>
          <FreightInvoiceForm />
        </Card>
      </div>
    </PageContainer>
  )
}
