# Design System v2 — Iconos, splash y dark mode

Fecha: 2026-09-17
Rama: `ai/night-mobile-2026-09-17`
Precede: `logs/mobile-design-applied-2026-09-17.md`

Continúa el trabajo anterior cerrando el GAP 8 (configuración nativa) y añadiendo el
wordmark provisional en dark mode. Cinco commits:

| Commit | Qué |
|---|---|
| `1dbc4c1` | `feat(deps): add expo-system-ui for dark mode on Android` |
| `3813936` | `feat(splash): configure splash screen with MOLA icon` |
| `cf1343b` | `feat(icon): apply MOLA icon as app icon` |
| `068147d` | `fix(brand): keep the brand mark legible on the dark scheme` |
| `b0bc85e` | `fix(icon): flatten the app icon onto the dark background token` |
| (previo) `53af662` | `chore(permissions): allow assets and app.json edits` |

---

## 1. Dependencias instaladas

| Paquete | Versión | Motivo |
|---|---|---|
| `expo-system-ui` | 57.0.4 | La referencia de SDK 57 dice que `userInterfaceStyle: "automatic"` **requiere** este paquete para funcionar en Android. Sin él, el dark mode solo se activaba en iOS y web. |
| `expo-splash-screen` | 57.0.9 | El splash nativo. La clave raíz `splash` está obsoleta en SDK 57; el camino documentado es el config plugin. |

---

## 2. Splash (commit `3813936`)

Configurado en `app.json` vía el plugin:

```json
["expo-splash-screen", {
  "image": "./assets/splash.png",
  "imageWidth": 200,
  "resizeMode": "contain",
  "backgroundColor": "#F7F7F5",
  "dark": { "image": "./assets/splash.png", "backgroundColor": "#0F1419" }
}]
```

Los dos colores de fondo son tokens reales (`colors.md` → `background` light y dark).

**Desviación consciente:** se usa la **misma imagen** para light y dark, en vez de generar
un `splash-dark.png` aparte. La marca es un degradado sobre transparencia que se lee bien
sobre ambos fondos, así que un segundo PNG idéntico solo duplicaría un asset, cosa que
`design/README.md` prohíbe expresamente.

### Verificado ejecutando el plugin de verdad

`expo config` solo resuelve la lista de plugins; para probar que el plugin **escribe** lo
correcto hay que ejecutar los mods. Se hizo con:

```
npx expo prebuild --platform android --no-install
```

y se auditó el proyecto nativo generado (luego eliminado, está en `.gitignore`):

- `drawable-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/splashscreen_logo.png` — variante clara.
- `drawable-night-{mdpi..xxxhdpi}/splashscreen_logo.png` — **la variante oscura existe**.
- `values/colors.xml`: `splashscreen_background = #F7F7F5`.
- `values-night/colors.xml`: `splashscreen_background = #0F1419`.
- `values/styles.xml`: `windowSplashScreenAnimatedIcon → @drawable/splashscreen_logo`.
- El logo a xxxhdpi sale 1152×1152 con la marca en 614×377 → diagonal 721 < 1152, así que
  **la máscara circular de Android 12+ no la recorta**.

---

## 3. Icono de app (commit `cf1343b`)

| Fichero | Contenido |
|---|---|
| `assets/icon.png` | 1024×1024, la marca al 80% sobre **`#0F1419` opaco** (`RGB`, sin alfa) |
| `assets/adaptive-icon.png` | 1024×1024, la marca al **66%**, fondo transparente (el color lo pone `app.json`) |

La marca se escaló desde su **caja de contenido medida** (784×480 dentro del PNG de 1024),
no desde el lienzo bruto, para que los porcentajes describan lo que se ve.

**Desviación consciente:** `icon.png` no es una copia literal de `logo-icon-1024.png`. Ese
PNG tiene transparencia y la guía de iconos de Apple exige un icono opaco, así que se
aplanó sobre el color de fondo. Primero se usó `#2E7D5F` (el que se había pedido) y después
se cambió a `#0F1419` al resolver el GAP 9 — ver la sección 3.1.

**No hecho:** `monochromeImage` se eliminó (el snippet no lo incluía), así que los iconos
temáticos de Android 13+ vuelven al tratamiento por defecto. Y `assets/android-icon-*.png`
quedan sin referenciar.

