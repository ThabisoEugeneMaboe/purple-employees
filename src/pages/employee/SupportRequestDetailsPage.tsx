
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import {
  getEmployeeJourney,
  getEmployeeJourneyLabel,
  getFollowUpsForRequest,
  getSupportRequestById,
  getSupportRequests,
} from '../../data/supportRequests'
import type {
  IndependentSupportCategory,
  SupportRequest,
} from '../../types/support'

// Formats request dates using the South African date and language conventions.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Converts request type values into employee-friendly display labels.
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
    case 'iod':
      return 'Injury on duty / J88'
  }
}

// Maps independent support category values to their display labels.
function getIndependentCategoryLabel(
  category: IndependentSupportCategory,
) {
  const labels: Record<IndependentSupportCategory, string> = {
    wellbeing: 'Emotional and wellbeing support',
    'workplace-concerns': 'Workplace concerns',
    'harassment-discrimination': 'Harassment or discrimination',
    retaliation: 'Retaliation or victimisation',
    guidance: 'Guidance and advice',
    other: 'Other support',
  }

  return labels[category]
}

// Displays the details, progress and follow-up history for one support request.
function SupportRequestDetailsPage() {
  const { id } = useParams()
  // Looks up the request using the ID supplied in the current route.
  const request = id ? getSupportRequestById(id) : undefined

  if (!request) {
    return (
      <div className="request-details-not-found">
        <div className="support-empty-icon">
          <MessageCircle size={28} />
        </div>
        <h2>Request not found</h2>
        <p>
          This request may not exist in the current prototype session.
        </p>
        <Link to="/my-support" className="support-empty-link">
          <ArrowLeft size={16} />
          Back to My Support
        </Link>
      </div>
    )
  }

  // Retrieves employee-visible follow-up updates linked to this request.
  const requestFollowUps = getFollowUpsForRequest(request.id)

  // Finds retaliation reports linked to this original support request.
  const linkedRetaliationRequests = getSupportRequests().filter(
    (candidate) =>
      candidate.type === 'retaliation' &&
      candidate.originalRequestId === request.id,
  )

  // Retrieves the original request when viewing a linked retaliation report.
  const originalRequest =
    request.type === 'retaliation' && request.originalRequestId
      ? getSupportRequestById(request.originalRequestId)
      : undefined

  const journey = getEmployeeJourney(request)

  return (
    <div className="request-details-page">
      <Link to="/my-support" className="request-back-link">
        <ArrowLeft size={17} />
        Back to My Support
      </Link>

      <div className="request-details-header">
        <div>
          <span className="eyebrow">SUPPORT REQUEST</span>
          <h1>{getRequestLabel(request.type)}</h1>
          <p>Reference: {request.reference}</p>
        </div>

        <span
          className={`request-status status-${request.status
            .toLowerCase()
            .replace(/\s+/g, '-')}`}
        >
          {getEmployeeJourneyLabel(request)}
        </span>
      </div>

      <div className="request-details-grid">
        <div className="request-details-main">
          <section className="request-details-card">
            <h2>Your request</h2>

            <div className="request-detail-field">
              <span>Submitted</span>
              <strong>{formatDate(request.createdAt)}</strong>
            </div>

            <div className="request-detail-field">
              <span>Support pathway</span>
              <strong>{getRequestLabel(request.type)}</strong>
            </div>

            {request.type === 'independent' && (
              <>
                {request.independentSupportCategories &&
                  request.independentSupportCategories.length > 0 && (
                    <div className="request-detail-field">
                      <span>Types of support requested</span>
                      <ul>
                        {request.independentSupportCategories.map(
                          (category) => (
                            <li key={category}>
                              {getIndependentCategoryLabel(category)}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {request.independentSupportDetails?.trim() && (
                  <div className="request-detail-field">
                    <span>Additional details</span>
                    <p className="request-detail-description">
                      {request.independentSupportDetails}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="request-detail-field">
              <span>Your description</span>
              <p className="request-detail-description">
                {request.description}
              </p>
            </div>

            {request.type === 'iod' && (
              <>
                <div className="request-detail-field">
                  <span>Incident date</span>
                  <strong>
                    {request.iodIncidentDate}
                    {request.iodIncidentTime
                      ? ` · ${request.iodIncidentTime}`
                      : ''}
                  </strong>
                </div>
                <div className="request-detail-field">
                  <span>Location</span>
                  <strong>{request.iodLocation}</strong>
                </div>
                <div className="request-detail-field">
                  <span>Medical care</span>
                  <strong>
                    {request.iodMedicalAttended
                      ? 'Already attended'
                      : 'Not yet attended'}
                  </strong>
                </div>
                {(request.attachments ?? []).length > 0 && (
                  <div className="request-detail-field">
                    <span>Uploaded documents</span>
                    <ul>
                      {request.attachments?.map((file) => (
                        <li key={file.id}>
                          <a href={file.dataUrl} download={file.name}>
                            {file.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </section>

          {request.type === 'retaliation' ? (
            originalRequest && (
              <section className="request-details-card">
                <h2>Related original request</h2>
                <p>
                  This retaliation report is linked to the following
                  original support request. Its status and history remain
                  separate.
                </p>
                <div className="request-detail-field">
                  <span>Original request</span>
                  <strong>{getRequestLabel(originalRequest.type)}</strong>
                </div>
                <div className="request-detail-field">
                  <span>Reference</span>
                  <strong>{originalRequest.reference}</strong>
                </div>
                <div className="request-detail-field">
                  <span>Current status</span>
                  <strong>{originalRequest.status}</strong>
                </div>
                <Link
                  to={`/my-support/${originalRequest.id}`}
                  className="request-primary-link"
                >
                  View original request
                </Link>
              </section>
            )
          ) : (
            <>
              <section className="request-details-card">
                <h2>Retaliation support</h2>
                <p>
                  If you experience retaliation connected to this
                  request, you can submit a separate linked report.
                  This will not change the original request.
                </p>
                <Link
                  to={`/my-support/${request.id}/retaliation`}
                  className="request-primary-link"
                >
                  Report retaliation related to this request
                </Link>
              </section>

              {linkedRetaliationRequests.length > 0 && (
                <section className="request-details-card">
                  <h2>Linked retaliation reports</h2>
                  <p>
                    These reports are linked to this original request
                    and have their own references and progress.
                  </p>
                  {linkedRetaliationRequests.map((retaliation) => (
                    <div
                      className="request-detail-field"
                      key={retaliation.id}
                    >
                      <span>{retaliation.reference}</span>
                      <strong>{retaliation.status}</strong>
                      <Link to={`/my-support/${retaliation.id}`}>
                        View retaliation report
                      </Link>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}

          <section className="request-details-card">
            <h2>Contact preferences</h2>

            <div className="request-detail-field">
              <span>Preferred contact method</span>
              <strong>{request.preferredChannel}</strong>
            </div>

            <div className="request-detail-field">
              <span>Preferred language</span>
              <strong>{request.preferredLanguage}</strong>
            </div>

            <div className="request-detail-field">
              <span>Preferred contact time</span>
              <strong>{request.preferredContactTime}</strong>
            </div>

            <div className="request-detail-field">
              <span>Safe to contact</span>
              <strong>{request.safeToContact ? 'Yes' : 'No'}</strong>
            </div>

            {request.safeContactInstructions && (
              <div className="request-detail-field">
                <span>Safe contact instructions</span>
                <p>{request.safeContactInstructions}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="request-details-sidebar">
          <section className="request-details-card">
            <h2>Where your request is now</h2>
            <p className="request-journey-intro">
              You will see each hand-off from coordinator to responder until
              this case is resolved.
            </p>

            <div className="request-timeline">
              {journey.map((step) => {
                return (
                  <div
                    className={`request-timeline-item ${
                      step.current ? 'request-timeline-current' : ''
                    }`}
                    key={step.id}
                  >
                    <div className="request-timeline-marker">
                      {step.completed && !step.current ? (
                        <CheckCircle2 size={19} />
                      ) : (
                        <Circle size={19} />
                      )}
                    </div>

                    <div>
                      <strong className={step.completed ? 'completed' : ''}>
                        {step.label}
                      </strong>
                      <span>{step.detail}</span>
                      {step.current && <span>Current stage</span>}
                      {step.at && !step.current && (
                        <span>{formatDate(step.at)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="request-details-privacy">
            <ShieldCheck size={21} />
            <strong>Your support information</strong>
            <p>
              Updates from coordinators and responders appear here and in
              My follow-ups, without leaving your confidential workspace.
            </p>
          </section>

          
          <section className="request-details-card request-follow-up-card">
            <h2>Follow-ups</h2>

            {requestFollowUps.length === 0 ? (
                <div className="request-follow-up-empty">
                <Clock3 size={23} />
                <p>No follow-up updates yet.</p>
                <span>
                    You will see coordinator assignment, responder
                    acceptance, and every follow-up until resolution.
                </span>
                </div>
            ) : (
                <div className="request-detail-follow-up-list">
                {requestFollowUps.map((followUp) => (
                    <article
                    className="request-detail-follow-up"
                    key={followUp.id}
                    >
                    <span>{followUp.type}</span>
                    <strong>{followUp.title}</strong>
                    <p>{followUp.message}</p>

                    {followUp.scheduledFor && (
                        <small>
                        Scheduled for:{' '}
                        {new Date(followUp.scheduledFor).toLocaleString('en-ZA')}
                        </small>
                    )}

                    <small>
                        Updated:{' '}
                        {new Date(followUp.createdAt).toLocaleString('en-ZA')}
                    </small>
                    </article>
                ))}
                </div>
            )}
            </section>

        </aside>
      </div>
    </div>
  )
}

export default SupportRequestDetailsPage



