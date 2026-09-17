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
| TD-020 | Media | `src/presentation/components/ui/Button.tsx:24,29-32,36,40,94,105` | Tamaños visuales `sm` (32px) y `md` (40px) en `SIZES` (líneas 29-32). Los comentarios del componente (líneas 24 y 36) citan `design/components/buttons.md` y `accessibility/guidelines.md`, y **ninguno de los dos existe en el repo** (`design/components/` solo contiene `.gitkeep`; no hay carpeta `accessibility/`), así que los valores 32/40 no son verificables contra ninguna fuente de verdad. El área táctil **sí** cumple: `MIN_TOUCH_TARGET = 44` (línea 40) calcula el `hitSlop` (línea 94) y lo aplica (línea 105), dando 44×44 reales en `sm` y `md`; `lg` (48) y `xl` (56) ya superan 44 sin `hitSlop`. WCAG 2.5.8 (AA) exige 24×24 y se cumple de sobra | 📝 **Decisión pendiente — componente NO tocado.** Bloqueado por la guía de diseño ausente. Ver sección TD-020 abajo |

| TD-021 | Baja | `src/presentation/pets/` (backend: `POST /households/:householdId/pets/:petId/tasks`) | **Ruta sin consumir:** el backend permite crear tareas ligadas a una mascota y el móvil no lo ofrece. Es la única ruta del slice de Pets sin cubrir (27 de 29 rutas de M5 están consumidas) | Pendiente |
| TD-022 | Alta | `src/presentation/sos/SOSActivationScreen.tsx`, `src/domain/sos/entities/Sos.ts` | **SOS sin geolocalización:** `ActivateSOSSchema` acepta `locationLat`/`locationLng` opcionales y el port los soporta, pero la pantalla no los envía porque `expo-location` no está instalado. La alerta viaja solo con el mensaje | Pendiente |
| TD-023 | Baja | `src/presentation/sos/TrustedContactsScreen.tsx` | **Verificación del contacto no accionable:** `POST /sos/contacts/:contactId/verify` es pública por diseño (la consume el enlace del email), así que la app no puede verificar por el contacto. La UI muestra "Sin verificar"/"Verificado" sin explicar el siguiente paso | Pendiente |
| TD-024 | Media | `src/presentation/expenses/recurring/`, `src/presentation/pets/PetPermissionsSection.tsx` | **Turno del recurrente sin nombre de miembro:** no hay endpoint de miembros del hogar cableado, así que la fila dice "le toca a otro miembro" en vez de un nombre. Mismo gap que arrastra `PetPermissionsSection` | Pendiente |
| TD-025 | Media | `src/presentation/notifications/NotificationPreferencesSection.tsx` | **`quietHours` sin UI:** el DTO trae `quietHoursStart`/`quietHoursEnd` y el mapper los conserva, pero la pantalla solo expone los toggles booleanos | Pendiente |
| TD-026 | Alta | `src/presentation/notifications/`, `src/core/auth/` | **Sin registro automático del device al hacer login:** el token Expo se registra solo si el usuario entra a la pantalla de notificaciones. Hasta entonces no llega push aunque el usuario crea tenerlas activas | Pendiente |
| TD-027 | N/A | `src/presentation/{tasks,inventory,shopping,expenses,savings}/hooks/` | **UI de paginación** — mismo hallazgo que TD-018. Fila de trazabilidad con el gap 7 del informe M5; no hay trabajo nuevo detrás | ✅ Resuelto vía TD-018 (commit `dcd8197`) |
| TD-028 | Media | `tests/setup.ts`, `vitest.config.ts` | **Sin tests de componente:** el setup sigue en `environment: 'node'` sin preset de React Native, así que las pantallas no se renderizan en tests y ningún test cubre el árbol de UI | Pendiente |
| TD-029 | Baja | `src/presentation/{tasks,inventory,shopping,expenses,savings}/hooks/` | **Contrato de paginación no uniforme:** cada módulo devuelve su propia clave (`tasks`, `items`, `lists`, `expenses`, `goals`) en vez de `{items, total, page, limit}`. Cada hook respeta la clave real de su módulo, así que funciona — es deuda de consistencia de contrato, no un bug | Pendiente |
| TD-030 | Media | `tests/unit/{expenses,inventory,savings,shopping}/*.test.tsx` | **Tests frágiles por timing:** 4 tests usan un `await new Promise(resolve => setTimeout(resolve, 100))` fijo que estrecha la ventana de fallo pero no la elimina. Mismo patrón de causa raíz que TD-011 en APP; el mecanismo no es portable 1:1 | Pendiente — propuesta concreta escrita (helper `waitFor`), sin implementar |

## Detalle TD-021+ (promovidos del informe M5, 2026-09-17)

Origen: sección "Gaps encontrados" de `logs/mobile-m5-2026-09-17.md` (8 ítems) más los dos
hallazgos del mismo audit que ya estaban en este fichero como prosa sin ID (TD-029 y TD-030).
El gap 7 del informe ya tenía ID propia (TD-018) y se registra como TD-027 solo para que la
correspondencia 1:1 con el informe sea trazable.