Verificado con `prebuild`: `mipmap-anydpi-v26/ic_launcher.xml` y `ic_launcher_round.xml`
referencian `<background android:drawable="@color/iconBackground"/>` = `#0F1419` y
`<foreground android:drawable="@mipmap/ic_launcher_foreground"/>`.

### 3.1 GAP 9 resuelto — el fondo del icono (commit `b0bc85e`)

`#2E7D5F` no existe en `colors.md` y dejaba la banda violeta de la marca en **1.08:1**, así
que desaparecía medio degradado. Cambiado a **`#0F1419`**, que sí es token (`background`
dark) y sube la peor banda a **4.00:1**:

| Banda | Sobre `#2E7D5F` | Sobre `#0F1419` |
|---|---|---|
| rosa `#FFC4DF` | 3.37:1 | 12.53:1 |
| violeta `#7357FF` | **1.08:1** | 4.00:1 |
| azul `#397CFF` | 1.31:1 | 4.85:1 |
| menta `#BFFFD8` | 4.39:1 | 16.32:1 |

Se cambió **también** `assets/icon.png`, no solo el token de Android: si solo se cambiara el
adaptativo, iOS (que lee el PNG directamente) y Android (que lee el token) divergirían.

El PNG se regeneró con el **procedimiento idéntico**, verificado byte a byte: la
reconstrucción sobre `#2E7D5F` coincide con el commit anterior y la reconstrucción sobre
`#0F1419` coincide con el nuevo, ambas con **0 píxeles distintos**. Tamaño, modo, escala
(80%) y la marca en sí no cambian: **0 de los píxeles opacos de la marca difieren**; solo
cambian los 870240 píxeles de fondo y el borde con alfa parcial. Sigue siendo `RGB` opaco.

**Confirmado en el árbol nativo** (`prebuild` + inspección, no inferencia): `values/colors.xml`
→ `iconBackground #0F1419`; `values-night/colors.xml` → `splashscreen_background #0F1419`
(la misma clave que el modo claro, sin override de icono, que es lo correcto: el fondo del
icono adaptativo es un solo color para los dos esquemas); `styles.xml` →
`windowSplashScreenAnimatedIcon` sigue apuntando a `@drawable/splashscreen_logo` y
`windowSplashScreenBackground` a `@color/splashscreen_background`. Los dos `ic_launcher*.xml`
de `mipmap-anydpi-v26/` son los **únicos** consumidores de `iconBackground`. Cero ficheros con
`2E7D5F` en todo `android/`. Es decir: **el cambio de color no puede tocar el splash** — van
por claves distintas — y el foreground del icono (`ic_launcher_foreground.webp`) no se
modificó, que es justamente lo que deja vivo el GAP 12.

---

## 4. Wordmark provisional en dark mode (commit `068147d`)

Ver GAP 9 y GAP 10 abajo. Resumen: el wordmark se veía invisible en dark mode (2.94:1 de
media, 80.4% de sus píxeles por debajo de 3:1), así que en dark se renderiza
`logo-icon.svg` en su lugar. Medido en el navegador con capturas reales del logo:

| Modo | Asset | Tamaño | Tinta media | Contraste |
|---|---|---|---|---|
| Light | wordmark | 200×46 | `#38393B` | **10.78:1** |
| Dark | `logo-icon` | 88×88 | `#BCCAF4` | **11.37:1** |

El cambio funciona en ambos sentidos (`light → dark → light` vuelve al wordmark).

**Se intentó primero el `tintColor`** a `theme.text`, que es más fiel a la marca, y se
descartó con medición: react-native-web construye el tint como un filtro SVG **solo al
montar**, y al cambiar el esquema en caliente la marca quedaba sin tintar (tinta
`#757472`, 20.8% de cobertura frente al 56.5% tintada). Forzar el remontaje con un `key`
**tampoco** lo arregló — se comprobó que el `key` sí estaba en el bundle servido.

`useTheme` ahora delega en un hook `useIsDarkScheme`, para que el esquema se resuelva en un
solo sitio.

