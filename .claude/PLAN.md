# Plan de Mejoras - Workmap360 MVP

**Fecha:** 2026-01-16
**Versión:** 1.0
**Estado del Proyecto:** MVP funcional con gaps críticos de seguridad

---

## Resumen Ejecutivo

Este documento detalla las mejoras necesarias para transformar el MVP actual en una aplicación lista para producción. Las tareas están priorizadas según su criticidad y organizadas en 3 fases: **Crítico**, **Alta Prioridad**, y **Mejoras de Mantenibilidad**.

**Score Actual:** 5.4/10
**Score Objetivo:** 8.5/10 (después de completar todas las mejoras)

---

## 📋 FASE 1: SEGURIDAD CRÍTICA (BLOQUEANTES PARA PRODUCCIÓN)

Estas tareas DEBEN completarse antes de cualquier deployment en producción. Sin ellas, la aplicación es vulnerable a ataques graves.

### ✅ 1.1. CSRF Protection (COMPLETADO)

**Estado:** ✅ Implementado
**Archivos creados:**

- `src/lib/security/csrf.ts` - Utilidades de CSRF
- `src/app/api/csrf/route.ts` - Endpoint para obtener token
- `src/hooks/use-csrf-token.ts` - Hook de React
- `SECURITY.md` - Guía de implementación

**Próximos pasos:** Aplicar a todas las rutas API restantes.

---

### 🔴 1.2. Implementar Row-Level Security (RLS) en Supabase

**Prioridad:** CRÍTICA
**Esfuerzo:** 1-2 días
**Riesgo sin implementar:** CRÍTICO - Exposición completa de datos si hay bug en código

#### Problema Actual

```sql
-- ❌ NO hay políticas RLS
-- La seguridad depende SOLO del código de la app
-- Si un token es comprometido → acceso total a la DB
```

#### Solución

Crear migraciones SQL con políticas RLS para todas las tablas:

**Archivos a crear:**

```
supabase/migrations/
  └── 20260116_enable_rls_all_tables.sql
```

**Políticas necesarias:**

##### Tabla: `users`

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = uid);

-- Admin/Manager pueden ver todos los usuarios
CREATE POLICY "Admin and Manager can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Solo Admin puede crear/editar usuarios
CREATE POLICY "Only admin can modify users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role = 'admin'
    )
  );
```

##### Tabla: `projects`

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Admin/Manager pueden ver todos los proyectos
CREATE POLICY "Admin and Manager can view all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Técnicos solo ven proyectos asignados
CREATE POLICY "Technicians can view assigned projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_technicians pt
      JOIN users u ON u.id = pt.technician_id
      WHERE u.uid = auth.uid()
      AND pt.project_id = projects.id
    )
  );

-- Clientes solo ven sus proyectos
CREATE POLICY "Clients can view own projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND id = projects.client_id
    )
  );

-- Solo Admin/Manager pueden crear proyectos
CREATE POLICY "Admin and Manager can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );
```

##### Tabla: `repairs`

```sql
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Admin/Manager pueden ver todas las reparaciones
CREATE POLICY "Admin and Manager can view all repairs"
  ON repairs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- Técnicos ven reparaciones de proyectos asignados
CREATE POLICY "Technicians can view assigned repairs"
  ON repairs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_technicians pt
      JOIN users u ON u.id = pt.technician_id
      WHERE u.uid = auth.uid()
      AND pt.project_id = repairs.project_id
    )
  );

-- Técnicos pueden actualizar sus reparaciones
CREATE POLICY "Technicians can update assigned repairs"
  ON repairs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_technicians pt
      JOIN users u ON u.id = pt.technician_id
      WHERE u.uid = auth.uid()
      AND pt.project_id = repairs.project_id
    )
  );
```

##### Tablas relacionadas: `project_elevations`, `project_repair_types`, `project_technicians`

```sql
-- Similar pattern: heredan permisos del proyecto padre
ALTER TABLE project_elevations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_repair_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technicians ENABLE ROW LEVEL SECURITY;

-- Los permisos se basan en acceso al proyecto
CREATE POLICY "Inherit project permissions"
  ON project_elevations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_elevations.project_id
      -- Las políticas de projects ya validan el acceso
    )
  );
```

#### Checklist de Implementación

- [ ] Crear archivo de migración SQL
- [ ] Escribir políticas RLS para tabla `users`
- [ ] Escribir políticas RLS para tabla `projects`
- [ ] Escribir políticas RLS para tabla `repairs`
- [ ] Escribir políticas RLS para tablas relacionadas
- [ ] Ejecutar migración en entorno de desarrollo
- [ ] Probar con diferentes roles (admin, manager, technician, client)
- [ ] Verificar que cada rol solo ve sus datos permitidos
- [ ] Ejecutar migración en producción

#### Comandos

```bash
# Crear migración
supabase migration new enable_rls_all_tables

# Aplicar migración localmente
supabase db push

# Verificar políticas
supabase db diff
```

---

### 🔴 1.3. Validar Inputs con Zod en Todas las API Routes

**Prioridad:** CRÍTICA
**Esfuerzo:** 1-2 días
**Riesgo sin implementar:** ALTO - XSS, SQL injection, corrupción de datos

#### Problema Actual

```typescript
// ❌ API routes validan existencia pero NO formato
const { firstName, email } = await req.json()
if (!firstName || !email) { return error() }

// Problemas:
// 1. No valida que email sea válido
// 2. No sanitiza HTML/scripts
// 3. No limita longitud de strings
// 4. Permite inyección de datos malformados
```

**Ejemplo de ataque:**

```typescript
// Un atacante puede enviar:
{
  firstName: "<script>alert('XSS')</script>",
  email: "not-an-email",
  role: "super-admin" // rol que no existe
}
```

#### Solución

Crear schemas Zod para cada endpoint y validar ANTES de procesar.

##### Paso 1: Crear schemas en `/src/schemas/api/`

**Archivo: `src/schemas/api/user.schema.ts`**

