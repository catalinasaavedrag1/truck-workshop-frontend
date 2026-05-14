import { Card } from '../../../shared/components/Card/Card'
import type { ReportBarItem } from '../types/report.types'
import { ReportBarList } from './ReportBarList'

interface RepairTimeReportProps {
  rows: ReportBarItem[]
}

export function RepairTimeReport({ rows }: RepairTimeReportProps) {
  return (
    <Card>
      <div className="stack">
        <div>
          <h2 className="section-title">Carga de taller</h2>
          <p className="muted-text">Horas comprometidas entre agenda, cola y bloqueos.</p>
        </div>
        <ReportBarList items={rows} valueSuffix="h" />
      </div>
    </Card>
  )
}