**Comprobación de que TD-044 no lo afecta** (2026-09-18). TD-044 reescribió la paleta
(`src/core/theme/colors.ts`) y `Card`, `Badge`, `Chip`, `TaskRow` y el Dashboard, pero **no
tocó** `BrandLogo.tsx`, `src/shared/assets/brand/`, ni `useTheme.ts`. La razón es estructural:
la rama lee `useColorScheme() === 'dark'` y los assets estáticos, no ningún token de color —
el wordmark no consulta la paleta. Y ahora hay un guard que lo fija:
`tests/unit/brand/BrandLogo.test.tsx` (light → `logo-primary`, dark → `logo-icon` cuadrado y
nunca el wordmark, vuelta a light, más la geometría de los PNG en disco). Verificado por
mutación. La comprobación nativa sigue en la lista de **PENDING DEVICE VALIDATION**.

---

## 5. Estado del dark mode

| Plataforma | Estado |
|---|---|
| iOS | **Activo** — `userInterfaceStyle: "automatic"`, sin dependencias extra |
| Android | **Activo** — requiere `expo-system-ui`, ya instalado |
| Web | Activo desde el principio (responde a `prefers-color-scheme`) |

---

## 6. Verificación

- `npm run verify` → **verde**: `biome check` 248 ficheros, `tsc --noEmit` con **0 errores**,
  **100 ficheros / 733 tests** pasando (línea base al cerrar TD-044 y TD-045; eran 49/281 al
  escribir la primera versión de este informe).
- `npx expo config --type public` → `userInterfaceStyle: automatic`, plugin del splash y
  `adaptiveIcon` resueltos, y los tres ficheros referenciados existen.
- `npx expo prebuild --platform android --no-install` + auditoría de los recursos generados
  (sección 2 y 3).
- Navegador real (Chrome headless + CDP) contra un servidor limpio en 8083: capturas del
  logo en light/dark y análisis de píxeles. El ciclo `light → dark → light` devuelve el
  wordmark en light (sección 4).
- Regeneración de `assets/icon.png` verificada **byte a byte** contra el procedimiento en
  ambos colores (0 píxeles distintos en los dos casos) y de forma independiente del
  umbral: 0 diferencias en la zona opaca de la marca (sección 3.1).
- Barrido a nivel de píxel de los 13 PNG de `assets/` y `src/shared/assets/`: **ninguno**
  contiene `#2E7D5F`.
- Análisis de la máscara circular sobre `ic_launcher_foreground.webp` (GAP 12 / TD-045).
- `prebuild` + auditoría del árbol nativo tras el cambio de color: `values/colors.xml` con
  `iconBackground #0F1419`, `values-night/colors.xml` con `splashscreen_background #0F1419`
  sin tocar, `windowSplashScreenAnimatedIcon` apuntando a `@drawable/splashscreen_logo`, y
  **0 ficheros** con `2E7D5F` en todo `android/`.
- Guardas de test nuevas: `tests/unit/theme/colors.test.ts` (paridad de tokens entre claro y
  oscuro por tipo + contraste de los pares `tone`×`text` en las dos paletas) y
  `tests/unit/brand/BrandLogo.test.tsx` (el wordmark vuelve en light, el símbolo cuadrado en
  dark, y los PNG de marca en disco conservan su geometría). Ambas verificadas por mutación:
  se reintrodujo el defecto y las dos fallan.

### Lo que NO se puede verificar aquí

El entorno es **Linux sin Xcode, sin `adb` y sin Android SDK**, así que **no hay simulador**:
no he podido ver el icono en la home screen ni el splash al abrir la app. Además, los docs
de SDK 57 advierten que **Expo Go y los development builds no reproducen el splash**:
*"Expo Go will show your app icon instead of the splash screen, and the splash screen on
development builds will not reflect all properties set in the config plugin. It is highly
recommended that you test your splash screen on a release build."*

O sea: para ver el icono y el splash hacen falta `npx expo prebuild` + una **build nativa**
(`npx expo run:ios` / `run:android`, o EAS). `expo start` no basta. El dark mode sí se puede
ver en Expo Go.

### PENDING DEVICE VALIDATION (lista cerrada, no declarar hecho sin hardware)

