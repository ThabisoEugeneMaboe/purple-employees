
import { useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  Inbox,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  acceptSupportAssignment,
  assignSupportRequest,
  getAssignedSupportRequests,
  getCaseAssignment,
  getSupportResponders,
  getSupportRequests,
  getUnassignedSupportRequests,
} from '../../data/supportRequests'
import type { SupportRequest } from '../../types/support'

// Defines the two workspaces available to internal support staff.
type WorkspaceView = 'Coordinator' | 'Responder'

// Demonstration coordinator identity used when recording case assignments.
const COORDINATOR_ID = 'coordinator-001'

// Formats request and assignment dates using the South African locale.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Converts stored request types into employee-friendly labels.
function getRequestLabel(type: SupportRequest['type']) {
  switch (type) {
    case 'emotional':
      return 'Emotional support'
    case 'workplace':
      return 'Workplace support'
    case 'independent':
      return 'Independent support'
    case 'retaliation':
      return 'Retaliation support'
  }
}

// Determines which requests are eligible for handling by the internal support team.
function isInternalSupportRequest(request: SupportRequest) {
  if (
    request.type === 'emotional' ||
    request.type === 'workplace'
  ) {
    return true
  }

  return (
    request.type === 'retaliation' &&
    request.retaliationRoutePreference === 'internal'
  )
}

// Provides the coordinator and responder views for internal case management.
function InternalSupportPage() {
  const [view, setView] = useState<WorkspaceView>('Coordinator')
  const [responderId, setResponderId] = useState('responder-001')
  const [selectedResponders, setSelectedResponders] = useState<
    Record<string, string>
  >({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  // Only active users with the Responder role are offered for case assignment.
  const responders = getSupportResponders().filter(
    (responder) => responder.active && responder.role === 'Responder',
  )

  // Loads the current in-memory requests and derives the workspace's case lists.
  const allRequests = getSupportRequests()
  const unassignedRequests = getUnassignedSupportRequests().filter(
    isInternalSupportRequest,
  )

  const assignedRequests = getAssignedSupportRequests(responderId)

  // Groups eligible internal requests by their current workflow status for the overview.
  const submitted = allRequests.filter(
    (request) =>
      isInternalSupportRequest(request) &&
      request.status === 'Submitted',
  )

  const active = allRequests.filter(
    (request) =>
      isInternalSupportRequest(request) &&
      (request.status === 'Acknowledged' ||
        request.status === 'In progress'),
  )

  const resolved = allRequests.filter(
    (request) =>
      isInternalSupportRequest(request) &&
      request.status === 'Resolved',
  )

  // Updates the page key to refresh the displayed data after an assignment action.
  function refresh() {
    setRefreshKey((current) => current + 1)
  }

  // Assigns an unassigned case to the coordinator's selected active responder.
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
        assignedBy: COORDINATOR_ID,
      })

      setError('')
      setNotice('The case has been assigned successfully.')
      refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'The case could not be assigned.',
      )
    }
  }

  // Records the selected responder's acceptance of an assigned case.
  function handleAccept(requestId: string) {
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
    <div
      className="dashboard internal-support-page"
      key={refreshKey}
    >
      <div className="page-heading">
        <span className="eyebrow">SUPPORT WORKSPACE</span>
        <h1>Internal support</h1>
        <p>
          Coordinate incoming requests and manage assigned employee
          support cases.
        </p>
      </div>

      <div className="privacy-banner">
        <div className="privacy-banner-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="privacy-banner-content">
          <strong>Confidential support workspace</strong>
          <p>
            Employee support information must only be accessed by
            authorised responders with an appropriate role in the case.
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
            <h2>Case management</h2>
            <p>
              Switch between intake coordination and your assigned
              cases.
            </p>
          </div>
        </div>

        <div className="internal-workspace-switch">
          <button
            type="button"
            className={view === 'Coordinator' ? 'active' : ''}
            onClick={() => {
              setView('Coordinator')
              setNotice('')
              setError('')
            }}
          >
            <Users size={17} />
            Intake &amp; assignment
          </button>

          <button
            type="button"
            className={view === 'Responder' ? 'active' : ''}
            onClick={() => {
              setView('Responder')
              setNotice('')
              setError('')
            }}
          >
            <UserCheck size={17} />
            My assigned cases
          </button>
        </div>

        {notice && (
          <div className="internal-workspace-notice">
            {notice}
          </div>
        )}

        {error && (
          <div className="internal-workspace-error" role="alert">
            {error}
          </div>
        )}

        {view === 'Coordinator' ? (
          <div className="internal-workspace-panel">
            <div className="section-heading">
              <div>
                <h2>Intake &amp; assignment</h2>
                <p>
                  Review requests that require an internal responder.
                </p>
              </div>
              <span className="optional-label">
                {unassignedRequests.length} awaiting assignment
              </span>
            </div>

            {unassignedRequests.length === 0 ? (
              <div className="panel internal-support-empty">
                <div className="placeholder-icon">
                  <CheckCircle2 size={25} />
                </div>
                <h2>No cases awaiting assignment</h2>
                <p>
                  New eligible requests and cases requiring reassignment
                  will appear here.
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
                          <option
                            key={responder.id}
                            value={responder.id}
                          >
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
                No active responders are currently available for
                assignment.
              </p>
            )}
          </div>
        ) : (
          <div className="internal-workspace-panel">
            <div className="section-heading">
              <div>
                <h2>My assigned cases</h2>
                <p>
                  Review and accept cases assigned to you.
                </p>
              </div>
            </div>

            <div className="internal-responder-selector">
              <label htmlFor="active-responder">
                Demo responder identity
              </label>
              <select
                id="active-responder"
                value={responderId}
                onChange={(event) => {
                  setResponderId(event.target.value)
                  setNotice('')
                  setError('')
                }}
              >
                {responders.map((responder) => (
                  <option key={responder.id} value={responder.id}>
                    {responder.displayName}
                  </option>
                ))}
              </select>
              <p>
                Demonstration control only. This is not an authenticated
                user session.
              </p>
            </div>

            {assignedRequests.length === 0 ? (
              <div className="panel internal-support-empty">
                <div className="placeholder-icon">
                  <Inbox size={25} />
                </div>
                <h2>No cases assigned to you</h2>
                <p>
                  Cases assigned by the coordinator will appear here.
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
                          Assigned {assignment
                            ? formatDate(assignment.assignedAt)
                            : '—'}
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
                          to={`/internal-support/${request.id}?responder=${encodeURIComponent(responderId)}`}
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
          </div>
        )}
      </section>
    </div>
  )
}

export default InternalSupportPage

