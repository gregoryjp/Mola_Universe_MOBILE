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
| TD-018 | Baja | `src/presentation/{tasks,inventory,shopping,expenses,savings}/screens/` | UI de paginación: solo se cargaba la primera página de cada listado (sin `loadMore`/`hasNextPage`/`fetchNextPage`). **Corrección de ruta (2026-09-17):** la paginación se consume en las *pantallas* — el `fetchNextPage`/`hasNextPage` que devuelve `useInfiniteQuery` —, no en los hooks; la ruta anterior apuntaba a `hooks/` y despistaba al auditar | ✅ Resuelto con matices (commit `dcd8197`) — ver detalle por módulo abajo |
| TD-020 | Media | `src/presentation/components/ui/Button.tsx:25-28,33-36,40-45,46,100,111` y `src/presentation/components/ui/Input.tsx:42-46` | Tamaños visuales de `Button` (`sm` 32, `md` 40) e `Input` (`sm` 44, `md` 48). El área táctil **sí** cumple en ambos: `Button` calcula `hitSlop` hasta 44×44 reales en `sm` y `md` (constante línea 46, cálculo 100, aplicación 111) e `Input` ya parte de 44. WCAG 2.5.8 (AA) exige 24×24 y se cumple de sobra. Los valores **no eran verificables**: los comentarios de los dos componentes citaban `design/components/buttons.md` y `accessibility/guidelines.md`, y ninguno de los dos existe | ✅ **Cerrado con traspaso a TD-031** — comentarios corregidos en ambos componentes (commits `1d326f6` y el de la sesión de cierre); el tamaño visual queda **sin tocar** y la decisión de alinearlo pasa a TD-031, que es de diseñador y producto |

