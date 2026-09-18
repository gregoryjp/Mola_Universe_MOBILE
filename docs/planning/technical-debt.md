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
| TD-024 | Media | `src/presentation/expenses/recurring/`, `src/presentation/pets/PetPermissionsSection.tsx` | **Turno del recurrente sin nombre de miembro:** la fila decía "le toca a otro miembro" porque **ninguna pantalla tenía la lista de miembros del hogar**. Es la misma causa raíz que TD-032 | ✅ Resuelto (commit `a04be62`) — corte de miembros en Mobile (`listMembers`, `useHouseholdMembers`, `memberNameById`) y la fila ya nombra a la persona. Conserva "Te toca reponer" para el turno propio y cae a la copia neutra si el miembro no está en la lista, sin mostrar nunca un `userId` |
| TD-025 | Media | `src/presentation/notifications/NotificationPreferencesSection.tsx` | **`quietHours` sin UI:** el DTO trae `quietHoursStart`/`quietHoursEnd` y el mapper los conserva, pero la pantalla solo expone los toggles booleanos | ✅ Resuelto (commit `7006dcd`) — entradas `HH:mm` con validación en un módulo puro (`quietHours.ts`, testeado sin UI). Documentado que el backend compara contra **UTC del servidor**, no hora local |
| TD-026 | Alta | `src/presentation/notifications/hooks/usePushRegistration.ts`, `src/core/navigation/RootNavigator.tsx` | **Sin registro automático del device al hacer login:** el token Expo se registraba solo si el usuario entraba a la pantalla de notificaciones. Hasta entonces no llegaba push aunque el usuario creyera tenerlas activas | ✅ Resuelto (commit `c270b92`) — query única en el árbol autenticado: lee el permiso real y, si ya está concedido, registra el device (upsert idempotente). El estado de la UI viene de esa fuente, no de la mutación efímera |
| TD-027 | N/A | `src/presentation/{tasks,inventory,shopping,expenses,savings}/hooks/` | **UI de paginación** — mismo hallazgo que TD-018. Fila de trazabilidad con el gap 7 del informe M5; no hay trabajo nuevo detrás | ✅ Resuelto vía TD-018 (commit `dcd8197`) |
| TD-028 | Media | `tests/setup.ts`, `vitest.config.ts`, `tests/helpers/reactNativeStub.ts` | **Sin tests de componente:** el setup sigue en `environment: 'node'` sin preset de React Native, así que las pantallas no se renderizan con el paquete real. **Actualización 1:** la afirmación "ningún test cubre el árbol de UI" ya **no** es cierta — hay **13 ficheros de test de componente/pantalla** (`RsvpSection`, `MomentCard`, `MomentDetailScreen`, `PetDetailScreen`, `NotificationPreferencesSection`, `SOSActivationScreen`, `TrustedContactRow`, `MeowScreen`, `PhraseBanner`, `TasksListScreen`, `SavingsScreen`, `RecurringExpenseRow`, `RecurringExpensesListScreen`) sobre un stub compartido de `react-native`. El stub es superficial (drives behaviour, no styling) porque el paquete trae fuentes Flow que Vite no parsea. **Actualización 2 (intento de cierre, 2026-09-17):** se atacó la raíz y **no hay preset que instalar** — ver "Por qué la raíz de TD-028 no se cierra por configuración" abajo. Intento **revertido**: es sustituir un stub de 60 líneas por infraestructura a medida más frágil, no una mejora | ⚠️ Parcial — raíz investigada y **descartada por medición**, no por falta de intento |
| TD-029 | Baja | `src/presentation/{tasks,inventory,shopping,expenses,savings}/hooks/` | **Contrato de paginación no uniforme:** cada módulo devuelve su propia clave (`tasks`, `items`, `lists`, `expenses`, `goals`) en vez de `{items, total, page, limit}`. Cada hook respeta la clave real de su módulo, así que funciona — es deuda de consistencia de contrato, no un bug | Pendiente |
| TD-030 | Media | `tests/unit/{expenses,inventory,savings,shopping}/*.test.tsx` | **Tests frágiles por timing:** el registro decía 4 tests con `await new Promise(resolve => setTimeout(resolve, 100))`; la medición real fue **25 ocurrencias en 24 ficheros** (y con duraciones arbitrarias: 0, 5, 10, 20, 25, 100 ms). Mismo patrón de causa raíz que TD-011 en APP; el mecanismo no es portable 1:1 | ✅ Resuelto (commit `7b15436`) — helper determinista `tests/helpers/flush.ts` (microtasks, no milisegundos), 24 ficheros migrados, diff mínimo de 2 líneas por fichero. La suite quedó más rápida (52 ms en el primer fichero migrado) |
| TD-031 | Media | `design/components/buttons.md` y `accessibility/guidelines.md` (ambos por crear) | **Faltan los dos documentos que el código ya cita como fuente de verdad.** `Button.tsx` e `Input.tsx` escriben como si existieran y no existen: `design/components/` solo contiene `.gitkeep` y no hay carpeta `accessibility/`. La guía debe decidir tres cosas: **(1)** target táctil mínimo, ¿**44×44** (WCAG 2.5.5, nivel AAA) o **24×24** (WCAG 2.5.8, nivel AA)?; **(2)** ¿`Button` e `Input` comparten escala de tamaños o son independientes?; **(3)** ¿la guía nace del código actual o el código se alinea a la guía? | Pendiente — trabajo de **diseñador y producto**, no de ingeniería. No se crea desde este repo |
| TD-032 | Media | `src/domain/household/entities/Household.ts`, backend `src/modules/households/` | **Sin nombre visible de miembro:** `IHouseholdMemberDTO` solo traía `userId`/`role`/`joinedAt` — ni nombre ni email. Nadie podía mostrar "le toca a Ana" ni listar quién asistió a un Moment. Misma causa raíz que TD-024 | ✅ Resuelto (commit `a04be62`) — el backend une `user.name`/`user.email` en `memberToDTO` (`householdService.ts:38`) y Mobile ya consume la ruta. **Desbloquea** la lista nominal de RSVP en Moments (§9 de `docs/modules/moments.md`), que sigue sin hacerse: ahora es una mejora de UI pendiente, no un bloqueo |
| TD-033 | Media | `src/presentation/notifications/hooks/useNotificationMutations.ts` (`useRemovePushDevice`), `src/shared/store/authStore.ts` (logout) | **Baja del device sin cablear y sin lectura de estado real:** `DELETE /notifications/devices/:token` está implementado en el cliente pero **ninguna pantalla lo llama**, y el logout no lo invoca, así que un device dado de baja sigue en el backend. Además el contrato **no expone `GET`** de devices registrados, así que la app nunca puede confirmar contra el servidor qué devices tiene | Pendiente — el `GET` es de backend; el cableado de `useRemovePushDevice` al logout sí es de Mobile |
| TD-034 | Media | `src/modules/sos/routes/sosRoutes.ts` (backend), `src/presentation/sos/screens/TrustedContactsScreen.tsx` | **Sin reenvío de la invitación de verificación:** las 7 rutas de SOS no incluían ningún `POST .../resend` ni `.../reinvite`. Si la invitación caducaba o el contacto no la veía, **la app solo podía eliminar y recrear el contacto** — un rodeo destructivo para una acción que debería ser un botón. TD-023 se cerró guiando a ese rodeo porque era la única vía existente | ✅ Resuelto — el backend añadió `POST /sos/contacts/:contactId/resend-invite` (commit `83a25c9` de APP, que rechaza contactos ya verificados) y Mobile ya lo consume (`resendContactInvite`, `useResendContactInvite`, botón en `TrustedContactRow`). El borrado y recreación queda solo como salida para un correo equivocado |
| TD-035 | Media | `src/presentation/meow/` (backend `src/modules/billing/`) | **`meowAdvanced` se calcula y no se aplica en ningún sitio:** Billing lo deriva del entitlement, pero ningún punto de Meow lo enforça, así que hoy tener el plan o no tenerlo **no cambia ninguna capability** | Pendiente — **decisión de producto** (no se enforça por ahora) |
| TD-036 | Baja | `src/presentation/phrases/`, `src/presentation/{tasks,savings}/screens/` | **Casi todo el banco de frases sin consumir, y el diagnóstico original era impreciso.** Medido: el banco está **completo** — 6 módulos (`TASKS`, `SAVINGS`, `MOVE`, `ENGLISH`, `DIARY`, `SOS`) × 5 contextos (`DAY_START`, `DAY_END`, `STREAK`, `ACHIEVEMENT`, `RELAPSE`) = **30 combinaciones, 2 frases cada una, ninguna vacía**, así que `PHRASE_NOT_FOUND` es inalcanzable en la práctica. La selección es `now.getDay() % frases.length`: una **rotación pura por día de la semana, sin estado** (PRD §20). Dato clave: **ningún contexto necesita un evento del servidor para poder pedirse** — mi afirmación anterior ("lo dispara un evento de módulo que Mobile no produce") solo es cierta para tres de los cuatro. Mobile consume **2 de las 30** (`TASKS/DAY_START`, `SAVINGS/DAY_START`); de las 30, solo **15 son alcanzables** desde Mobile (TASKS, SAVINGS y SOS existen; MOVE, ENGLISH y DIARY no), luego **13 combinaciones alcanzables están sin usar**, incluidas los 5 contextos de SOS. Detalle por contexto: **`DAY_END` es consumible hoy** (solo hace falta un chequeo de "¿es de noche?" en el cliente, ninguna fuente de eventos); **`STREAK`/`ACHIEVEMENT`/`RELAPSE` sí** necesitan estado que Mobile no modela (rachas, logros, recaídas) y en dos casos pertenecen a módulos fuera de alcance | Pendiente — decisión de **producto** sobre *cuándo* mostrar cada contexto, más una feature inexistente para 3 de los 4 |
| TD-037 | Alta | módulo `diary` (no existe en Mobile) | **Diary sin implementar, y bloqueado por una decisión que no es de ingeniería:** el contrato exige `encryptedContent` + `iv` — **AES-256-GCM cifrado en el cliente** (zero-knowledge: el backend nunca ve el texto). Mobile no tiene ninguna librería criptográfica instalada. Antes de escribir código hay que decidir **dónde vive la clave** (derivada de la contraseña, en `expo-secure-store`, o frase de recuperación) y qué pasa si el usuario la pierde | Pendiente — **bloqueado por gestión de clave** |
| TD-038 | Media | módulo `storage` (no existe en Mobile) | **Storage sin implementar:** el backend sube por **presigned URL** y **no ofrece listado**. Mobile no tiene ni una sola capacidad de subir ficheros (sin `expo-image-picker` ni `expo-document-picker`). Construirlo sin caso de uso confirmado sería adivinar la UI | Pendiente — **esperando confirmación de Producto** |
| TD-039 | Media | módulo `billing` (no existe en Mobile) | **Billing sin superficie en Mobile, por decisión de producto:** el backend deriva entitlements y `meowAdvanced`, pero no hay pasarela — Stripe **no es ni dependencia del backend** (los campos existen y nunca se escriben) y RevenueCat no está instalado. La decisión tomada es *entitlement-only*: sin compra, sin suscripción. Falta decidir si Mobile muestra el estado del entitlement aunque no haya pasarela | Pendiente — **decisión de producto** |
| TD-040 | **Alta** | `src/core/theme/colors.ts`, `Button.tsx`, `Badge.tsx`, `Input.tsx` | **Ninguno de los 8 tokens cromáticos sirve como texto en tema claro, y varios fallan también como relleno y como borde.** Medidos sobre `surface` (`#FFFFFF`): `primary` **2.06:1**, `error` **2.47:1**, `success` **1.91:1** (1.67–1.91 según fondo), `accent` **1.71:1**, `warning` **1.55:1**, `secondary` **1.97:1**, `info` **2.08:1**, `primaryDark` **2.87:1** — **ninguno alcanza el 3:1** de texto grande / componentes de interfaz (1.4.11), y mucho menos el 4.5:1 de texto normal. Falla en **las dos direcciones**: como texto sobre claro *y* como relleno con etiqueta blanca — el botón primario (`2.06:1`) y el de peligro (`2.47:1`) no llegan a AA consigo mismos. Los badges empeoran: texto de color sobre su propio `*Soft` cae a **1.42–2.08:1**, y el borde del badge mide lo mismo. **60 usos** de un token cromático como `color:` en **43 ficheros**, más el `Spinner` por prop. El tema **oscuro no se ve afectado** (6.70–10.82:1: el problema es exclusivo de claro). Solo `text` (17.40:1) y `textMuted` (5.33:1) son utilizables como texto. Los **tokens no se tocan**; en el checkpoint de Auth sí se añadieron a `Button` dos variantes **aditivas** (`primaryTonal` 8.43:1, `linkNeutral` 16.23:1) sin alterar `primary` ni `link` | Pendiente — **decisión de diseñador**: ¿variantes «text-safe» o cambiar los tokens base? Ver ficha **`## TD-040`** |
| TD-041 | **Alta** | `package.json`, `src/data/sos/location/expoLocation.ts` | **Dependencia importada por código en producción y nunca declarada:** `expoLocation.ts:1` hace `import * as Location from 'expo-location'`, pero **`expo-location` no estaba en `package.json` en ningún commit** (`git log -S"expo-location" -- package.json` no devuelve nada). Sobrevivía porque sí estaba en `package-lock.json` y en `node_modules` local: `npm ci` lo instalaba, `npm install` lo **purgaba** como extraneous, y entonces `tsc` fallaba con `TS2307: Cannot find module 'expo-location'`. Un `npm install` en una máquina limpia rompía el typecheck y el bundle. Detectado al purgar dependencias durante la investigación de TD-028 | ✅ Resuelto — declarado `expo-location: ~57.0.18` en `package.json` (la misma versión que ya fijaba el lock, así que el lock quedó **idéntico**). Encontrado por accidente, pero habría roto la build nativa |
| TD-042 | **Alta** | `src/presentation/auth/screens/VerifyEmailScreen.tsx`, backend `src/modules/auth/services/authService.ts` | **No existe forma de reenviar el código de verificación de email — un código expirado o bloqueado deja la cuenta inutilizable.** Contrato actual: `POST /auth/verify-otp` `{verificationToken, code}` (el `verificationToken` es el `challengeId` que devuelve `/auth/register`). Comportamiento observado leyendo `authService.ts`: código expirado → `AUTH_OTP_EXPIRED` (400, sin recuperación); 5 intentos fallidos → `AUTH_OTP_BLOCKED` (429, sin recuperación); código incorrecto → `AUTH_INVALID_CREDENTIALS` (401, el mismo código que usa `/auth/login`, así que el mensaje del backend dice "Invalid email or password" — Mobile sobrescribe esa copia solo para esta pantalla); ya verificado → `AUTH_ALREADY_VERIFIED` (400, se trata como éxito). El endpoint `POST /auth/resend-verification` **existe pero no sirve para esto**: regenera `emailVerificationToken` (campo de un flujo distinto, basado en enlace, usado solo por `/auth/verify-email`), no `emailVerificationCode`/`emailVerificationChallengeId` (los campos que `verify-otp` valida). **Hallazgo adicional:** `forgotPassword`, `resetPassword` y `verifyOTPCode` leen/escriben exactamente esos mismos cuatro campos (`emailVerificationCode`, `emailVerificationChallengeId`, `emailVerificationCodeExpiresAt`, `emailVerificationCodeAttempts`) — un código de verificación de email pendiente y un código de reseteo de contraseña pendiente para el mismo usuario se pisan entre sí. No se ha explotado esta coincidencia desde Mobile (decisión explícita: no acoplar Mobile a un comportamiento de backend no documentado) — se registra como pista para quien resuelva el TD, no como solución. Lo que Mobile necesita: un endpoint de resend dedicado a la verificación por OTP (mismos campos que `verify-otp` valida) que devuelva un `verificationToken` fresco, con la misma forma que ya devuelve `/register`. Mientras tanto, `VerifyEmailScreen.tsx` no ofrece reenvío (copia honesta: "Revisa tu carpeta de spam") y el único escape de un código expirado/bloqueado es cerrar sesión — lo que devuelve a Login sin resolver el bloqueo, porque el email ya existe y `/auth/register` lo rechaza (`AUTH_ERRORS.EMAIL_EXISTS`). No localicé tests de backend para el caso expirado/bloqueado de `verify-otp` específicamente (sí hay cobertura de integración para `resend-verification`, que es el endpoint equivocado para este caso) | ✅ Resuelto por Backend (2026-09-18) — `resend-verification` ahora llama `resendVerificationOtp`, que usa un slot de campos **propio e independiente** (`emailVerificationOtpCode`/`OtpChallengeId`/`OtpExpiresAt`/`OtpAttempts`, separado de `emailVerificationCode`/`ChallengeId` que usa `forgotPassword`) — el acoplamiento descrito arriba ya no existe. La respuesta incluye `verificationToken`, `otpExpiresAt`, `otpExpiresIn`; `EMAIL_VERIFICATION_OTP_VALIDITY_SECONDS = 60` (confirmado en `authService.ts:29`). Reenviar invalida el código anterior de inmediato (nuevo `challengeId` sobrescrito). Mobile ya lo consume — ver `VerifyEmailScreen.tsx` |

