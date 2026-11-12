
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  addSupportFollowUp,
  getFollowUpsForRequest,
  getSupportRequestById,
  updateSupportRequestStatus,
} from '../../data/supportRequests'
import type { SupportFollowUp } from '../../types/support'

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function InternalSupportRequestPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [request] = useState(() =>
    id ? getSupportRequestById(id) : undefined,
  )

  const [followUps, setFollowUps] = useState<SupportFollowUp[]>(() =>
    id ? getFollowUpsForRequest(id) : [],
  )

  const [acknowledging, setAcknowledging] = useState(false)
  const [error, setError] = useState('')

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
          <Link to="/internal-support" className="support-empty-link">
            <ArrowLeft size={16} />
            Back to internal support
          </Link>
        </div>
      </div>
    )
  }

  const handleAcknowledge = () => {
    if (acknowledging || request.status !== 'Submitted') {
      return
    }

    setAcknowledging(true)
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
          'Your request has been received and acknowledged by the support team. An authorised responder will review the next steps and contact you according to your stated preferences.',
        createdAt: new Date().toISOString(),
      })

      setFollowUps((current) => [newFollowUp, ...current])
      setAcknowledging(false)
      navigate('/internal-support', { replace: true })
    } catch {
      setError(
        'We could not acknowledge this request. Please try again.',
      )
      setAcknowledging(false)
    }
  }

  const requestType =
    request.type === 'emotional'
      ? 'Emotional support'
      : 'Workplace support'

  return (
    <div className="dashboard internal-support-page">
      <div className="page-heading">
        <Link to="/internal-support" className="support-back-link">
          <ArrowLeft size={16} />
          Back to support queue
        </Link>

        <span className="eyebrow">SUPPORT WORKSPACE</span>
        <h1>Support request details</h1>
        <p>
          Review the request and coordinate appropriate support and
          follow-through.
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
                      <span>{formatDate(followUp.createdAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="internal-request-sidebar">
          <section className="panel internal-request-action-card">
            <h2>Case actions</h2>

            {request.status === 'Submitted' ? (
              <>
                <p>
                  Acknowledge receipt of this request so the employee
                  knows it has reached the support team.
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

                {error && (
                  <p className="internal-request-error" role="alert">
                    {error}
                  </p>
                )}
              </>
            ) : (
              <div className="internal-request-acknowledged">
                <CheckCircle2 size={21} />
                <strong>Request acknowledged</strong>
                <p>
                  This request has already moved beyond its initial
                  submission.
                </p>
              </div>
            )}
          </section>

          <section className="panel internal-request-case-info">
            <h2>Case information</h2>

            <div>
              <UserRound size={17} />
              <span>Assigned responder</span>
              <strong>Not yet assigned</strong>
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