| Qué | Se comprueba | Por qué no se cierra aquí |
|---|---|---|
| **GAP 12 / TD-045** | el icono con máscara **circle**, **squircle** y **rounded square** | El recorte del círculo está medido (17.55% en safe zone), pero cuánto importa depende del launcher |
| **Brand light/dark** | el wordmark en light y el símbolo en dark, en una build nativa | El guard de test cubre la rama, no el render nativo |
| **TD-043** | teclado iOS, teclado Android y viewport pequeño en las pantallas de Auth | Sin simulador no hay teclado ni safe area reales |
| **Tasks** | comportamiento táctil del pull-to-refresh | Se prueba la estructura, no la física del gesto |
| **Tasks assignee** | nombre y avatar de un miembro real de `/households/{id}/members` | **PENDING REAL-DATA VALIDATION**: hoy el cableado está testeado con mocks, no con datos reales de un hogar |

### Efectos colaterales de `prebuild`, revisados

- Cambió `scripts.android/ios` de `expo start --*` a `expo run:*`. **Lo reverti**: es un
  cambio de flujo de trabajo que no pediste. Si vas a hacer builds nativas, esas dos líneas
  son lo que quieres (y es lo que hace falta para ver icono y splash).
- Añadió `android.package: "com.gregory222.Mola_Universe_MOBILE"` a `app.json`. **Lo dejé**:
  es necesario para cualquier build nativa y es inocuo.
- Creó `android/`, que **se eliminó** después. `/ios` y `/android` están en `.gitignore`.

---

## 7. Gaps

### GAP 9 — `#2E7D5F` no es token y deja medio icono ilegible — RESUELTO

Resuelto en `b0bc85e` (ver sección 3.1). Se deja aquí el registro de la medición.

El fondo del icono adaptativo indicado no existe en `colors.md` (los menta del sistema
son `primary #6BC5A8` y `primaryDark #4FA88C`). Y medido, el problema era peor que el
color: el degradado de la marca va de rosa claro a menta claro, así que **sobre un fondo
oscuro saturado se pierden las bandas violeta y azul**.

| Fondo | Origen | Peor banda del degradado |
|---|---|---|
| **`#2E7D5F`** | el indicado | **1.08:1** (violeta `#7357FF`) — invisible |
| `#4FA88C` | `primaryDark` (token) | 1.33:1 |
| `#6BC5A8` | `primary` (token) | 1.40:1 |
| **`#0F1419`** | `background` dark (token) | **4.00:1** ← adoptado |
| `#1A1A1A` | `text` light (token) | 3.76:1 |
| `#FFFFFF` | `surface` light (token) | 1.13:1 (se pierde la menta) |

### GAP 10 — `tintColor` no es fiable en react-native-web

No es solo un problema de la provisional: si alguna vez se quiere tintar una imagen al
cambiar de tema, en web **no funciona** en el cambio en caliente. Documentado en el commit
`068147d`.

### GAP 11 — El wordmark sigue necesitando su variante clara

`brand/logo-primary-light.svg` no ha llegado todavía. Cuando llegue: sustituir el
intercambio por asset de `068147d` por el asset real, y quitar el `useIsDarkScheme` de
`BrandLogo` si ya no hace falta. El resto de la app no cambia.

### GAP 12 — La marca es ancha y la máscara del icono adaptativo es circular

Registrado como **TD-045**. Dos correcciones sobre el hallazgo original, ambas medidas.

**Corrección 1 — qué marca es.** El icono no contiene el wordmark: contiene el **símbolo** (el
arco sonriente de `design/brand/logo-icon.svg`, un único `path` sobre un viewBox de 128), que
mide 1.63:1 por geometría propia. No hay wordmark que comprimir ni composición que rehacer:
el problema es enteramente de escala.

**Corrección 2 — la métrica.** El número anterior (5.06% / 12.11%) se calculó sobre el `.webp`
de 432px y midiendo el recorte sobre el ancho. Para una máscara circular lo que cuenta es el
punto de tinta **más lejano del centro del lienzo**, comparado con el radio del círculo. Con
la definición de Android (máscara 72dp sobre una capa de 108dp; safe zone garantizada 66dp):

| Círculo | Radio, en % del semi-lado |
|---|---|
| Viewport de máscara (72/108) | **66.67%** |
| Safe zone garantizada (66/108) | **61.11%** |