```typescript
import { z } from 'zod'

// Schema para crear usuario
export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .trim()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Only letters allowed'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long')
    .trim()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Only letters allowed'),

  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .max(255),

  role: z.enum(['admin', 'manager', 'technician', 'client', 'guest'], {
    errorMap: () => ({ message: 'Invalid role' })
  }),

  avatar: z
    .string()
    .url('Invalid avatar URL')
    .optional(),

  status: z
    .enum(['active', 'inactive'])
    .default('active'),

  useInviteFlow: z.boolean().default(true),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// Schema para editar usuario
export const updateUserSchema = createUserSchema
  .partial()
  .extend({
    id: z.number().int().positive()
  })

export type UpdateUserInput = z.infer<typeof updateUserSchema>
```

**Archivo: `src/schemas/api/project.schema.ts`**

```typescript
import { z } from 'zod'

const elevationSchema = z.object({
  name: z.string().min(1).max(100),
  drops: z.number().int().min(1),
  levels: z.number().int().min(1),
})

const repairTypeSchema = z.object({
  repair_type_id: z.number().int(),
  repair_type: z.string().min(1),
  phases: z.array(z.string()),
  price: z.number().min(0),
  unit_to_charge: z.enum(['unit', 'drop', 'level', 'project']),
  minimum_charge_per_repair: z.number().min(0).optional(),
  minimum_charge_per_drop: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name too long')
    .trim(),

  client_name: z.string().min(1).max(200).trim(),

  client_id: z.number().int().positive(),

  status: z
    .enum(['pending', 'in_progress', 'completed', 'cancelled'])
    .default('pending'),

  elevations: z
    .array(elevationSchema)
    .min(1, 'At least one elevation required'),

  repair_types: z.array(repairTypeSchema).optional(),

  technicians: z.array(z.object({
    technician_id: z.number().int(),
    technician_first_name: z.string(),
    technician_last_name: z.string(),
    technician_avatar: z.string().url().optional(),
  })).optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
```

**Archivo: `src/schemas/api/repair.schema.ts`**

```typescript
import { z } from 'zod'

export const createRepairSchema = z.object({
  project_id: z.number().int().positive(),
  repair_type_id: z.number().int().positive(),
  elevation_name: z.string().min(1).max(100),
  drop_number: z.number().int().min(1),
  level: z.number().int().min(1),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']).default('pending'),
  notes: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(10).optional(),
})

export const updateRepairStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  notes: z.string().max(1000).optional(),
})

export type CreateRepairInput = z.infer<typeof createRepairSchema>
export type UpdateRepairStatusInput = z.infer<typeof updateRepairStatusSchema>
```

##### Paso 2: Aplicar schemas en API routes

**Actualizar: `src/app/api/users/create/route.ts`**

```typescript
import { createUserSchema } from '@/schemas/api/user.schema'
import { z } from 'zod'

export async function POST(req: Request) {
  // CSRF Protection
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  try {
    // Auth check
    const { user, role, error } = await getSupabaseAuthWithRole(req)
    if (error || !user || !role) {
      return NextResponse.json({ error }, { status: 401 })
    }

    if (!['admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // ✅ Validar input con Zod
    const body = await req.json()
    const validatedData = createUserSchema.parse(body)

    // Usar validatedData (NO body) para DB operations
    const { data: authUser } = await serviceClient.auth.admin.createUser({
      email: validatedData.email,
      password: `${validatedData.firstName.toLowerCase()}123`,
      email_confirm: true,
    })

    // ... resto del código

  } catch (error) {
    // ✅ Manejar errores de validación
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

##### Paso 3: Crear helper para validación consistente

**Archivo: `src/lib/api/validation.ts`**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          {
            error: 'Invalid input data',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      }
    }

    return {
      error: NextResponse.json(
        { error: 'Failed to parse request body' },
        { status: 400 }
      )
    }
  }
}

// Uso:
export async function POST(req: Request) {
  const validation = await validateRequest(req, createUserSchema)
  if ('error' in validation) return validation.error

  const { data } = validation
  // usar data...
}
```

#### Checklist de Implementación

- [ ] Crear carpeta `src/schemas/api/`
- [ ] Crear `user.schema.ts` con schemas para user endpoints
- [ ] Crear `project.schema.ts` con schemas para project endpoints
- [ ] Crear `repair.schema.ts` con schemas para repair endpoints
- [ ] Crear helper `src/lib/api/validation.ts`
- [ ] Actualizar `/api/users/create` con validación
- [ ] Actualizar `/api/users/edit` con validación
- [ ] Actualizar `/api/users/delete` con validación
- [ ] Actualizar `/api/projects/create` con validación
- [ ] Actualizar `/api/projects/update` con validación
- [ ] Actualizar `/api/projects/delete` con validación
- [ ] Actualizar `/api/repairs/create` con validación
- [ ] Actualizar `/api/repairs/update` con validación
- [ ] Actualizar `/api/repairs/update-status` con validación
- [ ] Actualizar `/api/images/upload` con validación
- [ ] Probar envío de datos inválidos (debe rechazar)
- [ ] Probar envío de datos válidos (debe aceptar)

---

### 🔴 1.4. Implementar Rate Limiting

**Prioridad:** CRÍTICA
**Esfuerzo:** 4-6 horas
**Riesgo sin implementar:** MEDIO-ALTO - Ataques de fuerza bruta, DoS, abuse de API

#### Problema Actual

```typescript
// ❌ No hay límite de requests
// Un atacante puede hacer 1000 requests/segundo a login
// Puede probar miles de contraseñas en minutos
```

#### Solución

Usar `@upstash/ratelimit` con Redis (Upstash ofrece tier gratuito).

##### Paso 1: Instalar dependencias

```bash
npm install @upstash/ratelimit @upstash/redis
```

##### Paso 2: Configurar Upstash

