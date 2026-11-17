
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import CoordinatorPage from './pages/internal-support/CoordinatorPage'
import ResponderPage from './pages/internal-support/ResponderPage'
import SupportRequestDetailsPage from './pages/employee/SupportRequestDetailsPage'
import RetaliationRequestPage from './pages/employee/RetaliationRequestPage'
import InternalSupportRequestPage from './pages/internal-support/InternalSupportRequestPage'
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import SupportRequestPage from './pages/employee/SupportRequestPage'
import MySupportPage from './pages/employee/MySupportPage'
import MyFollowUpsPage from './pages/employee/MyFollowUpsPage'
import { getSupportRequests } from './data/supportRequests'
import LoginPage from './pages/login/LoginPage'
import AdministrationPage from './pages/admin/AdministrationPage'
import {
  clearSession,
  firstName,
  getStoredSession,
  landingPages,
  type SessionUser,
  type WorkspaceRole,
} from './auth/session'

// Centralises sidebar navigation so each demonstration role has its own menu.
const navigationByRole = {
  Employee: [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'My support', icon: MessageCircle, path: '/my-support' },
        { label: 'My follow-ups', icon: ClipboardList, path: '/follow-ups' },
      ],
    },
  ],

  'Internal Support Coordinator': [
    {
      title: 'COORDINATOR WORKSPACE',
      items: [
        {
          label: 'Intake & assignment',
          icon: Users,
          path: '/coordinator',
        },
      ],
    },
  ],

  'Internal Support Responder': [
    {
      title: 'RESPONDER WORKSPACE',
      items: [
        {
          label: 'My assigned cases',
          icon: UserCheck,
          path: '/responder',
        },
      ],
    },
  ],

  Administration: [
    {
      title: 'MANAGEMENT',
      items: [
        {
          label: 'Administration',
          icon: BriefcaseBusiness,
          path: '/admin',
        },
      ],
    },
  ],
}

// Provides the breadcrumb title displayed for each recognised top-level route.
const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/my-support': 'My support',
  '/follow-ups': 'My follow-ups',
  '/im-okay': 'Wellbeing check-in',
  '/coordinator': 'Intake & assignment',
  '/responder': 'My assigned cases',
  '/external-support': 'Independent support',
  '/admin': 'Administration',
}

