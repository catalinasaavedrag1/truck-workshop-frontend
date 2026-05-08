import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { FreightFlowStepper } from '../components/FreightFlowStepper'
import { FreightQuoteCalculator } from '../components/FreightQuoteCalculator'
import { FreightRequestForm } from '../components/FreightRequestForm'

export function CreateFreightRequestPage() {
  return (
    <PageContainer>
      <PageHeader
        description="Captura cliente, ruta y carga con contexto comercial para iniciar el flujo logistico."
        title="Crear solicitud de flete"
      />
      <FreightFlowStepper activeStage="request" title="Inicio del flujo TMS" />
      <div className="two-column-grid">
        <FreightRequestForm />
        <FreightQuoteCalculator />
      </div>
    </PageContainer>
  )
}
