import { Card } from '../../../shared/components/Card/Card'
import { ErrorState } from '../../../shared/components/ErrorState/ErrorState'
import { LoadingState } from '../../../shared/components/LoadingState/LoadingState'
import type { Diagnostic } from '../types/diagnostic.types'

interface DiagnosticResultCardProps {
  diagnostic?: Diagnostic | null
  diagnostics?: Diagnostic[]
  errorMessage?: string
  isLoading?: boolean
}

export function DiagnosticResultCard({
  diagnostic,
  diagnostics = [],
  errorMessage = '',
  isLoading = false,
}: DiagnosticResultCardProps) {
  const previousDiagnostics = diagnostics.filter((item) => item.id !== diagnostic?.id).slice(0, 3)

  return (
    <Card>
      <div className="stack">
        <h2 className="section-title">Diagnostico del caso</h2>
        {isLoading ? <LoadingState label="Cargando diagnosticos" /> : null}
        {errorMessage ? <ErrorState description={errorMessage} title="No se pudieron cargar los diagnosticos" /> : null}
        {!isLoading && !errorMessage && diagnostic ? (
          <>
            <p className="muted-text">{diagnostic.rootCause}</p>
            <dl className="detail-list">
              <div>
                <dt>Severidad</dt>
                <dd>{diagnostic.severity}</dd>
              </div>
              <div>
                <dt>Sintomas</dt>
                <dd>{diagnostic.symptoms.join(', ')}</dd>
              </div>
              <div>
                <dt>Registrado por</dt>
                <dd>{diagnostic.createdBy || 'Sistema'}</dd>
              </div>
            </dl>
            {previousDiagnostics.length > 0 ? (
              <div className="stack-tight">
                <strong>Registros anteriores</strong>
                {previousDiagnostics.map((item) => (
                  <p className="muted-text" key={item.id}>
                    {item.rootCause}
                  </p>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
        {!isLoading && !errorMessage && !diagnostic ? (
          <p className="muted-text">
            Al guardar, el diagnostico quedara asociado al caso y el flujo avanzara a definicion de solucion.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