| TD-043 | Media | `src/presentation/auth/screens/*.tsx`, `src/presentation/components/ui/` | **No existe la primitiva `Screen` del Design System, y ninguna pantalla de Auth evita el teclado.** Medido en `src/`: **0 ocurrencias de `KeyboardAvoidingView` y 0 de `Keyboard`** — la única mención es un comentario en `LoginScreen.tsx:20` que dice que el patrón no existe — y **0 usos** de `keyboardShouldPersistTaps`, `keyboardDismissMode` o `automaticallyAdjustKeyboardInsets`. El DS expone 14 primitivas (`Avatar`…`Spinner`) pero **no `Screen`**, así que cada pantalla repite a mano su `View` contendedor y la cobertura de SafeArea es desigual: `WelcomeScreen` usa `SafeAreaView` (vía `react-native-safe-area-context`), el resto usa `paddingTop: spacing.s16` fijo. Las 6 pantallas de Auth con inputs (Login, Register, ForgotPassword, ResetPasswordOtp, ResetPassword, VerifyEmail) centran el contenido con `justifyContent: 'center'` dentro de un `View` sin ScrollView ni avoidance: en iOS, con el teclado abierto, el CTA de envío puede quedar tapado sin forma de desplazarse hasta él. Es un defecto de dispositivo, no de estilo | ✅ Implementada (2026-09-18) — **PENDING DEVICE VALIDATION** — creada la primitiva `Screen` en el DS (`src/presentation/components/ui/Screen.tsx`) y migradas **las 7 pantallas de Auth con inputs** (Login, Register, ForgotPassword, ResetPasswordOtp, ResetPassword, VerifyEmail, Onboarding). Ver ficha **`## TD-043`**. **No verificable en este entorno** (sin dispositivo ni simulador): probados estructura, props, ramas de `Platform`, scroll y tests; el comportamiento real del teclado queda **pendiente de validación física** |

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
| TD-024 | Recurring Expenses (+ Pets) | Medio | S | Ninguna — el endpoint existía, faltaba cablearlo | ✅ **Cerrado** (commit `a04be62`) — desbloqueado al resolverse TD-032 |
| TD-025 | Notifications | Medio | S | Ninguna — el contrato ya existe y está mapeado | ✅ **Cerrado** (commit `7006dcd`) |
| TD-026 | Notifications (+ Auth) | **Alto** | S | Flujo de auth (`useAuth`/sesión) y permiso de notificaciones | ✅ **Cerrado** (commit `c270b92`) |
| TD-027 | Paginación (5 módulos) | — | — | Ninguna | Cerrado (TD-018) |
| TD-028 | Infra de tests (cross-cutting) | Bajo (indirecto) | L | Cambia el entorno de toda la suite | ⚠️ **Paliado** — stub de `react-native` compartido, **13 ficheros de test de componente**; la raíz sigue abierta |
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