1. Crear cuenta en https://upstash.com
2. Crear base de datos Redis
3. Agregar variables a `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

##### Paso 3: Crear configuración de rate limiting

**Archivo: `src/lib/security/rate-limit.ts`**

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

// Singleton Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiters para diferentes casos de uso
export const rateLimiters = {
  // Auth endpoints: 5 requests por 15 minutos
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // API mutations: 30 requests por minuto
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Image uploads: 10 requests por minuto
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:upload',
  }),

  // Strict: para endpoints muy sensibles
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '10 m'),
    analytics: true,
    prefix: 'ratelimit:strict',
  }),
}

/**
 * Aplica rate limiting a una request
 * @param req - Request object
 * @param limiter - Cual rate limiter usar
 * @returns NextResponse si se excedió el límite, null si está OK
 */
export async function applyRateLimit(
  req: Request,
  limiter: Ratelimit
): Promise<NextResponse | null> {
  // Usar IP como identificador (o user ID si está autenticado)
  const ip = req.headers.get('x-forwarded-for') ??
             req.headers.get('x-real-ip') ??
             'unknown'

  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    console.warn(`Rate limit exceeded for IP: ${ip}`)

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  return null
}
```

##### Paso 4: Aplicar a endpoints críticos

**Ejemplo: Login endpoint**

```typescript
// src/app/api/auth/login/route.ts
import { applyRateLimit, rateLimiters } from '@/lib/security/rate-limit'

export async function POST(req: Request) {
  // ✅ Rate limiting ANTES de cualquier procesamiento
  const rateLimitResult = await applyRateLimit(req, rateLimiters.auth)
  if (rateLimitResult) return rateLimitResult

  // Continuar con lógica de login...
}
```

**Ejemplo: User creation**

```typescript
// src/app/api/users/create/route.ts
import { applyRateLimit, rateLimiters } from '@/lib/security/rate-limit'

export async function POST(req: Request) {
  // Rate limiting
  const rateLimitResult = await applyRateLimit(req, rateLimiters.api)
  if (rateLimitResult) return rateLimitResult

  // CSRF
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  // Resto de la lógica...
}
```

**Ejemplo: Image upload**

```typescript
// src/app/api/images/upload/route.ts
import { applyRateLimit, rateLimiters } from '@/lib/security/rate-limit'

export async function POST(req: Request) {
  // Rate limiting más restrictivo para uploads
  const rateLimitResult = await applyRateLimit(req, rateLimiters.upload)
  if (rateLimitResult) return rateLimitResult

  // Procesamiento de imagen...
}
```

#### Checklist de Implementación

- [ ] Crear cuenta en Upstash
- [ ] Crear base de datos Redis
- [ ] Agregar variables de entorno
- [ ] Instalar paquetes npm
- [ ] Crear `src/lib/security/rate-limit.ts`
- [ ] Aplicar rate limiting a `/api/auth/*` (todos los endpoints)
- [ ] Aplicar a `/api/users/create`
- [ ] Aplicar a `/api/users/edit`
- [ ] Aplicar a `/api/users/delete`
- [ ] Aplicar a `/api/users/change-password`
- [ ] Aplicar a `/api/projects/create`
- [ ] Aplicar a `/api/projects/update`
- [ ] Aplicar a `/api/projects/delete`
- [ ] Aplicar a `/api/repairs/*` (todos los endpoints)
- [ ] Aplicar a `/api/images/upload`
- [ ] Probar haciendo muchas requests (debe bloquear después del límite)
- [ ] Verificar headers de rate limit en respuestas

---

### 🔴 1.5. Aplicar CSRF a Todas las Rutas API Restantes

**Prioridad:** CRÍTICA
**Esfuerzo:** 2-3 horas
**Estado:** Parcialmente implementado (solo `/api/users/create`)

#### Rutas que necesitan CSRF

- [ ] `/api/users/edit` - PUT
- [ ] `/api/users/delete` - DELETE
- [ ] `/api/users/change-password` - POST
- [ ] `/api/projects/create` - POST
- [ ] `/api/projects/update` - PUT
- [ ] `/api/projects/delete` - DELETE
- [ ] `/api/repairs/create` - POST
- [ ] `/api/repairs/update` - PUT
- [ ] `/api/repairs/update-status` - PUT
- [ ] `/api/repairs/delete` - DELETE
- [ ] `/api/images/upload` - POST
- [ ] `/api/images/signed-upload` - POST
- [ ] `/api/images/[id]` - DELETE

#### Template para aplicar

```typescript
import { validateCSRFForRequest } from '@/lib/security/csrf'

export async function POST(req: Request) {
  // Agregar como primera validación
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  // Resto del código...
}
```

---

### 🔴 1.6. Configuración Segura de Variables de Entorno

**Prioridad:** CRÍTICA
**Esfuerzo:** 30 minutos
**Riesgo sin implementar:** CRÍTICO - Si .env.local se filtra, toda la seguridad se compromete

#### Problema Actual

```env
# ❌ Secrets en .env.local (riesgo de commit accidental)
SUPABASE_SERVICE_ROLE_KEY=...  # Acceso total a DB
CLOUDINARY_API_SECRET=...       # Permite subir/borrar cualquier imagen
VAPID_PRIVATE_KEY=...           # Permite enviar push notifications falsas
```

#### Solución

##### Paso 1: Actualizar `.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Supabase
.supabase
```

##### Paso 2: Crear `.env.example` con placeholders

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Optional: Web Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

##### Paso 3: Validar env vars en runtime

**Archivo: `src/lib/env.ts`**

```typescript
// Validación de variables de entorno
function getEnvVar(key: string, isPublic = false): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(
      `Missing ${isPublic ? 'public' : 'server'} environment variable: ${key}`
    )
  }

  return value
}

// Server-only (NUNCA exponer al cliente)
export const serverEnv = {
  supabase: {
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  },
  cloudinary: {
    apiSecret: getEnvVar('CLOUDINARY_API_SECRET'),
  },
  upstash: {
    redisUrl: getEnvVar('UPSTASH_REDIS_REST_URL'),
    redisToken: getEnvVar('UPSTASH_REDIS_REST_TOKEN'),
  },
  vapid: {
    privateKey: getEnvVar('VAPID_PRIVATE_KEY'),
  },
} as const

// Public (seguro exponer al cliente)
export const publicEnv = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', true),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', true),
  },
  cloudinary: {
    cloudName: getEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', true),
  },
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL', true),
  },
  vapid: {
    publicKey: getEnvVar('VAPID_PUBLIC_KEY', true),
  },
} as const

