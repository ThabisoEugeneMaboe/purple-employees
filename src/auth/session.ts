export type WorkspaceRole = 'Employee' | 'Internal Support' | 'Administration'

export type SessionUser = {
  email: string
  displayName: string
  initials: string
  role: WorkspaceRole
}

type DemoAccount = SessionUser & { password: string }

export const landingPages: Record<WorkspaceRole, string> = {
  Employee: '/',
  'Internal Support': '/internal-support',
  Administration: '/admin',
}

export const demoAccounts: DemoAccount[] = [
  {
    email: 'naledi@youngtech.local',
    password: 'demo',
    displayName: 'Naledi Mokoena',
    initials: 'NM',
    role: 'Employee',
  },
  {
    email: 'coordinator@youngtech.local',
    password: 'demo',
    displayName: 'Support Coordinator',
    initials: 'SC',
    role: 'Internal Support',
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
      !parsed.role
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
  }
}

export function firstName(displayName: string) {
  return displayName.split(' ')[0] ?? displayName
}