| TD-021 | Baja | `src/presentation/pets/` (backend: `POST /households/:householdId/pets/:petId/tasks`) | **Ruta sin consumir:** el backend permite crear tareas ligadas a una mascota y el móvil no lo ofrece. Es la única ruta del slice de Pets sin cubrir (27 de 29 rutas de M5 están consumidas) | ✅ Resuelto (commit `6292278`) — formulario en `PetDetailScreen` (`pet-task-open`/`title`/`due-date`/`rotative`), `createPetCareTask` en el port y el repositorio, invalidación de `['tasks']`. La ruta crea una tarea de hogar con `category: 'PETS'` |
| TD-022 | Alta | `src/presentation/sos/SOSActivationScreen.tsx`, `src/data/sos/location/expoLocation.ts`, `src/presentation/sos/hooks/useSosLocation.ts` | **SOS sin geolocalización:** `ActivateSOSSchema` acepta `locationLat`/`locationLng` opcionales y el port los soporta, pero la pantalla no los enviaba porque `expo-location` no estaba instalado. La alerta viajaba solo con el mensaje | ✅ Resuelto (commit `08fdc26`) — `expo-location ~57.0.18` + captura que **nunca bloquea la alerta** (máx. 5 s, degrada a sin ubicación) |
| TD-023 | Baja | `src/presentation/sos/TrustedContactsScreen.tsx` | **Verificación del contacto no accionable:** `POST /sos/contacts/:contactId/verify` es pública por diseño (la consume el enlace del email), así que la app no puede verificar por el contacto. La UI muestra "Sin verificar"/"Verificado" sin explicar el siguiente paso | ✅ Resuelto (commit `a692e82`) — con un **hallazgo más grave de lo reportado**: el backend **solo avisa a los contactos verificados** (`sosDispatchWorker` filtra por `verifiedAt`) y la pantalla contaba **todos** y prometía *"Se avisará a N contacto(s)"*. Ahora cuenta verificados, avisa cuando no hay ninguno, marca listas parciales y explica el estado en la fila |
| TD-024 | Media | `src/presentation/expenses/recurring/`, `src/presentation/pets/PetPermissionsSection.tsx` | **Turno del recurrente sin nombre de miembro:** no hay endpoint de miembros del hogar cableado, así que la fila dice "le toca a otro miembro" en vez de un nombre. Mismo gap que arrastra `PetPermissionsSection` | Pendiente |
| TD-025 | Media | `src/presentation/notifications/NotificationPreferencesSection.tsx` | **`quietHours` sin UI:** el DTO trae `quietHoursStart`/`quietHoursEnd` y el mapper los conserva, pero la pantalla solo expone los toggles booleanos | ✅ Resuelto (commit `7006dcd`) — entradas `HH:mm` con validación en un módulo puro (`quietHours.ts`, testeado sin UI). Documentado que el backend compara contra **UTC del servidor**, no hora local |
| TD-026 | Alta | `src/presentation/notifications/hooks/usePushRegistration.ts`, `src/core/navigation/RootNavigator.tsx` | **Sin registro automático del device al hacer login:** el token Expo se registraba solo si el usuario entraba a la pantalla de notificaciones. Hasta entonces no llegaba push aunque el usuario creyera tenerlas activas | ✅ Resuelto (commit `c270b92`) — query única en el árbol autenticado: lee el permiso real y, si ya está concedido, registra el device (upsert idempotente). El estado de la UI viene de esa fuente, no de la mutación efímera |
| TD-027 | N/A | `src/presentation/{tasks,inventory,shopping,expenses,savings}/hooks/` | **UI de paginación** — mismo hallazgo que TD-018. Fila de trazabilidad con el gap 7 del informe M5; no hay trabajo nuevo detrás | ✅ Resuelto vía TD-018 (commit `dcd8197`) |
| TD-028 | Media | `tests/setup.ts`, `vitest.config.ts`, `tests/helpers/reactNativeStub.ts` | **Sin tests de componente:** el setup sigue en `environment: 'node'` sin preset de React Native, así que las pantallas no se renderizan en tests. **Actualización:** la afirmación "ningún test cubre el árbol de UI" ya **no** es cierta — hay **7 tests de componente** (`RsvpSection`, `MomentCard`, `MomentDetailScreen`, `PetDetailScreen`, `NotificationPreferencesSection`, `SOSActivationScreen`, `TrustedContactRow`) sobre un stub compartido de `react-native`. El stub es superficial (drives behaviour, no styling) porque el paquete trae fuentes Flow que Vite no parsea | ⚠️ Parcial — paliado con stub, no resuelto de raíz (sigue sin preset RN real) |
| TD-029 | Baja | `src/presentation/{tasks,inventory,shopping,expenses,savings}/hooks/` | **Contrato de paginación no uniforme:** cada módulo devuelve su propia clave (`tasks`, `items`, `lists`, `expenses`, `goals`) en vez de `{items, total, page, limit}`. Cada hook respeta la clave real de su módulo, así que funciona — es deuda de consistencia de contrato, no un bug | Pendiente |
| TD-030 | Media | `tests/unit/{expenses,inventory,savings,shopping}/*.test.tsx` | **Tests frágiles por timing:** el registro decía 4 tests con `await new Promise(resolve => setTimeout(resolve, 100))`; la medición real fue **25 ocurrencias en 24 ficheros** (y con duraciones arbitrarias: 0, 5, 10, 20, 25, 100 ms). Mismo patrón de causa raíz que TD-011 en APP; el mecanismo no es portable 1:1 | ✅ Resuelto (commit `7b15436`) — helper determinista `tests/helpers/flush.ts` (microtasks, no milisegundos), 24 ficheros migrados, diff mínimo de 2 líneas por fichero. La suite quedó más rápida (52 ms en el primer fichero migrado) |
| TD-031 | Media | `design/components/buttons.md` y `accessibility/guidelines.md` (ambos por crear) | **Faltan los dos documentos que el código ya cita como fuente de verdad.** `Button.tsx` e `Input.tsx` escriben como si existieran y no existen: `design/components/` solo contiene `.gitkeep` y no hay carpeta `accessibility/`. La guía debe decidir tres cosas: **(1)** target táctil mínimo, ¿**44×44** (WCAG 2.5.5, nivel AAA) o **24×24** (WCAG 2.5.8, nivel AA)?; **(2)** ¿`Button` e `Input` comparten escala de tamaños o son independientes?; **(3)** ¿la guía nace del código actual o el código se alinea a la guía? | Pendiente — trabajo de **diseñador y producto**, no de ingeniería. No se crea desde este repo |
| TD-032 | Media | `src/domain/household/entities/Household.ts`, backend `src/modules/households/` | **Sin nombre visible de miembro:** `IHouseholdMemberDTO` solo trae `userId`/`role`/`joinedAt` — ni nombre ni email. Nadie puede mostrar "le toca a Ana" ni listar quién asistió a un Moment. Es la **misma causa raíz** que TD-024 y que el hallazgo M5 "turno del recurrente sin nombre de miembro", contada tres veces desde tres pantallas. Se resuelve una sola vez: exponiendo un display name en el contrato de miembros | Pendiente — **de backend**. Bloquea la lista nominal de RSVP en Moments (§9 de `docs/modules/moments.md`) |
| TD-033 | Media | `src/presentation/notifications/hooks/useNotificationMutations.ts` (`useRemovePushDevice`), `src/shared/store/authStore.ts` (logout) | **Baja del device sin cablear y sin lectura de estado real:** `DELETE /notifications/devices/:token` está implementado en el cliente pero **ninguna pantalla lo llama**, y el logout no lo invoca, así que un device dado de baja sigue en el backend. Además el contrato **no expone `GET`** de devices registrados, así que la app nunca puede confirmar contra el servidor qué devices tiene | Pendiente — el `GET` es de backend; el cableado de `useRemovePushDevice` al logout sí es de Mobile |
| TD-034 | Media | `src/modules/sos/routes/sosRoutes.ts` (backend), `src/presentation/sos/screens/TrustedContactsScreen.tsx` | **Sin reenvío de la invitación de verificación:** las 7 rutas de SOS no incluyen ningún `POST .../resend` ni `.../reinvite`. Si la invitación caduca (el backend guarda `verificationTokenExpiresAt`), o si el contacto no la vio, **la app solo puede eliminar y recrear el contacto**. Eso obliga a un rodeo destructivo para una acción que debería ser un botón. TD-023 quedó cerrado guiando al usuario a ese rodeo, porque era la única vía existente | Pendiente — **de backend** (ruta nueva). Mobile ya explica la alternativa en `TrustedContactRow` |

