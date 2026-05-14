# Truck Workshop Backend

Actualizado: 2026-05-14

API Express de Truck Workshop. Expone `/api`, soporta SQL Server y modo memoria, y usa un registry declarativo para CRUD, migracion, seed y auditoria.
Incluye login con JWT, hashes PBKDF2 para usuarios y middleware opcional de permisos por modulo para produccion.

## Documentacion

- [Documentacion integral del proyecto](../docs/project-architecture.md)
- [Indice backend](../docs/backend/README.md)
- [Arquitectura](../docs/backend/overview.md)
- [Configuracion y comandos](../docs/backend/setup.md)
- [API y recursos](../docs/backend/api.md)
- [Operaciones y mantenimiento](../docs/backend/operations.md)

## Comandos rapidos

```bash
npm install
npm run dev
npm run start
npm run migrate
npm run seed
npm run db:reset
npm run db:audit
npm run check
```

Desde la raiz usa los scripts `backend:*`, por ejemplo `npm run backend:dev` o `npm run backend:db:audit`.