## TD-040 — los tokens cromáticos no sirven como color de texto en claro (2026-09-17)

**Trabajo de diseñador, no de Mobile.** Esta ficha no cambia ningún token ni ningún componente:
mide y documenta. La decisión —¿variantes «text-safe» o cambiar los tokens base?— es de diseño.

### Qué pasa

Los 8 tokens cromáticos (`primary`, `primaryDark`, `secondary`, `accent`, `error`, `success`,
`warning`, `info`) son **pasteles de luminosidad alta**. Sobre los fondos claros del tema, ninguno
alcanza el mínimo de contraste **ni siquiera para texto grande**, y varios quedan por debajo del
umbral de **componentes de interfaz** (WCAG 1.4.11, 3:1).

Umbrales de referencia, WCAG 2.1:

- texto normal: **4.5:1**
- texto grande (≥24 px, o ≥18.66 px en negrita): **3:1**
- bordes, iconos, indicadores: **3:1** (1.4.11)

### Medición — tema claro (token como color de texto)

| token | valor | sobre `surface` `#FFFFFF` | sobre `background` `#F7F7F5` | sobre `surfaceAlt` `#F0F0ED` |
| --- | --- | --- | --- | --- |
| `primary` | `#6BC5A8` | **2.06:1** ✗ | 1.92:1 ✗ | 1.81:1 ✗ |
| `primaryDark` | `#4FA88C` | 2.87:1 ✗ | 2.68:1 ✗ | 2.52:1 ✗ |
| `secondary` | `#A8B8E8` | 1.97:1 ✗ | 1.83:1 ✗ | 1.72:1 ✗ |
| `accent` | `#E8B8D8` | 1.71:1 ✗ | 1.59:1 ✗ | 1.50:1 ✗ |
| `error` | `#E88B8B` | **2.47:1** ✗ | 2.30:1 ✗ | 2.16:1 ✗ |
| `success` | `#8BC9A8` | 1.91:1 ✗ | 1.78:1 ✗ | 1.67:1 ✗ |
| `warning` | `#F5C88B` | 1.55:1 ✗ | 1.45:1 ✗ | 1.36:1 ✗ |
| `info` | `#8BB8E8` | 2.08:1 ✗ | 1.93:1 ✗ | 1.82:1 ✗ |
| `text` | `#1A1A1A` | 17.40:1 ✓ | 16.23:1 ✓ | 15.24:1 ✓ |
| `textMuted` | `#6B6B6B` | 5.33:1 ✓ | 4.97:1 ✓ | 4.67:1 ✓ |

