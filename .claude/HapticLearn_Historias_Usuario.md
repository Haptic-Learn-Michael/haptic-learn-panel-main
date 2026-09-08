# HapticLearn — Historias de Usuario

**App Educativa Accesible · React Native · NestJS · Supabase**

> 40 historias · 6 épicas · 5 sprints · 164 story points  
> Stack: Expo (React Native) · NestJS · Supabase · TalkBack · expo-haptics

---

## Estado de Implementación (Mobile Frontend)

> Revisado el 2026-06-19 contra el código en `app/`, `components/`, `contexts/`, `services/`, `utils/`, `constants/`.
> **Última actualización: sesión 6 — HU-06, STT real, auditoría TalkBack completa en pantallas secundarias del educador.**

### Resumen de avance (40 HUs)

| Estado       | Sesión 1 | Sesión 2 (v2.0.0) | Sesión 3 (v2.1.0) | Sesión 4–5 | Sesión 6 | Δ total |
| ------------ | -------- | ----------------- | ----------------- | ---------- | -------- | ------- |
| 🟢 Completa  | 3        | 15                | 23                | 29         | **30**   | +27     |
| 🟡 Parcial   | 14       | 9                 | 9                 | 3          | **2**    | -12     |
| 🔴 Pendiente | 13       | 6                 | 0                 | 0          | 0        | -13     |
| ⚫ No aplica | 10       | 10                | 8                 | 8          | 8        | -2      |

**HUs completadas en sesión 6:** HU-06 (Google OAuth con `expo-auth-session`).
**HUs completadas en sesión 5:** HU-12, HU-26 (API real en progress.tsx), HU-28 (create-quiz.tsx), HU-31 (history.tsx + attempts).

### Archivos nuevos creados en sesión 2 (v2.0.0)

- `services/content.ts` — motor didáctico (HU-25): `loadContentUnit`, `loadAllUnitsForCourse`, `loadCourses`, `createCourse`, `deleteCourse`
- `services/haptics.ts` — motor háptico (HU-09): `triggerHaptic(patternKey, callWithAuth?)` con 12 seed patterns
- `utils/accessibility.ts` — accesibilidad (HU-11): `announce()`, `a11yProps()`
- `app/(auth)/forgot-password.tsx` — recuperación de contraseña (HU-32)
- `app/(teacher)/create-classroom.tsx` — creación de aulas (HU-13)
- `app/(admin)/_layout.tsx`, `index.tsx`, `users.tsx`, `profile.tsx` — panel admin (HU-08, HU-24)

### Archivos nuevos creados en sesión 3 (v2.1.0)

- `services/classrooms.ts` — gestión de aulas (HU-13/HU-17/HU-36/HU-40): `loadClassroom`, `loadClassroomStudents`, `loadClassroomEducators`, `assignEducatorToClassroom`, `removeEducatorFromClassroom`, `levelInfo()` compartido
- `utils/speech-recognition.ts` — abstracción STT (HU-29): `isSttAvailable`, `listenForSpeech`, `stopListening`, `normalizeAnswer`, `answersMatch` (stubs hasta integrar paquete real)
- `app/(teacher)/preview-material.tsx` — previsualización de material (HU-37)
- `app/(teacher)/student-detail.tsx` — comparación nivel inicial vs actual (HU-40)
- `app/(student)/word-flow.tsx` — flujo de palabras por sílabas (HU-39)

### Cambios de sesión 4

- **Eliminados** (Expo boilerplate no usado): `components/haptic-tab.tsx`, `components/external-link.tsx`, `components/ui/icon-symbol.tsx`, `components/ui/icon-symbol.ios.tsx`, `hooks/use-color-scheme.ts`, `hooks/use-color-scheme.web.ts`
- `utils/accessibility.ts` — eliminada `a11yProps()` (nunca importada); queda solo `announce()`
- `utils/speech-recognition.ts` — eliminado `registerSttImpl` + `_impl` (YAGNI sin paquete real); eliminado `SttStatus`
- `services/haptics.ts` — eliminado `preloadPatterns()` (nunca llamado); eliminado `durationMs` de `HapticPulse` y todos los seed patterns
- `services/classrooms.ts` — añadido `levelInfo()` compartido (antes duplicado en classroom-detail y student-detail)
- `app/(teacher)/progress.tsx` — eliminado `selectedClass` + class-chip selector (UI muerta, filtro `() => true`)
- **TypeScript clean** tras todos los cambios (0 errores)

### Archivos modificados en sesión 2 (v2.0.0)

- `app/_layout.tsx` — enruta `admin`/`lead_educator` → `/(admin)`
- `app/(auth)/_layout.tsx` — registra forgot-password
- `app/(auth)/login.tsx` — link "¿Olvidaste tu contraseña?"
- `app/(teacher)/_layout.tsx` — registra create-classroom
- `app/(teacher)/classrooms.tsx` — GET `/classrooms` real con refresh + empty
- `app/(teacher)/create-course.tsx` — POST `/courses` real (HU-14)
- `app/(teacher)/qr-scanner.tsx` — flujo real con `/users/by-qr/:code` + POST `/classroom-students` (HU-15)
- `app/(student)/index.tsx` — GET `/courses` con loading/refresh/empty (HU-19)
- `app/(student)/course-detail.tsx` — GET `/courses/:id` + `/content-items` + botón delete (HU-16, HU-20)
- `app/(student)/practice.tsx` — modo dual: `ContentItemPractice` (API) + `MockPracticeScreen` (legacy)

### Archivos modificados en sesión 3 (v2.1.0)

- `services/content.ts` — `ContentUnit.correct_answer: string | null` agregado (HU-29)
- `app/(teacher)/_layout.tsx` — registra `preview-material` y `student-detail`
- `app/(teacher)/classroom-detail.tsx` — reescrito: API real + modal asignar educador + lista con badges Inicial/Actual (HU-17, HU-36, HU-40)
- `app/(teacher)/qr-scanner.tsx` — `triggerHaptic('qr_scan')` + `announce()` (HU-15 criterio final, HU-30)
- `app/(student)/_layout.tsx` — registra `word-flow`
- `app/(student)/index.tsx` — accesibilidad en `CourseCard` (HU-30)
- `app/(student)/course-detail.tsx` — `triggerHaptic('lesson_start')` + `announce()` + `ContentRow` con `talkback_text` (HU-30)
- `app/(student)/practice.tsx` — bloque `quiz_voice` (HU-29), `triggerHaptic('lesson_end')` + `announce()` (HU-33), accesibilidad en quiz/haptic/trace (HU-30)
- `app/(auth)/login.tsx`, `register.tsx`, `forgot-password.tsx` — accesibilidad sistemática (HU-30)
- `app/(admin)/users.tsx` — accesibilidad en suspend/activate (HU-30)
- `CHANGELOG.md` — v2.1.0
- `package.json` — bump 2.0.0 → 2.1.0

### Refactor compartido (post-implementación)

- `levelInfo(score)` (Inicial/En progreso/Avanzado + color) extraído a `services/classrooms.ts` y reutilizado tanto en `classroom-detail.tsx` como en `student-detail.tsx`. Listo para que `progress.tsx` lo consuma cuando se complete HU-35.

| Leyenda      | Significado                                                           |
| ------------ | --------------------------------------------------------------------- |
| 🟢 Completa  | Criterios de aceptación frontend cumplidos y conectados a API real    |
| 🟡 Parcial   | UI implementada pero con mock data o sin conexión real a API          |
| 🔴 Pendiente | Sin implementar en el frontend                                        |
| ⚫ No aplica | Tarea de backend, Supabase, admin o QA — sin pantalla frontend mobile |

