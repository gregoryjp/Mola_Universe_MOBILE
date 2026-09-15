# Mola-Mobile-Universe Setup

## Estructura del Proyecto

```
src/
├── api/              # Módulos de API (auth, tasks, shopping, expenses, households)
├── screens/          # Pantallas principales (Login, Dashboard, Tasks, Shopping, Expenses)
├── stores/           # Zustand stores (authStore)
├── types/            # Definiciones de tipos (entities)
└── App.tsx          # App principal con navegación
```

## Dependencias Principales

- **React Native + Expo 57**
- **@react-navigation** — Navegación nativa
- **Zustand** — State management
- **Axios** — HTTP client
- **@tanstack/react-query** — Data fetching (opcional para upgrade futuro)

## Variables de Entorno

`.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Cómo ejecutar

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npm run start
   ```

3. **Ejecutar en dispositivo/emulador**
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Componentes Principales

### API Modules (`src/api/`)
- **auth.ts** — login, register, refreshToken, logout
- **households.ts** — gestión de hogares
- **tasks.ts** — tareas personales y de hogar
- **shopping.ts** — listas de compras
- **expenses.ts** — gastos del hogar
- **client.ts** — configuración de axios con interceptores de auth

### Screens (`src/screens/`)
- **LoginScreen** — Autenticación
- **HouseholdDashboardScreen** — Lista de hogares
- **TasksScreen** — Tareas pendientes
- **ShoppingScreen** — Listas de compras
- **ExpensesScreen** — Gastos del hogar

### State Management (`src/stores/`)
- **authStore.ts** — Estado global de autenticación con Zustand

## Arquitectura

- **API-First**: Toda la comunicación con el backend va a través de funciones tipadas en `src/api/`
- **Separación de concerns**: API, screens, stores, y types están separados
- **Types sincronizados**: Los tipos de `src/types/entities.ts` coinciden con el backend OpenAPI
- **Auth interceptor**: Axios está configurado para inyectar el token JWT en todas las requests

## Siguiente Fase

1. ✅ Estructura base funcional
2. Estilización y diseño (CSS Modules / StyleSheet tokens)
3. Validación de formularios
4. Tests E2E
5. Optimización de rendering