✗ = por debajo de **3:1**, es decir falla incluso el umbral de texto grande y el de interfaz.

Solo `text` y `textMuted` son utilizables como color de texto. `primaryDark`, el más oscuro de los
cromáticos, se queda en **2.87:1**: le falta un 36 % de recorrido para llegar a 4.5:1.

Nota sobre las cifras del registro original: citaba «success 1.72:1». La medición por par da
**1.67–1.91:1** según el fondo (el 1.72 corresponde a `secondary`/`accent` sobre `surfaceAlt`). Las
de `primary` (2.06) y `error` (2.47) se reproducen exactas sobre `surface`.

### Las cuatro formas en que el fallo aterriza hoy

**1. Texto de color sobre fondo claro.** `primary` como etiqueta del botón outline
(`Button.tsx`, `textOutline`), como enlace (`textLink`), y 11 usos más. Todos ≤ 2.06:1.

**2. Texto blanco sobre un relleno del token** — el caso más visiblemente roto:

| relleno | etiqueta | ratio | veredicto |
| --- | --- | --- | --- |
| `primary` (botón primario) | `#FFFFFF` | **2.06:1** | ✗ |
| `error` (variante `danger`) | `#FFFFFF` | **2.47:1** | ✗ |
| `success` | `#FFFFFF` | **1.91:1** | ✗ |
| `secondary`, `accent`, `warning`, `info` | `#FFFFFF` | 1.55–2.08:1 | ✗ |

