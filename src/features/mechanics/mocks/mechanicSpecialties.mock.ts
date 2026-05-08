import type { MechanicSpecialty } from '../types/mechanic.types'

export const mechanicSpecialtiesMock: MechanicSpecialty[] = [
  {
    id: 'mechanic-specialty-engine',
    code: 'MOT-DIESEL',
    name: 'Motor diesel',
    category: 'Mecanica pesada',
    description: 'Diagnostico, inyeccion, potencia, filtros y fallas de motor diesel.',
    status: 'active',
    createdBy: 'Sistema',
    updatedBy: 'Sistema',
  },
  {
    id: 'mechanic-specialty-brakes',
    code: 'FRE-AIRE',
    name: 'Frenos y suspension',
    category: 'Seguridad operacional',
    description: 'Circuitos de aire, valvulas, frenos, suspension y bloqueos de seguridad.',
    status: 'active',
    createdBy: 'Sistema',
    updatedBy: 'Sistema',
  },
  {
    id: 'mechanic-specialty-front-axle',
    code: 'TRE-DEL',
    name: 'Tren delantero',
    category: 'Rodado y direccion',
    description: 'Direccion, terminales, alineacion, vibraciones y tren delantero.',
    status: 'active',
    createdBy: 'Sistema',
    updatedBy: 'Sistema',
  },
  {
    id: 'mechanic-specialty-transmission',
    code: 'TRANS',
    name: 'Transmision',
    category: 'Powertrain',
    description: 'Embrague, caja, cardan, diferencial y pruebas finales de transmision.',
    status: 'active',
    createdBy: 'Sistema',
    updatedBy: 'Sistema',
  },
]
