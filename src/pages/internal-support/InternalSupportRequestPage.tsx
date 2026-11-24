import { useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import {
  acceptSupportAssignment,
  addInternalCaseNote,
  addSupportFollowUp,
  declareSupportConflict,
  getCaseAssignment,
  getFollowUpsForRequest,
  getInternalCaseNotes,
  getSupportRequestById,
  getSupportResponders,
  updateSupportRequestStatus,
} from '../../data/supportRequests'
import type {
  CaseAssignment,
  InternalCaseNote,
  SupportFollowUp,
} from '../../types/support'

// Formats request, follow-up and case-note dates using the South African locale.
function formatDate(date: string) {
  return new Date(date).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Sets the initial minimum scheduling time; submission also validates against the current time.
const MINIMUM_SCHEDULED_FOR = new Date(Date.now() + 60000).toISOString().slice(0, 16)

// Displays an individual support case and provides actions for its assigned responder.
function InternalSupportRequestPage({
  responderId,
}: {
  responderId: string
}) {
  const { id } = useParams()

  // Resolves the responder identity against the available demonstration responder records.
  const responders = getSupportResponders()
  const currentResponder = responders.find(
    (responder) => responder.id === responderId,
  )

  // Loads the current assignment so the page can determine the responder's case permissions.
  const [assignment, setAssignment] = useState<
    CaseAssignment | undefined
  >(() => (id ? getCaseAssignment(id) : undefined))

  // Checks whether the selected responder matches the responder currently assigned to this case.
  const isAssignedResponder =
    Boolean(currentResponder) &&
    assignment?.responderId === responderId

  const hasAcceptedAssignment =
    isAssignedResponder && assignment?.status === 'Accepted'

  // Loads the support request identified by the current route parameter.
  const [request, setRequest] = useState(() =>
    id ? getSupportRequestById(id) : undefined,
  )

  // Loads employee-visible updates associated with this support request.
  const [followUps, setFollowUps] = useState<SupportFollowUp[]>(() =>
    id ? getFollowUpsForRequest(id) : [],
  )

  // Loads private notes only when the current responder has an accepted assignment.
  const [caseNotes, setCaseNotes] = useState<InternalCaseNote[]>(() => {
  if (!id || !hasAcceptedAssignment || !responderId) {
    return []
  }

  try {
    return getInternalCaseNotes(id, responderId)
  } catch {
      return []
  }
  })

  const [noteDraft, setNoteDraft] = useState('')
  const [progressTitle, setProgressTitle] = useState('')
  const [progressMessage, setProgressMessage] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [conflictReason, setConflictReason] = useState('')
  const [resolutionMessage, setResolutionMessage] = useState('')

  const [acknowledging, setAcknowledging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [successSlot, setSuccessSlot] = useState<
    | ''
    | 'progress'
    | 'schedule'
    | 'note'
    | 'resolve'
    | 'accept'
    | 'acknowledge'
  >('')

  function showSuccess(
    slot:
      | 'progress'
      | 'schedule'
      | 'note'
      | 'resolve'
      | 'accept'
      | 'acknowledge',
    message: string,
  ) {
    setError('')
    setSuccessSlot(slot)
    setSuccess(message)
  }

  if (!request) {
    return (
      <div className="dashboard internal-support-page">
        <div className="panel internal-support-empty">
          <div className="placeholder-icon">
            <MessageCircle size={25} />
          </div>
          <h2>Support request not found</h2>
          <p>
            This request may no longer exist or the reference may be invalid.
          </p>
          <Link to="/responder" className="support-empty-link">
            <ArrowLeft size={16} />
            Back to assigned cases
          </Link>
        </div>
      </div>
    )
  }

  // Accepts the assignment and loads the private notes available to the accepted responder.
  const handleAcceptAssignment = () => {
  if (
    !id ||
    !responderId ||
    !isAssignedResponder ||
    assignment?.status !== 'Assigned'
  ) {
    setError('You are not authorised to accept this assignment.')
    return
  }

  setSuccess('')
  setSuccessSlot('')
  setError('')

  try {
    const acceptedAssignment = acceptSupportAssignment(
      id,
      responderId,
    )

    setAssignment(acceptedAssignment)

    const notes = getInternalCaseNotes(id, responderId)
    setCaseNotes(notes)
    showSuccess(
      'accept',
      'Assignment accepted. The employee can see that a responder has taken the case, and the coordinator stays in the loop.',
    )
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'The assignment could not be accepted.',
    )
  }
}

// Records a responder's conflict declaration and returns the case for reassignment.
const handleDeclareConflict = () => {
  if (
    !id ||
    !responderId ||
    !hasAcceptedAssignment
  ) {
    setError('You are not authorised to declare a conflict.')
    return
  }

  if (!conflictReason.trim()) {
    setError('Please explain why you cannot handle this case.')
    return
  }

  setError('')

  try {
    const updatedAssignment = declareSupportConflict(
      id,
      responderId,
      conflictReason,
    )

    setAssignment(updatedAssignment)
    setCaseNotes([])
    setConflictReason('')
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : 'The conflict could not be recorded.',
    )
  }
}

    // Acknowledges a submitted request and records an employee-visible follow-up.
    const handleAcknowledge = () => {
    if (
      acknowledging ||
      request.status !== 'Submitted' ||
      !hasAcceptedAssignment ||
      !id
    ) {
      setError(
        'Only the responder who has accepted this assignment may acknowledge it.',
      )
      return
    }

    setAcknowledging(true)
    setSuccess('')
    setSuccessSlot('')
    setError('')

    try {
      const updatedRequest = updateSupportRequestStatus(
        request.id,
        'Acknowledged',
      )

      if (!updatedRequest) {
        throw new Error('The support request could not be updated.')
      }

      const newFollowUp = addSupportFollowUp({
        requestId: request.id,
        type: 'Acknowledgement',
        status: 'Update',
        title: 'Your support request has been acknowledged',
        message:
          'Your request has been received and acknowledged by the support team. An authorised responder is reviewing the next steps and will follow the safe-contact arrangements you provided.',
        createdAt: new Date().toISOString(),
      })

      setRequest(updatedRequest)
      setFollowUps((current) => [newFollowUp, ...current])
      showSuccess(
        'acknowledge',
        'Request acknowledged. The employee has been updated, and the coordinator can see this stage.',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not acknowledge this request. Please try again.',
      )
    } finally {
      setAcknowledging(false)
    }
  }

  // Publishes an employee-visible progress update and moves the request into progress when needed.
  const handleAddProgressUpdate = () => {
    if (!id || !hasAcceptedAssignment) {
      setError('You must accept this assignment before adding an update.')
      return
    }

    if (!progressTitle.trim() || !progressMessage.trim()) {
      setError('Please provide both an update title and message.')
      return
    }

    if (!request || request.status === 'Resolved') {
      setError('A resolved request cannot receive further progress updates.')
      return
    }

    setError('')

    try {
      const newFollowUp = addSupportFollowUp({
        requestId: id,
        type: 'Progress update',
        status: 'Update',
        title: progressTitle.trim(),
        message: progressMessage.trim(),
        createdAt: new Date().toISOString(),
      })

      if (request.status !== 'In progress') {
        const updatedRequest = updateSupportRequestStatus(
          id,
          'In progress',
        )

        if (!updatedRequest) {
          throw new Error('The request status could not be updated.')
        }

        setRequest(updatedRequest)
      }

      setFollowUps((current) => [newFollowUp, ...current])
      setProgressTitle('')
      setProgressMessage('')
      showSuccess(
        'progress',
        'Progress update published. The employee can read it now, and the coordinator has been notified.',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The progress update could not be saved.',
      )
    }
  }

  // Records a proposed future conversation in the employee's follow-up timeline.
  const handleScheduleConversation = () => {
    if (!id || !hasAcceptedAssignment) {
      setError('You must accept this assignment before scheduling a conversation.')
      return
    }

    if (!scheduledFor) {
      setError('Please select a date and time for the conversation.')
      return
    }

    const scheduledDate = new Date(scheduledFor)

    if (
      Number.isNaN(scheduledDate.getTime()) ||
      scheduledDate.getTime() <= Date.now()
    ) {
      setError('Please select a valid future date and time.')
      return
    }

    setError('')

    try {
      const newFollowUp = addSupportFollowUp({
        requestId: id,
        type: 'Scheduled conversation',
        status: 'Scheduled',
        title: 'A support conversation has been scheduled',
        message:
          'A conversation has been scheduled for the date and time shown below. Please refer to your stated contact preferences and safe-contact arrangements.',
        createdAt: new Date().toISOString(),
        scheduledFor: scheduledDate.toISOString(),
      })

      setFollowUps((current) => [newFollowUp, ...current])
      setScheduledFor('')
      showSuccess(
        'schedule',
        'Conversation recorded. The employee can see the proposed time, and the coordinator stays informed.',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The conversation could not be scheduled.',
      )
    }
  }

  // Saves an internal case note separately from employee-visible follow-ups.
  const handleAddPrivateNote = () => {
    if (!id || !responderId || !hasAcceptedAssignment) {
      setError('Only the accepted responder may add private case notes.')
      return
    }

    if (!noteDraft.trim()) {
      setError('Please enter a note before saving.')
      return
    }

    setError('')

    try {
      const newNote = addInternalCaseNote({
        requestId: id,
        responderId,
        type: 'Internal note',
        content: noteDraft.trim(),
      })

      setCaseNotes((current) => [newNote, ...current])
      setNoteDraft('')
      showSuccess(
        'note',
        'Private note saved. The coordinator was told a note was added; the employee cannot see the note content.',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The private note could not be saved.',
      )
    }
  }

  // Marks the request as resolved and records the resolution summary for the employee.
  const handleResolveCase = () => {
    if (!id || !hasAcceptedAssignment || request.status === 'Resolved') {
      setError('Only the accepted responder may resolve this case.')
      return
    }

    if (!resolutionMessage.trim()) {
      setError('Please provide a resolution summary.')
      return
    }

    setError('')

    try {
      const updatedRequest = updateSupportRequestStatus(
        id,
        'Resolved',
      )

      if (!updatedRequest) {
        throw new Error('The support request could not be updated.')
      }

      const newFollowUp = addSupportFollowUp({
        requestId: id,
        type: 'Resolution',
        status: 'Completed',
        title: 'Your support request has been marked as resolved',
        message: resolutionMessage.trim(),
        createdAt: new Date().toISOString(),
      })

      setRequest(updatedRequest)
      setFollowUps((current) => [newFollowUp, ...current])
      setResolutionMessage('')
      showSuccess(
        'resolve',
        'Case resolved. The employee has the outcome, and the coordinator can see that this case is closed.',
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The support case could not be resolved.',
      )
    }
  }

  // Maps stored request types to the labels displayed in the case details.
  const requestType = {
  emotional: 'Emotional support',
  workplace: 'Workplace support',
  independent: 'Independent support',
  retaliation: 'Retaliation support',
  }[request.type]

  return (
    <div className="dashboard internal-support-page">
      <div className="page-heading">
        <Link to="/responder" className="support-back-link">
          <ArrowLeft size={16} />
          Back to assigned cases
        </Link>

        <span className="eyebrow">RESPONDER WORKSPACE</span>
        <h1>Support request details</h1>
        <p>
          Accept the assignment, support the employee, and oversee the case
          through to resolution.
        </p>
      </div>

      <div className="privacy-banner">
        <div className="privacy-banner-icon">
          <ShieldCheck size={20} />
        </div>
        <div className="privacy-banner-content">
          <strong>Confidential case information</strong>
          <p>
            Access this information only when authorised to respond to
            this request. Internal case records must remain separate from
            employee-visible updates.
          </p>
        </div>
      </div>

      {success && (
        <div className="action-success-banner" role="status">
          <CheckCircle2 size={22} />
          <div>
            <strong>It went through</strong>
            <p>{success}</p>
          </div>
        </div>
      )}

      <div className="internal-request-detail-grid">
        <div className="internal-request-main">
          <section className="panel internal-request-detail-card">
            <div className="internal-request-detail-header">
              <div>
                <span className="eyebrow">REQUEST REFERENCE</span>
                <h2>{request.reference}</h2>
                <span className="internal-request-type">
                  {requestType}
                </span>
              </div>

              <span
                className={`request-status status-${request.status
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                {request.status}
              </span>
            </div>

            <div className="internal-request-description-section">
              <h3>Employee's message</h3>
              <p>{request.description}</p>
            </div>

            <div className="internal-request-information">
              <h3>Contact preferences</h3>

              <div className="internal-request-information-grid">
                <div>
                  <span>Preferred contact channel</span>
                  <strong>{request.preferredChannel}</strong>
                </div>

                <div>
                  <span>Preferred language</span>
                  <strong>{request.preferredLanguage}</strong>
                </div>

                <div>
                  <span>Preferred contact time</span>
                  <strong>{request.preferredContactTime}</strong>
                </div>

                <div>
                  <span>Submitted</span>
                  <strong>{formatDate(request.createdAt)}</strong>
                </div>
              </div>
            </div>

            <div className="internal-request-safety-section">
              <h3>Safe-contact arrangements</h3>

              <div className="internal-request-safety-answer">
                <span>Safe to contact?</span>
                <strong>{request.safeToContact ? 'Yes' : 'No'}</strong>
              </div>

              {request.safeContactInstructions && (
                <div className="internal-request-safety-instructions">
                  <span>Employee's instructions</span>
                  <p>{request.safeContactInstructions}</p>
                </div>
              )}
            </div>

            <div className="internal-request-consent">
              <CheckCircle2 size={18} />
              <div>
                <strong>Consent confirmation</strong>
                <p>
                  {request.consentConfirmed
                    ? 'The employee confirmed the consent and disclosure information before submitting.'
                    : 'Consent confirmation is not recorded.'}
                </p>
              </div>
            </div>
          </section>

          <section className="panel internal-request-timeline">
            <div className="panel-heading">
              <div>
                <h2>Employee-visible updates</h2>
                <p>
                  Updates recorded for the employee through My Follow-ups.
                </p>
              </div>
              <MessageCircle size={20} />
            </div>

            {followUps.length === 0 ? (
              <div className="internal-request-no-updates">
                <Clock3 size={20} />
                <p>No employee-visible updates have been recorded yet.</p>
              </div>
            ) : (
              <div className="internal-request-timeline-list">
                {followUps.map((followUp) => (
                  <article key={followUp.id}>
                    <div className="internal-request-timeline-icon">
                      <CheckCircle2 size={17} />
                    </div>
                    <div>
                      <strong>{followUp.title}</strong>
                      <p>{followUp.message}</p>
                      {followUp.scheduledFor && (
                        <p>
                          <strong>Scheduled for:</strong>{' '}
                          {formatDate(followUp.scheduledFor)}
                        </p>
                      )}
                      <span>{formatDate(followUp.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {hasAcceptedAssignment && request.status !== 'Resolved' && (
          <>
            <section className="panel internal-request-detail-card">
              <div className="panel-heading">
                <div>
                  <h2>Record a progress update</h2>
                  <p>
                    Share an appropriate update with the employee.
                  </p>
                </div>
                <MessageCircle size={20} />
              </div>

              <div className="internal-request-description-section">
                <label htmlFor="progress-title">Update title</label>
                <input
                  id="progress-title"
                  type="text"
                  value={progressTitle}
                  onChange={(event) => setProgressTitle(event.target.value)}
                  placeholder="e.g. Your request is being reviewed"
                />

                <label htmlFor="progress-message">Update message</label>
                <textarea
                  id="progress-message"
                  value={progressMessage}
                  onChange={(event) => setProgressMessage(event.target.value)}
                  placeholder="Write the message the employee will see..."
                  rows={5}
                />

                <button
                  type="button"
                  className="internal-request-acknowledge-button"
                  onClick={handleAddProgressUpdate}
                >
                  Publish progress update
                </button>
                {successSlot === 'progress' && (
                  <p className="inline-action-success" role="status">
                    <CheckCircle2 size={16} />
                    {success}
                  </p>
                )}
              </div>
            </section>

            <section className="panel internal-request-detail-card">
              <div className="panel-heading">
                <div>
                  <h2>Schedule a conversation</h2>
                  <p>
                    Record a proposed conversation date and time.
                  </p>
                </div>
                <CalendarDays size={20} />
              </div>

              <div className="internal-request-description-section">
                <label htmlFor="scheduled-for">Conversation date and time</label>
                <input
                  id="scheduled-for"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(event) => setScheduledFor(event.target.value)}
                  min={MINIMUM_SCHEDULED_FOR}
                />

                <button
                  type="button"
                  className="internal-request-acknowledge-button"
                  onClick={handleScheduleConversation}
                >
                  Record scheduled conversation
                </button>
                {successSlot === 'schedule' && (
                  <p className="inline-action-success" role="status">
                    <CheckCircle2 size={16} />
                    {success}
                  </p>
                )}

                <p>
                  This records the proposed arrangement in the employee's
                  follow-up timeline. It does not send an invitation or
                  automatically contact the employee.
                </p>
              </div>
            </section>
          </>
        )}
        {hasAcceptedAssignment && (
          <section className="panel internal-request-detail-card">
            <div className="panel-heading">
              <div>
                <h2>Private case notes</h2>
                <p>
                  These notes are restricted to the responder who accepted
                  this assignment. They are not visible to the employee.
                </p>
              </div>
              <ShieldCheck size={20} />
            </div>

            <div className="internal-request-description-section">
              <label htmlFor="private-note">Internal note</label>
              <textarea
                id="private-note"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Record relevant observations, actions or internal context..."
                rows={5}
              />

                <button
                  type="button"
                  className="internal-request-acknowledge-button"
                  onClick={handleAddPrivateNote}
                >
                  Save private note
                </button>
                {successSlot === 'note' && (
                  <p className="inline-action-success" role="status">
                    <CheckCircle2 size={16} />
                    {success}
                  </p>
                )}
              </div>

            <div className="internal-request-timeline-list">
              {caseNotes.length === 0 ? (
                <div className="internal-request-no-updates">
                  <ShieldCheck size={20} />
                  <p>No private notes have been recorded.</p>
                </div>
              ) : (
                caseNotes.map((note) => (
                  <article key={note.id}>
                    <div className="internal-request-timeline-icon">
                      <ShieldCheck size={17} />
                    </div>
                    <div>
                      <strong>{note.type}</strong>
                      <p>{note.content}</p>
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}


        {hasAcceptedAssignment && request.status !== 'Resolved' && (
  <section className="panel internal-request-detail-card">
    <div className="panel-heading">
      <div>
        <h2>Resolve support case</h2>
        <p>
          Record the outcome and provide an appropriate summary
          for the employee.
        </p>
      </div>
      <CheckCircle2 size={20} />
    </div>

    <div className="internal-request-description-section">
      <label htmlFor="resolution-message">
        Resolution summary
      </label>

      <textarea
        id="resolution-message"
        value={resolutionMessage}
        onChange={(event) =>
          setResolutionMessage(event.target.value)
        }
        placeholder="Summarise the outcome or agreed next steps..."
        rows={5}
      />

      <button
        type="button"
        className="internal-request-acknowledge-button"
        onClick={handleResolveCase}
      >
        Mark case as resolved
      </button>
      {successSlot === 'resolve' && (
        <p className="inline-action-success" role="status">
          <CheckCircle2 size={16} />
          {success}
        </p>
      )}

      <p>
        Only resolve a case when the support process has reached
        an appropriate conclusion. The summary will be visible
        to the employee.
      </p>
    </div>
  </section>
)}
        </div>

        <aside className="internal-request-sidebar">
         <section className="panel internal-request-action-card">
            <h2>Case actions</h2>

            {!currentResponder ? (
              <p>
                No valid responder identity was provided. Return to the
                support workspace and open the case from your responder queue.
              </p>
            ) : !isAssignedResponder ? (
              <p>
                This case is not currently assigned to you. You cannot
                perform case actions.
              </p>
            ) : assignment?.status === 'Conflict declared' ? (
              <div className="internal-request-acknowledged">
                <ShieldCheck size={21} />
                <strong>Conflict declared</strong>
                <p>
                  This case has been returned to the coordinator for reassignment.
                </p>
              </div>
            ) : assignment?.status === 'Reassignment requested' ? (
              <p>This case is awaiting reassignment.</p>
            ) : assignment?.status === 'Assigned' ? (
              <>
                <p>
                  This case has been assigned to you. Accept the assignment
                  before accessing private notes or taking case actions.
                </p>

                <button
                  type="button"
                  className="internal-request-acknowledge-button"
                  onClick={handleAcceptAssignment}
                >
                  <CheckCircle2 size={17} />
                  Accept assignment
                </button>
              </>
            ) : hasAcceptedAssignment ? (
              <>
                {request.status === 'Submitted' && (
                  <>
                    <p>
                      You have accepted this assignment. You can now
                      acknowledge receipt of the employee's request.
                    </p>

                    <button
                      type="button"
                      className="internal-request-acknowledge-button"
                      onClick={handleAcknowledge}
                      disabled={acknowledging}
                    >
                      <CheckCircle2 size={17} />
                      {acknowledging
                        ? 'Acknowledging...'
                        : 'Acknowledge request'}
                    </button>
                  </>
                )}

                {request.status === 'Acknowledged' && (
                  <div className="internal-request-acknowledged">
                    <CheckCircle2 size={21} />
                    <strong>Request acknowledged</strong>
                    <p>You are the accepted responder for this case.</p>
                  </div>
                )}

                {request.status === 'In progress' && (
                  <div className="internal-request-acknowledged">
                    <Clock3 size={21} />
                    <strong>Case in progress</strong>
                    <p>You are managing this support request.</p>
                  </div>
                )}

                {request.status === 'Resolved' && (
                  <div className="internal-request-acknowledged">
                    <CheckCircle2 size={21} />
                    <strong>Case resolved</strong>
                    <p>A resolution update has been recorded.</p>
                  </div>
                )}

                {request.status !== 'Resolved' && (
                  <>
                    <div className="internal-request-description-section internal-request-conflict-section">
                      <h3>Declare a conflict</h3>
                      <p>
                        If you cannot handle this case impartially or
                        appropriately, explain why so it can be reassigned.
                      </p>
                    </div>

                    <textarea
                      value={conflictReason}
                      onChange={(event) => setConflictReason(event.target.value)}
                      placeholder="Explain the conflict of interest or other concern..."
                      rows={4}
                    />

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleDeclareConflict}
                    >
                      Declare conflict
                    </button>
                  </>
                )}
              </>
            ) : (
              <p>
                This assignment is not currently available for action.
              </p>
            )}

            {successSlot === 'accept' || successSlot === 'acknowledge' ? (
              <p className="inline-action-success" role="status">
                <CheckCircle2 size={16} />
                {success}
              </p>
            ) : null}

            {error && (
              <p className="internal-request-error" role="alert">
                {error}
              </p>
            )}
          </section>

          <section className="panel internal-request-case-info">
            <h2>Case information</h2>

            <div>
              <UserRound size={17} />
              <span>Assigned responder</span>
              <strong>
                {assignment?.responderName ?? 'Not yet assigned'}
              </strong>
            </div>

            <div>
              <ShieldCheck size={17} />
              <span>Assignment status</span>
              <strong>{assignment?.status ?? 'Unassigned'}</strong>
            </div>

            <div>
              <CalendarDays size={17} />
              <span>Request received</span>
              <strong>{formatDate(request.createdAt)}</strong>
            </div>

            <div>
              <ShieldCheck size={17} />
              <span>Access</span>
              <strong>Authorised responders only</strong>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default InternalSupportRequestPage