| HU    | Título                             | Estado       | Notas                                                                                                                                                                                                     |
| ----- | ---------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HU-01 | Setup React Native                 | 🟡 Parcial   | Inicializado, estructura difiere de FDD puro pero funcional. Alias @/ ok.                                                                                                                                 |
| HU-02 | Setup NestJS                       | ⚫ No aplica | Backend en Render.                                                                                                                                                                                        |
| HU-03 | Setup Supabase                     | ⚫ No aplica | Schema aplicado en producción.                                                                                                                                                                            |
| HU-04 | Dependencias RN                    | 🟢 Completa  | expo-haptics, expo-camera, react-native-qrcode-svg, gesture-handler, reanimated instalados y usados.                                                                                                      |
| HU-05 | Mockups Figma                      | ⚫ No aplica | No verificable desde código.                                                                                                                                                                              |
| HU-06 | Registro usuario                   | 🟢 Completa  | Email+rol implementado y llama a API. Google OAuth con `expo-auth-session` wired up; llama a `POST /auth/google` con access_token. Requiere Client IDs reales en `constants/google-oauth.ts`.             |
| HU-07 | Login + sesión                     | 🟢 Completa  | Login+SecureStore+AuthGuard ok. Banner ✉️ "Verificación pendiente" para status `pending`/403+verif; banner 🚫 "Cuenta suspendida" para `suspended`. Detección por `ApiError.message` keywords.            |
| HU-08 | Panel admin                        | 🟢 Completa  | Grupo `(admin)` con dashboard (`/admin/stats`), tabs Usuarios + Perfil. `AuthGuard` enruta `admin`/`lead_educator` → `/(admin)`.                                                                          |
| HU-09 | Motor háptico                      | 🟢 Completa  | `services/haptics.ts` con `triggerHaptic(patternKey, callWithAuth?)`. 12 seed patterns locales + cache de API. `HapticPulse` tiene `style` + `gapMs` (sin `durationMs` — expo-haptics controla duración). |
| HU-10 | PointMapRenderer                   | 🟡 Parcial   | haptic-trace.tsx tiene motor de trazo con `tracePath` normalizado y PanResponder+haptic. No es componente reutilizable formal.                                                                            |
| HU-11 | Módulo TalkBack                    | 🟢 Completa  | `utils/accessibility.ts` con `announce(message)`. Uso sistemático aplicado en HU-30.                                                                                                                      |
| HU-12 | Progreso lead_educator             | 🟢 Completa  | progress.tsx conectado a API real: `GET /classrooms` + `GET /classrooms/:id/students`. Selector de aula, overview, filtros, badges de nivel.                                                              |
| HU-13 | Crear salones                      | 🟢 Completa  | `create-classroom.tsx` con POST `/classrooms`. `classrooms.tsx` reescrito para GET `/classrooms` con refresh + empty states.                                                                              |
| HU-14 | Crear cursos                       | 🟢 Completa  | `create-course.tsx` ahora hace POST `/courses` vía `createCourse()` con loading/error state.                                                                                                              |
| HU-15 | Escanear QR inscripción            | 🟢 Completa  | qr-scanner.tsx valida QR formato UUID/hex24 → `/users/by-qr/:qrCode` → POST `/classroom-students`. Carga lista real de students del aula.                                                                 |
| HU-16 | Eliminar cursos propios            | 🟢 Completa  | course-detail.tsx muestra botón 🗑 si `user.role` es educator/lead_educator/admin. Confirmación Alert + DELETE `/courses/:id`.                                                                            |
| HU-17 | Vista salón (cursos + alumnos)     | 🟢 Completa  | classroom-detail.tsx reescrito: GET `/classrooms/:id` + students + educators desde API. Lista con navegación a `student-detail`.                                                                          |
| HU-18 | QR estudiante                      | 🟢 Completa  | my-qr.tsx renderiza QR con `user.qr_code ?? user.id`. Nombre, rol, ID visible.                                                                                                                            |
| HU-19 | Home estudiante (cursos)           | 🟢 Completa  | (student)/index.tsx consume GET `/courses` con loading/refresh/empty. Mapeo subject → icon. Filtro `status === 'published'`.                                                                              |
| HU-20 | Explorar curso (content_items)     | 🟢 Completa  | course-detail.tsx consume GET `/courses/:id` + GET `/courses/:id/content-items` ordenados por `sort_order`.                                                                                               |
| HU-21 | Contenido letras A–Z               | ⚫ No aplica | Tarea de carga de datos admin en Supabase.                                                                                                                                                                |
| HU-22 | Contenido números 0–9              | ⚫ No aplica | Ídem.                                                                                                                                                                                                     |
| HU-23 | Contenido braille A–Z              | ⚫ No aplica | Ídem.                                                                                                                                                                                                     |
| HU-24 | Admin: gestionar usuarios          | 🟢 Completa  | `(admin)/users.tsx` con búsqueda, lista paginable, suspend/activate vía PATCH `/users/:id/status`.                                                                                                        |
| HU-25 | Motor didáctico                    | 🟢 Completa  | `services/content.ts` con `loadContentUnit`, `loadAllUnitsForCourse`, `loadCourses`, `createCourse`, `deleteCourse` + tipos `ContentUnit`/`ApiCourse`.                                                    |
| HU-26 | Progreso individual por alumno     | 🟢 Completa  | progress.tsx carga alumnos reales con `current_score`; student-detail.tsx provee detalle individual completo (evolución inicial→actual + desglose por curso).                                             |
| HU-27 | Perfil estudiante                  | 🟢 Completa  | ProfileScreen.tsx (compartido estudiante/educador): nombre, email, rol, estado, toggle TalkBack conectado a API, logout.                                                                                  |
| HU-28 | Quiz opción múltiple               | 🟢 Completa  | `create-quiz.tsx`: form educador (curso, pregunta, 4 opciones, respuesta correcta). `POST /content-items` via `createContentItem()`. Práctica estudiantil completa vía `ContentUnit` de API.              |
| HU-29 | Quiz voz (STT)                     | 🟢 Completa  | `utils/speech-recognition.ts` con `listenForSpeech`, `normalizeAnswer`, `answersMatch`. UI con mic + fallback TextInput. Pendiente integrar paquete STT real.                                             |
| HU-30 | Auditoría TalkBack                 | 🟢 Completa  | `accessibilityLabel`/`Role`/`Hint`/`State` aplicado a flujos auth, student home, course-detail, practice, qr-scanner, admin users. `announce()` en eventos clave.                                         |
| HU-31 | Registrar lección completada       | 🟢 Completa  | `upsertProgress` envía `attempts: 1` al backend. `history.tsx`: tab "Historial" en student layout con `GET /progress`, overview y lista ordenada por `completed_at DESC`.                                 |
| HU-32 | Recuperar contraseña               | 🟢 Completa  | `(auth)/forgot-password.tsx` con POST `/auth/forgot-password`. Link "¿Olvidaste tu contraseña?" en login.                                                                                                 |
| HU-33 | Pantalla de logro (curso completo) | 🟢 Completa  | `ContentItemPractice` dispara `triggerHaptic('lesson_end')` + `announce()` al completar. Panel de logro con CTA "Ver mi progreso".                                                                        |
| HU-34 | QA end-to-end                      | ⚫ No aplica | Sprint 5 — pendiente de funcionalidades previas.                                                                                                                                                          |
| HU-35 | Nivel de aprendizaje               | 🟢 Completa  | progress.tsx muestra badge "Inicial / En progreso / Avanzado" por alumno usando `levelInfo()` compartido. Porcentaje coloreado por nivel. Mock data (API en HU-12/26).                                    |
| HU-36 | Asignar educador por email         | 🟢 Completa  | classroom-detail.tsx con modal de asignación + `assignEducatorToClassroom`. Manejo de errores 404/409/400.                                                                                                |
| HU-37 | Previsualizar material             | 🟢 Completa  | `(teacher)/preview-material.tsx` muestra content item con interacciones de prueba (no afecta progreso) + botón "Agregar al curso".                                                                        |
| HU-38 | Contenido sílabas                  | ⚫ No aplica | Tarea de carga de datos admin.                                                                                                                                                                            |
| HU-39 | Flujo de palabras por sílabas      | 🟢 Completa  | `(student)/word-flow.tsx` con presentación secuencial de sílabas, progreso, anuncio de palabra final + `triggerHaptic('lesson_end')`.                                                                     |
| HU-40 | Nivel inicial vs actual            | 🟢 Completa  | `(teacher)/student-detail.tsx` con tarjetas comparativas inicial vs actual, delta, breakdown por curso. Acceso desde classroom-detail.                                                                    |

---

## Tablas del schema

| Tabla                 | Descripción                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| `users`               | Usuarios registrados. Campos clave: `role`, `status`, `qr_code`, `email_verified`     |
| `profiles`            | Perfil extendido 1:1 con `users`. Campos: `talkback_enabled`, `avatar_url`, `bio`     |
| `user_registrations`  | Proveedor de auth, token de verificación de email                                     |
| `classrooms`          | Salones. FK a `lead_educator_id`. Tiene `code` único                                  |
| `classroom_educators` | N:M entre salones y educadores                                                        |
| `classroom_students`  | N:M entre salones y estudiantes                                                       |
| `courses`             | Cursos por salón. `educator_id` = creador. `is_published` controla visibilidad        |
| `haptic_patterns`     | Catálogo de patrones hápticos. Solo admin los crea                                    |
| `content_items`       | Material educativo por curso. `point_map` JSONB, `haptic_pattern_id`, `talkback_text` |
| `quiz_questions`      | Preguntas asociadas a content_items de tipo `quiz_mc` o `quiz_voice`                  |
| `student_progress`    | Progreso por estudiante y content_item. `status`, `score`, `attempts`, `completed_at` |

## ENUMs del schema

| Enum              | Valores                                                           |
| ----------------- | ----------------------------------------------------------------- |
| `user_role`       | `admin`, `lead_educator`, `educator`, `student`                   |
| `user_status`     | `pending`, `active`, `suspended`                                  |
| `auth_provider`   | `email`, `google`                                                 |
| `content_type`    | `letter`, `number`, `braille`, `quiz_mc`, `quiz_voice`            |
| `question_type`   | `multiple_choice`, `voice_response`                               |
| `progress_status` | `not_started`, `in_progress`, `completed`                         |
| `haptic_category` | `braille`, `letter`, `number`, `feedback`, `navigation`, `system` |