## Detalle TD-021+ (promovidos del informe M5, 2026-09-17)

Origen: sección "Gaps encontrados" de `logs/mobile-m5-2026-09-17.md` (8 ítems) más los dos
hallazgos del mismo audit que ya estaban en este fichero como prosa sin ID (TD-029 y TD-030).
El gap 7 del informe ya tenía ID propia (TD-018) y se registra como TD-027 solo para que la
correspondencia 1:1 con el informe sea trazable.

| ID | Módulo afectado | Impacto UX | Esfuerzo | Dependencias | Prioridad sugerida |
|---|---|---|---|---|---|
| TD-021 | Pets (+ Tasks) | Medio | S | Slice `tasks` | ✅ **Cerrado** (commit `6292278`) |
| TD-022 | SOS | **Alto** | M | `expo-location` (dependencia nueva), permisos en `app.json`, verificación en build nativa | ✅ **Cerrado** (commit `08fdc26`) |
| TD-023 | SOS | **Alto** (reclasificado) | XS | Ninguna — `verify` es pública por diseño, no consumible autenticada | ✅ **Cerrado** (commit `a692e82`) — contaba contactos que nunca reciben la alerta |
| TD-024 | Recurring Expenses (+ Pets) | Medio | S (si el endpoint existe en backend) / M si hay que crearlo | Endpoint de miembros del hogar, no cableado en móvil | ⛔ **Bloqueado por TD-032** (backend) |
| TD-025 | Notifications | Medio | S | Ninguna — el contrato ya existe y está mapeado | ✅ **Cerrado** (commit `7006dcd`) |
| TD-026 | Notifications (+ Auth) | **Alto** | S | Flujo de auth (`useAuth`/sesión) y permiso de notificaciones | ✅ **Cerrado** (commit `c270b92`) |
| TD-027 | Paginación (5 módulos) | — | — | Ninguna | Cerrado (TD-018) |
| TD-028 | Infra de tests (cross-cutting) | Bajo (indirecto) | L | Cambia el entorno de toda la suite | ⚠️ **Paliado** — stub de `react-native` compartido, **7 tests de componente**; la raíz sigue abierta |
| TD-029 | Contrato de API (cross-cutting) | Bajo | M | Decisión de producto; toca el backend, fuera de Mobile | Baja |
| TD-030 | Infra de tests (cross-cutting) | Bajo | S | Ninguna | ✅ **Cerrado** (commit `7b15436`) |

