import { useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Inbox,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import {
  assignSupportRequest,
  getCaseActivities,
  getCaseAssignment,
  getSupportResponders,
  getSupportRequests,
  getUnassignedSupportRequests,
} from '../../data/supportRequests'
import { getStoredSession } from '../../auth/session'
import {
  formatDate,
  getRequestLabel,
  isInternalSupportRequest,
} from './internalSupportShared'

function CoordinatorPage() {
  const session = getStoredSession()
  const coordinatorId = session?.staffId ?? 'coordinator-001'

  const [selectedResponders, setSelectedResponders] = useState<
    Record<string, string>
  >({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const responders = getSupportResponders().filter(
    (responder) => responder.active && responder.role === 'Responder',
  )

  const allRequests = getSupportRequests()
  const unassignedRequests = getUnassignedSupportRequests().filter(
    isInternalSupportRequest,
  )

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

  const activities = getCaseActivities('coordinator').slice(0, 8)

  function refresh() {
    setRefreshKey((current) => current + 1)
  }

  function handleAssign(requestId: string) {
    const selectedResponderId =
      selectedResponders[requestId] ?? responders[0]?.id

    if (!selectedResponderId) {
      setError('No active responder is available for assignment.')
      return
    }

    try {
      assignSupportRequest({
        requestId,
        responderId: selectedResponderId,
        assignedBy: coordinatorId,
      })

      setError('')
      setNotice(
        'Assigned. The employee can see this stage, and you will receive responder activity in the live case loop.',
      )
      refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'The case could not be assigned.',
      )
    }
  }

  return (
    <div className="dashboard internal-support-page" key={refreshKey}>
      <div className="page-heading">
        <span className="eyebrow">COORDINATOR WORKSPACE</span>
        <h1>Internal Support Coordinator</h1>
        <p>
          Review incoming employee requests and assign them to an available
          responder.
        </p>
      </div>

      <div className="privacy-banner">
        <div className="privacy-banner-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="privacy-banner-content">
          <strong>Intake and assignment only</strong>
          <p>
            Coordinators route cases to responders. Ongoing employee support
            and resolution stay with the assigned Internal Support Responder.
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

      {activities.length > 0 && (
        <section className="support-section">
          <div className="section-heading">
            <div>
              <h2>Live case loop</h2>
              <p>
                Employee and responder activity, so you stay informed after
                assignment.
              </p>
            </div>
          </div>
          <div className="panel coordinator-activity-list">
            {activities.map((activity) => {
              const request = allRequests.find(
                (item) => item.id === activity.requestId,
              )

              return (
                <article key={activity.id} className="coordinator-activity">
                  <strong>{activity.title}</strong>
                  <p>{activity.message}</p>
                  <span>
                    {activity.actor}
                    {request ? ` · ${request.reference}` : ''}
                    {` · ${formatDate(activity.createdAt)}`}
                  </span>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <section className="support-section">
        <div className="section-heading">
          <div>
            <h2>Intake &amp; assignment</h2>
            <p>Review requests that require an internal responder.</p>
          </div>
          <span className="optional-label">
            {unassignedRequests.length} awaiting assignment
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

        {unassignedRequests.length === 0 ? (
          <div className="panel internal-support-empty">
            <div className="placeholder-icon">
              <CheckCircle2 size={25} />
            </div>
            <h2>No cases awaiting assignment</h2>
            <p>
              New eligible requests and cases requiring reassignment will
              appear here.
            </p>
          </div>
        ) : (
          <div className="internal-support-request-list">
            {unassignedRequests.map((request) => (
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

                  <span className="request-status status-submitted">
                    {getCaseAssignment(request.id)?.status ===
                    'Conflict declared'
                      ? 'Reassignment needed'
                      : 'Awaiting assignment'}
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
                  <span>{request.preferredChannel}</span>
                </div>

                <div className="internal-assignment-controls">
                  <label htmlFor={`responder-${request.id}`}>
                    Assign to responder
                  </label>

                  <select
                    id={`responder-${request.id}`}
                    value={
                      selectedResponders[request.id] ??
                      responders[0]?.id ??
                      ''
                    }
                    onChange={(event) =>
                      setSelectedResponders((current) => ({
                        ...current,
                        [request.id]: event.target.value,
                      }))
                    }
                    disabled={responders.length === 0}
                  >
                    {responders.map((responder) => (
                      <option key={responder.id} value={responder.id}>
                        {responder.displayName}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="primary-button"
                    disabled={responders.length === 0}
                    onClick={() => handleAssign(request.id)}
                  >
                    Assign case
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {responders.length === 0 && (
          <p className="internal-workspace-error">
            No active responders are currently available for assignment.
          </p>
        )}
      </section>
    </div>
  )
}

export default CoordinatorPage