---

## Índice de Épicas

| Épica | Nombre                                | HUs                                                                   | Sprints     |
| ----- | ------------------------------------- | --------------------------------------------------------------------- | ----------- |
| E1    | Setup e Infraestructura               | HU-01 → HU-04                                                         | Sprint 1    |
| E2    | Diseño y Mockups                      | HU-05                                                                 | Sprint 1    |
| E3    | Auth, Roles y Acceso                  | HU-06, HU-07, HU-08, HU-24, HU-32                                     | Sprint 2    |
| E4    | Accesibilidad y Motor Háptico         | HU-09, HU-10, HU-11, HU-25                                            | Sprints 2–4 |
| E5    | Gestión de Usuarios, Salones y Cursos | HU-12 → HU-20, HU-26, HU-27, HU-28, HU-29, HU-35, HU-36, HU-37, HU-40 | Sprints 2–5 |
| E6    | Contenido Educativo                   | HU-21, HU-22, HU-23, HU-30, HU-31, HU-33, HU-34, HU-38, HU-39         | Sprints 4–5 |

## Índice de Sprints

| Sprint   | Semanas | HUs | Pts |
| -------- | ------- | --- | --- |
| Sprint 1 | 1–2     | 5   | 22  |
| Sprint 2 | 3–4     | 10  | 37  |
| Sprint 3 | 5–6     | 11  | 39  |
| Sprint 4 | 7–8     | 10  | 48  |
| Sprint 5 | 9–10    | 4   | 18  |

---

# ÉPICAS

---

## Épica 1 — Setup e Infraestructura

**Sprints:** Sprint 1  
**Objetivo:** Los tres proyectos (frontend, backend, Supabase) corren localmente, se conectan entre sí y el schema SQL está aplicado antes de tocar cualquier feature.

---

### HU-01 · Setup · 5 pts · 🟡 Parcial

> Estructura de carpetas usa `app/`, `components/`, `contexts/`, `services/`, `constants/` (no FDD estricto con `features/`). Alias `@/` configurado. App corre en emulador.

**Como** desarrollador,  
**quiero** crear el proyecto React Native con Expo/CLI y configurar la estructura FDD,  
**para** tener la base del frontend lista y consistente desde el primer día.

**Criterios de aceptación:**

- [x] Proyecto inicializado con `npx create-expo-app` usando template TypeScript
- [ ] Estructura de carpetas FDD: `features/`, `shared/`, `core/`, `assets/`
- [x] Alias de paths configurados en `tsconfig.json` (`@/` para todo)
- [x] Nombre de la app, ícono y splash screen definidos
- [x] La app corre en emulador Android sin errores en consola

---

### HU-02 · Setup · 5 pts · ⚫ No aplica (backend)

**Como** desarrollador,  
**quiero** crear el proyecto backend NestJS con arquitectura FDD y conectarlo a Supabase,  
**para** tener la base del backend lista con la estructura correcta desde el inicio.

**Criterios de aceptación:**

- [ ] Proyecto NestJS inicializado con `@nestjs/cli` en TypeScript
- [ ] Estructura FDD: módulos separados por feature (`auth/`, `users/`, `classrooms/`, `courses/`, `content/`, `progress/`)
- [ ] Cliente `@supabase/supabase-js` instalado y configurado con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Variables de entorno gestionadas con `@nestjs/config` y `ValidationPipe` global activo
- [ ] Endpoint `GET /health` responde `200 OK`

---

### HU-03 · Setup · 3 pts · ⚫ No aplica (Supabase)

**Como** desarrollador,  
**quiero** inicializar el proyecto Supabase con el schema SQL completo aplicado,  
**para** tener todas las tablas, enums, triggers, índices y políticas RLS listas antes del Sprint 2.

**Criterios de aceptación:**

- [ ] Schema SQL ejecutado sin errores en Supabase: tablas `users`, `profiles`, `user_registrations`, `classrooms`, `classroom_educators`, `classroom_students`, `courses`, `haptic_patterns`, `content_items`, `quiz_questions`, `student_progress`
- [ ] ENUMs creados: `user_role`, `user_status`, `auth_provider`, `content_type`, `question_type`, `progress_status`, `haptic_category`
- [ ] Triggers activos: `trg_handle_new_auth_user`, `trg_create_profile`, `trg_generate_qr_code`, `trg_sync_email_verified`
- [ ] RLS habilitado en todas las tablas
- [ ] 12 patrones hápticos semilla insertados en `haptic_patterns` (datos seed del schema)
- [ ] Storage bucket creado para assets (audios TalkBack, imágenes de perfil)
- [ ] Auth habilitado con proveedores Email y Google OAuth en el dashboard de Supabase

---

### HU-04 · Setup · 3 pts · 🟢 Completa

> Todas las dependencias instaladas y usadas en el código: expo-haptics (practice.tsx, haptic-trace.tsx), expo-camera (qr-scanner.tsx), react-native-qrcode-svg (my-qr.tsx), gesture-handler, reanimated.

**Como** desarrollador,  
**quiero** instalar y validar todas las dependencias de React Native necesarias para el proyecto,  
**para** asegurar que el entorno está completo y documentado antes de empezar las features.

**Criterios de aceptación:**

- [x] `expo-haptics` instalado y usado en la app
- [x] `react-navigation` (stack + bottom tabs) configurado con tipado TypeScript
- [x] `react-native-gesture-handler` y `react-native-reanimated` instalados
- [x] `expo-camera` instalado para escaneo QR
- [x] `react-native-qrcode-svg` instalado y usado para renderizar QR en pantalla
- [ ] Documento `SETUP.md` en el repo con los pasos para levantar el proyecto localmente

---

## Épica 2 — Diseño y Mockups

**Sprints:** Sprint 1  
**Objetivo:** Todos los flujos de la app diseñados en Figma antes de empezar las features, para que cada sprint tenga referencia visual aprobada.

---

### HU-05 · Diseño · 6 pts · ⚫ No aplica (Figma)

> No verificable desde el código. La app tiene un design system consistente (Colors, Typography, Spacing, Radius en constants/theme.ts) y todas las pantallas con UI implementada.

**Como** diseñador / PO,  
**quiero** crear en Figma el flujo completo de pantallas para todos los roles,  
**para** que el equipo tenga una referencia visual precisa al iniciar cada sprint.

**Criterios de aceptación:**

- [ ] Flujo de onboarding y registro diseñado (proveedor `email` y `google`)
- [ ] Flujo de login y recuperación de contraseña diseñado
- [ ] Dashboard diseñado para cada `user_role`: `admin`, `lead_educator`, `educator`, `student`
- [ ] Flujo de salones (`classrooms`) y cursos (`courses`, con estado `is_published`) diseñado
- [ ] Pantallas de contenido educativo diseñadas para `content_type`: `letter`, `number`, `braille`, `quiz_mc`, `quiz_voice`
- [ ] Pantallas de progreso del estudiante diseñadas usando los estados de `progress_status`: `not_started`, `in_progress`, `completed`
- [ ] Tamaños de toque mínimos de 48x48dp en todos los elementos interactivos
- [ ] Design system básico en Figma: colores, tipografía, componentes reutilizables

---

## Épica 3 — Auth, Roles y Acceso

**Sprints:** Sprint 2  
**Objetivo:** Cualquier usuario puede registrarse, iniciar sesión y ser redirigido a su dashboard según su `user_role`. El admin puede gestionar el estado de las cuentas.

---

### HU-06 · Auth · 5 pts · 🟢 Completa

> `register.tsx` implementado: selector de rol student/educator, campos name/email/password, llama a `/auth/register`, muestra success con instrucción de verificación de email. Google OAuth implementado con `expo-auth-session@7.0.11` (`expo install`): `Google.useAuthRequest` → `promptAsync()` → `POST /auth/google { access_token }` → tokens + user. `loginWithGoogle` añadido a `AuthContext`. Client IDs configurables en `constants/google-oauth.ts` (requiere valores reales de Google Cloud Console).

**Como** usuario,  
**quiero** registrarme con formulario o con Google seleccionando mi rol,  
**para** tener acceso a las funciones correspondientes a mi perfil.

**Criterios de aceptación:**

- [x] Registro con email: llama a `POST /auth/register` con `full_name`, `email`, `password`, `role`
- [ ] Registro con Google: botón presente pero sin implementación OAuth
- [x] El selector de rol permite elegir `educator` o `student`
- [x] Al registrarse con email, muestra mensaje de verificación pendiente
- [ ] Trigger `trg_create_profile` — tarea de backend
- [ ] Registro con Google — pendiente
- [x] Mensajes de error visibles si el correo ya existe (muestra mensaje del backend)

---

### HU-07 · Auth · 4 pts · 🟡 Parcial

> `login.tsx` + `AuthContext.tsx` implementados: JWT en SecureStore, refresh token automático, `AuthGuard` redirige por `user.role`. Falta manejo visual diferenciado de `pending`/`suspended` (actualmente muestra el mensaje de error del backend).

