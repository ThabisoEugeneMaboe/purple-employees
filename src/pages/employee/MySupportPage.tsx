
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import {
  getEmployeeJourneyLabel,
  getSupportRequests,
} from '../../data/supportRequests'
import type { SupportRequest } from '../../types/support'

// Formats request dates using the South African date and language conventions.
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Converts internal request type values into labels displayed to employees.
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

// Displays the employee's submitted support requests and their current status.
function MySupportPage() {
  // Loads the current in-memory requests when the component is first rendered.
  const [requests] = useState<SupportRequest[]>(getSupportRequests)

  return (
    <div className="my-support-page">
      <div className="my-support-heading">
        <div>
          <span className="eyebrow">EMPLOYEE WORKSPACE</span>
          <h1>My support</h1>
          <p>
            Track every stage — from coordinator assignment to responder
            follow-up — until your case is resolved.
          </p>
        </div>

        <Link to="/" className="support-new-button">
          <MessageCircle size={17} />
          New request
        </Link>
      </div>

      <div className="support-privacy-note">
        <ShieldCheck size={20} />
        <div>
          <strong>Your support space</strong>
          <p>
            You stay in the loop as coordinators assign and responders
            follow up. Personal details remain in this confidential workspace.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="support-empty-state">
          <div className="support-empty-icon">
            <ClipboardList size={30} />
          </div>
          <h2>You haven't submitted a request yet</h2>
          <p>
            Whenever you need support, you can start a request here.
            You don't have to wait until things become difficult.
          </p>
          <Link to="/" className="support-empty-link">
            Explore support options <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="support-request-list">
          <div className="support-list-header">
            <h2>Your requests</h2>
            <span>{requests.length} submitted</span>
          </div>

          {requests.map((request) => (
            <Link to={`/my-support/${request.id}`} className="support-request-card support-request-card-link" key={request.id}
>
              <div className="support-request-card-top">
                <div className="support-request-type">
                  <div className="support-request-icon">
                    <MessageCircle size={19} />
                  </div>
                  <div>
                    <h3>{getRequestLabel(request.type)}</h3>
                    <span>{request.reference}</span>
                  </div>
                </div>

                <span
                  className={`request-status status-${request.status
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {getEmployeeJourneyLabel(request)}
                </span>
              </div>

              <p className="support-request-description">
                {request.description}
              </p>

              <div className="support-request-meta">
                <span>
                  <Clock3 size={15} />
                  Submitted {formatDate(request.createdAt)}
                </span>
                <span>
                  {request.preferredChannel}
                </span>
              </div>

              <div className="support-request-footer">
                <span>
                  <ShieldCheck size={15} />
                  Support request
                </span>
                <span className="support-reference-label">
                  Reference: {request.reference}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MySupportPage