Es decir: **el botón primario y el de peligro de la app no llegan a AA con su propia etiqueta**. El
token falla en las dos direcciones a la vez (como texto y como relleno con texto blanco).

**3. Texto de color sobre el fondo suave de su familia** (`Badge.tsx`) — el peor grupo:

| badge | texto | sobre | ratio |
| --- | --- | --- | --- |
| success | `#8BC9A8` | `successSoft` `#E8F5EE` | **1.70:1** ✗ |
| warning | `#F5C88B` | `warningSoft` `#FCF4E5` | **1.42:1** ✗ |
| error | `#E88B8B` | `errorSoft` `#F8E8E8` | **2.08:1** ✗ |
| info | `#8BB8E8` | `infoSoft` `#E8F0FA` | **1.81:1** ✗ |

El **borde** del mismo badge, que es un componente de interfaz sujeto a 1.4.11 (3:1), mide
exactamente lo mismo: **1.42–2.08:1**. El badge se dibuja con un color que no se distingue de su
propio fondo.

**4. Color como icono, indicador o borde** (1.4.11, 3:1): el `Spinner`
(`Spinner.tsx:42`, vía prop `color={theme.primary}`) y el borde del botón `secondary`
(`Button.tsx:59`, `borderColor: theme.primary`) van sobre el fondo de página: **1.92:1** ✗.

### Alcance medido

**60 usos** de un token cromático como propiedad `color:` en **43 ficheros**, más `Spinner.tsx:42`
por prop. Núcleo afectado: `Button.tsx`, `Badge.tsx`, `Input.tsx` (estado de error) y las
filas/errores de formulario de los 14 módulos de la app. `error` es el más extendido (41 usos, en
mensajes de validación de casi todas las pantallas).

