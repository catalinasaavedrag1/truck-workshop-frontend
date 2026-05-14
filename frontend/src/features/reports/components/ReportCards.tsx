import { AlertTriangle, BarChart3, ClipboardList, DollarSign, FileWarning, Gauge, PackageSearch, ReceiptText, Truck } from 'lucide-react'
import { Badge } from '../../../shared/components/Badge/Badge'
import { MetricCard } from '../../../shared/components/MetricCard/MetricCard'
import type { OperationalAlert, ReportCatalogItem, ReportMetric, ReportSection } from '../types/report.types'
import styles from './ReportCards.module.css'

const metricIcons = {
  'available-trucks': <Truck aria-hidden size={18} />,
  'blocked-parts': <PackageSearch aria-hidden size={18} />,
  'driver-trip-sheets': <ReceiptText aria-hidden size={18} />,
  'fuel-spend': <Gauge aria-hidden size={18} />,
  'freight-revenue': <DollarSign aria-hidden size={18} />,
  'open-cases': <ClipboardList aria-hidden size={18} />,
  'pending-purchases': <PackageSearch aria-hidden size={18} />,
  'sla-risk': <AlertTriangle aria-hidden size={18} />,
  'technical-inspections-due': <FileWarning aria-hidden size={18} />,
}

interface ReportMetricGridProps {
  metrics: ReportMetric[]
}

export function ReportMetricGrid({ metrics }: ReportMetricGridProps) {
  return (
    <div className={styles.metricGrid}>
      {metrics.map((metric) => (
        <MetricCard
          helper={metric.helper}
          icon={metricIcons[metric.id as keyof typeof metricIcons] || <BarChart3 aria-hidden size={18} />}
          key={metric.id}
          label={metric.label}
          tone={metric.tone}
          value={metric.value}
        />
      ))}
    </div>
  )
}

interface ReportCatalogProps {
  activeSection: ReportSection
  items: ReportCatalogItem[]
  onSelect: (section: ReportSection) => void
}

export function ReportCatalog({ activeSection, items, onSelect }: ReportCatalogProps) {
  return (
    <div className={styles.catalogGrid}>
      {items.map((item) => (
        <button
          className={[styles.catalogCard, activeSection === item.id ? styles.catalogCardActive : ''].filter(Boolean).join(' ')}
          key={item.id}
          onClick={() => onSelect(item.id)}
          type="button"
        >
          <span className={styles.catalogHeader}>
            <h2>{item.label}</h2>
            <Badge tone={item.tone}>{item.kpi}</Badge>
          </span>
          <p>{item.description}</p>
          <span className={styles.catalogKpi}>Ver reporte</span>
        </button>
      ))}
    </div>
  )
}

interface OperationalAlertsProps {
  alerts: OperationalAlert[]
}

export function OperationalAlerts({ alerts }: OperationalAlertsProps) {
  return (
    <div className={styles.alertGrid}>
      {alerts.map((alert) => (
        <article className={[styles.alertItem, styles[alert.tone]].join(' ')} key={alert.id}>
          <div className="split-row">
            <strong>{alert.title}</strong>
            <Badge tone={alert.tone}>{alert.owner}</Badge>
          </div>
          <p>{alert.description}</p>
        </article>
      ))}
    </div>
  )
}
