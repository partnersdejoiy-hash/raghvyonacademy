/**
 * RAGHVYON ACADEMY — Centralized role-based permission system (RBAC).
 *
 * Single source of truth for WHAT each role may do. `requireRole` guards the
 * HTTP surface; `hasPermission` / `permissionsFor` express the capability
 * model shared by the server (enforcement) and the client (UI affordances
 * ONLY — hiding a button is cosmetic; the server still enforces everything).
 *
 * Principle: permissions attach to the SESSION's server-verified role.
 * Request bodies can never introduce or elevate a capability.
 */

export type Role = 'student' | 'parent' | 'admin';

export type Permission =
  /* ---------- student ---------- */
  | 'student:dashboard'
  | 'student:courses:view'
  | 'student:assignments:submit'
  | 'student:notes:create'
  | 'student:drive:connect'      // manage OWN Drive (connect/disconnect/upload)
  | 'student:notes:saveToDrive'
  | 'student:certificates:view'
  | 'student:feedback:view'
  | 'student:account:delete'
  /* ---------- parent ---------- */
  | 'parent:children:view'        // verified children only
  | 'parent:childProgress:view'   // verified children only
  | 'parent:consultation:request'
  /* ---------- AI ---------- */
  | 'ai:ask'
  /* ---------- public ---------- */
  | 'public:courses:view'
  | 'public:demo:book'
  | 'public:enquiry:submit'
  /* ---------- admin ---------- */
  | 'admin:overview:view'
  | 'admin:courses:manage'
  | 'admin:enquiries:manage'
  | 'admin:demos:manage'
  | 'admin:users:view'
  | 'admin:parentLinks:view'
  | 'admin:driveStatus:view'      // metadata ONLY — never tokens
  | 'admin:auditLogs:view'
  | 'admin:teacherProfile:manage';

/**
 * The capability map. A role gets EXACTLY what is listed — anything not
 * listed is denied by default (deny-by-default RBAC).
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: [
    'student:dashboard',
    'student:courses:view',
    'student:assignments:submit',
    'student:notes:create',
    'student:drive:connect',
    'student:notes:saveToDrive',
    'student:certificates:view',
    'student:feedback:view',
    'student:account:delete',
    'ai:ask',
    'public:courses:view',
    'public:demo:book',
    'public:enquiry:submit',
  ],
  parent: [
    'parent:children:view',
    'parent:childProgress:view',
    'parent:consultation:request',
    'public:courses:view',
    'public:demo:book',
    'public:enquiry:submit',
 ],
  admin: [
    'admin:overview:view',
    'admin:courses:manage',
    'admin:enquiries:manage',
    'admin:demos:manage',
    'admin:users:view',
    'admin:parentLinks:view',
    'admin:driveStatus:view',
    'admin:auditLogs:view',
    'admin:teacherProfile:manage',
    // Admin also gets safe public/parent-visibility capabilities via the
    // explicit list only — no inheritance magic.
    'public:courses:view',
    'public:demo:book',
    'public:enquiry:submit',
  ],
};

/** Deny-by-default check against the capability map. */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** All permissions for a role (fresh array; callers cannot mutate the map). */
export function permissionsFor(role: Role): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

/**
 * Human-readable labels for the client UI (Permissions/Security panels,
 * admin user inspector) — no secrets, pure metadata.
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  'student:dashboard': 'View own learning dashboard',
  'student:courses:view': 'View enrolled courses',
  'student:assignments:submit': 'Submit assignments',
  'student:notes:create': 'Create study notes',
  'student:drive:connect': 'Connect & manage own Google Drive',
  'student:notes:saveToDrive': 'Save notes to own Google Drive',
  'student:certificates:view': 'View certificates',
  'student:feedback:view': 'View teacher feedback',
  'student:account:delete': 'Delete own account & data',
  'parent:children:view': 'View verified children',
  'parent:childProgress:view': 'View children’s academic progress',
  'parent:consultation:request': 'Request consultations',
  'ai:ask': 'Use AI Study Assistant',
  'public:courses:view': 'Browse public course catalog',
  'public:demo:book': 'Book a free demo class',
  'public:enquiry:submit': 'Submit enquiries',
  'admin:overview:view': 'View academy statistics',
  'admin:courses:manage': 'Manage course catalog',
  'admin:enquiries:manage': 'Manage enquiries',
  'admin:demos:manage': 'Manage demo bookings',
  'admin:users:view': 'View users (no credentials)',
  'admin:parentLinks:view': 'View parent-child links',
  'admin:driveStatus:view': 'View Drive connection metadata (credentials excluded)',
  'admin:auditLogs:view': 'View audit logs',
  'admin:teacherProfile:manage': 'Manage faculty profile',
};

/** Public endpoint → permission mapping (for /api/auth/permissions). */
export const PUBLIC_ENDPOINT_PERMISSIONS: Array<{ method: string; endpoint: string; permission: Permission }> = [
  { method: 'GET', endpoint: '/api/student/dashboard', permission: 'student:dashboard' },
  { method: 'GET', endpoint: '/api/parent/children', permission: 'parent:children:view' },
  { method: 'GET', endpoint: '/api/parent/child-data/:studentId', permission: 'parent:childProgress:view' },
  { method: 'GET', endpoint: '/api/admin/overview', permission: 'admin:overview:view' },
  { method: 'GET', endpoint: '/api/admin/users', permission: 'admin:users:view' },
  { method: 'GET', endpoint: '/api/admin/audit-logs', permission: 'admin:auditLogs:view' },
  { method: 'GET', endpoint: '/api/admin/drive-connections', permission: 'admin:driveStatus:view' },
  { method: 'POST', endpoint: '/api/ai/ask', permission: 'ai:ask' },
];