### Tema oscuro: no afectado

En oscuro los mismos tokens van sobre `surface` `#1A1F26` y pasan todos:

| token | sobre `surface` oscuro |
| --- | --- |
| `primary` `#6BC5A8` | 8.03:1 ✓ |
| `error` `#E88B8B` | 6.70:1 ✓ |
| `success` `#8BC9A8` | 8.69:1 ✓ |
| resto de cromáticos | 5.77–10.82:1 ✓ |

El problema es **exclusivo del tema claro**: los pasteles se eligieron para leer sobre oscuro, y en
claro falta la otra mitad del par.

### La decisión que hace falta

No es «cambiar un hex»: es decidir **cuántos valores necesita cada rol semántico**. Hoy cada token
cromático se usa con tres funciones que, en claro, son incompatibles entre sí:

1. como **relleno** (fondo de botón o insignia) → debe contrastar con su etiqueta;
2. como **texto** sobre fondo claro → necesita **4.5:1** contra `surface` y `background`;
3. como **borde o icono** → necesita **3:1** (1.4.11).

Un solo valor no puede cumplir 1 y 2 a la vez en claro: si se oscurece lo suficiente para leer como
texto, deja de admitir texto blanco encima. Opciones:

- **(A) Variantes «text-safe».** Añadir, p. ej., `primaryText`, `errorText`, `successText`… con el
  valor oscurecido que sí lea sobre claro (mínimo **4.5:1** sobre `surface`), y dejar los pasteles
  como relleno. Coste: hasta 8 tokens nuevos × 2 temas, y el mapeo rol→token en el código.
- **(B) Cambiar los tokens base.** Oscurecer los 8 para que sirvan como texto e **invertir la
  etiqueta** de los rellenos a un color oscuro. Cambia el aspecto del tema claro en toda la app y
  rompe la dirección «pastel» ya aprobada.
- **(C) Híbrido.** Oscurecer solo los que se usan como texto (`primary`, `error`, `success`,
  `warning`, `info`) y mantener los pasteles como relleno con etiqueta oscura.

Las tres exigen **un valor por rol**, que es justo lo que debe fijar la guía de diseño (TD-031).
Recomendación de ingeniería: **(A)**, porque es aditiva y no toca la paleta ya aprobada; pero la
decisión es de diseño.

### Qué hace Mobile y qué no

Los **tokens** no se tocan: los 60 usos de un token cromático como `color:` siguen como están, y la
decisión (A/B/C) sigue siendo de diseño.

Lo que sí se hizo, en el checkpoint de Auth, es **añadir dos variantes aditivas a `Button`** sin
modificar `primary` ni `link`, que conservan su valor actual:

| variante | tratamiento | ratio | veredicto |
| --- | --- | --- | --- |
| `primaryTonal` | relleno `primary` + tinta `text` `#1A1A1A` | **8.43:1** | AAA |
| `linkNeutral` | tinta `text` + subrayado | **16.23:1** sobre `background` claro, **16.98:1** en oscuro | AAA |

Esto **no pre-empta** la decisión de diseño: es la opción (A) aplicada solo donde el brief de Auth la
exigía explícitamente («contraste AA» en el CTA y en la acción secundaria), y medida en el runtime
real (Expo Web, 390×844, claro y oscuro). Los 60 usos fuera de Auth quedan intactos y pendientes.

El rollout de Auth quedó cerrado así: **11 `variant="link"` y 9 `variant="primary"` migrados** a las
variantes AA. Verificado recorriendo el funnel en el runtime (Welcome → ValueProps → ChooseMethod →
Register → Login → ForgotPassword): **ningún botón por debajo de 4.5:1**, en ninguno de los dos temas.

También se corrigió el **ancho** del CTA primario en las pantallas que centran su contenido
(`alignItems: 'center'` colapsaba el botón al ancho de su etiqueta mientras el `Input` de al lado sí
era `width: '100%'`): medido en Forgot Password, el botón pasó de **147×48** a **342×48**.

Queda **abierta, como decisión de diseño y no como defecto**, la altura del CTA primario: **56 px**
(`size="xl"`) en Welcome y ValueProps frente a **48 px** (`size="lg"`) en las pantallas de formulario.
Los enlaces secundarios también mezclan `size="sm"` (32 px) con el tamaño por defecto (40 px).


## TD-043 — la primitiva `Screen` (2026-09-18)

### Qué se hizo

Una sola primitiva, `src/presentation/components/ui/Screen.tsx`, adoptada por **las 7 pantallas de
Auth con inputs**: Login, Register, ForgotPassword, ResetPasswordOtp, ResetPassword, VerifyEmail y
Onboarding. Resuelve, en un único sitio: safe area, `keyboardShouldPersistTaps`, scroll cuando el
viewport no alcanza, columna flexible, padding inferior derivado del inset (no de una constante),
tap-fuera-para-cerrar opcional, `maxWidth` para tablets/web y un `gap` de columna.

No hay seis copias de `KeyboardAvoidingView` + `ScrollView`.

### Divergencia con la propuesta original (deliberada)

