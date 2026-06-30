# Plan de trabajo — Carpool UTEC (Mobile) · Proyecto 2 Frontend

> App móvil nativa **React Native / Expo / TypeScript** para carpool universitario UTEC.
> Alcance de este plan: **solo frontend mobile** (visual, navegación, interacción). No se
> cambia lógica de backend, endpoints, modelos, DTOs ni servicios principales. Comportamiento
> no soportado por el backend se simula con **estado local / mock**, sin romper la integración.

---

## 1. Resumen de lo entendido

- **Regla de producto central:** sin vehículo = solo pasajero · con vehículo = pasajero + conductor.
  El modo conductor se **bloquea visualmente** (candado) si no hay vehículo; desde Perfil se activa
  registrando vehículo.
- **Estilo a respetar:** header azul oscuro, fondo gris claro, cards blancas redondeadas,
  acento celeste/turquesa, botones grandes, tipografía fuerte, mobile-first.
- **Doble objetivo:** (a) cumplir el flujo/UX del enunciado y (b) maximizar la **rúbrica del
  Proyecto 2**, trabajando de menor a mayor consumo/riesgo.

---

## 2. Rúbrica del Proyecto 2 (Fase 2) — 20 pts · criterios y puntaje máximo (Excelente)

### Mobile (foco de este plan)
| # | Criterio | Máx. | Qué evalúa (resumen) |
|---|----------|------|----------------------|
| 2.1 | Integración con Backend y Consumo de API | **1.5** | Consume solo el backend; GET/POST/PUT/DELETE/PATCH; **JWT en SecureStore**; headers (Authorization, Content-Type); **interceptores**; sin datos en memoria. |
| 2.2 | Arquitectura y Separación de Responsabilidades | **1.0** | Capas: services/API (axios baseURL+interceptors), lógica (**custom hooks**, **Context API**), UI; carpetas `screens/components/services/hooks/contexts/utils`; nombres en inglés. |
| 2.3 | Sensores y APIs Externas | **1.5** | **≥2 sensores** (cámara/QR, GPS, etc. con `expo-camera`/`expo-location`) + **≥1 API externa** (mapas/clima); **permisos** con mensajes claros; **fallbacks**. |
| 2.4 | Manejo de Errores y Estados de Carga | **1.0** | try-catch en todas las llamadas; loading (spinners/skeletons); errores red/timeout/4xx/5xx; **retry**; feedback de éxito (toasts/confirmaciones); validación; casos edge (listas vacías, sin conexión). |

### Transversales
| # | Criterio | Máx. |
|---|----------|------|
| 1 | Exposición del Proyecto (Individual) | **5.0** |
| 5 | Deployment (stack completo, mobile vía Expo) | ~**2.5** |

### Web (OTRO repo — fuera del alcance de este plan mobile)
3.1 Integración API (2) · 3.2 Componentes React (1) · 3.3 Routing (1) · 3.4 Errores/Validaciones (1) ·
4.1 Diseño Visual (1) · 4.2 Experiencia (0.5) · 4.3 Vistas/Funcionalidades (0.5) · 4.4 Paginación (0.5).

---

## 3. Fase 0 — Inspección mínima (sin modificar código)

**Estructura ya mapeada:**
- **Navegación:** `src/navigation/AppNavigator.tsx` — único `NativeStack` con grupos condicionales:
  `!isAuthenticated` (Welcome/Login/Register) → `pendingVehicleSetup` (SetupVehicle/Vehicle) →
  principal (Home, SearchTrips, TripDetail, PublishTrip, MyRequests, DriverPanel, Vehicle, Profile,
  Review, ConfirmedTrip). Sin bottom-tabs.
- **Pantallas:** `src/screens/*` (13).
- **Modo pasajero/conductor:** `src/contexts/AuthContext.tsx` → `mode: 'passenger'|'driver'`
  persistido en SecureStore + `pendingVehicleSetup`; gate por vehículo en Home y Profile.
