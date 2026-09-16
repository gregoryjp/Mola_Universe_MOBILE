# M3 — Flujos diferidos (fuera de UI) — Mola_Universe_MOBILE — 2026-09-17

Flujos que quedan **fuera de alcance de UI** en M3 por decisión de producto. El port
y la implementación de data existen y están testeados donde se indica; lo que falta
es la/screen/hook. Pasarlos a `technical-debt.md` en `Mola_Universe_APP`.

## Shopping

| Flujo | Endpoint real (rel. a `/api/v1`) | Método | Estado en móvil |
| --- | --- | --- | --- |
| Editar una lista | `/users/shopping-lists/:listId` | — | **No existe endpoint** (no implementar) |
| Archivar/borrar una lista | `/users/shopping-lists/:listId` | DELETE | Port: `deleteList` (impl ok). **UI: falta** |
| Detalle de lista | `/users/shopping-lists/:listId` | GET | Port: `getList` (impl ok). **UI: falta** |
| Editar item | `/shopping-lists/:listId/items/:itemId` | PATCH | Port: `updateItem` (impl ok). **UI: falta** |
| Cancelar item | `/shopping-lists/:listId/items/:itemId/cancel` | PATCH | Port: `cancelItem` + `useCancelItem` (ok, sin uso). **UI: falta** |
| Copiar item a otra lista | `/shopping-lists/:listId/items/:itemId/copy` | POST | Port: `copyItem` (impl ok) + DTO `CopyShoppingItemRequestDto`. **UI: falta** |
| Duplicados de una lista | `/shopping-lists/:listId/duplicates` | GET | Port: `getDuplicates` (impl ok) + `DuplicateGroup`. **UI: falta** |
| Sugerencias de duplicado al añadir | — (vienen en la respuesta de `addItem`) | POST | `CreatedShoppingItem.duplicateSuggestions` se mapea pero **no se muestra** |

## Inventory

| Flujo | Endpoint real (rel. a `/api/v1`) | Método | Estado en móvil |
| --- | --- | --- | --- |
| Editar item (nombre/unidad) | `/users/inventory-items/:itemId` | PATCH | Port: `updateItem` (impl ok). **UI: falta** |
| Editar umbral bajo (`lowThreshold`) | `/users/inventory-items/:itemId` | PATCH | Igual que arriba — **UI: falta** |
| Editar caducidad (`expiresAt`) | `/users/inventory-items/:itemId` | PATCH | Igual que arriba — **UI: falta** |

> Nota: `archivedAt`/`expiresAt` se mapean y se muestran en el detalle, pero no hay
> formulario para fijarlos tras la creación. `createPersonalItem`/`createHouseholdItem`
> aceptan `lowThreshold` y `expiresAt`, pero la pantalla de alta solo envía `name`+`unit`.

## Households

| Flujo | Endpoint real (rel. a `/api/v1`) | Método | Estado en móvil |
| --- | --- | --- | --- |
| Unirse a hogar existente | `/invitations/accept` | POST | **No implementado** (port no lo expone) |
| Rechazar invitación | `/invitations/reject` | POST | **No implementado** |
| Invitar miembro | `/households/:householdId/invitations` | POST | **No implementado** |
| Listar invitaciones | `/households/:householdId/invitations` | GET | **No implementado** |
| Revocar invitación | `/households/:householdId/invitations/:invitationId` | DELETE | **No implementado** |
| Detalle de hogar | `/households/:householdId` | GET | **No implementado** |
| Editar hogar | `/households/:householdId` | PATCH | **No implementado** |
| Borrar/restaurar hogar | `/households/:householdId[/restore]` | DELETE/POST | **No implementado** |
| Miembros / roles | `/households/:householdId/members*` | GET/PATCH/DELETE | **No implementado** |
| Salir de hogar | `/households/:householdId/leave` | POST | **No implementado** |
| Transferir propiedad | `/households/:householdId/transfer-ownership` | POST | **No implementado** |
| Zonas | `/households/:householdId/zones*` | CRUD | **No implementado** |

## Alcance cubierto en M3 (para contraste)

- **Shopping**: crear lista, añadir item, comprar, reabrir, borrar item, selector de hogar.
- **Inventory**: listar, crear item, detalle, movement ADD/CONSUME/ADJUST, listar movimientos, revertir, archivar.
- **Households**: listar mis hogares, **crear hogar** (T1, añadido en este paso), selector.

## Justificación de prioridad (T1)

Se adelantó **crear hogar** a UI porque sin hogar el usuario no puede usar ningún
endpoint de household (todo lo de la tabla de Households queda inaccesible). El resto
de esta lista queda como deuda técnica en APP.
