# Experience reset — vertical slice visual (2026-09-18)

Checkpoint del brief **P0 — Experience Reset**. Alcance autorizado y entregado: **4 superficies**
(HOY, CASA, `+` universal, TAREAS + Quick Create Task). El resto de módulos **no se propaga a
propósito** hasta revisión visual.

Sin backend tocado. Sin endpoints inventados. Sin capacidades ocultas. Sin push.

---

## 1. Mapa de IA: propuesto vs. implementado

| Destino objetivo | Estado | Qué existe hoy | Qué falta |
|---|---|---|---|
| **HOY** | ✅ Implementado | `DashboardScreen` (tab `Dashboard`, etiqueta «Hoy») reescrito: saludo + fecha, tareas de hoy, próximos eventos, aviso offline, bloque contextual de casa y línea de Meow | — |
| **CASA** | ✅ Implementado | `HouseholdHubScreen` (hub por intención, 4 grupos + gestión) + línea contextual medible | — |
| **+** | ✅ Implementado | Botón central en `FloatingTabBar` (no es pestaña) → `UniversalCreate` con 5 acciones frecuentes + secundarias | — |
| **TÚ** | ❌ No implementado | `AccountScreen` existe pero se alcanza desde el chip de usuario en Hoy | Entrada de primer nivel. Requiere decidir el navigator (ver TD-048) |
| **DESCUBRIR** | ❌ No implementado | CASA absorbe hoy 9 capacidades en 4 grupos; `UniversalCreate` pone las acciones secundarias tras «Más» | Un destino propio. Requiere decidir el navigator (ver TD-048) |

**Razonamiento del límite:** rehacer la barra de pestañas es un cambio de producto que reasigna 42
pantallas. Se implementa la dirección (Hoy deja de ser un launcher, Casa pasa a ser hub, el `+` pasa a
ser creación universal) sin tocar el ecosistema de rutas. Queda registrado en TD-048.

---

## 2. Rutas afectadas

| Ruta | Cambio | Fichero |
|---|---|---|
| `UniversalCreate` | **Nueva** en el root stack | `src/presentation/create/screens/UniversalCreateScreen.tsx` |
| `QuickTaskCreate` | **Nueva** (admite `{ scope }` opcional) | `src/presentation/tasks/screens/QuickTaskCreateScreen.tsx` |
| `HouseholdHub` | Consumida (creada en el checkpoint anterior); ahora responde «¿hay algo pendiente en casa?» | `src/presentation/households/screens/HouseholdHubScreen.tsx` |
| `Dashboard` (Hoy) | Reescrita | `src/presentation/dashboard/screens/DashboardScreen.tsx` |
| `TasksList` (Tareas) | Reescrita + pull-to-refresh + responsable real | `src/presentation/tasks/screens/TasksListScreen.tsx` |
| `MainTabs` / `FloatingTabBar` | Botón central `+` (no pestaña) | `src/core/navigation/FloatingTabBar.tsx` |

Primitivas nuevas reutilizables: `Screen`, `ScreenHeader`, `SectionHeader`, `NavRow`, `TimelineRow`,
`QuickAction`, `TaskRow`, `Card` (tone).

---

## 3. Cadenas de navegación (extraídas del código, no de memoria)

```
Hoy        → Tarea             → TaskDetail    → back → Hoy
Hoy        → «En casa»: Abrir  → Casa          → back → Hoy
Hoy        → Próximo evento    → CalendarEventDetail → back → Hoy
Casa       → Inventario        → InventoryList → back → Casa
Casa       → Mascotas          → Pets          → back → Casa
Casa       → Gastos recurrentes → RecurringExpenses → back → Casa
+          → Tarea             → QuickTaskCreate → crear → back (goBack en onSuccess)
+          → Evento            → CalendarEventForm → back → (donde estuviera)
Tareas     → FAB               → QuickTaskCreate (con `scope` = filtro activo si no es «Todas»)
Tareas     → tarea             → TaskDetail    → back → Tareas
```

Detalle de contrato: el FAB de Tareas propaga el filtro
(`TasksListScreen.tsx:87` → `navigate('QuickTaskCreate', filter === 'ALL' ? undefined : { scope: filter })`),
y Quick Create lo usa como valor inicial (`scopeChoice ?? route.params?.scope`). No se inventa scope:
la ruta de hogar fuerza `scope: "HOUSEHOLD"` **en el servidor**.

---

## 4. Datos reales consumidos por superficie