// Uso:
// import { serverEnv, publicEnv } from '@/lib/env'
// const secret = serverEnv.supabase.serviceRoleKey
```

##### Paso 4: Configurar en hosting provider

**Vercel:**

1. Ir a Project Settings → Environment Variables
2. Agregar cada variable con su valor
3. Seleccionar environments: Production, Preview, Development

**Netlify:**

1. Ir a Site Settings → Environment Variables
2. Agregar cada variable

**Railway/Render:**
Similar - usar el panel de environment variables

#### Checklist de Implementación

- [ ] Verificar que `.env.local` está en `.gitignore`
- [ ] Crear `.env.example` con placeholders
- [ ] Crear `src/lib/env.ts` con validación
- [ ] Actualizar imports para usar `serverEnv` / `publicEnv`
- [ ] Configurar variables en hosting provider
- [ ] Eliminar hardcoded secrets del código
- [ ] Verificar que build funciona sin .env.local
- [ ] Documentar proceso en README.md

---

## 📋 FASE 2: FUNCIONALIDADES CORE (ALTA PRIORIDAD)

Estas funcionalidades son necesarias para que la app cumpla su propósito como PWA de construcción.

### 🟠 2.1. Implementar Real-time Subscriptions

**Prioridad:** ALTA
**Esfuerzo:** 2-3 días
**Impacto:** Sin esto, no hay colaboración en tiempo real

#### Problema Actual

```typescript
// ❌ Package instalado pero NO usado
"@supabase/realtime-js": "^2.0.0"

// Los usuarios deben refrescar manualmente
// No hay updates automáticos cuando otro usuario cambia datos
```

#### Solución

##### Paso 1: Crear hook de real-time para proyectos

**Archivo: `src/hooks/use-realtime-projects.ts`**

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProjectStore } from '@/stores/project-store'
import type { Project } from '@/types/project-types'

export function useRealtimeProjects() {
  const { addProject, updateProject, removeProject } = useProjectStore()

  useEffect(() => {
    const supabase = createClient()

    // Suscribirse a cambios en la tabla projects
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('New project:', payload.new)
          addProject(payload.new as Project)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Project updated:', payload.new)
          updateProject(payload.new as Project)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Project deleted:', payload.old)
          removeProject((payload.old as Project).id)
        }
      )
      .subscribe((status) => {
        console.log('Projects realtime status:', status)
      })

    // Cleanup al desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [addProject, updateProject, removeProject])
}
```

##### Paso 2: Crear hook de real-time para repairs

**Archivo: `src/hooks/use-realtime-repairs.ts`**

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRepairStore } from '@/stores/repair-store'
import type { Repair } from '@/types/project-types'

export function useRealtimeRepairs(projectId?: number) {
  const { addRepair, updateRepair, removeRepair } = useRepairStore()

  useEffect(() => {
    const supabase = createClient()

    // Si projectId es proporcionado, filtrar por ese proyecto
    const filter = projectId
      ? { project_id: `eq.${projectId}` }
      : {}

    const channel = supabase
      .channel(`repairs-changes${projectId ? `-${projectId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'repairs',
          filter: projectId ? `project_id=eq.${projectId}` : undefined,
        },
        (payload) => {
          console.log('New repair:', payload.new)
          addRepair(payload.new as Repair)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'repairs',
          filter: projectId ? `project_id=eq.${projectId}` : undefined,
        },
        (payload) => {
          console.log('Repair updated:', payload.new)
          updateRepair(payload.new as Repair)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'repairs',
          filter: projectId ? `project_id=eq.${projectId}` : undefined,
        },
        (payload) => {
          console.log('Repair deleted:', payload.old)
          removeRepair((payload.old as Repair).id)
        }
      )
      .subscribe((status) => {
        console.log('Repairs realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, addRepair, updateRepair, removeRepair])
}
```

##### Paso 3: Actualizar Zustand stores para soportar real-time

**Actualizar: `src/stores/project-store.ts`**

```typescript
interface ProjectStore {
  projects: Project[]
  // ... otros campos

  // Métodos para real-time
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  removeProject: (projectId: number) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),

  updateProject: (updatedProject) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    )
  })),

  removeProject: (projectId) => set((state) => ({
    projects: state.projects.filter(p => p.id !== projectId)
  })),
}))
```

##### Paso 4: Usar hooks en componentes

**Actualizar: `src/app/dashboard/[role]/projects/page.tsx`**

```typescript
'use client'

import { useRealtimeProjects } from '@/hooks/use-realtime-projects'
import { useProjectStore } from '@/stores/project-store'