Medido sobre el asset que `app.json` cablea (`assets/adaptive-icon.png`, 1024², tinta 676×414,
bbox centrado en `511.5, 511.5`, radio de tinta **74.12%**):

| Zona | Recorte | Escala necesaria |
|---|---|---|
| Viewport de máscara (72/108) | **10.05%** | 90.0% |
| Safe zone (66/108) | **17.55%** | **82.5%** |

**`prebuild` no lo arregla, y esto es lo importante.** El `ic_launcher_foreground.webp` que
genera (162², hdpi) mide 108×66 en su capa — el mismo 1.63:1 y el mismo 74.12% que el fuente.
Es decir, expo mapea el lienzo del asset a la capa completa de 108dp **sin aplicar ningún
inset de safe zone**. No hay bandera de `app.json` que lo haga: el asset tiene que llegar ya
encajado.

**El asset adecuado no existe.** El único que cabe en el círculo es
`assets/android-icon-foreground.png` (radio 54.12%), pero es **otra marca** —perfil de tinta
1/3 y orientación invertida, no el arco sonriente— y no lo referencia `app.json`, `src/` ni
`tests/`. `logo-icon-1024.png` sí es la marca correcta, pero se sale aún más (82.14%).

**El encargo, en medidas**, sobre un lienzo de 1024²:

1. Fuente: `design/brand/logo-icon.svg`, **sin redibujar** (es un vector real: re-export, no
   pieza nueva).
2. Radio de tinta **≤ 55% del semi-lado**. Equivale a **ancho de tinta ≤ 565px** para tocar
   justo la safe zone, y **≈508px (49.6% del lienzo)** para dejar el margen que ya tiene el
   asset del repo que sí cabe.
3. Centrado por el **círculo envolvente mínimo**, no por el bbox.
4. Sin deformar: la proporción 1.63:1 se mantiene. Se reduce, no se comprime.
5. Solo afecta a `assets/adaptive-icon.png`. **`assets/icon.png` (iOS/web) no cambia**: la
   máscara de iOS es un cuadrado redondeado, así que una marca ancha no se recorta en las
   puntas. Encogerla para que quepa en un círculo que iOS no dibuja empeoraría el icono.

Hueco adicional: `app.json` **no** define `android.adaptiveIcon.monochromeImage`, así que los
**iconos tematizados de Android 13+ no están soportados**. La `android-icon-monochrome.png` que
hay en `assets/` no sirve: es la marca vieja.

**No se ha cambiado nada**, a propósito: un radio medido demuestra el defecto, pero «cuánto
espacio muerto es aceptable alrededor del símbolo dentro de un círculo» es criterio de diseño,
y la mayoría de launchers actuales usan *squircle*, que recorta bastante menos que un círculo.
**PENDING DEVICE VALIDATION** con la máscara *circle*, *squircle* y *rounded square*.

---

## 8. Próximo paso

1. **Pedir `logo-primary-light.svg`** (APP, lo está haciendo Claude). Al llegar, sustituye
   la provisional de `068147d`.
2. **Encargar el asset de `assets/adaptive-icon.png`** (TD-045). No es una decisión abierta:
   es un re-export medido de `design/brand/logo-icon.svg`, sin redibujar, con el símbolo
   centrado por su círculo envolvente mínimo y un radio de tinta **≤ 55% del semi-lado**
   (ancho de tinta ≤ 565px sobre 1024 para tocar justo la safe zone; ≈508px para dejar
   margen). `assets/icon.png` (iOS) **no** se toca. Requiere herramienta de diseño: en el
   repo no hay ningún generador de assets, los PNG llegan ya hechos.
3. **Build nativa** para ver icono y splash de verdad (requiere macOS para iOS). Al mirar el
   icono, comprobar la máscara **circle**, **squircle** y **rounded square**.
4. Reiniciar los dos servidores de Metro que siguen vivos y obsoletos (8081 y 8082, de hace
   ~6 h): `Ctrl+C` y `npx expo start --clear`.
5. Decidir los GAP 1, 3, 4, 5 y 6 del informe anterior (paleta y contraste del design
   system, que siguen abiertos).
6. Decidir el destino del cambio de CORS en APP.