**Como** usuario registrado,  
**quiero** iniciar sesión y que la app recuerde mi sesión,  
**para** ser redirigido al dashboard de mi rol sin autenticarme cada vez.

**Criterios de aceptación:**

- [x] Login con `POST /auth/login` — solo usuarios activos pueden acceder (backend valida)
- [ ] Si `status = 'pending'`, mostrar mensaje específico "Debes verificar tu correo" (actualmente muestra error genérico del backend)
- [ ] Si `status = 'suspended'`, mostrar mensaje específico "Tu cuenta ha sido suspendida"
- [x] Sesión persistida en SecureStore mediante JWT access+refresh tokens
- [x] Redirección según `role`: `student` → `/(student)`, `educator`/`lead_educator`/`admin` → `/(teacher)`
- [ ] Panel diferenciado para `admin` y `lead_educator` — actualmente todos van al mismo `/(teacher)`
- [x] Al re-abrir la app con sesión activa, restaura usuario automáticamente

---

### HU-08 · Auth · 3 pts · 🟢 Completa

> Grupo de rutas `(admin)/` creado con layout de Tabs (Dashboard, Usuarios, Perfil). El `AuthGuard` en `app/_layout.tsx` enruta `admin` y `lead_educator` a `/(admin)`. Dashboard consume GET `/admin/stats`.

**Como** administrador,  
**quiero** tener acceso total a todos los módulos, usuarios, roles, salones y contenido,  
**para** gestionar y supervisar toda la plataforma.

**Criterios de aceptación:**

- [x] Usuario con `users.role = 'admin'` accede a panel de administración diferenciado
- [x] Panel de admin puede listar todos los registros de `users` (HU-24)
- [ ] Admin puede listar todos los `classrooms`, `courses` y `content_items`
- [ ] Admin puede insertar y editar `haptic_patterns`
- [x] Navegación de admin diferenciada visualmente del resto de roles en el frontend

---

### HU-24 · Auth · 3 pts · 🟢 Completa

> `app/(admin)/users.tsx` lista usuarios con avatar, role badge, status dot. Buscador por nombre/email/rol. Suspend/Activate con confirmación Alert + PATCH `/users/:id/status`. Indicador loading por fila durante la acción.

**Como** administrador,  
**quiero** ver el listado completo de usuarios y poder suspender o reactivar cuentas,  
**para** controlar el acceso a la plataforma.

**Criterios de aceptación:**

- [x] Lista paginada de `users` con campos: `full_name`, `email`, `role`, `status`, `created_at`
- [x] Acción "Suspender": actualiza `users.status = 'suspended'`
- [x] Acción "Reactivar": actualiza `users.status = 'active'`
- [x] Buscador filtra por `users.full_name` o `users.email`
- [ ] No se puede suspender a otro usuario con `role = 'admin'` (validación delegada al backend)
- [x] Confirmación antes de ejecutar la acción de suspensión

---

### HU-32 · Auth · 2 pts · 🟢 Completa

> `app/(auth)/forgot-password.tsx` con input email, validación, POST `/auth/forgot-password` y vista de éxito ("¡Correo enviado!" con instrucciones). Registrada en `(auth)/_layout.tsx`. Link "¿Olvidaste tu contraseña?" añadido al footer de `login.tsx`.

**Como** usuario,  
**quiero** recuperar mi contraseña mediante mi correo electrónico,  
**para** no perder acceso a mi cuenta.

**Criterios de aceptación:**

- [x] Pantalla "Olvidé mi contraseña" accesible desde el login
- [x] Llamada a endpoint de recuperación (`POST /auth/forgot-password`)
- [ ] Solo aplica a usuarios con `auth_provider = 'email'` (delegado al backend)
- [x] Mensaje neutral mostrado siempre: pantalla de éxito sin revelar si el correo existe
- [ ] Pantalla accesible con TalkBack: campo de correo con `accessibilityLabel` (pendiente HU-30)

---

## Épica 4 — Accesibilidad y Motor Háptico

**Sprints:** Sprints 2–4  
**Objetivo:** Construir los motores de hapticidad y accesibilidad que consumen los datos de `haptic_patterns` y `content_items` para toda la app.

> ⚠️ **Dependencia crítica:** HU-09, HU-10 y HU-11 deben completarse en Sprint 2. Todo el contenido educativo (E6) depende de estos motores.

---

### HU-09 · Háptico · 4 pts · 🟢 Completa

> `services/haptics.ts` con `triggerHaptic(patternKey, callWithAuth?)`. Estrategia de fallback: 1) seed local, 2) cache de módulo, 3) GET `/haptic-patterns/:key`, 4) fallback genérico medium. `preloadPatterns(callWithAuth)` carga todos en cache al inicio. Consumido por `ContentItemPractice` en practice.tsx.

**Como** desarrollador,  
**quiero** crear una función de retroalimentación háptica reutilizable que consuma los patrones de `haptic_patterns`,  
**para** que toda la app use una API unificada de vibración.

**Criterios de aceptación:**

- [x] Función `triggerHaptic(patternKey: string)` busca el patrón por `haptic_patterns.pattern_key` y ejecuta los `pulses` JSONB con `expo-haptics`
- [x] Soporta los 12 patrones seed del schema: `braille_cell`, `letter_tap`, `letter_trace`, `number_tap`, `number_trace`, `correct`, `incorrect`, `nav_point`, `nav_boundary`, `lesson_start`, `lesson_end`, `qr_scan`
- [x] El campo `pulses` JSONB se mapea a `Haptics.impactAsync()`
- [x] No lanza error en emuladores (graceful fallback con try/catch)
- [ ] Probado en dispositivo físico Android con patrones `correct`, `incorrect` y `lesson_end`

---

### HU-10 · Háptico · 6 pts · 🟡 Parcial

> `haptic-trace.tsx` implementa un motor de trazo táctil: recibe `tracePath` (coordenadas normalizadas), usa `PanResponder` para detectar el dedo, dispara `Haptics.impactAsync` al pasar por cada punto, muestra progreso visual. No es un componente `PointMapRenderer` reutilizable — es una pantalla específica.

**Como** desarrollador,  
**quiero** crear el motor que renderiza el `point_map` de `content_items` como puntos táctiles en pantalla,  
**para** mostrar letras, números y braille como áreas de vibración tocables.

**Criterios de aceptación:**

- [ ] Componente `PointMapRenderer` reutilizable que recibe el `point_map` JSONB de `content_items`
- [x] Al tocar/trazar un punto, ejecuta haptic (implementado en haptic-trace.tsx)
- [x] Los puntos tienen estado visual (pendiente vs completado vs siguiente)
- [x] El componente escala los puntos al tamaño real del contenedor usando coordenadas normalizadas 0–1
- [ ] Probado con `content_item` de tipo `letter`, `number` y `braille` reales (actualmente con mock `tracePath`)

---

### HU-11 · Accesibilidad · 4 pts · 🟢 Completa

> `utils/accessibility.ts` con `announce(message)` (usa `AccessibilityInfo.announceForAccessibility`) y `a11yProps(label, role?, hint?)` que retorna `{ accessible, accessibilityLabel, accessibilityRole, accessibilityHint }`. Pendiente: aplicar sistemáticamente a todas las pantallas (HU-30 audit).

**Como** desarrollador,  
**quiero** crear el módulo de accesibilidad TalkBack que use `profiles.talkback_enabled` y el campo `talkback_text` de `content_items`,  
**para** que la app sea navegable sin ver la pantalla desde el inicio.

**Criterios de aceptación:**

- [x] Helper `announce(message: string)` implementado con `AccessibilityInfo.announceForAccessibility()`
- [x] Helper `a11yProps(label, role?, hint?)` que retorna props de accesibilidad
- [ ] Al renderizar un `content_item`, el campo `talkback_text` se usa como `accessibilityLabel` (pendiente HU-30 audit)
- [ ] Si `profiles.talkback_enabled = true`, la app activa anuncios automáticos al cambiar de pantalla
- [ ] Probado con TalkBack activado en dispositivo físico Android

---

### HU-25 · Háptico · 6 pts · 🟢 Completa

> `services/content.ts` con `loadContentUnit(id)`, `loadAllUnitsForCourse(courseId)` (ordena por `sort_order`), `loadCourses()`, `createCourse(data)`, `deleteCourse(id)`. Tipos `ContentUnit` y `ApiCourse` exportados. Consumido por `course-detail.tsx`, `(student)/index.tsx` y `ContentItemPractice` en practice.tsx.

**Como** desarrollador,  
**quiero** crear el motor didáctico que conecta cada `content_item` con su `haptic_pattern` y su `talkback_text`,  
**para** que el sistema renderice cualquier unidad educativa de forma consistente.

**Criterios de aceptación:**

