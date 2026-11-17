import {
  BriefcaseBusiness,
  CheckCircle2,
  Inbox,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import {
  getSupportRequests,
  getUnassignedSupportRequests,
} from '../../data/supportRequests'

function AdministrationPage() {
  const requests = getSupportRequests()
  const submitted = requests.filter((request) => request.status === 'Submitted')
  const active = requests.filter(
    (request) =>
      request.status === 'Acknowledged' || request.status === 'In progress',
  )
  const resolved = requests.filter((request) => request.status === 'Resolved')
  const unassigned = getUnassignedSupportRequests()

  return (
    <div className="dashboard">
      <div className="page-heading">
        <span className="eyebrow">MANAGEMENT</span>
        <h1>Administration</h1>
        <p>
          A confidential overview of support activity across the organisation.
          Coordinators assign incoming cases. Responders oversee employee
          support through to resolution. Employee conversations stay in the
          employee workspace.
        </p>
      </div>

      <div className="privacy-banner">
        <div className="privacy-banner-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="privacy-banner-content">
          <strong>Separated access</strong>
          <p>
            Administration can see organisational volume and status. Personal
            support conversations and internal case notes remain in their own
            workspaces.
          </p>
        </div>
      </div>

      <section className="support-overview">
        <div className="support-overview-grid">
          <div className="panel support-overview-card">
            <div className="support-overview-icon pending">
              <Inbox size={20} />
            </div>
            <div className="support-overview-content">
              <span>Awaiting acknowledgement</span>
              <strong>{submitted.length}</strong>
            </div>
          </div>

          <div className="panel support-overview-card">
            <div className="support-overview-icon">
              <MessageCircle size={20} />
            </div>
            <div className="support-overview-content">
              <span>Active support</span>
              <strong>{active.length}</strong>
            </div>
          </div>

          <div className="panel support-overview-card">
            <div className="support-overview-icon">
              <CheckCircle2 size={20} />
            </div>
            <div className="support-overview-content">
              <span>Resolved</span>
              <strong>{resolved.length}</strong>
            </div>
          </div>

          <div className="panel support-overview-card">
            <div className="support-overview-icon">
              <BriefcaseBusiness size={20} />
            </div>
            <div className="support-overview-content">
              <span>Unassigned internal cases</span>
              <strong>{unassigned.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="panel placeholder-panel">
        <div className="placeholder-icon">
          <BriefcaseBusiness size={25} />
        </div>
        <h2>Connected across roles</h2>
        <p>
          When an employee submits a request, the Internal Support Coordinator
          assigns it. The Internal Support Responder then accepts it and
          follows it through to resolution. This administration view reflects
          that same activity without mixing the workspaces.
        </p>
      </div>
    </div>
  )
}

export default AdministrationPage
