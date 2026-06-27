import type { GpsPosition } from '../services/gpsTracking.service'

// Datos de demostracion para el panel GPS cuando el backend (proxy DS-TMS) no
// esta disponible, por ejemplo en el despliegue estatico de GitHub Pages.
// Reflejan el shape real que entrega la integracion DS-TMS.
export const gpsPositionsMock: GpsPosition[] = [
  { plate: 'FHDS61', lat: -33.601083, lng: -71.618922, location: 'Puerto San Antonio, Region de Valparaiso', fixedAt: '2026-06-27 16:53:19', speed: 0, heading: 295, engineOn: false, odometerKm: 289117, voltage: 25.9, satellites: 19, driver: '' },
  { plate: 'PJJV19', lat: -33.51744, lng: -70.64207, location: 'Avenida Lo Ovalle, San Miguel, RM', fixedAt: '2026-06-27 16:23:55', speed: 0, heading: 58, engineOn: false, odometerKm: 367421, voltage: 25.0, satellites: 14, driver: '' },
  { plate: 'CRXZ44', lat: -35.596241, lng: -71.705228, location: 'San Javier, Region del Maule', fixedAt: '2026-06-27 16:42:13', speed: 62, heading: 279, engineOn: true, odometerKm: 316737, voltage: 27.4, satellites: 16, driver: 'Luis Herrera' },
  { plate: 'MY3701', lat: -35.594, lng: -71.701, location: 'Ruta 5 Sur, San Javier, Region del Maule', fixedAt: '2026-06-27 16:40:02', speed: 78, heading: 12, engineOn: true, odometerKm: 285014, voltage: 27.8, satellites: 18, driver: 'Marcela Soto' },
  { plate: 'WT7166', lat: -35.6, lng: -71.71, location: 'San Javier, Region del Maule', fixedAt: '2026-06-27 16:35:00', speed: 0, heading: 0, engineOn: false, odometerKm: 292653, voltage: 26.1, satellites: 15, driver: '' },
  { plate: 'CDBY48', lat: -33.575, lng: -71.541, location: 'Aguas Buenas, San Antonio, Region de Valparaiso', fixedAt: '2026-06-27 16:30:44', speed: 0, heading: 180, engineOn: true, odometerKm: 258608, voltage: 25.6, satellites: 12, driver: 'Claudio Munoz' },
  { plate: 'LKBP98', lat: -33.576, lng: -71.542, location: 'Aguas Buenas, San Antonio, Region de Valparaiso', fixedAt: '2026-06-27 16:18:10', speed: 0, heading: 0, engineOn: false, odometerKm: 317528, voltage: 24.8, satellites: 11, driver: '' },
  { plate: 'HYKZ33', lat: -33.5175, lng: -70.6422, location: 'Avenida Lo Ovalle, San Miguel, RM', fixedAt: '2026-06-27 16:10:31', speed: 45, heading: 90, engineOn: true, odometerKm: 322816, voltage: 27.1, satellites: 17, driver: 'Felipe Araya' },
]