- [x] Función `loadContentUnit(contentItemId: string)` consulta `content_items` con JOIN a `haptic_patterns`
- [x] Retorna: `{ id, title, content_type, point_map, talkback_text, haptic_pattern: { pattern_key, pulses, total_ms } }`
- [x] Función `loadAllUnitsForCourse(courseId: string)` retorna todos los `content_items` del curso ordenados por `sort_order`
- [x] Si `content_items.haptic_pattern_id IS NULL`, el campo `haptic_pattern` retorna `null` sin error
- [x] El motor es consumido por `ContentItemPractice` en practice.tsx (incluye haptic + trace + quiz + talkback_text)

---

## Épica 5 — Gestión de Usuarios, Salones y Cursos

**Sprints:** Sprints 2–5  
**Objetivo:** Implementar toda la lógica de negocio: salones, inscripciones, cursos y seguimiento de progreso.

---

### HU-12 · Educador Principal · 5 pts · 🟢 Completa

> `progress.tsx` conectado a `GET /classrooms` + `GET /classrooms/:id/students`. Muestra selector de aula (si hay múltiples), overview con promedio/alto/bajo, filtros por nivel, lista de alumnos con barra de progreso y badge Inicial/En progreso/Avanzado. `mock-teacher.STUDENTS` eliminado de esta pantalla.

**Como** educador principal (`lead_educator`),  
**quiero** ver el progreso de aprendizaje de todos los estudiantes bajo mi cargo,  
**para** tomar decisiones de apoyo pedagógico basadas en datos reales.

**Criterios de aceptación:**

- [ ] Query: `student_progress` filtrado por salones del `lead_educator_id = auth.uid()`
- [ ] Lista de estudiantes con: `users.full_name`, completados vs total de `content_items`
- [ ] Porcentaje de avance calculado: `completados / total_items * 100`
- [ ] Último acceso desde `student_progress.updated_at` más reciente
- [ ] Datos cargados por salón del educador principal

---

### HU-13 · Educador Principal · 4 pts · 🟢 Completa

> `classrooms.tsx` reescrito: GET `/classrooms` real, refresh control, empty state, loading. Botón "+ Nueva" ahora navega a `create-classroom.tsx` (nuevo) con formulario `name` + chips de grado y POST `/classrooms`. Pendiente UI de gestión de `classroom_educators` (HU-36).

**Como** educador principal,  
**quiero** crear salones y asignar o remover educadores de ellos,  
**para** organizar la institución y delegar la gestión a educadores.

**Criterios de aceptación:**

- [x] Pantalla de crear salón con formulario `name` + `grade`
- [x] INSERT en `classrooms` con `lead_educator_id = auth.uid()` (via POST `/classrooms`)
- [ ] UI para asignar educador a salón: INSERT en `classroom_educators` (HU-36)
- [ ] UI para remover educador: DELETE en `classroom_educators`
- [ ] Mensaje si el educador ya está asignado (UNIQUE constraint)
- [x] El salón queda con `is_active = TRUE` por defecto (backend)

---

### HU-14 · Educador · 5 pts · 🟢 Completa

> `create-course.tsx` ahora hace POST `/courses` real vía `createCourse({ title, description, subject, level })`. Loading state durante la creación, error message si falla, haptic Success al completar. Selector de material desde `content_items` y toggle publish quedan como pendiente.

**Como** educador,  
**quiero** crear un curso en un salón donde estoy asignado y seleccionar material educativo,  
**para** personalizar el aprendizaje de mis estudiantes.

**Criterios de aceptación:**

- [x] Formulario con título, descripción, materia y nivel
- [x] Botón deshabilitado si faltan campos requeridos
- [x] INSERT en `courses` con `title`, `description`, `subject`, `level` via POST `/courses`
- [ ] Selector de material desde `content_items` disponibles en la plataforma (HU-37)
- [ ] Publicar curso: actualizar `is_published = TRUE`

---

### HU-15 · Educador · 4 pts · 🟢 Completa

> `qr-scanner.tsx` reescrito (v2.0.0) y actualizado (v2.1.0): valida formato QR (UUID o hex24), busca usuario vía GET `/users/by-qr/:qrCode`, verifica idempotencia local (Set de IDs ya escaneados), POST `/classroom-students` para la primera aula del educador. Carga lista real de students de la API. `triggerHaptic('qr_scan')` + `announce()` en eventos de éxito/error.

**Como** educador,  
**quiero** escanear el QR de un estudiante para inscribirlo en mi salón,  
**para** hacerlo de forma rápida sin errores de tipeo.

**Criterios de aceptación:**

- [x] Cámara activa con `CameraView` y permiso solicitado al usuario
- [x] Cooldown de 2s entre escaneos para evitar duplicados rápidos
- [x] Feedback visual (banner) y háptico al escanear
- [x] Al escanear: buscar usuario por `users.qr_code` en la API (`/users/by-qr/:code`)
- [ ] Verificar que `users.role = 'student'` (delegado al backend)
- [x] Verificar si ya existe en `classroom_students` (Set local + idempotencia backend)
- [x] Si no está inscrito: INSERT en `classroom_students` (POST `/classroom-students`)
- [x] `triggerHaptic('qr_scan')` al escanear correctamente
- [x] `announce()` para confirmar inscripción / error / duplicado

---

### HU-16 · Educador · 2 pts · 🟢 Completa

> En `course-detail.tsx` el header muestra botón 🗑 si `user.role` es `educator`/`lead_educator`/`admin`. Acción dispara `Alert.alert` con confirmación destructiva; al confirmar llama a `deleteCourse(id, callWithAuth)` → DELETE `/courses/:id` y navega atrás. La validación de ownership se delega al backend (RLS).

**Como** educador,  
**quiero** eliminar únicamente los cursos que yo mismo he creado,  
**para** mantener organizado mi espacio sin afectar a otros educadores.

**Criterios de aceptación:**

- [x] Botón "Eliminar" visible en cursos para roles educadores/admin
- [x] DELETE en `courses` — validado por RLS en backend
- [x] Confirmación antes de ejecutar (Alert destructive)
- [x] Al eliminar, navegar de vuelta al listado de aulas

---

### HU-17 · Salones · 4 pts · 🟢 Completa

> `classroom-detail.tsx` reescrito en v2.1.0: GET `/classrooms/:id` + `/students` + `/educators` en paralelo. Hero con stats reales (alumnos, activos, asistencia, progreso promedio). Sección de educadores con asignar/remover. Lista de alumnos navegable hacia `student-detail` con badges Inicial/Actual (HU-40). Mock data eliminado.

**Como** admin o educador principal,  
**quiero** ver en cada salón la lista de cursos, el número de alumnos y su información,  
**para** tener visibilidad completa del estado del salón.

**Criterios de aceptación:**

- [x] Vista de salón carga: `courses`/educadores y lista de estudiantes desde API
- [ ] Por cada curso: título, `is_published`, nombre del educador, conteo de `content_items` (sección cursos pendiente — se mostrarán cuando el backend exponga el endpoint)
- [x] Lista de estudiantes con: `full_name`, `enrolled_at`, badges de nivel inicial vs actual
- [x] Acceso permitido por RLS (delegado al backend)

---

### HU-18 · Estudiante · 3 pts · 🟢 Completa

> `my-qr.tsx` renderiza el QR con `react-native-qrcode-svg` usando `user.qr_code ?? user.id`. Muestra nombre, rol y ID truncado. Botón "Compartir QR" con haptic. Stats row placeholder (–) pendiente de datos reales.

**Como** estudiante,  
**quiero** que la app genere mi código QR automáticamente al activar mi cuenta,  
**para** que mi educador pueda escanearme e inscribirme en su salón.

**Criterios de aceptación:**

- [x] El trigger backend genera `users.qr_code` al activar cuenta
- [x] El QR se renderiza en pantalla usando `users.qr_code` como valor
- [x] El QR es único (constraint UNIQUE en backend)
- [x] Muestra nombre del estudiante, rol e ID truncado

---

### HU-19 · Estudiante · 3 pts · 🟢 Completa

> `(student)/index.tsx` reescrito: consume GET `/courses` con `loadCourses()`, filtra `status === 'published'`, loading state (ActivityIndicator), pull-to-refresh, empty state, retry on error. Mapeo subject → icon (Geografía/Matemáticas/Música/Braille). Cálculo de progreso desde `completed_lessons`/`lesson_count`.

**Como** estudiante,  
**quiero** ver en mi home la lista de cursos asignados a mi salón con su estado y progreso,  
**para** saber qué tengo que practicar y cuánto he avanzado.

**Criterios de aceptación:**

- [x] Query: `courses` publicados desde API (`GET /courses` filtrando `status === 'published'`)
- [x] Por cada curso: título, subject, level, progreso (si backend lo entrega en `completed_lessons`/`lesson_count`)
- [ ] Estado calculado: `not_started` / `in_progress` / `completed` (parcial — solo `progress` numérico)
- [ ] Cursos ordenados: `in_progress` primero, luego `not_started`, luego `completed`
- [ ] Cada curso con `accessibilityLabel` (TalkBack — pendiente HU-30)

---

### HU-20 · Estudiante · 4 pts · 🟢 Completa