Nota sobre el impacto UX: TD-022 y TD-026 eran los dos únicos clasificados como **Alto** en el
planeo de la mañana. TD-022 porque la ubicación es el dato que más sirve a quien responde una
alerta SOS; TD-026 porque el usuario cree tener push activas cuando no hay ningún device registrado.

Al implementar TD-023 apareció un tercer caso **de la misma clase** (la UI promete algo que el
backend no hace), así que se reclasificó a **Alto**: la pantalla de SOS contaba todos los contactos
y prometía avisarles, cuando el dispatcher solo avisa a los verificados.

**Los tres cerrados en la sesión de M6 (2026-09-17)** — TD-022 y TD-026 primero, por ser los
declarados "Alto"; TD-023 al aparecer el hallazgo.

Esta tabla refleja el **planeo** del 2026-09-17 por la mañana, no el estado final del día. Para el
estado real, la tabla principal de arriba y la nota "Estado real de TD-021+" son la fuente.

## Detalle TD-018 por módulo

| Módulo | Estado | Notas |
|---|---|---|
| Tasks | ✅ Resuelto | `FlatList`, patrón "Cargar más" (no auto-scroll) |
| Inventory | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Shopping (listas) | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Expenses | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Savings (metas de hogar y personales) | ✅ Resuelto | `ScrollView.map()` + botón "Cargar más" |
| Moments | ✅ No aplica a TD-018 | El módulo no existía al auditar (sin `domain`/`data`/`presentation`) — era trabajo de M6, no deuda de TD-018. **M6 entregado (2026-09-17):** el módulo existe y su lista consume `Moment[]` (array plano del backend), así que `loadMore` no aplica por contrato, no por omisión |

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

## TD-020 — cerrado, con traspaso a TD-031

**Estado final: ✅ Cerrado.** Comentarios corregidos en `Button.tsx` e `Input.tsx`; tamaño visual
**sin tocar**; la decisión de alinearlo pasa a **TD-031**, que es de diseñador y producto.

Los dos componentes ya no citan documentos inexistentes como si fueran la fuente de verdad de sus
valores. Ver "Corrección de comentarios" más abajo.

Pregunta a resolver: ¿el tamaño visual de `sm` (32px) y `md` (40px) debe alinearse con la guía de
diseño?

Procedimiento seguido antes de decidir:

1. **Buscar la guía.** `design/README.md` describe la estructura prevista, pero
   `design/components/` contiene solo `.gitkeep`, no existe ningún `buttons.md` y no hay carpeta
   `accessibility/`. Barrido de todos los `*.md`/`*.mdx` del repo: sin resultados. La única
   mención a un target de 44px en todo el repo es la propia ficha de TD-020.
2. **Verificar el componente.** `Button.tsx` no citaba una guía por casualidad: los comentarios
   de las líneas 24 y 36 (antes de la corrección) afirmaban explícitamente que las alturas venían
   de `design/components/buttons.md` y que `accessibility/guidelines.md` exige 44×44. **Ninguno
   de los dos documentos existe**, así que la afirmación no era verificable. Es en sí mismo un
   hallazgo de trazabilidad, tratado abajo.
3. **Conclusión:** sin fuente de verdad no hay forma de saber si 32/40 son los valores correctos
   o una desviación. Cambiarlos sería sustituir un número sin base por otro número sin base, así
   que se documenta y no se toca.

Lo que **sí** está verificado y no necesita cambio: el área táctil real ya cumple 44×44 en `sm` y
`md` vía `hitSlop` (constante en la línea 46, cálculo en la 100, aplicación en la 111), y `lg`
(48) y `xl` (56) lo superan por altura. WCAG 2.5.8 (AA) exige 24×24 y se cumple en los cuatro
tamaños. Las líneas son las de después de corregir los comentarios.

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

### Corrección de comentarios (2026-09-17)

Un comentario que presenta como fuente de verdad un documento que no existe es peor que no tener
comentario: quien lea el código creerá que hay una guía detrás y no la irá a buscar. Corregidos los
tres comentarios para que describan la realidad actual:

