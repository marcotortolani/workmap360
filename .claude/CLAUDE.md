# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Workmap360 is a construction project management Progressive Web Application (PWA) designed to streamline workflows for construction teams. The application enables project tracking, repair management, image documentation, and real-time collaboration across different user roles.

**Tech Stack:**

- **Frontend:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Backend:** Supabase (PostgreSQL + Auth + Realtime subscriptions)
- **State Management:** Zustand with persist middleware
- **Image Storage:** Cloudinary with browser-side compression
- **Offline Support:** Service Worker + Dexie (IndexedDB)
- **Form Validation:** React Hook Form + Zod schemas
- **Type Safety:** TypeScript throughout

## Development Commands

```bash
# Installation
npm install
# or
pnpm install

# Development server
npm run dev
# Application runs at http://localhost:3000

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Note: No test suite currently configured
```

## Architecture Overview

### Role-Based Access Control (RBAC)

The application implements a comprehensive 5-role system with dedicated dashboard layouts:

1. **Admin** - Full system access, user management
2. **Manager** - Project oversight, team coordination
3. **Technician** - Field work, repair execution
4. **Client** - Project visibility, progress tracking
5. **Guest** - Limited read-only access

**Route Protection:**

- Middleware validates user roles at `/middleware.ts`
- Role-specific dashboard routes: `/dashboard/[role]/*`
- Each role has its own layout component at `/src/app/dashboard/[role]/layout.tsx`
- Unauthorized access redirects to appropriate landing pages

### State Management (Zustand)

**Key Stores:**

- **user-store.ts** - Authentication state, user profile, role management
  - Persists user session to localStorage
  - Manages Supabase auth state synchronization
  - Handles logout and session cleanup

- **project-store.ts** - Active project data, filtering, search
  - Caches project lists and details
  - Manages project-level state transitions

- **offline-store.ts** - Offline queue, sync status
  - Queues mutations when offline
  - Syncs data when connection restored

**Persistence Pattern:**
Most stores use Zustand's `persist` middleware with localStorage to maintain state across page refreshes.

### Database (Supabase)

**Authentication Flow:**

1. User signs in via Supabase Auth (email/password)
2. Session token stored in cookies (managed by @supabase/ssr)
3. User profile fetched from `profiles` table
4. Role-based redirect to appropriate dashboard

**Client vs Server Instances:**

- **Client-side** (`/src/lib/supabase/client.ts`): Browser-based operations, real-time subscriptions
- **Server-side** (`/src/lib/supabase/server.ts`): Server Components, API routes, uses cookie-based auth
- **Middleware** (`/src/lib/supabase/middleware.ts`): Route protection, session refresh

**Real-time Subscriptions:**

- Projects table: Live updates when projects change
- Repairs table: Instant status updates for field technicians
- Uses Supabase Realtime channels with row-level security (RLS)

**Important:** Always use the server instance in Server Components and API Routes, client instance only in Client Components.

### API Routes

RESTful structure organized by resource under `/src/app/api/`:

```
/api/projects/          - CRUD for projects
/api/repairs/           - CRUD for repairs
/api/users/             - User management (admin only)
/api/upload/            - Image upload to Cloudinary
/api/notifications/     - Notification management
```

**Image Upload Flow:**

1. Browser compresses image using canvas API
2. POST to `/api/upload` with base64 data
3. Server uploads to Cloudinary
4. Returns secure URL for storage in database

### Key Patterns

**Form Validation (React Hook Form + Zod):**

- Schema definitions in `/src/schemas/` directory
- Type inference using `z.infer<typeof schema>`
- Reusable form components in `/src/components/forms/`

**Image Management:**

- Browser-side compression before upload (target: <500KB)
- Cloudinary transformations for responsive images
- Fallback to placeholder images on error

**Offline Support:**

- Service Worker caches static assets and API responses
- Dexie IndexedDB stores offline mutation queue
- Background sync retries failed requests when online

**PWA Capabilities:**

- Manifest at `/public/manifest.json`
- Service Worker at `/public/sw.js`
- Install prompts for mobile devices
- Offline-first architecture

## Critical Files to Understand

**Authentication & Authorization:**

- `/src/stores/user-store.ts` - User state, auth logic
- `/src/lib/supabase/middleware.ts` - Session validation
- `/middleware.ts` - Route protection rules

**Database Access:**

- `/src/lib/supabase/client.ts` - Browser Supabase client
- `/src/lib/supabase/server.ts` - Server Supabase client
- `/src/lib/supabase/middleware.ts` - Middleware Supabase client

**Type Definitions:**

- `/src/types/user-types.ts` - User, profile, role types
- `/src/types/project-types.ts` - Project, repair, status types
- `/src/types/database.types.ts` - Auto-generated Supabase types

**Routing & Layouts:**

- `/src/app/dashboard/[role]/layout.tsx` - Role-specific dashboard wrapper
- `/src/app/dashboard/[role]/page.tsx` - Dashboard home pages
- `/src/components/layout/` - Shared layout components (navbar, sidebar)

**Core Features:**

- `/src/app/dashboard/[role]/projects/` - Project management pages
- `/src/app/dashboard/[role]/repairs/` - Repair tracking pages
- `/src/components/projects/` - Project UI components
- `/src/components/repairs/` - Repair UI components

## Environment Setup

The application requires a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Setup Steps:**

1. Copy `.env.example` to `.env.local`
2. Create a Supabase project and fill in credentials
3. Create a Cloudinary account and fill in credentials
4. Run database migrations (see `/supabase/migrations/`)

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "@/*": ["./src/*"]
}
```

**Usage:**

```typescript
import { useUserStore } from '@/stores/user-store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
```

## Common Development Workflows

**Adding a New Feature:**

1. Define types in `/src/types/`
2. Create Zod schema in `/src/schemas/`
3. Build UI components in `/src/components/`
4. Add API route in `/src/app/api/` if needed
5. Create page in appropriate role dashboard
6. Update middleware if route protection needed

**Modifying User Roles:**

1. Update role types in `/src/types/user-types.ts`
2. Modify RLS policies in Supabase
3. Update middleware route protection rules
4. Add/modify dashboard layout for new role

**Working with Real-time Data:**

1. Use client-side Supabase instance
2. Subscribe to table changes in `useEffect`
3. Update Zustand store on changes
4. Clean up subscription on unmount

**Debugging Auth Issues:**

1. Check browser cookies for `sb-*` entries
2. Verify Supabase client initialization
3. Check middleware logs for route protection
4. Validate user role in user-store

## Notes for AI Assistants

- Always use the correct Supabase instance (client vs server vs middleware)
- Respect the role-based access control system
- Follow existing patterns for forms, validation, and API routes
- Consider offline support when modifying data mutations
- Test with different user roles when changing access controls
- Maintain type safety - avoid `any` types
- Follow the established folder structure and naming conventions
