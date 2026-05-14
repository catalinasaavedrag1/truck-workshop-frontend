import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { TireRemovalForm } from '../components/TireRemovalForm'

export function TireRemovalPage() {
  return (
    <PageContainer>
      <PageHeader
        description="Retira una unidad instalada, calcula kilometros rendidos y costo por kilometro."
        title="Retirar neumatico"
      />
      <TireRemovalForm />
    </PageContainer>
  )
}
