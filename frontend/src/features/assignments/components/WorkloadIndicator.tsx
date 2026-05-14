interface WorkloadIndicatorProps {
  activeCases: number
  maxCases: number
}

export function WorkloadIndicator({ activeCases, maxCases }: WorkloadIndicatorProps) {
  const usage = Math.round((activeCases / maxCases) * 100)

  return (
    <div className="stack">
      <div className="split-row">
        <span className="muted-text">Carga</span>
        <strong>{usage}%</strong>
      </div>
      <div className="progress-bar">
        <span style={{ width: `${usage}%` }} />
      </div>
    </div>
  )
}