export default function ProjectsPage() {
  // ✅ Activar real-time
  useRealtimeProjects()

  const { projects } = useProjectStore()

  return (
    <div>
      {/* UI se actualiza automáticamente cuando hay cambios */}
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

##### Paso 5: Configurar Supabase Realtime

En el dashboard de Supabase:

1. Ir a Database → Replication
2. Habilitar replicación para tablas: `projects`, `repairs`
3. Verificar que RLS permite las subscriptions

#### Checklist de Implementación

- [ ] Crear `src/hooks/use-realtime-projects.ts`
- [ ] Crear `src/hooks/use-realtime-repairs.ts`
- [ ] Crear store para repairs si no existe
- [ ] Actualizar `project-store` con métodos real-time
- [ ] Usar `useRealtimeProjects` en página de proyectos
- [ ] Usar `useRealtimeRepairs` en página de reparaciones
- [ ] Habilitar replicación en Supabase
- [ ] Probar en múltiples ventanas (cambios deben verse en tiempo real)
- [ ] Probar reconexión después de perder conexión
- [ ] Agregar indicador visual de estado de conexión

---

### 🟠 2.2. Completar Offline Sync con Dexie

**Prioridad:** ALTA
**Esfuerzo:** 3-4 días
**Impacto:** App inutilizable en sitios de construcción sin conectividad

#### Problema Actual

```typescript
// ❌ Dexie configurado pero funciones NUNCA llamadas
export async function saveRepairOffline(repair: RepairData) {
  await db.repairs.add(repair)  // Nunca se ejecuta
}
```

#### Solución Completa

##### Paso 1: Actualizar schema de Dexie

**Actualizar: `src/lib/db/dexie.ts`**

```typescript
import Dexie, { type Table } from 'dexie'

export interface OfflineRepair {
  id?: number
  localId: string // UUID temporal
  projectId: number
  repairTypeId: number
  elevationName: string
  dropNumber: number
  level: number
  status: string
  notes?: string
  images?: string[]
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error'
  syncError?: string
  syncAttempts: number
}

export interface OfflineProject {
  id?: number
  localId: string
  name: string
  clientName: string
  clientId: number
  status: string
  elevations: unknown[]
  repairTypes: unknown[]
  technicians: unknown[]
  createdAt: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error'
  syncError?: string
  syncAttempts: number
}

export interface OfflineImage {
  id?: number
  localId: string
  repairLocalId: string
  base64Data: string
  fileName: string
  mimeType: string
  size: number
  uploadedUrl?: string
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error'
  syncError?: string
}

class WorkmapDatabase extends Dexie {
  repairs!: Table<OfflineRepair>
  projects!: Table<OfflineProject>
  images!: Table<OfflineImage>

  constructor() {
    super('workmap-offline-db')

    this.version(1).stores({
      repairs: '++id, localId, projectId, syncStatus',
      projects: '++id, localId, syncStatus',
      images: '++id, localId, repairLocalId, syncStatus',
    })
  }
}

export const db = new WorkmapDatabase()
```

##### Paso 2: Crear servicio de offline sync

**Archivo: `src/lib/offline/sync-service.ts`**

```typescript
import { db, type OfflineRepair, type OfflineProject } from '@/lib/db/dexie'
import { fetchWithCSRF } from '@/hooks/use-csrf-token'

class SyncService {
  private isOnline = true
  private syncInterval: NodeJS.Timeout | null = null

  constructor() {
    // Detectar cambios en conectividad
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
      this.isOnline = navigator.onLine
    }
  }

  private handleOnline() {
    console.log('✅ Back online, starting sync...')
    this.isOnline = true
    this.syncPendingData()
  }

  private handleOffline() {
    console.log('❌ Offline detected')
    this.isOnline = false
  }

  /**
   * Guarda una reparación offline
   */
  async saveRepairOffline(repair: Omit<OfflineRepair, 'id' | 'syncStatus' | 'syncAttempts'>): Promise<string> {
    const repairData: OfflineRepair = {
      ...repair,
      syncStatus: 'pending',
      syncAttempts: 0,
    }

    await db.repairs.add(repairData)
    console.log('💾 Repair saved offline:', repairData.localId)

    // Intentar sync inmediatamente si estamos online
    if (this.isOnline) {
      this.syncPendingData()
    }

    return repairData.localId
  }

  /**
   * Guarda un proyecto offline
   */
  async saveProjectOffline(project: Omit<OfflineProject, 'id' | 'syncStatus' | 'syncAttempts'>): Promise<string> {
    const projectData: OfflineProject = {
      ...project,
      syncStatus: 'pending',
      syncAttempts: 0,
    }

    await db.projects.add(projectData)
    console.log('💾 Project saved offline:', projectData.localId)

    if (this.isOnline) {
      this.syncPendingData()
    }

    return projectData.localId
  }

  /**
   * Sincroniza todos los datos pendientes
   */
  async syncPendingData() {
    if (!this.isOnline) {
      console.log('⏸️ Skipping sync - offline')
      return
    }

    console.log('🔄 Starting sync of pending data...')

    try {
      // Sincronizar proyectos primero
      await this.syncPendingProjects()

      // Luego reparaciones
      await this.syncPendingRepairs()

      // Finalmente imágenes
      await this.syncPendingImages()

      console.log('✅ Sync completed')
    } catch (error) {
      console.error('❌ Sync failed:', error)
    }
  }

  private async syncPendingProjects() {
    const pending = await db.projects
      .where('syncStatus')
      .equals('pending')
      .toArray()

    console.log(`📦 Syncing ${pending.length} pending projects...`)

    for (const project of pending) {
      try {
        // Marcar como syncing
        await db.projects.update(project.id!, { syncStatus: 'syncing' })

        // Enviar al servidor
        const response = await fetchWithCSRF('/api/projects/create', {
          method: 'POST',
          body: JSON.stringify({
            name: project.name,
            client_name: project.clientName,
            client_id: project.clientId,
            status: project.status,
            elevations: project.elevations,
            repair_types: project.repairTypes,
            technicians: project.technicians,
          }),
        })

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`)
        }

        const data = await response.json()

        // Marcar como synced
        await db.projects.update(project.id!, {
          syncStatus: 'synced',
          id: data.project_id, // Guardar ID real del servidor
        })

        console.log(`✅ Project ${project.localId} synced`)
      } catch (error) {
        console.error(`❌ Failed to sync project ${project.localId}:`, error)

        await db.projects.update(project.id!, {
          syncStatus: 'error',
          syncError: error instanceof Error ? error.message : 'Unknown error',
          syncAttempts: (project.syncAttempts || 0) + 1,
        })
      }
    }
  }

  private async syncPendingRepairs() {
    const pending = await db.repairs
      .where('syncStatus')
      .equals('pending')
      .toArray()

    console.log(`🔧 Syncing ${pending.length} pending repairs...`)

    for (const repair of pending) {
      try {
        await db.repairs.update(repair.id!, { syncStatus: 'syncing' })

        const response = await fetchWithCSRF('/api/repairs/create', {
          method: 'POST',
          body: JSON.stringify({
            project_id: repair.projectId,
            repair_type_id: repair.repairTypeId,
            elevation_name: repair.elevationName,
            drop_number: repair.dropNumber,
            level: repair.level,
            status: repair.status,
            notes: repair.notes,
            images: repair.images,
          }),
        })

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`)
        }

        const data = await response.json()

        await db.repairs.update(repair.id!, {
          syncStatus: 'synced',
          id: data.repair_id,
        })

        console.log(`✅ Repair ${repair.localId} synced`)
      } catch (error) {
        console.error(`❌ Failed to sync repair ${repair.localId}:`, error)

        await db.repairs.update(repair.id!, {
          syncStatus: 'error',
          syncError: error instanceof Error ? error.message : 'Unknown error',
          syncAttempts: (repair.syncAttempts || 0) + 1,
        })
      }
    }
  }

  private async syncPendingImages() {
    // Similar implementation for images
    console.log('🖼️ Image sync not yet implemented')
  }

  /**
   * Obtiene estadísticas de sync
   */
  async getSyncStats() {
    const [pendingRepairs, errorRepairs, pendingProjects, errorProjects] = await Promise.all([
      db.repairs.where('syncStatus').equals('pending').count(),
      db.repairs.where('syncStatus').equals('error').count(),
      db.projects.where('syncStatus').equals('pending').count(),
      db.projects.where('syncStatus').equals('error').count(),
    ])

    return {
      repairs: {
        pending: pendingRepairs,
        errors: errorRepairs,
      },
      projects: {
        pending: pendingProjects,
        errors: errorProjects,
      },
      total: {
        pending: pendingRepairs + pendingProjects,
        errors: errorRepairs + errorProjects,
      },
    }
  }

  /**
   * Inicia sincronización periódica
   */
  startPeriodicSync(intervalMs = 60000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      this.syncPendingData()
    }, intervalMs)

    console.log(`🔄 Periodic sync started (every ${intervalMs}ms)`)
  }

  /**
   * Detiene sincronización periódica
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('⏸️ Periodic sync stopped')
    }
  }
}

export const syncService = new SyncService()
```

##### Paso 3: Actualizar formularios para usar offline

**Ejemplo: Formulario de reparación**

```typescript
'use client'

import { useState } from 'react'
import { syncService } from '@/lib/offline/sync-service'
import { useToast } from '@/hooks/use-toast'

export function CreateRepairForm() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { toast } = useToast()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSubmit = async (data: RepairFormData) => {
    if (!isOnline) {
      // Guardar offline
      const localId = await syncService.saveRepairOffline({
        localId: crypto.randomUUID(),
        projectId: data.projectId,
        repairTypeId: data.repairTypeId,
        elevationName: data.elevationName,
        dropNumber: data.dropNumber,
        level: data.level,
        status: data.status,
        notes: data.notes,
        images: data.images,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: '💾 Saved offline',
        description: 'Your repair will sync when connection is restored',
      })

      return
    }

    // Enviar normalmente si estamos online
    try {
      const response = await fetchWithCSRF('/api/repairs/create', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create repair')

      toast({
        title: '✅ Repair created',
        description: 'Your repair has been saved',
      })
    } catch (error) {
      // Si falla, guardar offline como fallback
      await syncService.saveRepairOffline({
        localId: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
      })

      toast({
        title: '💾 Saved offline (fallback)',
        description: 'Will sync when possible',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          ⚠️ You are offline. Changes will be saved locally and synced later.
        </div>
      )}

      {/* Form fields */}
    </form>
  )
}
```

##### Paso 4: Crear componente de estado de sync

**Archivo: `src/components/offline/sync-status.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { syncService } from '@/lib/offline/sync-service'

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [stats, setStats] = useState({ total: { pending: 0, errors: 0 } })

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine)
      syncService.getSyncStats().then(setStats)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 5000)

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (isOnline && stats.total.pending === 0 && stats.total.errors === 0) {
    return null // Todo sincronizado
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-lg rounded-lg p-4 max-w-xs">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        ) : (
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        )}

        <span className="font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {stats.total.pending > 0 && (
        <p className="text-sm text-gray-600 mt-2">
          {stats.total.pending} items pending sync
        </p>
      )}

      {stats.total.errors > 0 && (
        <p className="text-sm text-red-600 mt-1">
          {stats.total.errors} sync errors
        </p>
      )}

      {isOnline && stats.total.pending > 0 && (
        <button
          onClick={() => syncService.syncPendingData()}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Sync now
        </button>
      )}
    </div>
  )
}
```

##### Paso 5: Integrar en layout

**Actualizar: `src/app/dashboard/[role]/layout.tsx`**

```typescript
import { SyncStatus } from '@/components/offline/sync-status'

export default function DashboardLayout({ children }) {
  useEffect(() => {
    // Iniciar sync periódico
    syncService.startPeriodicSync(60000) // Cada minuto

    return () => {
      syncService.stopPeriodicSync()
    }
  }, [])

  return (
    <div>
      {children}
      <SyncStatus />
    </div>
  )
}
```

#### Checklist de Implementación

- [ ] Actualizar schema de Dexie con campos de sync
- [ ] Crear `src/lib/offline/sync-service.ts`
- [ ] Implementar `saveRepairOffline`
- [ ] Implementar `saveProjectOffline`
- [ ] Implementar `syncPendingData`
- [ ] Crear componente `SyncStatus`
- [ ] Actualizar formularios para detectar offline
- [ ] Agregar fallback offline en caso de errores de red
- [ ] Iniciar sync periódico en dashboard layout
- [ ] Probar guardado offline (desconectar WiFi)
- [ ] Probar sync automático (reconectar WiFi)
- [ ] Probar manejo de errores de sync
- [ ] Agregar indicadores visuales de estado offline/syncing

---

### 🟠 2.3. Arreglar PWA (manifest + Service Worker)

**Prioridad:** ALTA
**Esfuerzo:** 1 día
**Impacto:** App no es instalable, no funciona offline

#### Problema Actual

```javascript
// ❌ public/sw.js tiene rutas incorrectas
const urlsToCache = [
  '/static/js/bundle.js',  // Next.js no usa esta estructura
  '/static/css/main.css',  // Paths obsoletos
]

// ❌ No hay manifest.json
// App no es instalable como PWA
```

#### Solución

##### Paso 1: Crear manifest.json

**Archivo: `public/manifest.json`**

```json
{
  "name": "Workmap360",
  "short_name": "Workmap360",
  "description": "Construction project management PWA for teams",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "business"],
  "shortcuts": [
    {
      "name": "Projects",
      "short_name": "Projects",
      "description": "View all projects",
      "url": "/dashboard/projects",
      "icons": [
        {
          "src": "/icons/projects.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Repairs",
      "short_name": "Repairs",
      "description": "View all repairs",
      "url": "/dashboard/repairs",
      "icons": [
        {
          "src": "/icons/repairs.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

##### Paso 2: Reescribir Service Worker moderno

**Archivo: `public/sw.js`**

```javascript
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `workmap360-${CACHE_VERSION}`

// Archivos a cachear en instalación
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Rutas de API que NO deben cachearse
const API_ROUTES = ['/api/']

// Instalación del SW
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_CACHE)
    })
  )

  // Activar inmediatamente
  self.skipWaiting()
})

