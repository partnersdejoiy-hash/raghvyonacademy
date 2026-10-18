// Role-based permissions. Defaults live here; the super admin (ADMIN_EMAIL) can override per role from the desk.
import { q, isAdminEmail, type Role, type User } from './_lib.js';

export const PERMISSIONS = [
  { id: 'classroom.view', label: 'See Classroom classes, work and announcements' },
  { id: 'classroom.manage', label: 'Create classes, assignments, announcements; invite students' },
  { id: 'calendar.view', label: 'See the class schedule (Google Calendar)' },
  { id: 'calendar.manage', label: 'Schedule classes with Google Meet links' },
  { id: 'academy.enroll', label: 'Add or remove academy courses on own dashboard' },
  { id: 'tools.gmail', label: 'Email people from the portal (opens Gmail)' },
  { id: 'attendance.view', label: 'See attendance (own, or linked child)' },
  { id: 'attendance.mark', label: 'Mark attendance for classes they teach' },
  { id: 'leave.apply', label: 'Apply for leave' },
  { id: 'leave.approve', label: "Approve or reject a linked child's leave" },
  { id: 'leave.view', label: 'See approved and pending leaves of all students' },
  { id: 'desk.demos', label: 'See and update demo requests' },
  { id: 'desk.people', label: 'Change roles and link parents to students' },
] as const;
export type Perm = (typeof PERMISSIONS)[number]['id'];

const TEACHER: Perm[] = ['classroom.view', 'classroom.manage', 'calendar.view', 'calendar.manage', 'tools.gmail', 'attendance.mark', 'leave.view'];
export const DEFAULTS: Record<Role, Perm[]> = {
  student: ['classroom.view', 'calendar.view', 'academy.enroll', 'tools.gmail', 'attendance.view', 'leave.apply'],
  parent: ['classroom.view', 'calendar.view', 'tools.gmail', 'attendance.view', 'leave.approve'],
  teacher: TEACHER,
  admin: [...TEACHER, 'desk.demos', 'desk.people'],
};

export async function permsFor(role: Role): Promise<Perm[]> {
  const [row] = await q<{ perms: string }>('SELECT perms FROM role_permissions WHERE role=?', [role]);
  if (!row) return DEFAULTS[role];
  try {
    const list = JSON.parse(row.perms) as string[];
    return list.filter((p): p is Perm => PERMISSIONS.some((x) => x.id === p));
  } catch {
    return DEFAULTS[role];
  }
}

export async function allPerms(): Promise<Record<Role, Perm[]>> {
  const roles: Role[] = ['student', 'parent', 'teacher', 'admin'];
  const out = {} as Record<Role, Perm[]>;
  for (const r of roles) out[r] = await permsFor(r);
  return out;
}

export const isSuperAdmin = (u: User) => isAdminEmail(u.email);

/** The super admin always has everything; everyone else gets their role's list. */
export async function effectivePerms(u: User): Promise<Perm[]> {
  return isSuperAdmin(u) ? PERMISSIONS.map((p) => p.id) : permsFor(u.role);
}
