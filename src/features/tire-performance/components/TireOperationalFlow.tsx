import { Activity, BarChart3, CircleDot, Package, PackagePlus, Repeat2, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Button } from '../../../shared/components/Button/Button'
import { Card } from '../../../shared/components/Card/Card'
import type { TireOperationalReport, TireWorkflowStep } from '../utils/tirePerformanceOperations'
import styles from './TireOperationalFlow.module.css'

interface TireOperationalFlowProps {
  report: TireOperationalReport
}

const stepIcons = {
  close: Repeat2,
  install: Wrench,
  intake: PackagePlus,
  monitor: Activity,
  report: BarChart3,
  stock: Package,
}

function getActionPath(step: TireWorkflowStep) {
  if (step.id === 'intake') {
    return ROUTES.tirePerformanceIntake
  }

  if (step.id === 'stock' || step.id === 'install') {
    return ROUTES.tirePerformanceInstall
  }

  if (step.id === 'monitor' || step.id === 'close') {
    return ROUTES.tirePerformanceRemove
  }

  return ROUTES.tirePerformanceComparison
}

export function TireOperationalFlow({ report }: TireOperationalFlowProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.heading}>
        <div className={styles.headingCopy}>
          <h2>Flujo operativo del reporte</h2>
          <p>El rendimiento solo es confiable cuando el neumatico tiene compra, instalacion, retiro y km cerrados.</p>
        </div>
        <div className={styles.readiness}>
          <strong>{report.reportReadiness}%</strong>
          <span>listo para decidir</span>
        </div>
      </div>

      <div className={styles.flow}>
        {report.steps.map((step) => {
          const Icon = stepIcons[step.id] || CircleDot

          return (
            <article className={styles.step} key={step.id}>
              <div className={styles.stepHeader}>
                <span className={[styles.marker, styles[step.tone]].join(' ')}>
                  <Icon aria-hidden size={16} />
                </span>
                <div className={styles.stepTitle}>
                  <strong>{step.label}</strong>
                  <span>{step.count} registros</span>
                </div>
              </div>
              <p className={styles.stepDescription}>{step.description}</p>
              <div aria-label={`${step.progress}% completo`} className={styles.progressTrack}>
                <span style={{ width: `${step.progress}%` }} />
              </div>
              <div className={styles.blockers}>
                {step.blockers.length > 0 ? (
                  <>
                    <strong>Bloqueo</strong>
                    <span>{step.blockers[0]}</span>
                  </>
                ) : (
                  <span>Sin bloqueos para esta etapa.</span>
                )}
              </div>
              <Link className={styles.action} to={getActionPath(step)}>
                <Button size="sm" variant="secondary">
                  {step.actionLabel}
                </Button>
              </Link>
            </article>
          )
        })}
      </div>
    </Card>
  )
}
