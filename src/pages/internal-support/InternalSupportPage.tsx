
import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Inbox,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getSupportRequests } from '../../data/supportRequests'
import type { SupportRequest } from '../../types/support'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function getRequestLabel(type: SupportRequest['type']) {
  switch (type) {
    case 'emotional':
      return 'Emotional support'
    case 'workplace':
      return 'Workplace support'
    case 'independent':
      return 'Independent support'
  }
}

function InternalSupportPage() {
  const [requests] = useState(() =>
    getSupportRequests().filter( (request) =>
        request.type === 'emotional' ||
        request.type === 'workplace',
    ),
    )

  const submitted = requests.filter(
    (request) => request.status === 'Submitted',
  )

  const active = requests.filter(
    (request) =>
      request.status === 'Acknowledged' ||
      request.status === 'In progress',
  )

  const resolved = requests.filter(
    (request) => request.status === 'Resolved',
  )

  return (
    <div className="dashboard internal-support-page">
      <div className="page-heading">
        <span className="eyebrow">SUPPORT WORKSPACE</span>
        <h1>Internal support</h1>
        <p>
          Manage incoming employee support requests and coordinate
          appropriate follow-through.
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
            <h2>Support queue</h2>
            <p>Incoming requests and their current summaries.</p>
          </div>
          <span className="optional-label">
            {requests.length} total
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="panel internal-support-empty">
            <div className="placeholder-icon">
              <Inbox size={25} />
            </div>
            <h2>No support requests yet</h2>
            <p>
              Employee requests will appear here when submitted.
            </p>
          </div>
        ) : (
          <div className="internal-support-request-list">
            {requests.map((request) => (
                <Link
                    to={`/internal-support/${request.id}`}
                    className="panel internal-support-request-card internal-support-request-link"
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
                    className={`request-status status-${request.status
                      .toLowerCase()
                      .replace(/\s+/g, '-')}`}
                  >
                    {request.status}
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

                <div className="internal-support-request-footer">
                  <span>
                    <AlertCircle size={15} />
                    Employee support request
                  </span>
                  <span>{request.reference}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default InternalSupportPage