- **Estado mock de usuario/vehículo:** no hay mock; todo via services reales + hooks
  (`useAuth/useVehicles/usePublications/useRequests/useRides`). Datos que el backend no expone
  (aporte, #reseñas, estado de vehículo) se muestran como texto/mock visual.
- **Riesgo:** nulo · **Consumo:** bajo · **Estado:** ✅ hecho.

---

## 4. Plan por fases

> **Estado:** ✅ implementado en iteraciones previas · ⬜ pendiente/recomendado.

### Fase 1 — Bajo consumo / alto impacto · ✅
- **Objetivo:** microcopy, badges, lock visual de conductor, limpieza de Perfil, avatar en Inicio.
- **Archivos:** `ProfileScreen`, `HomeScreen`, `StatusBadge`, `TripCard`, `TripDetailScreen`.
- **Pantallas:** Inicio, Perfil, Detalle, cards.
- **Riesgo:** bajo · **Consumo:** bajo.
- **Resultado:** candado en conductor sin vehículo; Perfil con "Cuenta UTEC verificada",
  "Modo disponible", teléfono enmascarado; avatar (iniciales) → Perfil; labels Conductor/Pasajero.
- **Rúbrica:** 2.4 (feedback/estados visuales), base de 2.2 (consistencia).

### Fase 2 — Onboarding, Perfil y Vehículos · ✅
- **Objetivo:** flujo registro→vehículo, perfil avanzado, CRUD visual de vehículos.
- **Archivos:** `SetupVehicleScreen`, `ProfileScreen`, `VehicleScreen`, `VehicleCard`, `EmptyState`.
- **Pantallas:** Bienvenida/onboarding, Perfil, Mis vehículos.
- **Riesgo:** medio · **Consumo:** medio.
- **Resultado:** "Registrar vehículo / Continuar como pasajero"; empty state con CTA; badge "Principal";
  bloqueo de borrado si el vehículo tiene viajes; resumen de vehículo en Perfil.
- **Rúbrica:** 2.4 (empty states, confirmaciones), 10/11 del enunciado.

### Fase 3 — Pantallas principales · ✅
- **Objetivo:** Inicio por modo, Publicar (Ofrezco/Busco), Buscar (filtros+búsqueda), Detalle (CTA+confianza),
  Mis solicitudes (tabs), Panel conductor (grupos + modal aceptar con cupos).
- **Archivos:** `HomeScreen`, `PublishTripScreen`, `SearchTripsScreen`, `TripDetailScreen`,
  `MyRequestsScreen`, `DriverPanelScreen`, `TripCard`, `RequestCard`, `DriverRequestCard`.
- **Pantallas:** las 6 principales.
- **Riesgo:** medio-alto · **Consumo:** alto.
- **Resultado:** bloqueo de publicar como conductor sin vehículo; botón dinámico
  (Publicar viaje/solicitud); selector de cupos ≤ asientos; tabs de estado; modal de aceptación.
- **Rúbrica:** 2.4 (validaciones, casos edge), 2.2 (componentes reutilizables), enunciado 1/3/4/5/6/7.

### Fase 4 — Operación del viaje · ✅
- **Objetivo:** pantalla "Viaje confirmado" + Calificar mejorado.
- **Archivos:** `ConfirmedTripScreen` (nueva), `ReviewScreen`, `AppNavigator`, `HomeScreen`.
- **Pantallas:** Viaje confirmado, Calificar.
- **Riesgo:** alto · **Consumo:** alto.
- **Resultado:** ruta/vehículo/pasajeros; **Abrir mapa real** (`Linking`); chat/cancelar/completar como
  placeholder; estrellas inician vacías, botón deshabilitado, chips, contador 0/500, confirmación.
- **Rúbrica:** 2.3 (API externa de mapas vía Linking — parcial), 2.4 (feedback), enunciado 8/9.

### Fase 5 — Pulido · ✅
- **Objetivo:** empty states, consistencia de cards/botones, microcopy, revisión TS.
- **Archivos:** componentes + pantallas (ajustes menores).
- **Riesgo:** bajo · **Consumo:** medio.
- **Resultado:** `tsc --noEmit` en verde; badges consistentes; sin microcopy técnico.
- **Rúbrica:** 2.2 y 2.4 (consistencia y estados).

---

## 5. GAPS de rúbrica NO cubiertos por las fases de UX (prioridad para subir puntaje)

> Estos puntos valen nota y **no** los cierran las fases visuales. Recomendados como Fase 6/7.

### 🔝 G1 — Sensores reales con Expo (criterio 2.3, **1.5 pts**) · 🔻 pendiente
- Hoy: ubicación vía `navigator.geolocation` (web) y mapa vía `Linking`; clima como API externa.
- Para **Excelente** se piden **≥2 sensores nativos** integrados con librerías Expo:
  - `expo-location` (GPS) para capturar punto de recojo / origen real con permisos + fallback.
  - `expo-camera` / `expo-image-picker` (cámara) para foto de perfil o **QR** de confirmación de viaje.
- Incluir **manejo de permisos** con mensajes claros y **fallbacks** cuando no estén disponibles.
- **Archivos:** `utils/locationHelpers`, nuevo `hooks/useCamera` o pantalla de foto/QR,
  `app.json` (permisos), `ProfileScreen`/`VehicleScreen` (foto).
- **Riesgo:** medio · **Consumo:** medio.

### G2 — Feedback de éxito (toasts) y retry (criterio 2.4) · 🔻 parcial
- Hoy: errores y loading OK; éxito vía `Alert`. Falta **toasts/confirmaciones no bloqueantes** y
  **retry** explícito en pantallas de listas.
- **Archivos:** componente `Toast`/`useToast`, `ErrorMessage` (botón reintentar ya existe en varias).
- **Riesgo:** bajo · **Consumo:** bajo.

### G3 — Verificar 2.1 / 2.2 (ya altos) · ✅ casi completo
- 2.1: `services/api.ts` con `baseURL` + **interceptores** + **JWT en SecureStore** ✓.
- 2.2: capas `services/hooks/contexts/components/screens/utils` + Context API ✓. Mantener nombres en inglés.

### G4 — Exposición (criterio 1, **5 pts**) y Deployment (~2.5) · 🔻 fuera de código
- Preparar **PPT + demo** (gancho, problemática, funciones sin fallos).
- **Deployment:** backend en AWS/equivalente + mobile vía **Expo** (build/preview); `.env` y link de repo.

---

## 6. Recomendación de orden

1. **G1 — Sensores Expo (2.3)** → mayor puntaje no cubierto (1.5 pts), riesgo medio.
2. **G2 — Toasts/retry (2.4)** → rápido, sube "Manejo de errores/estados".
3. **G3 — Checklist 2.1/2.2** → verificación, casi listo.
4. **G4 — Exposición + Deployment** → fuera de código, pero pesan 7.5 pts juntos.

> Las **Fases 1–5** de UX ya están implementadas y verificadas (`tsc` en verde). El trabajo de mayor
> retorno restante es **G1 (sensores)** y **G4 (expo/deploy + presentación)**.

---

## 7. Estado de implementación (a la fecha)

| Fase | Estado |
|------|--------|
| 0 Inspección | ✅ |
| 1 Bajo consumo / alto impacto | ✅ |
| 2 Onboarding/Perfil/Vehículos | ✅ |
| 3 Pantallas principales | ✅ |
| 4 Operación del viaje | ✅ |
| 5 Pulido | ✅ |
| G1 Sensores Expo (2.3) | 🔻 pendiente |
| G2 Toasts/retry (2.4) | 🔻 parcial |
| G4 Exposición + Deployment | 🔻 pendiente (no-código) |
