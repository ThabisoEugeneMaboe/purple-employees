import {
  ArrowLeft,
  BriefcaseBusiness,
  Heart,
  LockKeyhole,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  authenticate,
  getDemoAccount,
  landingPages,
  persistSession,
  type SessionUser,
  type WorkspaceRole,
} from '../../auth/session'

const roleOptions: Array<{
  role: WorkspaceRole
  title: string
  description: string
  icon: typeof Heart
}> = [
  {
    role: 'Employee',
    title: 'Employee',
    description: 'Request support, follow up, and look after your wellbeing.',
    icon: Heart,
  },
  {
    role: 'Internal Support',
    title: 'Internal support',
    description: 'Acknowledge, assign and manage employee support cases.',
    icon: Users,
  },
  {
    role: 'Administration',
    title: 'Administration',
    description: 'View organisational activity across the support platform.',
    icon: BriefcaseBusiness,
  },
]

function LoginPage({
  onLogin,
}: {
  onLogin: (user: SessionUser) => void
}) {
  const navigate = useNavigate()
  const [role, setRole] = useState<WorkspaceRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const demo = role ? getDemoAccount(role) : null

  function handleSelectRole(nextRole: WorkspaceRole) {
    const account = getDemoAccount(nextRole)
    setRole(nextRole)
    setEmail(account.email)
    setPassword('')
    setError('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!role) {
      return
    }

    try {
      const user = authenticate(role, email, password)
      persistSession(user)
      onLogin(user)
      navigate(landingPages[user.role], { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Sign-in could not be completed.',
      )
    }
  }

  return (
    <div className="login-shell">
      <aside className="login-brand">
        <div className="login-brand-inner">
          <div className="sidebar-logo-wrapper login-logo">
            <img
              src="/images/logo.jpeg"
              alt="PURPLE Employees"
              className="sidebar-logo"
            />
            <span className="sidebar-trademark">TM</span>
          </div>
          <h1>Confidential support, in the right workspace.</h1>
          <p>
            Choose your role to sign in. Employee conversations stay in the
            employee workspace; support teams and administrators use their own
            portals.
          </p>
          <div className="login-brand-note">
            <ShieldCheck size={18} />
            <span>
              Dignity, confidentiality and your wellbeing are central to PURPLE.
            </span>
          </div>
        </div>
      </aside>

      <main className="login-panel">
        {!role ? (
          <div className="login-card">
            <div className="eyebrow">SIGN IN</div>
            <h2>Who are you signing in as?</h2>
            <p>
              Each role has its own login so people only see the workspace
              meant for them.
            </p>

            <div className="login-role-grid">
              {roleOptions.map(({ role: optionRole, title, description, icon: Icon }) => (
                <button
                  key={optionRole}
                  type="button"
                  className="login-role-card"
                  onClick={() => handleSelectRole(optionRole)}
                >
                  <span className="login-role-icon">
                    <Icon size={20} />
                  </span>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="login-card">
            <button
              type="button"
              className="login-back"
              onClick={() => {
                setRole(null)
                setPassword('')
                setError('')
              }}
            >
              <ArrowLeft size={16} />
              Choose a different role
            </button>

            <div className="eyebrow">{role.toUpperCase()} WORKSPACE</div>
            <h2>Sign in</h2>
            <p>
              Use your {role.toLowerCase()} account to continue. Demo details
              are shown below for this prototype.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="login-submit">
                <LockKeyhole size={16} />
                Sign in to {role}
              </button>
            </form>

            {demo && (
              <p className="login-demo-hint">
                Demo: {demo.email} · password <strong>demo</strong>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default LoginPage