| Fichero | Antes | Ahora |
|---|---|---|
| `Button.tsx` | L24: *"Heights and horizontal padding from design/components/buttons.md."* | L25-28: los valores se definen aquí, y la guía de la que debían venir no existe todavía |
| `Button.tsx` | L36: *"accessibility/guidelines.md requires a 44x44 minimum touch target but the doc's…"* | L40-45: 44×44 es una **asunción de trabajo** pendiente de confirmar, no una cita |
| `Input.tsx` | L42-47: *"…every size clears the 44px touch minimum from accessibility/guidelines.md."* | L42-46: 44 sigue siendo el suelo, pero como **asunción de trabajo**, no como cita |

**Solo comentarios, en los dos ficheros.** Ni una línea de lógica, ni un valor de `SIZES` (tampoco
el `sm: 44` de `Input`), ni el `hitSlop` de `Button`. Verificado mecánicamente en ambos — filtrando
el diff, **ninguna** línea añadida o eliminada queda fuera de un bloque de comentario.

### Evidencia que la decisión de TD-031 tendrá que resolver

`Input.tsx` tenía el mismo patrón (`Input.tsx:46` también citaba `accessibility/guidelines.md`), y
está corregido en esta misma sesión. Aporta además la evidencia más útil de todo el TD, porque ya
resolvió el problema por su cuenta antes que nadie:

| Componente | `sm` | `md` | `lg` | `xl` |
|---|---|---|---|---|
| Button (`Button.tsx`) | 32 | 40 | 48 | 56 |
| Input (`Input.tsx`) | **44** | 48 | 56 | — |

`Input` trata 44 como suelo explícito y define su `md` como *la altura del botón `md` (40) más área
táctil*. Son dos componentes del mismo directorio aplicando criterios distintos al mismo problema,
y el segundo acoplado al primero por un número que vivía en un comentario.

Eso es justo lo que TD-031 tiene que decidir: si `Button` e `Input` comparten escala o no, y si la
guía nace del código actual o el código se alinea a la guía.

### La propuesta pasó a ser TD-031

Crear los dos documentos dejó de ser una propuesta sin ID: es **TD-031**. Esa ficha lleva el detalle
y, sobre todo, las tres preguntas que la guía debe responder antes de que nadie cambie un tamaño.

## TD-031 — crear la guía que el código ya cita (diseñador + producto)

**Estado: Pendiente.** No se crea desde este repo ni desde ingeniería: es trabajo de **diseñador y
producto**. Esta ficha existe para que la decisión no se pierda.

Hay dos documentos que `Button.tsx` e `Input.tsx` citaban como fuente de verdad y que **no existen**:
`design/components/buttons.md` y `accessibility/guidelines.md`. `design/README.md` ya reserva
`design/components/` para exactamente eso ("Component visual references (source for UI components)"),
así que el hueco estaba previsto; simplemente está vacío.

### Lo que la guía tiene que decidir

1. **¿El target táctil mínimo es 44×44 o 24×24?** No son intercambiables, son dos criterios distintos
   de WCAG:
   - **44×44** — WCAG **2.5.5**, nivel **AAA**. Es el valor que ambos componentes citan hoy.
   - **24×24** — WCAG **2.5.8**, nivel **AA** (el mínimo exigible). Se cumple de sobra: `Button` ya
     llega a 44×44 de área real vía `hitSlop` e `Input` parte de 44 de alto.
   Elegir AAA es más estricto y obliga a cambiar el tamaño *visual* de `Button.sm` (32) y
   `Button.md` (40); quedarse en AA no obliga a tocar ningún píxel.
2. **¿`Button` e `Input` comparten escala de tamaños?** Hoy no: `Button` va 32/40/48/56 e `Input`
   44/48/56, y el `md` de `Input` está definido *en función* del `md` de `Button` más área táctil.
   Compartir escala o desacoplarlos es decisión de diseño, pero el acoplamiento actual es invisible
   salvo que se lea el comentario.
3. **¿La guía nace del código o el código se alinea a la guía?** El código ya decidió de facto (44
   como suelo en `Input`, 32/40 en `Button`). Si la guía se escribe describiendo lo que hay, se
   corre el riesgo de bendecir una inconsistencia; si se escribe sin mirar el código, habrá que
   cambiar componentes.

### Alcance si se decide subir el target visual de `Button` a 44

