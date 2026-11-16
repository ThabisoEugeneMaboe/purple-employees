
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  MessageSquareText,
} from 'lucide-react'
import {
  getFollowUpsForRequests,
  getSupportRequests,
} from '../../data/supportRequests'
import type { SupportFollowUp } from '../../types/support'

// Formats follow-up dates and times using South African locale conventions.
function formatDate(date: string) {
  return new Date(date).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Maps follow-up statuses to their corresponding CSS classes.
function getStatusClass(status: SupportFollowUp['status']) {
  switch (status) {
    case 'Scheduled':
      return 'follow-up-status-scheduled'
    case 'Completed':
      return 'follow-up-status-completed'
    default:
      return 'follow-up-status-update'
  }
}

// Displays employee-visible updates and contact arrangements for support requests.
function MyFollowUpsPage() {
  // Loads support requests and their follow-ups together when the page initializes.
  const [data] = useState(() => {
    const requests = getSupportRequests()
    // Collects request IDs so their associated follow-ups can be retrieved.
    const requestIds = requests.map((request) => request.id)

    return {
      requests,
      followUps: getFollowUpsForRequests(requestIds),
    }
  })

  // Creates a lookup map to connect each follow-up to its original request.
  const requestMap = new Map(
    data.requests.map((request) => [request.id, request]),
  )

  return (
    <div className="my-support-page">
      <div className="my-support-heading">
        <div>
          <span className="eyebrow">EMPLOYEE WORKSPACE</span>
          <h1>My follow-ups</h1>
          <p>
            Updates, contact arrangements and next steps relating to
            your support requests.
          </p>
        </div>

        <Link to="/my-support" className="support-new-button">
          <MessageCircle size={17} />
          My support
        </Link>
      </div>

      <div className="support-privacy-note">
        <MessageSquareText size={20} />
        <div>
          <strong>Your support updates</strong>
          <p>
            Employee-visible updates relating to your requests appear here.
            Internal case notes are not displayed in this space.
          </p>
        </div>
      </div>

      {/* Shows an empty state when there are no updates to display. */}
      {data.followUps.length === 0 ? (
        <div className="support-empty-state">
          <div className="support-empty-icon">
            <MessageCircle size={30} />
          </div>
          <h2>No follow-up updates yet</h2>
          <p>
            When a support responder records an acknowledgement,
            contact attempt or progress update for you, it will appear here.
          </p>
          <Link to="/my-support" className="support-empty-link">
            View my support requests <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="follow-up-content">
          <div className="support-list-header">
            <h2>Your updates</h2>
            <span>
              {data.followUps.length}{' '}
              {data.followUps.length === 1 ? 'update' : 'updates'}
            </span>
          </div>

          <div className="follow-up-list">
            {data.followUps.map((followUp) => {
              // Finds the support request associated with this follow-up.
              const request = requestMap.get(followUp.requestId)

              if (!request) return null

              return (
                <article
                  className="follow-up-card"
                  key={followUp.id}
                >
                  <div className="support-request-card-top">
                    <div className="support-request-type">
                      <div className="support-request-icon">
                        {followUp.type === 'Scheduled conversation' ? (
                          <CalendarDays size={19} />
                        ) : followUp.type === 'Resolution' ? (
                          <CheckCircle2 size={19} />
                        ) : (
                          <MessageCircle size={19} />
                        )}
                      </div>

                      <div>
                        <h3>{followUp.title}</h3>
                        <span>{followUp.type}</span>
                      </div>
                    </div>

                    <span
                      className={`follow-up-status ${getStatusClass(
                        followUp.status,
                      )}`}
                    >
                      {followUp.status}
                    </span>
                  </div>

                  <p className="follow-up-message">
                    {followUp.message}
                  </p>

                  {followUp.scheduledFor && (
                    <div className="follow-up-scheduled">
                      <CalendarDays size={16} />
                      <span>
                        Scheduled for: {formatDate(followUp.scheduledFor)}
                      </span>
                    </div>
                  )}

                  <div className="support-request-footer">
                    <span>
                      <Clock3 size={15} />
                      {formatDate(followUp.createdAt)}
                    </span>

                    <Link
                      to={`/my-support/${request.id}`}
                      className="follow-up-request-link"
                    >
                      View request <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="follow-up-reference">
                    Related request: {request.reference}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default MyFollowUpsPage
