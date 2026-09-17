# Registro de deuda técnica — Mobile

> **Cómo usar este archivo:** cada ítem nuevo de deuda técnica encontrado (auditoría, code review, o
> descubrimiento durante desarrollo) se registra acá con severidad, ubicación exacta y estado. No se
> borra un ítem resuelto — se marca `✅ Resuelto` y se referencia el commit.
>
> Los IDs `TD-XXX` son compartidos con el registro del backend
> (`../../../Mola_Universe_APP/docs/planning/technical-debt.md`) cuando el hallazgo aplica a ambos
> repos. Este archivo es la fuente de verdad para el estado del lado Mobile; el registro de APP puede
> quedar desactualizado para ítems que se cierran acá (ver nota TD-018 más abajo).

| ID | Severidad | Archivo | Descripción | Estado |
|---|---|---|---|---|
| TD-018 | Baja | `src/presentation/{tasks,inventory,shopping,expenses,savings}/hooks/` | UI de paginación: solo se cargaba la primera página de cada listado (sin `loadMore`/`hasNextPage`/`fetchNextPage`) | ✅ Resuelto con matices (commit `dcd8197`) — ver detalle por módulo abajo |
| TD-020 | Media | `src/presentation/components/ui/Button.tsx:29-32` | Tamaños `sm` (32px) y `md` (40px) por debajo del target visual AAA (44×44) de `accessibility/guidelines.md` (doc no presente en el repo). **Matiz verificado:** el componente ya compensa con `hitSlop` (líneas 40, 94, 105) hasta llegar a 44×44 de área táctil real, y 32/40px ya superan el mínimo AA real (WCAG 2.5.8 exige 24×24). La deuda pendiente es de tamaño *visual*, no de área táctil ni de cumplimiento AA estricto | Pendiente — deuda de accesibilidad visual, no de AA. Fuera de alcance de TD-018. Se aborda en fase propia (Fase 0.5 o dentro de Fase 1 si el diseñador toca el componente) |

## Detalle TD-018 por módulo

| Módulo | Estado | Notas |
|---|---|---|
| Tasks | ✅ Resuelto | `FlatList`, patrón "Cargar más" (no auto-scroll) |
| Inventory | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Shopping (listas) | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Expenses | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Savings (metas de hogar y personales) | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Moments | ⚠️ No aplica a TD-018 | El módulo no existe en Mobile (sin `domain`/`data`/`presentation`) — es trabajo de M6, no deuda de TD-018 |

## Hallazgos adicionales (auditoría M5, 2026-09-17)

### Contrato de paginación no uniforme entre módulos

El contrato de paginación del backend **no** es uniforme `{items, total, page, limit}` como se asumía
al planear TD-018 — cada módulo devuelve su propia clave: `tasks`, `items`, `lists`, `expenses`,
`goals`. Cada hook de `useInfiniteQuery` respeta la clave real de su módulo (verificado en
`useTasksList.ts`, `useInventoryItems.ts`, `useShoppingLists.ts`, `useExpenses.ts`,
`useSavingsGoals.ts`).

No se corrigió ni se unificó — es una decisión de contrato de API a nivel de producto, no parte del
alcance de TD-018. Se documenta como hallazgo para una decisión futura: ¿vale la pena unificar la
forma de respuesta paginada entre módulos del backend?

### Tests frágiles por timing (mismo patrón que TD-011 en APP)

4 de los 5 tests unitarios actualizados en el commit `dcd8197` (uno por módulo, excepto Tasks) usaban
un `await new Promise(resolve => setTimeout(resolve, 20))` fijo que no alcanzaba a estabilizar el
estado bajo la suite completa. Subido a 100ms; verificado en verde con dos corridas completas de la
suite.

Mismo patrón de causa raíz que `TD-011` en APP (contención de CPU del host bajo carga de la suite
completa, no un bug de lógica de la app). **Los mecanismos no son literalmente unificables**: TD-011
en APP subió el `timeout` de Vitest por test (`it('...', ..., { timeout: 15000 })`); en Mobile no hay
timeout de test corto — el problema es un `await new Promise(resolve => setTimeout(resolve, X))` fijo
dentro del test (en `tests/unit/{expenses,inventory,savings,shopping}/*.test.tsx`, patrón
`render()` en cada archivo) que espera a que TanStack Query asiente su estado antes de las
aserciones. Subir el número (20→100ms) solo estrecha la ventana de fallo, no la elimina.

**Propuesta concreta (solo test infra, sin tocar lógica de producción ni de los hooks):**
sustituir el `setTimeout` fijo por un polling helper tipo `waitFor(condition, { timeoutMs, intervalMs })`
en `tests/setup.ts` (o `tests/helpers/waitFor.ts`) que reintente hasta que `captured?.fetchStatus`
(o la condición que corresponda) deje de ser `'fetching'`, con un timeout máximo generoso (p. ej.
2000ms) en vez de una espera ciega. Esto no depende de la velocidad del host — se resuelve tan pronto
la condición es verdadera, y solo falla si de verdad nunca se asienta. El principio ("no esperar un
tiempo fijo adivinado; esperar la condición real") es el que se podría compartir como convención entre
Mobile y APP, aunque el código concreto no es portable 1:1 por la diferencia de mecanismo. No
implementado — queda como propuesta a validar antes de ejecutar.

## Notas

- **TD-018**: cerrado del lado Mobile con matices — Moments queda fuera de alcance (no existe el
  módulo) y se recalendariza a M6. El registro de APP (`TD-018 | Baja | ... | Pendiente (V2)`) queda
  desactualizado respecto a este cierre; no se tocó ese archivo desde este repo.
- **TD-020** es un hallazgo nuevo de esta auditoría, no reportado antes. Se verificó leyendo
  `Button.tsx` completo antes de clasificarlo — no es deuda de área táctil (ya resuelta con
  `hitSlop`), es una discrepancia entre el tamaño visual y una guía de diseño (`buttons.md`,
  `accessibility/guidelines.md`) que además no está presente en el repo.
