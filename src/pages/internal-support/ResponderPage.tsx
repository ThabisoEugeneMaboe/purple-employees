import { useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Inbox,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  acceptSupportAssignment,
  getAssignedSupportRequests,
  getCaseAssignment,
  getSupportRequests,
} from '../../data/supportRequests'
import { getStoredSession } from '../../auth/session'
import {
  formatDate,
  getRequestLabel,
  isInternalSupportRequest,
} from './internalSupportShared'

function ResponderPage() {
  const session = getStoredSession()
  const responderId = session?.staffId ?? ''

  const [refreshKey, setRefreshKey] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const allRequests = getSupportRequests()
  const assignedRequests = responderId
    ? getAssignedSupportRequests(responderId)
    : []

  const submitted = allRequests.filter(
    (request) =>
      isInternalSupportRequest(request) && request.status === 'Submitted',
  )

  const active = allRequests.filter(
    (request) =>
      isInternalSupportRequest(request) &&
      (request.status === 'Acknowledged' || request.status === 'In progress'),
  )

  const resolved = allRequests.filter(
    (request) =>
      isInternalSupportRequest(request) && request.status === 'Resolved',
  )

  function refresh() {
    setRefreshKey((current) => current + 1)
  }

  function handleAccept(requestId: string) {
    if (!responderId) {
      setError('Your responder account could not be identified.')
      return
    }

    try {
      acceptSupportAssignment(requestId, responderId)
      setError('')
      setNotice('You have accepted this case assignment.')
      refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'The assignment could not be accepted.',
      )
    }
  }

  return (
    <div className="dashboard internal-support-page" key={refreshKey}>
      <div className="page-heading">
        <span className="eyebrow">RESPONDER WORKSPACE</span>
        <h1>Internal Support Responder</h1>
        <p>
          Accept assigned requests and support the employee through to
          resolution.
        </p>
      </div>

      <div className="privacy-banner">
        <div className="privacy-banner-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="privacy-banner-content">
          <strong>Assigned case work</strong>
          <p>
            You only see cases assigned to you. After you accept a case, you
            can acknowledge, follow up and close it.
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
            <div className="support-overview-icon active">
              <Clock3 size={20} />
            </div>
            <div className="support-overview-content">
              <span>Active requests</span>
              <strong>{active.length}</strong>
            </div>
          </div>

          <div className="panel support-overview-card">
            <div className="support-overview-icon resolved">
              <CheckCircle2 size={20} />
            </div>
            <div className="support-overview-content">
              <span>Resolved requests</span>
              <strong>{resolved.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="section-heading">
          <div>
            <h2>My assigned cases</h2>
            <p>Review and accept cases assigned to you.</p>
          </div>
          <span className="optional-label">
            {assignedRequests.length} assigned
          </span>
        </div>

        {notice && (
          <div className="internal-workspace-notice">{notice}</div>
        )}

        {error && (
          <div className="internal-workspace-error" role="alert">
            {error}
          </div>
        )}

        {assignedRequests.length === 0 ? (
          <div className="panel internal-support-empty">
            <div className="placeholder-icon">
              <Inbox size={25} />
            </div>
            <h2>No cases assigned to you</h2>
            <p>
              Cases assigned by the Internal Support Coordinator will appear
              here.
            </p>
          </div>
        ) : (
          <div className="internal-support-request-list">
            {assignedRequests.map((request) => {
              const assignment = getCaseAssignment(request.id)

              return (
                <div
                  className="panel internal-support-request-card"
                  key={request.id}
                >
                  <div className="internal-support-request-header">
                    <div className="support-request-type">
                      <div className="support-icon purple">
                        <MessageCircle size={19} />
                      </div>
                      <div>
                        <h3>{getRequestLabel(request.type)}</h3>
                        <span>{request.reference}</span>
                      </div>
                    </div>

                    <span
                      className={`request-status ${
                        assignment?.status === 'Accepted'
                          ? 'status-acknowledged'
                          : 'status-submitted'
                      }`}
                    >
                      {assignment?.status === 'Accepted'
                        ? 'Accepted'
                        : 'Awaiting acceptance'}
                    </span>
                  </div>

                  <p className="internal-support-request-description">
                    {request.description}
                  </p>

                  <div className="internal-support-request-meta">
                    <span>
                      <Clock3 size={15} />
                      Submitted {formatDate(request.createdAt)}
                    </span>
                    <span>
                      Assigned{' '}
                      {assignment ? formatDate(assignment.assignedAt) : '—'}
                    </span>
                  </div>

                  <div className="internal-assignment-controls">
                    {assignment?.status === 'Assigned' && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => handleAccept(request.id)}
                      >
                        Accept assignment
                      </button>
                    )}

                    <Link
                      to={`/responder/${request.id}`}
                      className="secondary-button"
                    >
                      Open case
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ResponderPage