// Activación del SW
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar caches viejas
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  // Tomar control inmediatamente
  self.clients.claim()
})

// Estrategia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // No cachear API requests
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - request failed' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      })
    )
    return
  }

  // Para páginas: Network First, fallback a cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear la respuesta para uso offline
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          // Si falla, usar cache
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline')
          })
        })
    )
    return
  }

  // Para assets estáticos: Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }

      return fetch(request).then((response) => {
        // Solo cachear respuestas exitosas
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})

// Sync background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-repairs') {
    event.waitUntil(syncRepairs())
  }
})

async function syncRepairs() {
  // Integrar con Dexie sync service
  console.log('[SW] Syncing pending repairs...')
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}

  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Workmap360', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
```

##### Paso 3: Registrar Service Worker

**Archivo: `src/app/layout.tsx`**

```typescript
'use client'

import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope)

          // Actualizar SW si hay uno nuevo
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            console.log('🔄 New Service Worker found')

            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Hay una nueva versión disponible
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload()
                }
              }
            })
          })
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }
  }, [])

  return <html>{children}</html>
}
```

##### Paso 4: Crear página offline

**Archivo: `src/app/offline/page.tsx`**

```typescript
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-8">
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

##### Paso 5: Agregar meta tags en head

**Actualizar: `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workmap360',
  description: 'Construction project management PWA',
  manifest: '/manifest.json',
  themeColor: '#1e40af',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Workmap360',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}
```