La propuesta inicial enumeraba `automaticallyAdjustKeyboardInsets` **además** de
`KeyboardAvoidingView`. No se implementó, y la razón es mecánica: ambos compensan el teclado, y
usarlos juntos produce **doble compensación** — el contenido sube dos veces y el CTA rebasa el borde
superior. Se eligió `KeyboardAvoidingView`, que es el que permite decidir el `behavior` y excluir
las plataformas que ya compensan solas.

### Comportamiento por plataforma

| Plataforma | Qué hace `Screen` | Por qué |
|---|---|---|
| iOS | `KeyboardAvoidingView` con `behavior="padding"` envolviendo el scroll | iOS dibuja el teclado **sobre** la ventana; el contenedor tiene que ceder el espacio |
| Android | **Nada extra** — el `ScrollView` simplemente recibe menos alto | `app.json` deja `softwareKeyboardLayoutMode` sin definir, lo que selecciona el modo `resize` por defecto: la activity ya se encoge. Añadir avoidance encima compensaría dos veces |
| Web | **Nada** | No hay teclado en pantalla móvil que dejar sitio |

La inclusión de `android.softwareKeyboardLayoutMode` en `app.json` se verificó **antes** de elegir
este diseño: el default es `resize`, no `pan`.

### Detalles que no son obvios

- El inset inferior entra como **padding de contenido**, no como edge de safe area: con el teclado
  arriba el inset no significa nada, y apilarlo sobre el padding del `KeyboardAvoidingView` deja una
  franja muerta bajo el CTA.
- El `ScrollView` va **dentro** del `TouchableWithoutFeedback`, nunca alrededor: así el
  tap-para-cerrar no se traga los taps ni rompe el arrastre.
- Sin `marginTop` ajustado a un modelo concreto ni `automaticallyAdjustKeyboardInsets`.

### Qué queda PENDING DEVICE VALIDATION

Bloqueado por entorno (Linux sin Xcode, sin `adb`, sin Android SDK, sin simulador). Solo se puede
probar la estructura, no la física del teclado. Falta comprobar:

1. **iOS con teclado**: el input activo y el CTA de continuar visibles, en Login/Register/VerifyEmail.
2. **Android con teclado**: que no haya doble compensación (el CTA no se va por arriba).
3. **Small viewport** (iPhone SE / similar): que el scroll llegue a todo sin recortes.

**TD-043 no se marca como completamente validada** hasta cubrir esos tres puntos.

### Tests

`tests/unit/ui/Screen.test.tsx` cubre la primitiva (safe area, `keyboardShouldPersistTaps`, ramas de
`Platform`, `align`, `dismissKeyboardOnTap`) y `tests/unit/auth/ValuePropsScreen.test.tsx` cubre las
dos únicas salidas de la entrada unificada. El mock de `react-native-safe-area-context` es un stub
compartido (`tests/helpers/safeAreaStub.ts`) con insets mutables, más un alias en `vitest.config.ts`
para el subpath `codegenNativeComponent` que esquiva el mock de `react-native`.


## TD-028 — por qué la raíz no se cierra por configuración (2026-09-17)

Se atacó la raíz y **se revirtió**. No fue falta de intento: fue una medición. El encargo decía
"instalar/configurar un preset RN real". **Ese preset no existe para este stack.** La cadena de
muros, en el orden en que aparecieron y cada uno medido:

1. **Vite no puede parsear React Native.** `RolldownError: Parse failure: Flow is not supported` en
   `react-native/index.js:1`. Vitest 5 usa rolldown, cuyo parser rechaza Flow de raíz. No es un
   problema de configuración: es que falta el transformador.
2. **No hay nada que instalar.** En todo el árbol no existe `@babel/preset-flow`, ni
   `@react-native/babel-preset`, ni `@react-native/jest-preset`, ni un `react-native/jest/setup.js`
   vendorizado. RN 0.86 **no trae mocks de módulos nativos**: su preset de tests se movió a un
   paquete aparte (`react-native/jest-preset.js` lo dice explícitamente al no encontrarlo).
3. **Babel tampoco puede parsear RN 0.86, ni con Flow configurado.** Instalado `@babel/preset-flow`
   y con un plugin de Vite haciendo el strip, el error pasa a
   `SyntaxError: Missing semicolon (397:1)` sobre `} as ReactNativePublicAPI`. Se probaron tres
   configuraciones de `@babel/parser` (`flow`, `flow+all`, `flow+jsx`): **las tres fallan** en la
   misma línea. Solo **`hermes-parser`** (el parser de Metro, que sí está disponible) lo acepta. Es
   decir: el transform tendría que ser hermes-parser → AST de Babel → generate, maquinaria propia.
4. **Con ese transform a mano, el entry point carga (99 exports) pero ningún componente sirve.** Un
   hook `require` con hermes+babel funciona; al tocar `View`, `Text`, `Pressable`, `Button`,
   `TextInput`, `ScrollView`, `Switch`, `FlatList`… todos fallan con `Unexpected token '<'` (RN
   trae **JSX**) y `Cannot find module` con mensajes de resolución **ESM**. La causa de fondo: RN
   0.86 depende del **resolutor de Metro** — requires sin extensión, extensiones de plataforma
   (`.ios.js`, `.android.js`, `.native.js`) y mapas `exports`. El resolutor de Node/Vite no es el de
   Metro.
