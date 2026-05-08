import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { TireInstallationForm } from '../components/TireInstallationForm'
import { TireModuleNav } from '../components/TireModuleNav'

export function TireInstallationPage() {
  return (
    <PageContainer>
      <PageHeader
        description="Instala una unidad comprada/en stock en un camion, posicion y kilometraje inicial."
        title="Instalar neumatico"
      />
      <TireModuleNav />
      <TireInstallationForm />
    </PageContainer>
  )
}