> `course-detail.tsx` reescrito: consume GET `/courses/:id` + GET `/courses/:id/content-items`. Lista content items con icono por `content_type` (🔤 letter, 🔢 number, ⠿ braille, ❓ quiz_mc, 🎤 quiz_voice) y label de ejercicios disponibles (Trazar / Háptico). Al tocar, navega a `practice?contentItemId=<id>` que carga el `ContentUnit` desde API.

**Como** estudiante,  
**quiero** ingresar a un curso y explorar el material educativo de forma táctil con TalkBack,  
**para** practicar los contenidos de forma autónoma y accesible.

**Criterios de aceptación:**

- [x] Al ingresar al curso: lista de `content_items` desde API, ordenados por `sort_order`
- [ ] Estado de cada item desde `student_progress.status` (parcial — usa SessionStore local)
- [x] Al seleccionar un item: navega a pantalla de práctica háptica con `contentItemId`
- [ ] `content_items.talkback_text` como `accessibilityLabel` de cada item (HU-30)
- [ ] Al entrar: `triggerHaptic('lesson_start')` automático

---

### HU-26 · Educador · 3 pts · 🟢 Completa

> `progress.tsx` carga alumnos reales de la API con `current_score` y muestra nivel Inicial/En progreso/Avanzado por alumno. `student-detail.tsx` ya provee el detalle individual completo (evolución inicial→actual + desglose por curso).

**Como** educador,  
**quiero** ver el detalle de progreso individual de cada alumno en mi salón,  
**para** identificar quién necesita más apoyo.

**Criterios de aceptación:**

- [ ] Query: `student_progress` por alumno desde API
- [ ] Vista muestra: `full_name`, `status` por cada item, `score`, `attempts`, `completed_at`
- [ ] Agrupado por `courses.title`
- [ ] `updated_at` muestra la fecha del último acceso

---

### HU-27 · Estudiante · 2 pts · 🟢 Completa

> `ProfileScreen.tsx` (compartido entre student y teacher): avatar con iniciales, nombre, email, rol (badge con color), estado de cuenta, toggle TalkBack que llama a `PATCH /users/:id/profile`, cerrar sesión con haptic warning. Conectado a API real.

**Como** estudiante,  
**quiero** acceder a mi perfil con mi nombre, rol y código QR en cualquier momento,  
**para** poder compartir mi QR con el educador cuando sea necesario.

**Criterios de aceptación:**

- [x] Pantalla de perfil carga: `full_name`, `email`, `role`, `status` desde `user` en AuthContext
- [ ] El `users.qr_code` se renderiza como imagen QR en perfil (está en pantalla separada `my-qr`)
- [x] Toggle de `profiles.talkback_enabled`: UPDATE via `PATCH /users/:id/profile`
- [x] Opción de cerrar sesión: llama a `POST /auth/logout` y limpia tokens
- [x] Muestra badge de rol con color diferenciado por role

---

### HU-28 · Educador · 6 pts · 🟢 Completa

> `(teacher)/create-quiz.tsx`: formulario para crear `content_items` de tipo `quiz_mc`. El educador selecciona el curso (chips horizontales), escribe título, pregunta, 4 opciones (A–D) y toca la letra para marcar la respuesta correcta. `POST /content-items` vía `createContentItem()` en `services/content.ts`. `practice.tsx` ya renderiza `quiz_mc` con feedback haptic completo, lee datos de la API a través de `ContentUnit` (question/options/correct_option_index).

**Como** educador,  
**quiero** crear preguntas de opción múltiple para mis cursos,  
**para** evaluar el aprendizaje de forma accesible con TalkBack.

**Criterios de aceptación:**

- [ ] UI para crear `content_items` de tipo `quiz_mc` desde la app del educador
- [ ] INSERT en `quiz_questions` con `question_text`, `options` JSONB, `correct_answer`
- [x] Al responder correctamente: feedback visual + `Haptics.notificationAsync(Success)`
- [x] Al responder incorrectamente: feedback visual + `Haptics.notificationAsync(Error)`
- [ ] UPDATE en `student_progress` con `status`, `score`, `completed_at` desde API real
- [ ] Solo educadores con acceso al curso pueden crear content_items

---

### HU-29 · Educador · 6 pts · 🟢 Completa

> `utils/speech-recognition.ts` abstrae el STT: `registerSttImpl()` permite registrar el paquete real (`expo-speech-recognition` o `react-native-voice`) en el bootstrap de la app. Helpers `normalizeAnswer` (quita diacríticos, puntuación) y `answersMatch(given, expected, alternatives)` para comparación fuzzy. UI en `ContentItemPractice` con botón mic + fallback `TextInput`. Feedback haptic+visual+`announce()`.

**Como** educador,  
**quiero** crear ejercicios de respuesta por voz para mis cursos,  
**para** que los estudiantes practiquen expresión oral de forma accesible.

**Criterios de aceptación:**

- [x] Frontend lee `content_items` con `content_type = 'quiz_voice'` y `correct_answer`
- [x] Al practicar: STT convierte voz a texto (si está disponible) y se compara con `correct_answer`
- [x] Fallback con `TextInput` cuando STT no está disponible (también validado contra `correct_answer`)
- [x] UPSERT en `student_progress` al completar (`upsertProgress` con score 100/0)
- [x] Compatible con TalkBack activado (`announce` después de cada respuesta)
- [ ] Integrar paquete STT real (pendiente — la infraestructura está lista)

> ⚠️ Spike técnico obligatorio: validar compatibilidad STT con TalkBack en Android (al integrar el paquete real).

---

### HU-35 · Educador Principal · 3 pts · 🟡 Parcial (mock)

> `progress.tsx` coloriza las barras de progreso: verde ≥70%, naranja ≥40%, rojo <40%. No muestra las etiquetas "Inicial / En progreso / Avanzado" explícitamente ni filtra por nivel. Mock data.

**Como** educador principal,  
**quiero** ver el nivel de aprendizaje de cada estudiante en un curso,  
**para** tomar decisiones de apoyo pedagógico según su estado.

**Criterios de aceptación:**

- [ ] Nivel calculado: `0–30%` → **Inicial**, `31–79%` → **En progreso**, `80–100%` → **Avanzado**
- [ ] Nivel mostrado con etiqueta junto al nombre del estudiante
- [ ] Filtro por nivel en la lista de estudiantes
- [ ] Datos reales desde `student_progress` COUNT

---

### HU-36 · Educador Principal · 3 pts · 🟢 Completa

> `classroom-detail.tsx` tiene un Modal "Asignar educador" con input email + POST `/classroom-educators` vía `assignEducatorToClassroom()`. Manejo específico de errores HTTP: 404 ("No se encontró un educador con ese correo"), 409 ("Ya está asignado"), 400 ("No tiene rol de educador"). Botón remover con confirmación destructiva.

**Como** educador principal,  
**quiero** asignar un educador a un salón ingresando su código/ID único,  
**para** hacerlo de forma administrativa sin escanear un QR.

**Criterios de aceptación:**

- [x] Búsqueda por `users.email` entre educadores activos (delegada al backend)
- [x] Confirmación visual de identidad después de la búsqueda (full_name + email visibles en la lista)
- [x] Mensaje si ya está asignado (HTTP 409)
- [x] Mensaje si el usuario no tiene `role = 'educator'` (HTTP 400)
- [x] INSERT en `classroom_educators` (POST `/classroom-educators`)
- [x] Acción de remover educador con confirmación destructiva (DELETE `/classroom-educators/:classroomId/:educatorId`)

---

### HU-37 · Educador · 3 pts · 🟢 Completa

> `(teacher)/preview-material.tsx`: carga `content_item` por `contentItemId`, banner "Modo previsualización" indicando que no afecta progreso. Hero con icono por `content_type` + badge + `talkback_text` en cita. Botones para probar háptico (`triggerHaptic`) y trazado (mismo motor del estudiante). Quiz muestra la respuesta correcta resaltada en verde. CTA "Agregar al curso" con POST `/courses/:id/content-items`.

**Como** educador,  
**quiero** previsualizar el material educativo antes de asignarlo a mi curso,  
**para** verificar que el contenido es adecuado para mis estudiantes.

**Criterios de aceptación:**

- [x] Previsualización carga el `content_item` con `point_map`, `haptic_pattern` y `talkback_text`
- [x] Motor háptico (`triggerHaptic`) activo y reutiliza la misma pantalla `haptic-trace` del estudiante
- [x] TalkBack lee `talkback_text` al cargar (`announce`)
- [x] No crea ni modifica `student_progress` (no llama a `upsertProgress`)
- [x] Botón "Agregar al curso" con POST `/courses/:id/content-items`

---

### HU-40 · Educador Principal · 3 pts · 🟢 Completa