// Renders the navigation menu for the currently selected workspace role.
function Sidebar({
  open,
  onClose,
  supportRequestCount,
  role,
}: {
  open: boolean
  onClose: () => void
  supportRequestCount: number
  role: WorkspaceRole
}) {
  const navigation = navigationByRole[role]
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-wrapper">
            <img
              src="/images/logo.jpeg"
              alt="PURPLE Employees"
              className="sidebar-logo"
            />
            <span className="sidebar-trademark">TM</span>
          </div>
        </div>

        <div className="workspace-label">YOUR WORKSPACE</div>

        <nav className="sidebar-navigation">
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>

              {group.items.map(({ label, icon: Icon, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  {path === '/my-support' && supportRequestCount > 0 && (
                    <span className="nav-indicator">{supportRequestCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-company">
            Young Tech Giants
          </div>

          <div className="sidebar-footer">
            <span className="footer-dot" />
            PURPLE Support Platform
            <span className="version">DEMO</span>
          </div>
        </div>
      </aside>
    </>
  )
}


// Displays the current page title, signed-in person and sign-out control.
function Topbar({
  title,
  onMenuClick,
  user,
  onSignOut,
}: {
  title: string
  onMenuClick: () => void
  user: SessionUser
  onSignOut: () => void
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <strong>{title}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="profile">
          <div className="avatar">{user.initials}</div>

          <div className="profile-info">
            <strong>{user.displayName}</strong>
            <span>{user.role}</span>
          </div>
        </div>

        <button className="sign-out-button" onClick={onSignOut} type="button">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  )
}


function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function SupportCard({
  image,
  title,
  description,
  label,
  onClick,
}: {
  image: string
  title: string
  description: string
  label: string
  onClick: () => void
}) {
  return (
    <button className="support-card" onClick={onClick}>
      <img className="support-card-image" src={image} alt="" />
      <div className="support-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="support-card-link">
          {label} <ArrowRight size={15} />
        </span>
      </div>
    </button>
  )
}

// Employee landing page containing support options and a summary of support activity.
function HomePage({ displayName }: { displayName: string }) {
  const [showNotice, setShowNotice] = useState(true)
  const navigate = useNavigate()

  const requests = getSupportRequests()

  // Counts submitted requests that have not yet been acknowledged by the support team.
  const pendingAcknowledgementCount = requests.filter(
  (request) => request.status === 'Submitted',
  ).length

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <PageHeading
          eyebrow="YOUR WELLBEING MATTERS"
          title={`Hello, ${firstName(displayName)}.`}
          description="Whatever you're experiencing, you don't have to navigate it alone."
        />
      </div>

      {showNotice && (
        <div className="privacy-banner">
          <div className="privacy-banner-icon">
            <ShieldCheck size={21} />
          </div>
          <div className="privacy-banner-content">
            <strong>Your wellbeing. Your choice.</strong>
            <p>
              You decide how to seek support. Your personal support conversations
              are not part of your manager's dashboard.
            </p>
          </div>
          <button
            className="banner-dismiss"
            onClick={() => setShowNotice(false)}
            aria-label="Dismiss privacy notice"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="support-section">
        <div className="section-heading">
          <div>
            <h2>How can we support you?</h2>
            <p>Choose the option that feels right for you.</p>
          </div>
          <span className="optional-label">You can change your mind at any time</span>
        </div>

        <div className="support-grid">
          <SupportCard
            image="/images/1_im_okay.png"
            title="I'm doing okay"
            description="Check in with yourself and explore wellbeing resources."
            label="Explore wellbeing"
            onClick={() => navigate('/im-okay')}
          />

          <SupportCard
            image="/images/2_talk_to_someone.png"
            title="I'd like someone to talk to"
            description="Reach out for a conversation, guidance or emotional support."
            label="Request support"
            onClick={() => navigate('/request/talk')}
          />

          <SupportCard
            image="/images/3_affecting_me_at_work.png"
            title="Something at work is affecting me"
            description="Talk about a workplace situation that's causing distress or concern."
            label="Find workplace support"
            onClick={() => navigate('/request/workplace')}
          />

          <SupportCard
            image="/images/4_independent_support.png"
            title="I need independent support"
            description="Connect with support outside your workplace reporting structure."
            label="Explore independent support"
            onClick={() => navigate('/request/independent')}
          />
        <SupportCard
          image="/images/5_retaliation.png"
          title="I'm experiencing retaliation"
          description="Seek support if you feel threatened or treated unfairly for raising a concern or speaking up."
          label="Request retaliation support"
          onClick={() => navigate('/my-support')}
        />
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel follow-up-panel">
          <div className="panel-heading">
            <div>
              <h2>Your support</h2>
              <p>A quick overview of your support activity.</p>
            </div>
            <span className="panel-icon"><MessageCircle size={18} /></span>
          </div>

          <div className="support-summary">
            <div className="summary-icon">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <strong>
                {pendingAcknowledgementCount > 0
                  ? `${pendingAcknowledgementCount} ${
                      pendingAcknowledgementCount === 1 ? 'request' : 'requests'
                    } awaiting acknowledgement`
                  : "You're in control"}
              </strong>

              <p>
                {pendingAcknowledgementCount > 0
                  ? 'Your support team has not yet acknowledged these requests. You can review their status in My Support.'
                  : "You don't have any requests awaiting acknowledgement at the moment."}
              </p>
            </div>
          </div>

          <NavLink to="/my-support" className="panel-link">
            View my support <ArrowRight size={15} />
          </NavLink>
        </div>

        <div className="panel resources-panel">
          <div className="panel-heading">
            <div>
              <h2>Wellbeing resources</h2>
              <p>Helpful information when you need it.</p>
            </div>
            <span className="panel-icon"><BookOpen size={18} /></span>
          </div>

          <div className="resource-item">
            <div className="resource-icon"><Heart size={17} /></div>
            <div className="resource-text">
              <strong>Taking care of yourself</strong>
              <span>Everyday wellbeing and self-care</span>
            </div>
            <ChevronRight size={17} />
          </div>

          <div className="resource-item">
            <div className="resource-icon"><CircleHelp size={17} /></div>
            <div className="resource-text">
              <strong>Understanding your support options</strong>
              <span>What happens when you reach out</span>
            </div>
            <ChevronRight size={17} />
          </div>
        </div>
      </section>

      <div className="dashboard-footer">
        <ShieldCheck size={15} />
        <span>Confidentiality, dignity and your wellbeing are central to PURPLE.</span>
      </div>
    </div>
  )
}

// Shared presentation for workspace areas whose dedicated functionality is not yet implemented.
function PlaceholderPage({
  title,
}: {
  title: string
}) {
  return (
    <div className="dashboard">
      <PageHeading
        eyebrow="PURPLE WORKSPACE"
        title={title}
        description="This workspace is being prepared as part of the PURPLE Employees prototype."
      />
      <div className="panel placeholder-panel">
        <div className="placeholder-icon"><Heart size={25} /></div>
        <h2>{title}</h2>
        <p>
          This area will contain its dedicated workflow, information and
          functionality.
        </p>
        <NavLink to="/" className="panel-link">
          Return to home <ArrowRight size={15} />
        </NavLink>
      </div>
    </div>
  )
}

// Displays confirmation for the demonstration wellbeing check-in.
// This screen does not establish that a check-in has been saved to a backend.
function OkayConfirmationPage() {
  return (
    <div className="dashboard">
      <PageHeading
        eyebrow="YOUR WELLBEING MATTERS"
        title="Your check-in has been recorded"
        description="Thank you for checking in with PURPLE. We're glad you're doing okay."
      />

      <div className="panel placeholder-panel">
        <div className="placeholder-icon">
          <CheckCircle2 size={25} />
        </div>

        <h2>Thank you for checking in</h2>

        <p>
          Your "I'm doing okay" selection has been recorded for this
          demonstration. You can return to your Employee Workspace
          whenever you need support.
        </p>

        <NavLink to="/" className="panel-link">
          Return to Employee Workspace <ArrowRight size={15} />
        </NavLink>
      </div>
    </div>
  )
}

function RoleRoute({
  role,
  allow,
  children,
}: {
  role: WorkspaceRole
  allow: WorkspaceRole | WorkspaceRole[]
  children: ReactNode
}) {
  const allowed = Array.isArray(allow) ? allow : [allow]
  if (!allowed.includes(role)) {
    return <Navigate to={landingPages[role]} replace />
  }

  return children
}

// Main application shell: coordinates workspace navigation, shared layout and route rendering.
function App() {
  const location = useLocation()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [session, setSession] = useState<SessionUser | null>(() =>
    getStoredSession(),
  )

  const title = pageTitles[location.pathname] ?? 'Workspace'
  const supportRequestCount = getSupportRequests().length

  function handleSignOut() {
    clearSession()
    setSession(null)
    setSidebarOpen(false)
    navigate('/login', { replace: true })
  }

  if (!session) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLogin={setSession} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} supportRequestCount={supportRequestCount} role={session.role}/>
      <div className="main-area">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} user={session} onSignOut={handleSignOut}/>

        <main className="main-content">

          {/* Maps application URLs to their corresponding employee and internal-support pages. */}
          <Routes>
            <Route path="/login" element={<Navigate to={landingPages[session.role]} replace />} />
            <Route
              path="/"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <HomePage displayName={session.displayName} />
                </RoleRoute>
              }
            />
            <Route
              path="/im-okay"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <OkayConfirmationPage />
                </RoleRoute>
              }
            />
            <Route
              path="/my-support"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <MySupportPage />
                </RoleRoute>
              }
            />
            <Route
              path="/my-support/:id/retaliation"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <RetaliationRequestPage />
                </RoleRoute>
              }
            />
            <Route
              path="/my-support/:id"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <SupportRequestDetailsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/follow-ups"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <MyFollowUpsPage />
                </RoleRoute>
              }
            />
            <Route
              path="/external-support"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <PlaceholderPage title="Independent support" />
                </RoleRoute>
              }
            />
            <Route
              path="/request/retaliation"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <Navigate to="/my-support" replace />
                </RoleRoute>
              }
            />
            <Route
              path="/request/:type"
              element={
                <RoleRoute role={session.role} allow="Employee">
                  <SupportRequestPage />
                </RoleRoute>
              }
            />
            <Route
              path="/coordinator"
              element={
                <RoleRoute role={session.role} allow="Internal Support Coordinator">
                  <CoordinatorPage />
                </RoleRoute>
              }
            />
            <Route
              path="/responder/:id"
              element={
                <RoleRoute role={session.role} allow="Internal Support Responder">
                  <InternalSupportRequestPage responderId={session.staffId ?? ''} />
                </RoleRoute>
              }
            />
            <Route
              path="/responder"
              element={
                <RoleRoute role={session.role} allow="Internal Support Responder">
                  <ResponderPage />
                </RoleRoute>
              }
            />
            <Route
              path="/internal-support"
              element={<Navigate to={landingPages[session.role]} replace />}
            />
            <Route
              path="/admin"
              element={
                <RoleRoute role={session.role} allow="Administration">
                  <AdministrationPage />
                </RoleRoute>
              }
            />
            <Route path="*" element={<Navigate to={landingPages[session.role]} replace />} />
          </Routes>

        </main>
      </div>
    </div>
  )
}

export default App




