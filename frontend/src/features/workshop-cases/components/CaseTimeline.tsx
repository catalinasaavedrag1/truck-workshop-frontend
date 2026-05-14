import type { WorkshopCase } from '../types/workshopCase.types'

const steps = [
  'Crear caso de taller',
  'Diagnosticar problema',
  'Definir solucion',
  'Asignar responsable',
  'Ejecutar reparacion',
  'Probar camion',
  'Cerrar caso',
]

interface CaseTimelineProps {
  workshopCase: WorkshopCase
}

export function CaseTimeline({ workshopCase }: CaseTimelineProps) {
  const currentIndex = getCurrentStepIndex(workshopCase)

  return (
    <div className="timeline">
      {steps.map((step, index) => (
        <div className="timeline-step" key={step}>
          <span className="timeline-dot">{index + 1}</span>
          <div>
            <strong>{step}</strong>
            <p className="muted-text">{index <= currentIndex ? 'Completado o en curso' : 'Pendiente'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function getCurrentStepIndex(workshopCase: WorkshopCase) {
  const explicitIndex = steps.indexOf(workshopCase.currentStep)

  if (explicitIndex >= 0) {
    return explicitIndex
  }

  const statusIndex: Record<WorkshopCase['status'], number> = {
    assigned: 3,
    closed: 6,
    diagnosis: 1,
    new: 0,
    repairing: 4,
    solution: 2,
    testing: 5,
  }

  return statusIndex[workshopCase.status] ?? 0
}
