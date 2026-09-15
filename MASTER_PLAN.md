# Plan Maestro V1: Mola-Mobile-Universe

## Alineación Backend → Mobile

Este documento contiene el Plan Maestro V1 ejecutado de manera autonoma. El mobile debe estar completamente alineado con la certificación del backend.

### Estado Actual

- **Backend:** Preparándose para B0 (Gobierno y baseline)
- **Mobile:** Reorganizándose a arquitectura M1 (Foundation)
- **Contracts:** Compartidos entre Backend y Mobile vía `packages/contracts`

### Arquitectura Mobile (M1)

```
apps/mobile/
├── app/                        # Expo Router pages
├── src/
│   ├── modules/
│   │   ├── auth/              # Auth slice
│   │   ├── users/             # Users/Profile slice
│   │   ├── privacy/           # Privacy slice
│   │   ├── households/        # Households slice
│   │   ├── billing/           # Billing slice
│   │   ├── storage/           # Storage slice
│   │   ├── tasks/             # Tasks slice
│   │   ├── shopping/          # Shopping slice
│   │   ├── inventory/         # Inventory slice
│   │   ├── expenses/          # Expenses slice
│   │   ├── savings/           # Savings slice
│   │   ├── calendar/          # Calendar slice
│   │   ├── notifications/     # Notifications slice
│   │   ├── pets/              # Pets slice
│   │   ├── dashboard/         # Dashboard slice
│   │   ├── meow/              # Meow slice
│   │   └── sos/               # SOS slice
│   └── shared/
│       ├── api/               # ApiClient y endpoints
│       ├── auth/              # SecureSessionStore
│       ├── config/            # Configuración por ambiente
│       ├── providers/         # QueryClientProvider, etc
│       ├── ui/                # Componentes compartidos
│       └── testing/           # MSW, fixtures, mocks
├── e2e/                        # Tests Maestro
└── eas.json                    # Configuración EAS

packages/
└── contracts/                  # Types compartidos Backend↔Mobile
```

### Orden de Implementación (M2)

1. **Auth** — Login, register, OTP, session management
2. **Users/Profile** — Edición y preferencias
3. **Privacy** — Consentimientos y derechos
4. **Households** — Crear, seleccionar, invitar
5. **Billing** — Paywall y compras in-app
6. **Storage** — Upload y gestión de archivos
7. **Tasks** — Crear, asignar, completar
8. **Shopping** — Listas y items
9. **Inventory** — Movimientos y cantidades
10. **Expenses** — Gastos compartidos
11. **Savings** — Metas de ahorro
12. **Calendar** — Eventos y calendario
13. **Notifications** — Inbox y push
14. **Pets** — Perfil de mascotas
15. **Dashboard** — Vista agregada
16. **Meow** — Asistente IA
17. **SOS** — Contacto de emergencia

### Decisiones Arquitectónicas

- ✅ Express + Prisma 5 + JWT backend
- ✅ Expo 57 + Expo Router mobile
- ✅ TypeBox para contratos HTTP
- ✅ TanStack Query para servidor (no Zustand)
- ✅ Zustand solo para estado local transversal
- ✅ `expo-secure-store` para refresh tokens
- ✅ Ports/Adapters para SDKs nativos
- ✅ MSW para mocking en tests
- ✅ Maestro para E2E

### Gates de Certificación

**Backend → Mobile:**
- 17/17 bloques CERTIFIED
- OpenAPI 100% sync
- Cero Critical/High vulnerabilidades
- Staging TLS en UE operativo
- Tests coverage ≥80%

**Mobile → Release:**
- Contracts sincronizados con Backend
- Journeys completos para 17 bloques
- WCAG 2.2 AA
- Tests ≥75% coverage
- Builds TestFlight/Google Play
- Crash-free sessions ≥99,5%

### Responsabilidades

- Backend: Autorización, validación, persistencia
- Mobile: UX, offline-stale, deep links, push
- Compartido: Contratos tipados en `packages/contracts`

---

**Estado:** 🔄 En reorganización
**Siguiente:** Restructurar M1 foundation
