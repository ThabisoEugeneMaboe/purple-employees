export type WorkspaceRole =
  | 'Employee'
  | 'Internal Support Coordinator'
  | 'Internal Support Responder'
  | 'Administration'

export type SessionUser = {
  email: string
  displayName: string
  initials: string
  role: WorkspaceRole
  staffId?: string
}

type DemoAccount = SessionUser & { password: string }

export const workspaceRoles: WorkspaceRole[] = [
  'Employee',
  'Internal Support Coordinator',
  'Internal Support Responder',
  'Administration',
]

export const landingPages: Record<WorkspaceRole, string> = {
  Employee: '/',
  'Internal Support Coordinator': '/coordinator',
  'Internal Support Responder': '/responder',
  Administration: '/admin',
}

export const demoAccounts: DemoAccount[] = [
  {
    email: 'thandeka@youngtech.local',
    password: 'demo',
    displayName: 'Thandeka Khambule',
    initials: 'TK',
    role: 'Employee',
  },
  {
    email: 'coordinator@youngtech.local',
    password: 'demo',
    displayName: 'Support Coordinator',
    initials: 'SC',
    role: 'Internal Support Coordinator',
    staffId: 'coordinator-001',
  },
  {
    email: 'responder@youngtech.local',
    password: 'demo',
    displayName: 'Support Responder A',
    initials: 'SR',
    role: 'Internal Support Responder',
    staffId: 'responder-001',
  },
  {
    email: 'admin@youngtech.local',
    password: 'demo',
    displayName: 'Lebo Dlamini',
    initials: 'LD',
    role: 'Administration',
  },
]

const STORAGE_KEY = 'purple.session'

function normaliseEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getDemoAccount(role: WorkspaceRole) {
  return demoAccounts.find((account) => account.role === role)!
}

export function getStoredSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as SessionUser
    if (
      !parsed?.email ||
      !parsed.displayName ||
      !parsed.initials ||
      !workspaceRoles.includes(parsed.role)
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function persistSession(user: SessionUser) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function authenticate(
  role: WorkspaceRole,
  email: string,
  password: string,
): SessionUser {
  const account = demoAccounts.find(
    (candidate) =>
      candidate.role === role &&
      candidate.email === normaliseEmail(email) &&
      candidate.password === password,
  )

  if (!account) {
    throw new Error(
      'Those details do not match this workspace. Check the email, password and selected role.',
    )
  }

  return {
    email: account.email,
    displayName: account.displayName,
    initials: account.initials,
    role: account.role,
    staffId: account.staffId,
  }
}

export function firstName(displayName: string) {
  return displayName.split(' ')[0] ?? displayName
}
