# M4 — Hallazgos de contrato y flujos diferidos — Mola_Universe_MOBILE — 2026-09-17

Hallazgos de M4 (Expenses + Savings + Calendar) que **no** se resuelven en el móvil:
o son inconsistencias del contrato del backend, o son alcance explícitamente diferido.
Pasar a `technical-debt.md` en `Mola_Universe_APP`.

Todos los endpoints citados están verificados contra runtime
(`Mola_Universe_APP/src/modules/*/routes/*.ts`), no solo contra `openapi.ts`.

## 1. `calendar-events` devuelve un array plano (inconsistente con el resto) — **TD-016 (Baja)**

`GET /api/v1/users/calendar-events` responde con un **array plano** de eventos, sin
envoltorio de paginación:

```json
[ { "id": "...", "title": "...", "startAt": "...", ... } ]
```

En cambio, los listados de `expenses` y `savings-goals` sí paginan:

```json
{ "items": [ ... ], "total": 137, "page": 1, "limit": 20 }
```

**Impacto en móvil:** el slice `calendar` tiene que mapear dos formas de respuesta
distintas según el endpoint, y no puede ofrecer "cargar más" de forma uniforme con
`expenses`/`savings`.

**Acción propuesta:** unificar el contrato de listados en APP (envoltorio paginado
para `calendar-events`) o, si es deliberado, documentarlo como excepción explícita en
`docs/architecture/api-contracts.md`.

**No es deuda de móvil:** el slice funciona correctamente con la forma actual.

## 2. `recurring-expenses`: 4 rutas en backend, sin slice en móvil — **TD-017 (Media)**

El módulo `expenses` de APP expone un sub-recurso completo de gastos recurrentes que
el slice móvil de `expenses` (M4) **no cubre**:

| Ruta (rel. a `/api/v1`) | Método | Estado en móvil |
| --- | --- | --- |
| `/users/recurring-expenses` | POST, GET | **No implementado** |
| `/users/recurring-expenses/:id` | PATCH, DELETE | **No implementado** |

**Es una feature del PRD**, así que no es deuda opcional: `Expenses` queda incompleto
sin ella (no se pueden ver ni gestionar las recurrencias que el usuario ha creado en
otras superficies).

**Estado:** aprobado como el **4.º slice de M5**. Se resuelve en M5, no en V2.

## 3. UI de paginación: solo se carga la primera página — **TD-018 (Baja)**

Los listados paginados (`expenses`, `savings-goals`, `shopping-lists`, `inventory-items`,
`tasks`) se consumen pidiendo **solo la primera página** (`limit=20`), y la UI renderiza
lo que llega. No hay control de "cargar más" ni scroll infinito.

**Por qué se difiere:** decisión de alcance de MVP. Con los volúmenes de datos actuales
(decenas de items) la primera página es suficiente y no bloquea ningún flujo.

**Acción:** diferido a **V2**, cuando haya datos reales que lo justifiquen. El port ya
expone `page`/`limit` en la mayoría de slices, así que añadir la UI después no requiere
tocar el contrato.

## 4. Entorno Node del repo móvil — **TD-019 (Baja) — documentado**

El `node` por defecto en `PATH` es muy antiguo; el proyecto requiere Node 22 vía `nvm use`.

**Resuelto en este paso:** documentado en `CONTRIBUTING.md` (sección
"Local environment (required: Node 22)"). No requiere cambios de código.

## Alcance cubierto en M4 (para contraste)

- **Expenses**: listar, crear, detalle (con splits), registrar pago, confirmar pago, balance, resumen.
- **Savings**: listar metas, detalle, crear meta, aportar a celdas, retirar de celdas, progreso.
- **Calendar**: listar eventos, crear, editar, borrar, detalle.

## Fuera de alcance en M4 (no son TD nuevos)

- Editar un gasto ya creado (solo se crea/consulta y se registran pagos).
- Cerrar/saldar un gasto completo desde la UI.
- Editar/borrar metas de ahorro (el backend solo expone `POST` de metas, sin `PATCH`/`DELETE`).