| ID | Módulo afectado | Impacto UX | Esfuerzo | Dependencias | Prioridad sugerida |
|---|---|---|---|---|---|
| TD-021 | Pets (+ Tasks) | Medio | S | Slice `tasks`; posiblemente M6 (Diary/Tasks) | Media-baja |
| TD-022 | SOS | **Alto** | M | `expo-location` (dependencia nueva), permisos en `app.json`, verificación en build nativa | **Alta** |
| TD-023 | SOS | Medio | XS | Ninguna — `verify` es pública por diseño, no consumible autenticada | Baja-media |
| TD-024 | Recurring Expenses (+ Pets) | Medio | S (si el endpoint existe en backend) / M si hay que crearlo | Endpoint de miembros del hogar, no cableado en móvil | Media |
| TD-025 | Notifications | Medio | S | Ninguna — el contrato ya existe y está mapeado | Media |
| TD-026 | Notifications (+ Auth) | **Alto** | S | Flujo de auth (`useAuth`/sesión) y permiso de notificaciones | **Alta** |
| TD-027 | Paginación (5 módulos) | — | — | Ninguna | Cerrado (TD-018) |
| TD-028 | Infra de tests (cross-cutting) | Bajo (indirecto) | L | Cambia el entorno de los 281 tests | Media |
| TD-029 | Contrato de API (cross-cutting) | Bajo | M | Decisión de producto; toca el backend, fuera de Mobile | Baja |
| TD-030 | Infra de tests (cross-cutting) | Bajo | S | Ninguna; la propuesta ya está redactada | Media |

Nota sobre el impacto UX de TD-022 y TD-026: son los dos únicos clasificados como **Alto**.
TD-022 porque la ubicación es el dato que más sirve a quien responde una alerta SOS; TD-026
porque el usuario cree tener push activas cuando no hay ningún device registrado.

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

## TD-020 — decisión pendiente (NO resuelto)

**Estado: 📝 bloqueado por una guía de diseño que no existe en el repo. El componente no se ha
tocado.**

Pregunta a resolver: ¿el tamaño visual de `sm` (32px) y `md` (40px) debe alinearse con la guía de
diseño?

Procedimiento seguido antes de decidir:

1. **Buscar la guía.** `design/README.md` describe la estructura prevista, pero
   `design/components/` contiene solo `.gitkeep`, no existe ningún `buttons.md` y no hay carpeta
   `accessibility/`. Barrido de todos los `*.md`/`*.mdx` del repo: sin resultados. La única
   mención a un target de 44px en todo el repo es la propia ficha de TD-020.
2. **Verificar el componente.** `Button.tsx` no cita una guía por casualidad: los comentarios de
   las líneas 24 y 36 afirman explícitamente que las alturas vienen de
   `design/components/buttons.md` y que `accessibility/guidelines.md` exige 44×44. **Ninguno de
   los dos documentos existe**, así que la afirmación no es verificable. Es en sí mismo un
   hallazgo de trazabilidad (ver resumen de la sesión).
3. **Conclusión:** sin fuente de verdad no hay forma de saber si 32/40 son los valores correctos
   o una desviación. Cambiarlos sería sustituir un número sin base por otro número sin base, así
   que se documenta y no se toca.

Lo que **sí** está verificado y no necesita cambio: el área táctil real ya cumple 44×44 en `sm` y
`md` vía `hitSlop` (constante en la línea 40, cálculo en la 94, aplicación en la 105), y `lg`
(48) y `xl` (56) lo superan por altura. WCAG 2.5.8 (AA) exige 24×24 y se cumple en los cuatro
tamaños.

**Alcance si se decide subir el target visual a 44×44:** hay 63 usos de `<Button>` en `src/`. 42
ya usan `lg` (48px) y no cambiarían; `sm` se usa 3 veces, `md` explícito 8 veces, y 10 botones no
pasan `size` (así que son `md` por defecto). La decisión afecta como máximo a **21 botones** (3
`sm` + 18 `md`), más los sitios donde convivan con botones `lg` y haya que reajustar el layout.

Para desbloquearlo hace falta una de estas dos cosas:

- que `design/components/buttons.md` exista y fije la altura de cada tamaño, o
- una decisión explícita de producto de que el target visual es 44×44, en cuyo caso `sm` sube de
  32 a 44 y `md` de 40 a 44, revisando los sitios donde conviven botones de distinto tamaño.

Mientras eso no ocurra, el componente se deja como está: la discrepancia es de tamaño *visual*,
no de área táctil ni de cumplimiento AA.

## Notas

- **TD-018**: cerrado del lado Mobile con matices — Moments queda fuera de alcance (no existe el
  módulo) y se recalendariza a M6. El registro de APP (`TD-018 | Baja | ... | Pendiente (V2)`) queda
  desactualizado respecto a este cierre; no se tocó ese archivo desde este repo.
- **TD-020** es un hallazgo de la auditoría anterior, no reportado antes de ella. Se verificó
  leyendo `Button.tsx` completo — no es deuda de área táctil (ya resuelta con `hitSlop`), es una
  discrepancia entre el tamaño visual y una guía de diseño que **no está presente en el repo**.
  Estado 2026-09-17: 📝 decisión pendiente, componente **no tocado** (ver sección TD-020). El
  hallazgo de trazabilidad asociado — los comentarios de `Button.tsx` (líneas 24 y 36) citan dos
  documentos inexistentes como si fueran la fuente de verdad de sus valores — queda registrado en
  la sección TD-020, no como TD nueva, para no salir del alcance autorizado.
- **TD-021 … TD-030**: promovidos del informe M5 (`logs/mobile-m5-2026-09-17.md`) el 2026-09-17.
  Ninguno tiene trabajo iniciado; son registro, no ejecución. El detalle con módulo, impacto UX,
  esfuerzo, dependencias y prioridad está en la sección "Detalle TD-021+".
