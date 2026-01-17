# Security Implementation Guide

This document provides guidelines for implementing security best practices in the Workmap360 application.

## CSRF Protection

### Overview

Cross-Site Request Forgery (CSRF) protection is implemented to prevent malicious websites from making unauthorized requests to our API using a user's credentials.

### Implementation

#### 1. API Routes (Server-Side)

Add CSRF validation to all state-changing endpoints (POST, PUT, PATCH, DELETE):

```typescript
import { validateCSRFForRequest } from '@/lib/security/csrf'

export async function POST(req: Request) {
  // Add CSRF validation as the first check
  const csrfValidation = await validateCSRFForRequest(req)
  if (csrfValidation) return csrfValidation

  // Continue with your route logic...
}
```

#### 2. Client-Side Usage

**Option A: Using the Hook**

```typescript
import { useCSRFToken } from '@/hooks/use-csrf-token'

function MyComponent() {
  const { token, isLoading } = useCSRFToken()

  const handleSubmit = async (data) => {
    if (isLoading) return

    const response = await fetch('/api/projects/create', {
      method: 'POST',
      headers: {
        'x-csrf-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }
}
```

**Option B: Using the Helper Function**

```typescript
import { fetchWithCSRF } from '@/hooks/use-csrf-token'

const response = await fetchWithCSRF('/api/projects/create', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### Routes That Need CSRF Protection

Apply CSRF validation to these endpoints:

**User Management:**
- ✅ `/api/users/create` - Already implemented
- `/api/users/edit`
- `/api/users/delete`
- `/api/users/change-password`

**Project Management:**
- `/api/projects/create`
- `/api/projects/update`
- `/api/projects/delete`

**Repair Management:**
- `/api/repairs/create`
- `/api/repairs/update`
- `/api/repairs/update-status`
- `/api/repairs/delete`

**Image Management:**
- `/api/images/upload`
- `/api/images/signed-upload`
- `/api/images/[id]` (DELETE method)

## Input Validation

### Overview
All API endpoints must validate input data using Zod schemas to prevent injection attacks and data corruption.

### Creating Schemas

Create schema files in `/src/schemas/api/`:

```typescript
// schemas/api/user.schema.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  role: z.enum(['admin', 'manager', 'technician', 'client', 'guest']),
  avatar: z.string().url().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
```

### Using Schemas in API Routes

```typescript
import { createUserSchema } from '@/schemas/api/user.schema'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validatedData = createUserSchema.parse(body)

    // Use validatedData (not body) for database operations
    const { data } = await supabase
      .from('users')
      .insert(validatedData)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    // Handle other errors
  }
}
```

## Rate Limiting

### Overview
Rate limiting prevents abuse by limiting the number of requests a user can make in a given time period.

### Implementation (To Be Added)

We will implement rate limiting using `@upstash/ratelimit` or a similar solution.

**Endpoints that need rate limiting:**
- Authentication endpoints (login, signup)
- Password reset
- User creation
- Image upload
- All POST/PUT/DELETE operations

## Row-Level Security (RLS)

### Overview
RLS policies in Supabase provide database-level security, ensuring users can only access data they're authorized to see.

### Implementation (To Be Added)

RLS policies will be added for all tables:
- `users`
- `projects`
- `repairs`
- `project_elevations`
- `project_repair_types`
- `project_technicians`

## Environment Variables Security

### Best Practices

1. **Never commit `.env.local` to version control**
2. **Use server-only environment variables for secrets:**
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLOUDINARY_API_SECRET`
   - `VAPID_PRIVATE_KEY`

3. **Use `NEXT_PUBLIC_` prefix only for client-safe variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_APP_URL`

4. **In production, use your hosting provider's environment variable management:**
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - AWS: Secrets Manager or Parameter Store

## Security Checklist

Before deploying to production, ensure:

- [ ] CSRF protection applied to all state-changing API routes
- [ ] Input validation with Zod on all API endpoints
- [ ] Rate limiting implemented on sensitive endpoints
- [ ] RLS policies enabled on all Supabase tables
- [ ] Environment variables properly configured
- [ ] HTTPS enabled in production
- [ ] Secure cookies (httpOnly, secure, sameSite)
- [ ] Content Security Policy (CSP) headers configured
- [ ] No sensitive data in client-side code
- [ ] Error messages don't leak sensitive information

## Reporting Security Issues

If you discover a security vulnerability, please email security@workmap360.com instead of using the issue tracker.
