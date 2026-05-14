import type { DiagnosticChecklistTemplate } from '../types/diagnosticChecklist.types'

export const diagnosticChecklistsMock: DiagnosticChecklistTemplate[] = [
  {
    id: 'checklist-engine',
    category: 'engine',
    name: 'Motor',
    estimatedMinutes: 35,
    items: [
      { id: 'engine-001', label: 'Revisar codigos de falla', required: true, checked: true },
      { id: 'engine-002', label: 'Medir presion de combustible', required: true, checked: false },
      { id: 'engine-003', label: 'Inspeccionar filtros y lineas', required: true, checked: true },
    ],
  },
  {
    id: 'checklist-brakes',
    category: 'brakes',
    name: 'Frenos',
    estimatedMinutes: 45,
    items: [
      { id: 'brakes-001', label: 'Verificar perdida de aire', required: true, checked: true },
      { id: 'brakes-002', label: 'Revisar valvula moduladora', required: true, checked: true },
      { id: 'brakes-003', label: 'Probar presion de circuito', required: true, checked: false },
    ],
  },
  {
    id: 'checklist-electrical',
    category: 'electrical',
    name: 'Electrico',
    estimatedMinutes: 30,
    items: [
      { id: 'electrical-001', label: 'Revisar bateria y alternador', required: true, checked: false },
      { id: 'electrical-002', label: 'Inspeccionar arnes principal', required: false, checked: false },
      { id: 'electrical-003', label: 'Validar sensores reportados', required: true, checked: false },
    ],
  },
  {
    id: 'checklist-tires',
    category: 'tires',
    name: 'Neumaticos',
    estimatedMinutes: 20,
    items: [
      { id: 'tires-001', label: 'Medir profundidad', required: true, checked: false },
      { id: 'tires-002', label: 'Revisar presion', required: true, checked: true },
      { id: 'tires-003', label: 'Buscar cortes o deformaciones', required: true, checked: false },
    ],
  },
  {
    id: 'checklist-suspension',
    category: 'suspension',
    name: 'Suspension',
    estimatedMinutes: 40,
    items: [
      { id: 'suspension-001', label: 'Inspeccionar bujes', required: true, checked: true },
      { id: 'suspension-002', label: 'Revisar amortiguadores', required: true, checked: false },
      { id: 'suspension-003', label: 'Validar alineacion visual', required: false, checked: false },
    ],
  },
  {
    id: 'checklist-transmission',
    category: 'transmission',
    name: 'Transmision',
    estimatedMinutes: 50,
    items: [
      { id: 'transmission-001', label: 'Verificar embrague', required: true, checked: true },
      { id: 'transmission-002', label: 'Revisar fugas', required: true, checked: false },
      { id: 'transmission-003', label: 'Probar cambios en ruta corta', required: true, checked: false },
    ],
  },
]