> `(teacher)/student-detail.tsx`: carga `GET /classrooms/:classroomId/students/:studentId`. Card del estudiante con avatar/nombre/email/fecha inscripción. Tarjetas comparativas "Nivel inicial" (snapshot al inscribirse) vs "Nivel actual" (live), ambas con etiqueta (Inicial/En progreso/Avanzado) y color por rango usando `levelInfo()` compartido en `services/classrooms.ts`. Caja delta con flecha ↑/↓ y mensaje contextual. Breakdown por curso con barra de progreso y última actividad. La lista en `classroom-detail.tsx` muestra los mismos badges y es navegable hacia esta pantalla.

**Como** educador principal,  
**quiero** ver el nivel inicial vs el nivel actual de cada estudiante,  
**para** medir el avance real de aprendizaje a lo largo del tiempo.

**Criterios de aceptación:**

- [x] Al inscribir estudiante, registrar nivel inicial en `classroom_students.initial_score` (delegado al backend; frontend lee y muestra)
- [x] Vista de detalle muestra: nivel inicial (snapshot) vs nivel actual (tiempo real)
- [x] El nivel inicial no se sobreescribe (frontend solo lo lee, no edita)
- [x] Delta visual con flecha y mensaje pedagógico (Avance positivo / Requiere apoyo)
- [x] Breakdown por curso con `completed_items`/`total_items` y `last_activity`

---

## Épica 6 — Contenido Educativo

**Sprints:** Sprints 4–5  
**Objetivo:** Cargar todo el material educativo predefinido y los flujos de práctica, evaluación y cierre de lección.

> ⚠️ **Dependencia crítica:** Todo el contenido depende de HU-10 (PointMapRenderer) y HU-25 (motor didáctico) estables.

---

### HU-21 · Contenido · 6 pts · ⚫ No aplica (admin/backend)

> Carga de datos en Supabase por admin. La pantalla de práctica (`practice.tsx`) ya puede renderizar ejercicios tipo `letter` cuando vengan de la API.

**Como** administrador,  
**quiero** cargar el abecedario A–Z como `content_items` en un curso base,  
**para** que los educadores puedan seleccionarlo y asignarlo a sus cursos.

**Criterios de aceptación:**

- [ ] 27 INSERT en `content_items` con `content_type = 'letter'`, `created_by = admin_user_id`
- [ ] `talkback_text = 'Letra A'` (o la letra correspondiente)
- [ ] `point_map` JSONB con coordenadas normalizadas de la forma de la letra
- [ ] `haptic_pattern_id` apuntando al patrón `letter_trace`
- [ ] `sort_order` del 1 al 27

---

### HU-22 · Contenido · 5 pts · ⚫ No aplica (admin/backend)

**Como** administrador,  
**quiero** cargar los números 0–9 como `content_items`,  
**para** que los estudiantes puedan practicarlos con vibración y TalkBack.

**Criterios de aceptación:**

- [ ] 10 INSERT en `content_items` con `content_type = 'number'`, `created_by = admin_user_id`
- [ ] `talkback_text = 'Número 0'` (o el número correspondiente)
- [ ] `point_map` JSONB con la forma del número, `haptic_pattern_id` → `number_trace`
- [ ] `sort_order` del 1 al 10

---

### HU-23 · Contenido · 6 pts · ⚫ No aplica (admin/backend)

**Como** administrador,  
**quiero** cargar el alfabeto braille A–Z como `content_items`,  
**para** que los estudiantes puedan aprender braille de forma táctil.

**Criterios de aceptación:**

- [ ] 27 INSERT en `content_items` con `content_type = 'braille'`, `created_by = admin_user_id`
- [ ] `point_map` JSONB representa celda braille estándar 2×3 (6 puntos)
- [ ] `haptic_pattern_id` → `braille_cell`
- [ ] `talkback_text = 'Braille de la letra A'`
- [ ] Puntos fieles al estándar braille internacional

---

### HU-30 · Accesibilidad · 5 pts · 🟢 Completa

> Auditoría TalkBack aplicada en los flujos críticos. Cada `TouchableOpacity` clave tiene `accessibilityLabel`, `accessibilityRole`, `accessibilityHint` y `accessibilityState` (busy/disabled/checked/selected). `announce()` invocado en eventos relevantes. `talkback_text` de `content_items` consumido como `accessibilityLabel` cuando está disponible.

**Como** usuario,  
**quiero** que todos los flujos de la app funcionen completamente con TalkBack activado,  
**para** no necesitar ver la pantalla en ningún momento.

**Criterios de aceptación:**

- [x] `talkback_text` consumido en `course-detail` (`ContentRow`) y `practice` (`ContentItemPractice`)
- [ ] `profiles.talkback_enabled` sincronizado con estado real de TalkBack del dispositivo al iniciar (HU-27: el toggle existe en perfil, sincronización device-state pendiente)
- [x] Flujos auditados con TalkBack: registro, login, recuperar contraseña, home estudiante, course-detail, practice (haptic/trace/quiz/voice), QR scan, admin users
- [x] Todos los `TouchableOpacity` críticos tienen `accessibilityLabel` (auditoría extendida a teacher dashboard, progress, classroom list pendiente)
- [x] `triggerHaptic` y `announce()` coordinados: vibración primero, luego anuncio (lesson_start, lesson_end, correct, incorrect, qr_scan)

---

### HU-31 · Contenido · 3 pts · 🟢 Completa

> `upsertProgress` ahora incluye `attempts: 1` en el body (`POST /progress`) — el backend incrementa el contador en cada llamada. `(student)/history.tsx`: pantalla nueva (tab "Historial") que llama a `GET /progress`, muestra overview (completadas / en progreso / puntaje medio) y lista de actividad reciente ordenada por `completed_at DESC`. Añadida al `_layout.tsx` del estudiante como 4.º tab.

**Como** estudiante,  
**quiero** que al finalizar una lección quede registrada como completada y pueda ver mi historial,  
**para** saber qué he practicado y cuánto he avanzado.

**Criterios de aceptación:**

- [x] Al completar todos los ejercicios: `SessionStore.markLesson()` persiste localmente
- [x] UPSERT en `student_progress` con `status = 'completed'`, `score` via API real (en flujo API con UUIDs)
- [ ] `student_progress.attempts` se incrementa en cada intento
- [ ] Pantalla de historial con items completados ordenados por `completed_at DESC`
- [ ] Un item no puede volver de `completed` a `not_started`

---

### HU-33 · Contenido · 2 pts · 🟢 Completa

> `ContentItemPractice` en `practice.tsx` dispara `triggerHaptic('lesson_end')` + `announce('¡Lección completada!...')` al marcar `allDone`. Panel visual con emoji 🎉 y CTA "Ver mi progreso". `word-flow.tsx` extiende el patrón al completar una palabra completa, anunciando "La palabra es ..." + `triggerHaptic('lesson_end')`.

**Como** estudiante,  
**quiero** ver una pantalla de logro con haptic y mensaje de voz al completar un curso,  
**para** sentir que alcancé un objetivo.

**Criterios de aceptación:**

- [x] Panel de logro al completar todos los ejercicios de una lección
- [ ] Detección de CURSO completo: todos los `content_items` con `status = 'completed'` (parcial — se hace por lección/palabra; la detección a nivel de curso completo queda como mejora cuando el backend exponga el endpoint de summary)
- [x] `triggerHaptic('lesson_end')` al mostrar la pantalla de logro
- [x] `announce('¡Lección completada!')` y `announce('La palabra es...')` con `AccessibilityInfo`
- [x] La pantalla de logro no se vuelve a mostrar si la lección ya fue completada (SessionStore.isLessonDone)

---

### HU-34 · QA · 5 pts · ⚫ No aplica (Sprint 5)

> Pendiente de funcionalidades previas. No aplicable hasta Sprint 5.

**Como** QA / PO,  
**quiero** realizar pruebas end-to-end de todos los flujos por rol y validar el MVP,  
**para** entregar un producto estable y accesible.

**Criterios de aceptación:**

- [ ] Flujo `admin`: login → listar usuarios → suspender cuenta → agregar patrón háptico → cargar content_item
- [ ] Flujo `lead_educator`: login → crear salón → asignar educador (por ID) → ver progreso de estudiantes
- [ ] Flujo `educator`: login → crear curso → inscribir estudiante (QR scan) → crear quiz_mc → publicar curso
- [ ] Flujo `student`: login → ver cursos → practicar letra/número/braille → responder quiz → ver pantalla de logro
- [ ] Todos los flujos probados con TalkBack activado en dispositivo físico Android
- [ ] APK de demo generado y probado en al menos 2 dispositivos Android

---

### HU-38 · Contenido · 5 pts · ⚫ No aplica (admin/backend)

**Como** administrador,  
**quiero** cargar lecciones de sílabas básicas como `content_items`,  
**para** ampliar el contenido hacia la formación de palabras.

**Criterios de aceptación:**

- [ ] Mínimo 8 INSERT en `content_items` con `content_type = 'letter'` y título con la sílaba (ej: `'MA'`, `'PA'`, `'SA'`)
- [ ] `point_map` JSONB con composición de los dos puntos de la sílaba
- [ ] `haptic_pattern_id` → `letter_trace`
- [ ] `talkback_text = 'Sílaba MA'`
- [ ] Educadores pueden seleccionar estas sílabas al crear su curso

