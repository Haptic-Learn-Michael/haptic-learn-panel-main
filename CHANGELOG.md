# Changelog — haptic-learn-panel-v1

Todos los cambios notables a este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Pendiente

- Flujo de invitación de educators desde el panel (`POST /auth/invite`)
- Vista de detalle de usuario con cambio de rol
- Gestión de haptic patterns desde el panel

---

## [0.2.0] - 2026-06-20

### Añadido

#### HU-06 / HU-08 — Google OAuth en el panel administrativo

- `@supabase/supabase-js` instalado como dependencia del panel.
- `src/lib/supabase.ts` — cliente Supabase inicializado con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- `src/pages/AuthCallbackPage.tsx` — página de callback OAuth:
  - Maneja flujo PKCE (`?code=`) y flujo implicit (hash con tokens) automáticamente.
  - Llama a `GET /auth/me` con el access token para obtener rol del usuario.
  - Solo permite acceso a usuarios con `role: admin` o `role: lead_educator`.
  - Redirige a `/login?error=access_denied` si el rol no está permitido.
  - Redirige a `/login?error=user_not_found` si el usuario no existe en `public.users`.
- `src/App.tsx` — ruta `/auth/callback` registrada para `AuthCallbackPage`.
- `src/pages/LoginPage.tsx`:
  - Botón "Continuar con Google" con ícono SVG oficial de Google.
  - `handleGoogleLogin` llama a `supabase.auth.signInWithOAuth({ provider: 'google' })` con `redirectTo` dinámico.
  - Mensajes de error específicos por tipo (`oauth_failed`, `access_denied`, `user_not_found`) leídos desde `?error=` en la URL.
  - `relative` añadido al className del botón Google para corregir bloqueo por `div.absolute` del grid overlay interno.
- `.env` — variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` añadidas.
- `.env.example` — placeholders para las nuevas variables de Supabase.

---

## [0.1.0] - 2026-06-18

### Añadido

#### Infraestructura

- Proyecto React + Vite + TypeScript con Tailwind CSS.
- Routing con `react-router-dom` v6.
- Cliente HTTP con `axios` en `src/api/client.ts` — `VITE_API_URL` como base, interceptor de Bearer token automático.
- Store de autenticación con `zustand` + `persist` en `src/store/auth.store.ts` — persiste en `localStorage` como `haptic-auth`.
- `src/components/ProtectedRoute.tsx` — guard que redirige a `/login` si no hay sesión.
- `src/types/index.ts` — tipos `User`, `LoginResponse`, `Classroom`, `School`, `HapticPattern`, `Course`, `ContentItem`, `Progress`.

#### Auth (HU-08)

- `src/pages/LoginPage.tsx` — formulario email/password con animaciones framer-motion, efecto 3D con `rotateX`/`rotateY`, traveling light beams en bordes del card.
- `src/api/auth.api.ts` — `login()`, `logout()`.
- Login restringido a roles `admin` y `lead_educator` — acceso denegado para otros roles.
- `GET /auth/me` llamado tras login para obtener datos completos del usuario.

#### Dashboard (HU-08)

- `src/pages/DashboardPage.tsx` — panel principal con stats del sistema.
- `src/components/Layout.tsx` — layout con sidebar, header y outlet.
- `src/components/Sidebar.tsx` — navegación lateral con links a todas las secciones.

#### Gestión de Usuarios (HU-24)

- `src/pages/UsersPage.tsx` — lista de usuarios con búsqueda, badge de rol y estado.
- `src/api/users.api.ts` — `getUsers()`, `updateUserStatus()`.

#### Gestión de Escuelas

- `src/pages/SchoolsPage.tsx` — lista de instituciones educativas.
- `src/pages/SchoolDetailPage.tsx` — detalle de escuela con aulas y estadísticas.
- `src/pages/SchoolStatsPage.tsx` — estadísticas detalladas de la escuela con progreso de estudiantes.
- `src/api/schools.api.ts` — `getSchools()`, `getSchool()`, `getSchoolStats()`.

#### Gestión de Aulas (HU-17)

- `src/pages/ClassroomsPage.tsx` — lista de aulas del sistema.
- `src/pages/ClassroomDetailPage.tsx` — detalle de aula con educadores y alumnos.
- `src/api/classrooms.api.ts` — `getClassrooms()`, `getClassroom()`.

#### Haptic Patterns (HU-09)

- `src/pages/HapticPatternsPage.tsx` — lista y gestión de patrones hápticos.
- `src/api/haptic-patterns.api.ts` — `getHapticPatterns()`.

#### Landing Pages

- `src/pages/LandingPage.tsx` — landing principal del proyecto.
- `src/pages/LandingPage2.tsx` — variante con `CinematicHero`.
- `src/components/ui/cinematic-landing-hero.tsx` — hero animado con GSAP.
- `src/components/ui/hover-button.tsx` — botón con efectos de hover.
- `src/components/ui/platform-features.tsx` — sección de features.
- `src/components/ui/wave-path.tsx` — animación SVG de onda.

#### Common

- `src/common/decorators/roles.decorator.ts` → movido a panel como `src/common/guards/`.
- `src/common/filters/http-exception.filter.ts` — manejo global de errores HTTP.
- `src/common/guards/auth.guard.ts` — guard de autenticación.
- `src/common/guards/roles.guard.ts` — guard de roles.
- `src/components/Modal.tsx` — modal reutilizable.

---

[Unreleased]: https://github.com/stxfxno/haptic-learn-panel-v1/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/stxfxno/haptic-learn-panel-v1/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/stxfxno/haptic-learn-panel-v1/releases/tag/v0.1.0