5. **Nunca se llegó al muro de los módulos nativos** (`UIManager`, `TurboModuleRegistry`), que es
   precisamente la razón de que RN necesite un preset con mocks.

**Veredicto.** Cerrar TD-028 "de verdad" significa reimplementar el transformador y el resolutor de
Metro dentro de Vite, y después escribir a mano los mocks de módulos nativos. Eso **sustituye un
stub de ~60 líneas por varios cientos de líneas de infraestructura propia**, y encima sin fidelidad
nativa. La alternativa real —usar el preset oficial— obliga a instalarlo junto a Jest y a migrar los
**82 ficheros de test** de `vi.*` a `jest.*`. Ninguna de las dos es "cerrar una deuda": son proyectos
con su propia sesión.

Decisión: **revertido**, según la instrucción de no forzar cuando el cambio rompe más de lo que
arregla. El stub se queda, y se queda **documentado como lo que es**: un contrato deliberadamente
superficial (drives behaviour, no styling), no un preset mal configurado. Si algún día se cierra,
hay que empezar por la bifurcación de arriba — preset oficial con Jest, o transformador propio—, no
por tocar `vitest.config.ts`.

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
  **TD-021** (`6292278`), **TD-023** (`a692e82`), **TD-025** (`7006dcd`), **TD-030** (`7b15436`) y
  **TD-024** (`a04be62`, al resolverse antes TD-032).
  Paliado: **TD-028**, que ya no es "ningún test cubre el árbol de UI" sino "el stub es compartido y
  cubre 13 ficheros de componente, pero sigue sin preset RN real".
- **Solo queda abierto TD-029** de los hallazgos M5, y es una decisión de contrato de API que toca al
  backend. Documentarlo era la acción correcta; no había nada que implementar sin inventar un endpoint.
  Los demás IDs abiertos (**TD-031**, **TD-033**, **TD-035** a **TD-040**) ya no son trabajo de
  ingeniería de Mobile: son decisiones de producto o de diseño, o trabajo que no fue autorizado.
- **TD-032 se resolvió en el backend durante esta sesión**, y eso desbloqueó TD-024 de inmediato: el
  `IHouseholdMemberDTO` ahora une `user.name`/`user.email` (`householdService.ts:38`). Su valor está
  menos en el ítem que en el patrón: **tres hallazgos distintos (TD-024, el M5 del turno del
  recurrente, y la lista nominal de RSVP) eran el mismo gap de backend** visto desde tres pantallas.
  Quedó resuelto una sola vez, y con **una sola** pieza de Mobile (`useHouseholdMembers` +
  `memberNameById`) sirven ya dos pantallas. La lista nominal de RSVP sigue pendiente, pero ahora es
  una mejora de UI, no un bloqueo.
- **TD-033** documenta el otro límite duro que apareció en TD-026: el contrato de notificaciones es
  **write-only** (`POST`/`DELETE`, sin `GET`), así que la app puede declarar su intención pero no
  puede verificar contra el servidor qué devices tiene registrados. El auto-registro es idempotente y
  eso lo hace seguro, pero "seguro" no es "verificable".
- **TD-031** fue el primer TD fuera del informe M5, y su creación fue autorizada expresamente. No es
  deuda de ingeniería en el sentido habitual: es la ausencia de una decisión de diseño que el código
  ya estaba asumiendo. Hasta que exista la guía, ningún tamaño debe cambiar. **TD-032** (ya resuelto),
  **TD-033** y **TD-034** (ya resuelto) también nacieron fuera del informe M5 — hallazgos de la sesión
  de M6. De los tres, **TD-034 es el caso más instructivo de dependencia cruzada**: se registró como
  «bloqueado por el backend», el backend lo implementó en paralelo (`83a25c9` de APP) mientras esta
  sesión corría, y en cuanto la ruta existió el trabajo de Mobile fue una hora de cableado. El registro
  de cada repo no puede verse como una foto fija cuando los dos repos avanzan a la vez.
- **TD-040** nació al implementar el botón de reenvío de TD-034 y es un hallazgo **medido**, no
  heredado: al elegir el color de la acción nueva medí el contraste de los tokens del tema contra la
  superficie, y `primary`, `error` y `success` fallan AA como color de texto. Por eso la acción nueva
  usa `theme.text`, y por eso no toqué `colors.ts`: cambiar un token compartido afecta a toda la app
  y pertenece a la misma decisión de diseño que TD-031.
- **TD-035 a TD-039** nacieron de la auditoría de los cinco módulos que Mobile todavía no consume
  (Meow, Phrases, Billing, Diary, Storage) y de la implementación de los dos primeros. **TD-035**
  (Meow) y **TD-036** (Phrases) son consecuencia directa de cablear módulos a medias: la capability
  estrella queda sin cobrar y cuatro contextos de frase sin disparador. **TD-037 a TD-039** no son
  deuda de código sino **trabajo no autorizado todavía**: Diary espera la decisión de gestión de clave
  (es cifrado en cliente, no un CRUD), Storage espera caso de uso confirmado, y Billing es
  *entitlement-only* por decisión de producto.