| Superficie | Fuente real (contrato verificado) |
|---|---|
| **HOY** | `useDashboardSummary()` → `GET /dashboard/summary` (ADR-0020). Read-model `DashboardSummary`: `date`, `tasksToday: Task[]`, `eventsToday`, `openShoppingLists`, `recentExpenses`, `meowSummary`. Más `useHouseholds()` para el bloque «En casa» y `useAuthStore` para el saludo |
| **CASA** | `useHouseholds()` (nombre + `memberCount`), `HouseholdSelector` (hogar activo), `useHouseholdTasks({ status: 'PENDING', limit: 1 })` → `total` del `GET /households/:id/tasks`. **El `total` viene de `db.task.count({ where })` con `status` aplicado en el `where`, así que el número es exacto**; no se deriva de una página |
| **`+`** | Ninguno. Solo destino de navegación (por diseño: no inventa datos ni scope) |
| **TAREAS** | `useHouseholdTasks()` / `useTasksList()` según filtro; `useHouseholdMembers()` (TD-024) para resolver el **nombre** del responsable; `bucketTasks()` (helper puro) para hoy / atrasadas / sin fecha |
| **QUICK CREATE** | `useCreateTask()` (personal) o `useCreateHouseholdTask()` (hogar). El formulario avanzado reutiliza el `TaskForm` existente: **ningún campo nuevo, ninguno eliminado** |

---

## 5. Omitido por falta de contrato (y por qué)

| Omitido | Motivo |
|---|---|
| Recuento de tareas «**de hoy**» en CASA | El listado **no acepta filtro por `dueDate`** (validado en `taskValidators.ts`). Se muestra el total de pendientes, que sí es exacto, en vez de un «hoy» calculado sobre una página |
| Fecha/hora en la fila de tarea | `Task` **no tiene campo de hora**; solo `dueDate` (`YYYY-MM-DD`). Por eso «Hoy»/«Atrasada» es un badge, no un reloj: no se inventa una hora |
| Nombres de miembro al invitar a un Moment | El DTO de miembro no exponía nombre (resuelto después en backend; TD-024). En TAREAS sí se usa el nombre porque el resolutor ya existe |
| Voz / NLU en Meow | **ADR-0025 en revisión**. `POST /meow/ask` no se consume: solo hay una línea contextual (`meowSummary`) y un acceso al asistente |
| «TÚ» y «DESCUBRIR» | Decisión de navigator pendiente (TD-048) |
| Miembros / Configuración del hogar en CASA | No existen pantallas de miembros ni de configuración. El brief manda **no simular**: CASA enlaza solo a lo que existe |

---

## 6. Responsive y accesibilidad

- **Responsive:** `Screen` centraliza `SafeArea` + `maxWidth` para tablet/web; los layout de Hoy y
  Tareas usan `flex`/`gap`, no medidas de un iPhone concreto. Se verificó en runtime a **320 / 390 /
  430 px** de ancho.
- **Accesibilidad:** 39/39 controles interactivos con `accessibilityLabel`; `accessibilityRole`,
  `accessibilityState` (chips y scope), targets ≥ 48 px, y las píldoras de `TaskRow` no anidan controles
  dentro de la fila pulsable (el lector de pantalla no queda sombreado).
- **Contraste:** cada par nuevo se midió antes de fijarlo. TD-044 (cerrado) derivó la paleta oscura que
  faltaba; los pares `*Soft` como relleno pasan con `text` (medido, no estimado).

---

## 7. Puerta técnica

```
npm run verify
  lint      255 ficheros, sin avisos
  typecheck 0 errores
  test      110 ficheros / 819 tests
  VERIFY_EXIT=0
```

Guardas añadidas en esta fase: `tests/unit/theme/colors.test.ts` (contraste y paridad de paletas),
`tests/unit/brand/BrandLogo.test.tsx` (el wordmark vuelve solo en claro), y los tests de las
superficies nuevas (`DashboardScreen`, `TasksListScreen`, `QuickCreateTask`, `UniversalCreate`,
`HouseholdHubScreen`). Cada guarda se probó por mutación: rompiendo el código a propósito, la guarda
falla y el fichero se restaura.

---

## 8. Capturas de runtime

Ejecutadas sobre `expo start --web` real (instancia propia en `:8083`, sin tocar las de revisión) con
Chrome headless pilotado por CDP: **clics reales y escritura real**, no maquetas.

| Captura | Qué muestra |
|---|---|
| `/tmp/shots/06-valueprops-320.png` | Entrada única a 320 px |
| `/tmp/shots/06-valueprops-390.png` | Entrada única a 390 px |
| `/tmp/shots/06-valueprops-430.png` | Entrada única a 430 px |
| `/tmp/shots/07-start-light.png` | Salto al funnel de auth tras pulsar «Comenzar» |

Se verificó además, sobre el bundle que sirve el navegador (8,17 MB), que **el código en ejecución es
el nuevo**: `hoy-day-summary`, `casa-context`, `universal-create-screen`, `quick-task-screen`,
`quick-task-title`, `tasks-scroll`, `tasks-fab` aparecen en el bundle servido.

**Pendiente de sesión:** las 4 superficies autenticadas (Hoy, Casa, `+`, Tareas y Quick Create) no se
pudieron capturar porque no hay sesión válida — la credencial de desarrollo documentada
(`testuser@example.com`) ya no existe en la base de datos (401). El backend está vivo en `:3000` y es
`mola_dev` (Postgres local, `NODE_ENV=development`), con registro en `/auth/register`. En cuanto haya
sesión, la captura de esas 5 pantallas es un solo comando con el mismo piloto.