##### Paso 6: Crear iconos PWA

Generar iconos en diferentes tamaños:

- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)
- `public/icon-96.png` (96x96) - para badge
- `public/icons/projects.png` (96x96)
- `public/icons/repairs.png` (96x96)

Usar herramienta: https://realfavicongenerator.net/

#### Checklist de Implementación

- [ ] Crear `public/manifest.json`
- [ ] Reescribir `public/sw.js` con estrategias modernas
- [ ] Crear página `/offline`
- [ ] Registrar SW en `layout.tsx`
- [ ] Agregar meta tags PWA
- [ ] Generar iconos en todos los tamaños
- [ ] Crear screenshots para manifest
- [ ] Probar instalación en Chrome Desktop
- [ ] Probar instalación en iOS Safari
- [ ] Probar instalación en Android Chrome
- [ ] Verificar que funciona offline
- [ ] Verificar que cachea assets correctamente
- [ ] Auditar con Lighthouse (debe tener score PWA > 90)

---

## 📋 FASE 3: MEJORAS DE MANTENIBILIDAD (PRIORIDAD MEDIA)

Estas mejoras hacen el código más mantenible y escalable a largo plazo.

### 🟡 3.1. Refactorizar Zustand Stores

**Prioridad:** MEDIA
**Esfuerzo:** 2 días
**Problema:** Store gigante (42.5KB), código legacy comentado (992 líneas), lógica mezclada

#### Acciones

1. **Separar `user-store.ts` en múltiples stores:**
   - `auth-store.ts` - Solo autenticación y sesión
   - `users-list-store.ts` - Lista de usuarios (admin/manager)
   - `current-user-store.ts` - Datos del usuario actual

2. **Eliminar 992 líneas de código legacy comentado**

3. **Crear selectors para evitar re-renders:**

```typescript
// ❌ Antes: re-render en cada cambio del store
const { user, role, isLoading, users, filters } = useUserStore()

// ✅ Después: solo re-render si cambia lo que usas
const user = useAuthStore(state => state.user)
const role = useAuthStore(state => state.role)
```

4. **Agregar middleware de logging en desarrollo:**

```typescript
import { devtools } from 'zustand/middleware'

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'auth-store' }
    ),
    { name: 'AuthStore' }
  )
)
```

#### Checklist

- [ ] Crear `src/stores/auth-store.ts`
- [ ] Crear `src/stores/users-list-store.ts`
- [ ] Migrar lógica de `user-store.ts` a stores específicos
- [ ] Eliminar código legacy comentado
- [ ] Actualizar imports en componentes
- [ ] Agregar devtools middleware
- [ ] Crear selectors para optimizar renders
- [ ] Testear que todo funciona igual

---

### 🟡 3.2. Crear Componentes Reutilizables

**Prioridad:** MEDIA
**Esfuerzo:** 2 días
**Problema:** Código duplicado en 70+ líneas (expand/collapse, status badges, avatars)

#### Componentes a crear

##### `src/components/ui/expandable-card.tsx`

```typescript
interface ExpandableCardProps {
  title: ReactNode
  subtitle?: ReactNode
  preview: ReactNode
  details: ReactNode
  defaultExpanded?: boolean
  actions?: ReactNode
}

export function ExpandableCard({
  title,
  subtitle,
  preview,
  details,
  defaultExpanded = false,
  actions
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {preview}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            {details}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

##### `src/components/ui/status-badge.tsx`

```typescript
type Status = 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'

