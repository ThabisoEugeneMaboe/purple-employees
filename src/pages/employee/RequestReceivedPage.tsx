import { ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getSupportRequestById } from '../../data/supportRequests'
import ShareRequestButton from './ShareRequestButton'

function requestHeading(type: string | null) {
  if (type === 'iod') {
    return 'Your IOD / J88 report has been received.'
  }

  if (type === 'retaliation') {
    return 'Your retaliation support request has been recorded.'
  }

  return 'Your request has been received.'
}

function nextStepCopy(type: string | null) {
  if (type === 'iod') {
    return 'A coordinator will assign a responder for this injury-on-duty report. Keep your reference number and any J88 or IOD documents you uploaded.'
  }

  return 'The appropriate support team will receive your request and provide an acknowledgement and next steps.'
}

function RequestReceivedPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const request = id ? getSupportRequestById(id) : undefined
  const reference = request?.reference ?? params.get('ref') ?? ''
  const type = request?.type ?? params.get('type')

  return (
    <div className="request-page">
      <div className="request-success">
        <div className="success-icon">
          <CheckCircle2 size={38} />
        </div>
        <div className="request-eyebrow">REQUEST SUBMITTED</div>
        <h1>{requestHeading(type)}</h1>
        <p>
          Thank you for reaching out. Your demonstration request has been
          recorded successfully.
        </p>

        {reference && (
          <div className="reference-card">
            <span>YOUR REFERENCE NUMBER</span>
            <strong>{reference}</strong>
            <small>Keep this number for future reference.</small>
          </div>
        )}

        <div className="success-next-step">
          <Clock size={19} />
          <div>
            <strong>What happens next?</strong>
            <p>{nextStepCopy(type)}</p>
          </div>
        </div>

        <ShareRequestButton reference={reference || 'PURPLE request'} />

        <div className="prototype-notice">
          <strong>Demonstration environment:</strong> This request exists only
          in temporary application memory. Share the confirmation if you want
          a copy of the reference. No support team has been notified.
        </div>

        {request ? (
          <Link to={`/my-support/${request.id}`} className="request-primary-link">
            Continue to my support <ArrowRight size={16} />
          </Link>
        ) : (
          <Link to="/my-support" className="request-primary-link">
            Continue to my support <ArrowRight size={16} />
          </Link>
        )}
        <Link to="/" className="request-secondary-link">
          Return to home
        </Link>
      </div>
    </div>
  )
}

export default RequestReceivedPage
