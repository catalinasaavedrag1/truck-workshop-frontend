# Calidad backend

Actualizado: 2026-05-13

## Patrones correctos

- Express modular con rutas centralizadas.
- CRUD generico desde `resources.js`.
- SQL parametrizado.
- Repositorio en memoria para demo local.
- Soft delete cuando aplica.
- Request ID por request.
- Respuestas estandarizadas con `data` y `meta`.
- Errores estandarizados con `error`.
- Migracion, seed y auditoria reutilizando el mismo registry.
- Modulos especializados para flujos de negocio.
- Integraciones externas con fallback seguro.

## Riesgos

- El CRUD generico no valida esquemas de payload por recurso.
- Falta suite automatizada de tests API.
- Algunas operaciones multi-tabla deberian reforzarse con transacciones explicitas.
- Permisos existen como datos y cuentan con enforcement transversal activable por entorno.
- Si se habilita `VITE_ALLOW_MOCK_FALLBACK`, puede parecer que un endpoint funciona aunque SQL este incompleto; mantenerlo solo para demo/desarrollo.

## Reglas recomendadas

- Para CRUD simple, agregar recurso en `src/config/resources.js`.
- Para flujos con estado, crear router, controller y service.
- Usar `AppError` para errores conocidos.
- Usar `sendResponse` para mantener contrato.
- Usar `request-actor` cuando haya auditoria.
- Guardar relaciones por ID y snapshot legible solo cuando ayude a lectura historica.
- Mantener secretos en `.env`.
- No cambiar endpoints o payloads sin actualizar frontend y documentacion.
- Ejecutar `npm run backend:check`.
- Si cambia DB, ejecutar `npm run backend:db:audit`.

## Checklist de recurso CRUD

- `name` claro.
- `route` estable.
- `table` en snake_case.
- `fields` completos.
- `jsonFields` para arrays/objetos.
- `searchableFields` solo con campos utiles.
- `filterFields` alineados con filtros reales del frontend.
- `sortFields` alineados con tablas/listados.
- Seed y auditoria actualizados si aplica.

## Checklist de modulo especializado

- Router montado en `routes/index.js`.
- Controller delgado.
- Service con reglas de negocio.
- Validacion de entidades relacionadas.
- Actor de request para auditoria.
- Errores con `AppError`.
- Respuestas con `sendResponse`.
- Sin secretos ni credenciales en codigo.
