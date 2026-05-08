import { ClipboardCheck, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { EmptyState } from '../../../shared/components/EmptyState/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import { Card } from '../../../shared/components/Card/Card'
import { useCaseDiagnostics } from '../../diagnostics/hooks/useCaseDiagnostics'

interface CaseDiagnosticsPanelProps {
  caseId: string
}

export function CaseDiagnosticsPanel({ caseId }: CaseDiagnosticsPanelProps) {
  const { data: diagnostics, errorMessage, isLoading } = useCaseDiagnostics(caseId)

  return (
    <Card>
      <div className="stack">
        <div className="section-heading-row">
          <h2 className="section-title">Diagnostico tecnico</h2>
          <Link className="module-tab" to={ROUTES.diagnostics(caseId)}>
            <Plus size={16} />
            Registrar
          </Link>
        </div>
        {isLoading ? <LoadingState label="Cargando diagnosticos" /> : null}
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudieron cargar los diagnosticos" /> : null}
        {!isLoading && !errorMessage && diagnostics.length === 0 ? (
          <EmptyState
            description="Registra sintomas, causa probable y severidad para que el caso avance a definicion de solucion."
            icon={<ClipboardCheck size={22} />}
            title="Sin diagnostico registrado"
          />
        ) : null}
        {!isLoading && !errorMessage && diagnostics.length > 0 ? (
          <div className="stack">
            {diagnostics.slice(0, 4).map((diagnostic) => (
              <div className="list-row" key={diagnostic.id}>
                <div className="stack-tight">
                  <strong>{diagnostic.rootCause}</strong>
                  <span className="muted-text">{diagnostic.symptoms.join(', ')}</span>
                </div>
                <dl className="detail-list">
                  <div>
                    <dt>Severidad</dt>
                    <dd>{diagnostic.severity}</dd>
                  </div>
                  <div>
                    <dt>Por</dt>
                    <dd>{diagnostic.createdBy || 'Sistema'}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  )
}
