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

---

## 5. Estado del dark mode

| Plataforma | Estado |
|---|---|
| iOS | **Activo** — `userInterfaceStyle: "automatic"`, sin dependencias extra |
| Android | **Activo** — requiere `expo-system-ui`, ya instalado |
| Web | Activo desde el principio (responde a `prefers-color-scheme`) |

---

## 6. Verificación

- `npm run verify` → **verde**: lint 183 ficheros, `tsc --noEmit` limpio, 49 ficheros / 281 tests.
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
- Análisis de la máscara circular sobre `ic_launcher_foreground.webp` (GAP 12).

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

### GAP 12 — La marca es ancha y la máscara del icono adaptativo es circular

Hallazgo nuevo, aparecido al auditar el foreground generado. El icono adaptativo se
escaló al **66% del ancho del lienzo**, que es correcto para un cuadrado, pero **el
viewport visible de Android es un círculo** (72dp de 108dp), y la marca tiene aspecto
**1.63:1**. Consecuencia, medida sobre `ic_launcher_foreground.webp` (432×432, marca
286×176, semidiagonal 168px):

| Zona | Radio | Marca recortada |
|---|---|---|
| viewport de máscara (72/108) | 144px | **5.06%** |
| safe zone (66/108) | 132px | **12.11%** |

Para que la marca quepa entera habría que bajarla al **56.8%** del ancho (viewport) o al
**52.0%** (safe zone), con lo que el icono se vería más pequeño. Es inherente: una marca
ancha no puede llenar una máscara redonda.

No se ha cambiado: los launchers con máscara *squircle* o cuadrado redondeado recortan
bastante menos que el círculo, así que el 66% no es necesariamente un error. Requiere
decisión (ver sección 8).

### GAP 10 — `tintColor` no es fiable en react-native-web

No es solo un problema de la provisional: si alguna vez se quiere tintar una imagen al
cambiar de tema, en web **no funciona** en el cambio en caliente. Documentado en el commit
`068147d`.

### GAP 11 — El wordmark sigue necesitando su variante clara

`brand/logo-primary-light.svg` no ha llegado todavía. Cuando llegue: sustituir el
intercambio por asset de `068147d` por el asset real, y quitar el `useIsDarkScheme` de
`BrandLogo` si ya no hace falta. El resto de la app no cambia.

---

## 8. Próximo paso

1. **Pedir `logo-primary-light.svg`** (APP, lo está haciendo Claude). Al llegar, sustituye
   la provisional de `068147d`.
2. **Decidir el GAP 12**: si la marca se baja al 56.8% del ancho para que la máscara
   circular no le coma el 5.06% de las puntas, o se deja al 66% asumiendo que la mayoría de
   launchers usan squircle. Es una línea en el generador de `assets/adaptive-icon.png`.
3. **Build nativa** para ver icono y splash de verdad (requiere macOS para iOS).
4. Reiniciar los dos servidores de Metro que siguen vivos y obsoletos (8081 y 8082, de hace
   ~6 h): `Ctrl+C` y `npx expo start --clear`.
5. Decidir los GAP 1, 3, 4, 5 y 6 del informe anterior (paleta y contraste del design
   system, que siguen abiertos).
6. Decidir el destino del cambio de CORS en APP.
