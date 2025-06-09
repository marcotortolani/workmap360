import { NextResponse } from 'next/server'
import { Role, Resource, Action } from '@/types/database-types'

type PermissionMatrix = Record<Role, Partial<Record<Resource, Action[]>>>

const permissions: PermissionMatrix = {
  authenticated: {
    users: ['read', 'create', 'update', 'delete'],
    repair_types: ['read', 'create', 'update', 'delete'],
    repairs: ['read', 'create', 'update', 'delete'],
    projects: ['read', 'create', 'update', 'delete'],
  },
  admin: {
    users: ['read', 'create', 'update', 'delete'],
    repair_types: ['read', 'create', 'update', 'delete'],
    repairs: ['read', 'create', 'update', 'delete'],
    projects: ['read', 'create', 'update', 'delete'],
  },
  manager: {
    users: ['read', 'create', 'update'],
    repair_types: ['read', 'create', 'update', 'delete'],
    repairs: ['read', 'create', 'update', 'delete'],
    projects: ['read', 'create', 'update', 'delete'],
  },
  technician: {
    users: ['read'],
    repair_types: ['read'],
    repairs: ['read', 'create', 'update'],
    projects: ['read'],
  },
  client: {
    projects: ['read'],
    repairs: ['read', 'update'],
  },
  guest: {},
}

export function canUserPerform(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  const rolePermissions = permissions[role]
  return rolePermissions?.[resource]?.includes(action) ?? false
}

export function checkPermissionOrFail(
  role: Role,
  resource: Resource,
  action: Action
): Response | null {
  if (!canUserPerform(role, resource, action)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }
  return null
}