interface StatusBadgeProps {
  status: Status
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-pending-status-bg text-pending-status-text border-pending-status-border'
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-in-progress-status-bg text-in-progress-status-text border-in-progress-status-border'
  },
  completed: {
    label: 'Completed',
    className: 'bg-completed-status-bg text-completed-status-text border-completed-status-border'
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rejected-status-bg text-rejected-status-text border-rejected-status-border'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-cancelled-status-bg text-cancelled-status-text border-cancelled-status-border'
  },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-3 py-1',
        size === 'lg' && 'text-base px-4 py-1.5'
      )}
    >
      {config.label}
    </Badge>
  )
}
```

##### `src/components/ui/avatar-with-fallback.tsx`

```typescript
interface AvatarWithFallbackProps {
  src?: string
  alt: string
  fallback: string // Initials
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarWithFallback({
  src,
  alt,
  fallback,
  size = 'md'
}: AvatarWithFallbackProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}
```

#### Checklist

- [ ] Crear `expandable-card.tsx`
- [ ] Crear `status-badge.tsx`
- [ ] Crear `avatar-with-fallback.tsx`
- [ ] Refactorizar `project-card.tsx` para usar ExpandableCard
- [ ] Refactorizar `repair-card.tsx` para usar ExpandableCard
- [ ] Refactorizar `client-project-card.tsx` para usar ExpandableCard
- [ ] Reemplazar badges hardcoded con StatusBadge
- [ ] Reemplazar avatars con AvatarWithFallback
- [ ] Eliminar código duplicado
- [ ] Verificar que todo se ve igual

---

### 🟡 3.3. Usar Design System Variables Consistentemente

**Prioridad:** MEDIA
**Esfuerzo:** 1 día
**Problema:** Variables CSS definidas pero no usadas, colores hardcoded

#### Acciones

1. **Auditar uso de colores:**

```bash
# Encontrar todos los colores hardcoded
grep -r "bg-yellow-100\|bg-green-100\|bg-red-100" src/
```

2. **Crear utility classes en Tailwind:**

**Actualizar: `tailwind.config.ts`**

```typescript
export default {
  theme: {
    extend: {
      colors: {
        'status-pending': {
          bg: 'oklch(var(--pending-status-bg))',
          text: 'oklch(var(--pending-status-text))',
          border: 'oklch(var(--pending-status-border))',
        },
        'status-approved': {
          bg: 'oklch(var(--approved-status-bg))',
          text: 'oklch(var(--approved-status-text))',
          border: 'oklch(var(--approved-status-border))',
        },
        // ... más estados
      }
    }
  }
}
```

3. **Reemplazar colores hardcoded:**

```typescript
// ❌ Antes
className="bg-yellow-100 text-yellow-800"

// ✅ Después
className="bg-status-pending-bg text-status-pending-text"
```

#### Checklist

- [ ] Auditar uso de colores hardcoded
- [ ] Extender Tailwind config con variables CSS
- [ ] Reemplazar en componentes de status
- [ ] Reemplazar en badges
- [ ] Reemplazar en alerts
- [ ] Verificar theme switching (si aplica)
- [ ] Documentar color system en Storybook (futuro)

---

## 📊 RESUMEN DE PRIORIDADES

### Completar ANTES de producción (Bloqueantes)

| # | Tarea | Tiempo | Criticidad | Estado |
|---|-------|--------|------------|--------|
| 1.1 | CSRF Protection | 2-3h | 🔴 CRÍTICO | ✅ HECHO |
| 1.2 | RLS Policies | 1-2d | 🔴 CRÍTICO | ⏳ Pendiente |
| 1.3 | Input Validation | 1-2d | 🔴 CRÍTICO | ⏳ Pendiente |
| 1.4 | Rate Limiting | 4-6h | 🔴 CRÍTICO | ⏳ Pendiente |
| 1.5 | CSRF en todas las rutas | 2-3h | 🔴 CRÍTICO | ⏳ Pendiente |
| 1.6 | Env Vars Security | 30m | 🔴 CRÍTICO | ⏳ Pendiente |

**Total Fase 1:** ~4-5 días

### MVP Funcional (Alta Prioridad)

| # | Tarea | Tiempo | Valor | Estado |
|---|-------|--------|-------|--------|
| 2.1 | Real-time Subscriptions | 2-3d | 🟠 ALTO | ⏳ Pendiente |
| 2.2 | Offline Sync | 3-4d | 🟠 ALTO | ⏳ Pendiente |
| 2.3 | PWA Fix | 1d | 🟠 ALTO | ⏳ Pendiente |

**Total Fase 2:** ~6-8 días

### Código Limpio (Prioridad Media)

| # | Tarea | Tiempo | Beneficio | Estado |
|---|-------|--------|-----------|--------|
| 3.1 | Refactor Stores | 2d | 🟡 MEDIO | ⏳ Pendiente |
| 3.2 | Componentes Reutilizables | 2d | 🟡 MEDIO | ⏳ Pendiente |
| 3.3 | Design System | 1d | 🟡 MEDIO | ⏳ Pendiente |

**Total Fase 3:** ~5 días

---

## 🎯 ROADMAP SUGERIDO

### Semana 1-2: Seguridad Crítica

- Días 1-2: RLS Policies
- Días 3-4: Input Validation
- Día 5: Rate Limiting
- Día 6: CSRF en rutas restantes
- Día 7: Env Vars + testing

### Semana 3-4: Funcionalidades Core

- Días 1-3: Real-time Subscriptions
- Días 4-7: Offline Sync
- Día 8: PWA Fix
- Días 9-10: Testing integrado

### Semana 5: Refactoring (Opcional)

- Días 1-2: Refactor Stores
- Días 3-4: Componentes Reutilizables
- Día 5: Design System

---

## ✅ CRITERIOS DE ÉXITO

### Después de Fase 1 (Seguridad)

- [ ] Lighthouse Security Score > 90
- [ ] Todas las API routes tienen CSRF
- [ ] RLS habilitado en todas las tablas
- [ ] Rate limiting activo en endpoints críticos
- [ ] Validación Zod en todas las mutations
- [ ] Secrets no expuestos en código

### Después de Fase 2 (Funcionalidad)

- [ ] Cambios en proyectos se ven en tiempo real
- [ ] App funciona offline (crear repairs sin internet)
- [ ] Sync automático al recuperar conexión
- [ ] PWA instalable en móviles
- [ ] Lighthouse PWA Score > 90
- [ ] Service Worker cachea correctamente

### Después de Fase 3 (Calidad)

- [ ] No hay código duplicado > 20 líneas
- [ ] Stores organizados por dominio
- [ ] Componentes reutilizables documentados
- [ ] Design system aplicado consistentemente
- [ ] Code coverage > 60% (si se agregan tests)

---

## 📚 RECURSOS ADICIONALES

- [SECURITY.md](./SECURITY.md) - Guía de implementación de seguridad
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod Documentation](https://zod.dev)
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Dexie.js Documentation](https://dexie.org)

---

**Última actualización:** 2026-01-16
**Siguiente revisión:** Después de completar Fase 1