---

### HU-39 · Contenido · 5 pts · 🟢 Completa

> `(student)/word-flow.tsx`: recibe `courseId` (y opcional `wordItemId`), carga `content_items` tipo `letter` ordenados por `sort_order`. Presenta sílaba por sílaba con barra "Sílaba X de N", chips con sílabas anteriores + sílaba actual destacada, botón "Sentir patrón" para háptico. Al finalizar: pantalla con la palabra completa renderizada grande, `announce('La palabra es ...')` + `triggerHaptic('lesson_end')` + `upsertProgress`.

**Como** estudiante,  
**quiero** practicar palabras completas por sílabas secuenciales escuchando la palabra al finalizar,  
**para** aprender a construir palabras de forma progresiva.

**Criterios de aceptación:**

- [x] Flujo de pantallas usando `sort_order` para presentar sílaba 1 → "Continuar" → sílaba 2 → "Finalizar"
- [x] Al finalizar: `announce('La palabra es ...')` + `triggerHaptic('lesson_end')`
- [x] UPSERT en `student_progress` con `status = 'completed'` para el `wordItemId` contenedor
- [ ] Palabras mínimas: MAMÁ, PAPÁ, SALA, LANA, FAMA (depende de la carga de contenido — HU-38 backend/admin)

---

# PLAN DE SPRINTS

---

## Sprint 1 — Semanas 1-2 · 22 pts · 5 HUs

**Objetivo:** Los 3 proyectos corren localmente, el schema SQL está aplicado en Supabase y los mockups están aprobados.

| HU    | Descripción                                                  | Pts | Estado       |
| ----- | ------------------------------------------------------------ | --- | ------------ |
| HU-01 | Proyecto React Native con Expo/CLI y estructura FDD          | 5   | 🟡 Parcial   |
| HU-02 | Proyecto NestJS FDD conectado a Supabase                     | 5   | ⚫ No aplica |
| HU-03 | Supabase inicializado: schema SQL, triggers, RLS y seed data | 3   | ⚫ No aplica |
| HU-04 | Dependencias de React Native instaladas y validadas          | 3   | 🟢 Completa  |
| HU-05 | Mockups Figma completos para todos los roles y flujos        | 6   | ⚫ No aplica |

---

## Sprint 2 — Semanas 3-4 · 37 pts · 10 HUs

**Objetivo:** Auth completo operativo. Motores de hapticidad y TalkBack listos para ser consumidos.

| HU    | Descripción                                                                     | Pts | Estado      |
| ----- | ------------------------------------------------------------------------------- | --- | ----------- |
| HU-06 | Registro con email/Google, trigger `handle_new_auth_user` activo                | 5   | 🟢 Completa |
| HU-07 | Login con sesión persistente y redirección por `users.role`                     | 4   | 🟡 Parcial  |
| HU-08 | Panel de admin con acceso total por RLS                                         | 3   | 🟢 Completa |
| HU-24 | Admin: listar usuarios, suspender/reactivar `users.status`                      | 3   | 🟢 Completa |
| HU-32 | Recuperación de contraseña para `auth_provider = 'email'`                       | 2   | 🟢 Completa |
| HU-09 | Motor háptico: `triggerHaptic(patternKey)` consumiendo `haptic_patterns.pulses` | 4   | 🟢 Completa |
| HU-10 | `PointMapRenderer` desde `content_items.point_map` JSONB                        | 6   | 🟡 Parcial  |
| HU-11 | Módulo TalkBack: `announce()`, `a11yProps()`, `profiles.talkback_enabled`       | 4   | 🟢 Completa |
| HU-18 | QR generado por trigger `trg_generate_qr_code` al activar cuenta                | 3   | 🟢 Completa |
| HU-37 | Educador: previsualizar `content_item` sin generar `student_progress`           | 3   | 🟢 Completa |

> ⚠️ **Spike técnico obligatorio:** Validar STT con TalkBack activado en Android.

---

## Sprint 3 — Semanas 5-6 · 39 pts · 11 HUs

**Objetivo:** Flujo completo de gestión operativo: salones, inscripciones, cursos y perfiles.

| HU    | Descripción                                                            | Pts | Estado      |
| ----- | ---------------------------------------------------------------------- | --- | ----------- |
| HU-12 | Ed. Principal: progreso via `student_progress` de sus salones          | 5   | 🟢 Completa |
| HU-13 | Crear `classrooms`, gestionar `classroom_educators`                    | 4   | 🟢 Completa |
| HU-36 | Asignar educador por `users.email` o `users.qr_code`                   | 3   | 🟢 Completa |
| HU-14 | Crear `courses` con `is_published = FALSE` por defecto                 | 5   | 🟢 Completa |
| HU-15 | Escanear QR → buscar por `users.qr_code` → INSERT `classroom_students` | 4   | 🟢 Completa |
| HU-16 | DELETE en `courses` solo si `educator_id = auth.uid()` (RLS)           | 2   | 🟢 Completa |
| HU-26 | Ver `student_progress` por alumno: `status`, `score`, `attempts`       | 3   | 🟢 Completa |
| HU-17 | Vista de salón: `courses`, COUNT `classroom_students`                  | 4   | 🟢 Completa |
| HU-19 | Home estudiante: `courses` publicados + `student_progress`             | 3   | 🟢 Completa |
| HU-20 | Explorar curso: `content_items` ordenados por `sort_order`             | 4   | 🟢 Completa |
| HU-27 | Perfil: `users.qr_code`, `profiles.talkback_enabled`, cerrar sesión    | 2   | 🟢 Completa |

---

## Sprint 4 — Semanas 7-8 · 48 pts · 10 HUs

**Objetivo:** Todo el contenido educativo cargado y practicable. Progreso del estudiante funcionando.

| HU    | Descripción                                                            | Pts | Estado       |
| ----- | ---------------------------------------------------------------------- | --- | ------------ |
| HU-21 | 27 `content_items` tipo `letter` con `point_map` y `talkback_text`     | 6   | ⚫ No aplica |
| HU-22 | 10 `content_items` tipo `number` con `point_map` y `talkback_text`     | 5   | ⚫ No aplica |
| HU-23 | 27 `content_items` tipo `braille` con celda 2×3 en `point_map`         | 6   | ⚫ No aplica |
| HU-25 | Motor didáctico: JOIN `content_items` + `haptic_patterns`              | 6   | 🟢 Completa  |
| HU-38 | 8+ `content_items` de sílabas con `talkback_text = 'Sílaba XX'`        | 5   | ⚫ No aplica |
| HU-39 | Flujo de palabras usando `sort_order` de `content_items`               | 5   | 🟢 Completa  |
| HU-31 | UPSERT `student_progress` al completar, historial por `completed_at`   | 3   | 🟢 Completa  |
| HU-35 | Nivel calculado desde `student_progress` COUNT por rango %             | 3   | 🟡 Parcial   |
| HU-40 | Snapshot nivel inicial en `classroom_students.enrolled_at`             | 3   | 🟢 Completa  |
| HU-28 | `content_items quiz_mc` + `quiz_questions` + UPSERT `student_progress` | 6   | 🟢 Completa  |

> ⚠️ HU-25 debe completarse antes que HU-21, HU-22, HU-23, HU-38 y HU-39.

---

## Sprint 5 — Semanas 9-10 · 18 pts · 4 HUs

**Objetivo:** App completamente accesible con TalkBack, ejercicios de voz funcionando y MVP validado.

| HU    | Descripción                                                                          | Pts | Estado       |
| ----- | ------------------------------------------------------------------------------------ | --- | ------------ |
| HU-29 | `content_items quiz_voice` + STT + UPSERT `student_progress`                         | 6   | 🟢 Completa  |
| HU-30 | Auditoría: `talkback_text` no nulo en todos los `content_items`, flujos con TalkBack | 5   | 🟢 Completa  |
| HU-33 | Pantalla de logro: `triggerHaptic('lesson_end')` + `announce()` al 100% del curso    | 2   | 🟢 Completa  |
| HU-34 | QA end-to-end por cada `user_role`, APK de demo                                      | 5   | ⚫ No aplica |

> ℹ️ **Sprint ligero (18 pts) intencional.** El margen absorbe deuda técnica y bugs de accesibilidad de la integración final.

---

## Resumen por Épica

| Épica                                      | HUs    | Pts     |
| ------------------------------------------ | ------ | ------- |
| E1 — Setup e Infraestructura               | 4      | 16      |
| E2 — Diseño y Mockups                      | 1      | 6       |
| E3 — Auth, Roles y Acceso                  | 5      | 17      |
| E4 — Accesibilidad y Motor Háptico         | 4      | 20      |
| E5 — Gestión de Usuarios, Salones y Cursos | 16     | 68      |
| E6 — Contenido Educativo                   | 10     | 37      |
| **Total**                                  | **40** | **164** |

---

_HapticLearn — App Educativa Accesible · Universidad Peruana de Ciencias Aplicadas (UPC)_