63 usos de `<Button>` en `src/`. 42 ya usan `lg` (48px) y no cambiarían; `sm` se usa 3 veces, `md`
explícito 8 veces y 10 botones no pasan `size` (son `md` por defecto). La decisión afecta como máximo
a **21 botones**, más los sitios donde convivan con botones `lg` y haya que reajustar el layout.

### Qué NO hay que hacer

No crear los documentos desde ingeniería, ni cambiar tamaños antes de que existan. La deuda no es
que falte un número: es que falta la decisión.

## Notas

- **TD-018**: cerrado del lado Mobile con matices — Moments quedó fuera de alcance (no existía el
  módulo) y se recalendarizó a M6. **Actualización (2026-09-17):** M6 entregó Moments, así que ese
  matiz está saldado; el módulo nace ya con su lista consumiendo el contrato (`Moment[]`, array plano
  sin paginación, por lo que `loadMore` no aplica). El registro de APP (`TD-018 | Baja | ... |
  Pendiente (V2)`) queda desactualizado respecto a este cierre; no se tocó ese archivo desde este
  repo.
- **TD-020**: cerrado el 2026-09-17 con traspaso a TD-031. La parte accionable sin diseñador está
  hecha: los comentarios de `Button.tsx` e `Input.tsx` que citaban documentos inexistentes fueron
  corregidos (commits `1d326f6` y el de cierre). El **tamaño visual no se tocó** en ninguno de los
  dos: sin fuente de verdad no hay forma de saber si 32/40 son correctos o una desviación, y
  cambiarlos habría sido sustituir un número sin base por otro número sin base. La decisión de
  alinearlos vive ahora en TD-031.
- **TD-021 … TD-030**: promovidos del informe M5 (`logs/mobile-m5-2026-09-17.md`) el 2026-09-17.
  El detalle con módulo, impacto UX, esfuerzo, dependencias y prioridad está en la sección
  "Detalle TD-021+". **Actualización (2026-09-17):** la afirmación "ninguno tiene trabajo iniciado"
  ya no se sostiene — ver la nota siguiente.
- **Estado real de TD-021+ tras la sesión de M6 (2026-09-17):** atacados por severidad, los "Alta"
  primero. Cerrados, en orden de ejecución: **TD-022** (`08fdc26`), **TD-026** (`c270b92`),
  **TD-021** (`6292278`), **TD-023** (`a692e82`), **TD-025** (`7006dcd`) y **TD-030** (`7b15436`).
  Paliado: **TD-028**, que ya no es "ningún test cubre el árbol de UI" sino "el stub es compartido y
  cubre 7 componentes, pero sigue sin preset RN real".
- **Solo dos quedan abiertos, y ninguno es alcanzable desde Mobile:** **TD-024** está **bloqueado
  por TD-032** (el contrato de miembros no trae nombre: no hay nada que cablear todavía) y **TD-029**
  es una decisión de contrato de API que toca al backend. Documentarlos era la acción correcta; no
  había nada que implementar sin inventar un endpoint.
- **TD-032** nació al construir el RSVP de Moments y su valor está menos en el ítem que en el
  patrón: **tres hallazgos distintos (TD-024, el M5 del turno del recurrente, y la lista nominal de
  RSVP) son el mismo gap de backend** visto desde tres pantallas. Se resuelve una vez, exponiendo un
  display name en `IHouseholdMemberDTO`. Hasta entonces, cualquier UI que necesite un nombre humano
  tiene que contar personas, no nombrarlas.
- **TD-033** documenta el otro límite duro que apareció en TD-026: el contrato de notificaciones es
  **write-only** (`POST`/`DELETE`, sin `GET`), así que la app puede declarar su intención pero no
  puede verificar contra el servidor qué devices tiene registrados. El auto-registro es idempotente y
  eso lo hace seguro, pero "seguro" no es "verificable".
- **TD-031** fue el primer TD fuera del informe M5, y su creación fue autorizada expresamente. No es
  deuda de ingeniería en el sentido habitual: es la ausencia de una decisión de diseño que el código
  ya estaba asumiendo. Hasta que exista la guía, ningún tamaño debe cambiar. **TD-032**, **TD-033** y
  **TD-034** también nacieron fuera del informe M5 — son hallazgos de la sesión de M6, no del audit de
  la mañana. Los tres son de **backend**: nombre de miembro, lectura de devices, y reenvío de la
  invitación de verificación SOS.
