import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { Card } from '../../../shared/components/Card/Card'
import type { TireLifecycle } from '../types/tirePerformance.types'
import type { TireOperationalReport } from '../utils/tirePerformanceOperations'
import styles from './TireLifecycleStageBoard.module.css'

interface TireLifecycleStageBoardProps {
  report: TireOperationalReport
}

interface Stage {
  actionPath: (tire: TireLifecycle) => string
  empty: string
  items: TireLifecycle[]
  label: string
}

export function TireLifecycleStageBoard({ report }: TireLifecycleStageBoardProps) {
  const stages: Stage[] = [
    {
      actionPath: (tire) => `${ROUTES.tirePerformanceInstall}?tireId=${tire.id}`,
      empty: 'Sin unidades listas. Ingresa compra/stock para iniciar nuevos ciclos.',
      items: report.stock,
      label: 'Listos para instalar',
    },
    {
      actionPath: (tire) => `${ROUTES.tirePerformanceRemove}?tireId=${tire.id}`,
      empty: 'No hay neumaticos instalados en seguimiento.',
      items: report.installed,
      label: 'En camion',
    },
    {
      actionPath: getGapActionPath,
      empty: 'Sin brechas de datos que bloqueen decisiones.',
      items: report.dataGaps,
      label: 'Datos por cerrar',
    },
    {
      actionPath: () => ROUTES.tirePerformanceComparison,
      empty: 'Aun no hay ciclos completos para comparar.',
      items: report.readyForReport,
      label: 'Reportables',
    },
  ]

  return (
    <Card className={styles.board}>
      <div className={styles.heading}>
        <div>
          <h2>Trabajo operativo por etapa</h2>
          <p>Usa estas colas para avanzar el ciclo real: stock, instalacion, cierre y decision.</p>
        </div>
      </div>
      <div className={styles.stages}>
        {stages.map((stage) => (
          <section className={styles.stage} key={stage.label}>
            <div className={styles.stageHeader}>
              <strong>{stage.label}</strong>
              <span>{stage.items.length}</span>
            </div>
            <div className={styles.items}>
              {stage.items.length > 0 ? (
                stage.items.slice(0, 4).map((tire) => (
                  <Link className={styles.item} key={tire.id} to={stage.actionPath(tire)}>
                    <strong>{tire.skuCode}</strong>
                    <span>{getTireMeta(tire)}</span>
                  </Link>
                ))
              ) : (
                <p className={styles.empty}>{stage.empty}</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </Card>
  )
}

function getGapActionPath(tire: TireLifecycle) {
  if (tire.status === 'INSTALLED') {
    return `${ROUTES.tirePerformanceRemove}?tireId=${tire.id}`
  }

  if (tire.status === 'PURCHASED' || tire.status === 'IN_STOCK') {
    return `${ROUTES.tirePerformanceInstall}?tireId=${tire.id}`
  }

  return ROUTES.tirePerformance
}

function getTireMeta(tire: TireLifecycle) {
  return [
    tire.truckPlate || 'Bodega',
    tire.tirePosition || tire.usageType,
    tire.supplierName,
  ]
    .filter(Boolean)
    .join(' - ')
}
