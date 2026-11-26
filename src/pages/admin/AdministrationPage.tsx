import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Inbox,
  MessageCircle,
  ShieldCheck,
  Siren,
  UserCheck,
  Users,
} from 'lucide-react'
import {
  getCaseAssignment,
  getSupportRequests,
  getUnassignedSupportRequests,
} from '../../data/supportRequests'
import { getRequestLabel } from '../internal-support/internalSupportShared'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function AdministrationPage() {
  const requests = getSupportRequests()
  const submitted = requests.filter((request) => request.status === 'Submitted')
  const active = requests.filter(
    (request) =>
      request.status === 'Acknowledged' || request.status === 'In progress',
  )
  const resolved = requests.filter((request) => request.status === 'Resolved')
  const unassigned = getUnassignedSupportRequests()
  const iodRequests = requests.filter((request) => request.type === 'iod')

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
            This view shows organisational volume and status only. Personal
            messages, private notes and uploaded IOD documents stay in the
            employee and responder workspaces.
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
              <Siren size={20} />
            </div>
            <div className="support-overview-content">
              <span>IOD / J88 reports</span>
              <strong>{iodRequests.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="section-heading">
          <div>
            <h2>How support moves through the organisation</h2>
            <p>
              Administration sees the pipeline. Coordinators assign. Responders
              resolve. Employees keep their conversations.
            </p>
          </div>
        </div>

        <div className="admin-flow-grid">
          <article className="panel admin-flow-card">
            <Users size={20} />
            <h3>Coordinators assign incoming cases</h3>
            <p>
              {unassigned.length === 0
                ? 'No internal cases are waiting for assignment.'
                : `${unassigned.length} internal ${
                    unassigned.length === 1 ? 'case is' : 'cases are'
                  } waiting for a coordinator to assign a responder.`}
            </p>
          </article>
          <article className="panel admin-flow-card">
            <UserCheck size={20} />
            <h3>Responders oversee support to resolution</h3>
            <p>
              {active.length === 0
                ? 'No cases are currently in responder follow-up.'
                : `${active.length} ${
                    active.length === 1 ? 'case is' : 'cases are'
                  } with responders and still open.`}
            </p>
          </article>
          <article className="panel admin-flow-card">
            <BriefcaseBusiness size={20} />
            <h3>Employee conversations stay separate</h3>
            <p>
              {requests.length === 0
                ? 'No employee requests have been submitted in this session yet.'
                : `${requests.length} organisational ${
                    requests.length === 1 ? 'record is' : 'records are'
                  } visible here without opening the employee chat.`}
            </p>
          </article>
        </div>
      </section>

      <section className="support-section">
        <div className="section-heading">
          <div>
            <h2>Organisational caseload</h2>
            <p>
              References, pathways and status only — not the employee’s
              written message.
            </p>
          </div>
          <span className="optional-label">
            {requests.length} recorded this session
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="panel placeholder-panel">
            <div className="placeholder-icon">
              <Inbox size={25} />
            </div>
            <h2>No support activity yet</h2>
            <p>
              When employees submit wellbeing, workplace, IOD or other
              requests, volume and status will appear here for leadership
              oversight.
            </p>
          </div>
        ) : (
          <div className="panel admin-caseload">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Pathway</th>
                  <th>Status</th>
                  <th>Assignment</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const assignment = getCaseAssignment(request.id)

                  return (
                    <tr key={request.id}>
                      <td>{request.reference}</td>
                      <td>{getRequestLabel(request.type)}</td>
                      <td>{request.status}</td>
                      <td>
                        {assignment
                          ? `${assignment.responderName} · ${assignment.status}`
                          : 'Not assigned'}
                      </td>
                      <td>
                        <span className="admin-caseload-date">
                          <Clock3 size={14} />
                          {formatDate(request.createdAt)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdministrationPage
