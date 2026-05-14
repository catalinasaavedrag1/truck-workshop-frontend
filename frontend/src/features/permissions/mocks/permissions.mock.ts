import type {
  PermissionModule,
  Role,
  UserRoleAssignment,
} from '../types/permission.types'

export const permissionModulesMock: PermissionModule[] = [
  {
    id: 'cases',
    label: 'Casos',
    permissions: [
      { key: 'cases.view', label: 'Ver casos', module: 'Casos' },
      { key: 'cases.create', label: 'Crear casos', module: 'Casos' },
      { key: 'cases.diagnose', label: 'Diagnosticar', module: 'Casos' },
      { key: 'cases.assign', label: 'Asignar caso', module: 'Casos' },
      { key: 'cases.escalate', label: 'Escalar caso', module: 'Casos' },
      { key: 'cases.close', label: 'Cerrar caso', module: 'Casos' },
    ],
  },
  {
    id: 'operations',
    label: 'Operacion',
    permissions: [
      { key: 'drivers.manage', label: 'Gestionar choferes', module: 'Operacion' },
      { key: 'warehouse.manage', label: 'Gestionar bodega', module: 'Operacion' },
    ],
  },
  {
    id: 'purchase-orders',
    label: 'Compras',
    permissions: [
      { key: 'purchaseOrders.create', label: 'Crear orden de compra', module: 'Compras' },
      { key: 'purchaseOrders.approve', label: 'Aprobar orden de compra', module: 'Compras' },
    ],
  },
  {
    id: 'freight',
    label: 'Fletes',
    permissions: [
      { key: 'freight.requests.view', label: 'Ver solicitudes de flete', module: 'Fletes' },
      { key: 'freight.requests.create', label: 'Crear solicitud de flete', module: 'Fletes' },
      { key: 'freight.quotes.create', label: 'Crear cotizacion de flete', module: 'Fletes' },
      { key: 'freight.quotes.send', label: 'Enviar cotizacion de flete', module: 'Fletes' },
      { key: 'freight.quotes.decide', label: 'Aprobar/rechazar cotizacion', module: 'Fletes' },
      { key: 'freight.assign', label: 'Asignar flete', module: 'Fletes' },
      { key: 'freight.assignments.view', label: 'Ver fletes asignados', module: 'Fletes' },
    ],
  },
  {
    id: 'fleet',
    label: 'Flota',
    permissions: [
      { key: 'fleet.view', label: 'Ver flota', module: 'Flota' },
      { key: 'fleet.manage', label: 'Gestionar ficha camion', module: 'Flota' },
      { key: 'fleet.availability', label: 'Ver disponibilidad', module: 'Flota' },
      { key: 'fleet.maintenance', label: 'Gestionar mantenimiento preventivo', module: 'Flota' },
      { key: 'fleet.documents', label: 'Gestionar documentos camion', module: 'Flota' },
      { key: 'fleet.fuel', label: 'Registrar combustible', module: 'Flota' },
      { key: 'fleet.costs', label: 'Ver costos por camion', module: 'Flota' },
      { key: 'fleet.incidents', label: 'Gestionar incidentes', module: 'Flota' },
      { key: 'fleet.telematics', label: 'Ver telemetria', module: 'Flota' },
    ],
  },
  {
    id: 'admin',
    label: 'Administracion',
    permissions: [
      { key: 'permissions.manage', label: 'Gestionar permisos', module: 'Administracion' },
      { key: 'reports.view', label: 'Ver reportes', module: 'Administracion' },
    ],
  },
]

export const rolesMock: Role[] = [
  {
    id: 'role-admin',
    code: 'ADMIN',
    name: 'Administrador',
    description: 'Acceso completo a configuracion y operacion.',
    permissions: permissionModulesMock.flatMap((module) => module.permissions.map((item) => item.key)),
  },
  {
    id: 'role-jefe-taller',
    code: 'JEFE_TALLER',
    name: 'Jefe de taller',
    description: 'Gestiona casos, diagnosticos, asignaciones y escalamiento.',
    permissions: [
      'cases.view',
      'cases.create',
      'cases.diagnose',
      'cases.assign',
      'cases.escalate',
      'cases.close',
      'fleet.availability',
      'fleet.maintenance',
      'reports.view',
    ],
  },
  {
    id: 'role-recepcion',
    code: 'RECEPCION',
    name: 'Recepcion',
    description: 'Registra camiones, choferes y nuevos casos.',
    permissions: [
      'cases.view',
      'cases.create',
      'drivers.manage',
      'fleet.view',
      'freight.requests.view',
      'freight.requests.create',
    ],
  },
  {
    id: 'role-mecanico',
    code: 'MECANICO',
    name: 'Mecanico',
    description: 'Diagnostica y actualiza avances tecnicos.',
    permissions: ['cases.view', 'cases.diagnose'],
  },
  {
    id: 'role-bodega',
    code: 'ENCARGADO_BODEGA',
    name: 'Encargado de bodega',
    description: 'Administra ubicaciones, stock y repuestos requeridos.',
    permissions: ['cases.view', 'warehouse.manage', 'fleet.view', 'fleet.maintenance'],
  },
  {
    id: 'role-compras',
    code: 'COMPRAS',
    name: 'Compras',
    description: 'Genera y controla ordenes de compra.',
    permissions: [
      'cases.view',
      'purchaseOrders.create',
      'purchaseOrders.approve',
      'freight.requests.view',
      'freight.quotes.create',
      'freight.quotes.send',
      'fleet.costs',
    ],
  },
  {
    id: 'role-supervisor',
    code: 'SUPERVISOR',
    name: 'Supervisor',
    description: 'Monitorea SLA, escalamiento y reportes.',
    permissions: [
      'cases.view',
      'cases.assign',
      'cases.escalate',
      'reports.view',
      'freight.requests.view',
      'freight.quotes.decide',
      'freight.assign',
      'freight.assignments.view',
      'fleet.view',
      'fleet.availability',
      'fleet.costs',
      'fleet.incidents',
    ],
  },
]

export const userRoleAssignmentsMock: UserRoleAssignment[] = [
  { id: 'user-role-user-001', userId: 'user-001', userName: 'Andrea Molina', email: 'andrea@taller.local', roleCode: 'ADMIN' },
  { id: 'user-role-user-002', userId: 'user-002', userName: 'Javier Torres', email: 'javier@taller.local', roleCode: 'JEFE_TALLER' },
  { id: 'user-role-user-003', userId: 'user-003', userName: 'Natalia Perez', email: 'natalia@taller.local', roleCode: 'ENCARGADO_BODEGA' },
  { id: 'user-role-user-004', userId: 'user-004', userName: 'Felipe Araya', email: 'felipe@taller.local', roleCode: 'COMPRAS' },
  { id: 'user-role-user-005', userId: 'user-005', userName: 'Daniel Rivas', email: 'daniel@taller.local', roleCode: 'MECANICO' },
  { id: 'user-role-user-006', userId: 'user-006', userName: 'Paula Fuentes', email: 'paula@taller.local', roleCode: 'MECANICO' },
  { id: 'user-role-user-007', userId: 'user-007', userName: 'Marco Silva', email: 'marco@taller.local', roleCode: 'MECANICO' },
  { id: 'user-role-user-008', userId: 'user-008', userName: 'Camila Herrera', email: 'camila@taller.local', roleCode: 'MECANICO' },
]
