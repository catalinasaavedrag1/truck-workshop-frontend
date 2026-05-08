import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { PageHeader } from '../../../shared/components/PageHeader/PageHeader'
import { PageContainer } from '../../../shared/layout/PageContainer/PageContainer'
import { CaseFilters } from '../components/CaseFilters'
import { CaseTable } from '../components/CaseTable'
import { useWorkshopCases } from '../hooks/useWorkshopCases'

export function WorkshopCasesPage() {
  const { cases, filters, isLoading, setFilters } = useWorkshopCases()

  return (
    <PageContainer>
      <PageHeader
        actions={
          <Link to={ROUTES.caseNew}>
            <Button icon={<Plus size={18} />}>Nuevo caso</Button>
          </Link>
        }
        description="Seguimiento de panas, diagnosticos, reparaciones y cierres."
        title="Casos de taller"
      />
      <CaseFilters filters={filters} setFilters={setFilters} />
      <Card>
        {isLoading ? <LoadingState label="Cargando casos de taller" /> : <CaseTable cases={cases} />}
      </Card>
    </PageContainer>
  )
}
