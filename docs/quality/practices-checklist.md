# Buenas practicas y checklist

Actualizado: 2026-05-13

## Estado por capa

| Capa | Correcto | Por mejorar |
|---|---|---|
| UI/UX | Shell compartido, sidebar compacto con submenus, topbar, filtros reutilizables, tablas, badges, RUT formateado, vistas operacionales clave mejoradas. | Tests visuales/E2E, indicador de fallback mock, seguir reduciendo formularios largos. |
| Datos frontend | Axios centralizado, request ID, resource API, hooks CRUD, servicios por feature. | Cancelacion/abort en filtros rapidos, politica de mocks por entorno. |
| Backend/API | CRUD declarativo, SQL parametrizado, request ID, migracion, seed, auditoria, modulos especializados. | Validacion por recurso, transacciones multi-tabla, permisos middleware, tests API. |
| Documentacion | Separada por backend, frontend, calidad y UX. | Mantener actualizada al cambiar rutas, recursos o patrones visuales. |

## Checklist antes de modificar una vista

1. Revisar la pagina completa.
2. Revisar componentes del modulo.
3. Revisar servicios/hook usados.
4. Confirmar endpoints y payloads.
5. Confirmar si hay mocks de fallback.
6. Mantener acciones primarias visibles.
7. Reducir ruido visual sin ocultar datos criticos.
8. Probar responsive si la vista cambia layout.
9. Ejecutar validaciones.

## Checklist para crear o modificar un modulo

1. Definir entidad principal y relaciones por ID.
2. Si es CRUD simple, agregar recurso en `backend/src/config/resources.js`.
3. Si tiene flujo, crear `routes`, `controller` y `service` en backend.
4. Agregar migracion/seed si corresponde.
5. Crear tipos frontend.
6. Crear servicio frontend si hay escritura.
7. Usar hooks CRUD para lectura simple.
8. Usar componentes compartidos.
9. Agregar ruta en `routes.ts` y `router.tsx`.
10. Agregar acceso en `app.config.ts` si debe navegarse.
11. Actualizar documentacion si cambia API, ruta o patron.
12. Ejecutar `npm run check` y `npm run build`.

## Contrato API estandar

Respuesta simple:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid"
  }
}
```

Respuesta paginada:

```json
{
  "data": [],
  "meta": {
    "limit": 100,
    "page": 1,
    "requestId": "uuid",
    "total": 0,
    "totalPages": 1
  }
}
```

Error:

```json
{
  "error": {
    "message": "Descripcion del error",
    "path": "/api/recurso",
    "requestId": "uuid",
    "statusCode": 400
  }
}
```

## Comandos de validacion

```bash
npm run check
npm run build
```

Si toca backend:

```bash
npm run backend:check
```

Si toca DB:

```bash
npm run backend:db:audit
```

## Prioridades tecnicas

1. Validacion de payloads backend para casos, fletes, inventario, compras, usuarios/perfiles e incidencias.
2. Indicador de datos fallback en frontend.
3. Tests E2E para flujos: crear caso, diagnosticar, cotizar, aprobar, crear incidencia, crear OC, asignar flete.
4. Middleware real de permisos.
5. Transacciones explicitas en flujos multi-tabla.
6. Consolidar duplicidad camion legacy vs flota.
7. Revisar indices SQL para filtros reales de `Table` y `FilterBar`.

## Regla de oro

No mejorar una vista rompiendo contratos. Se puede cambiar layout, jerarquia, responsive, componentes visuales y densidad, pero no endpoints, payloads, nombres criticos ni logica de negocio sin coordinar frontend y backend.
