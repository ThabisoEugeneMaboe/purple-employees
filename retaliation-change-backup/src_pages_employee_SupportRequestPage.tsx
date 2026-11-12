
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { submitSupportRequest } from '../../data/supportRequests'
import type {
  SupportChannel,
  SupportRequestDraft,
  SupportRequestType,
} from '../../types/support'

const pathwayDetails: Record<
  SupportRequestType,
  { title: string; description: string; icon: typeof Heart }
> = {
  emotional: {
    title: 'Someone to talk to',
    description: 'Request a conversation, guidance or emotional support.',
    icon: MessageCircle,
  },
  workplace: {
    title: 'Workplace support',
    description: 'Talk about a workplace situation causing distress or concern.',
    icon: UserRound,
  },
  independent: {
    title: 'Independent support',
    description: 'Request assistance outside your workplace reporting structure.',
    icon: ShieldCheck,
  },
}

const channels: SupportChannel[] = [
  'Phone call',
  'Email',
  'In-person conversation',
  'Secure message',
]

const languages = [
  'English',
  'isiZulu',
  'isiXhosa',
  'Sesotho',
  'Setswana',
  'Sepedi',
  'Afrikaans',
  'Other / Please discuss with me',
]

const contactTimes = [
  'Morning (08:00–12:00)',
  'Afternoon (12:00–17:00)',
  'Evening (after 17:00)',
  'Please arrange a suitable time with me',
]

const initialDraft: SupportRequestDraft = {
  type: 'emotional',
  description: '',
  preferredChannel: 'Phone call',
  preferredLanguage: 'English',
  preferredContactTime: contactTimes[0],
  safeToContact: true,
  safeContactInstructions: '',
  consentConfirmed: false,
}

function getPathwayType(value: string | undefined): SupportRequestType | null {
  if (value === 'talk') return 'emotional'
  if (value === 'workplace') return 'workplace'
  if (value === 'independent') return 'independent'
  return null
}

function SupportRequestPage() {
  const { type: routeType } = useParams()
  const requestType = getPathwayType(routeType)

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<SupportRequestDraft>({
    ...initialDraft,
    type: requestType ?? 'emotional',
  })
  const [error, setError] = useState('')
  const [submittedReference, setSubmittedReference] = useState('')

  if (!requestType) {
    return (
      <div className="request-page">
        <div className="request-error">
          <h2>Support pathway not found</h2>
          <p>Please return to your home workspace and choose a support option.</p>
          <Link to="/" className="request-primary-link">Return home</Link>
        </div>
      </div>
    )
  }

  const pathway = pathwayDetails[requestType]
  const PathwayIcon = pathway.icon

  function updateDraft<K extends keyof SupportRequestDraft>(
    field: K,
    value: SupportRequestDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function continueStep() {
    if (step === 1 && !draft.preferredLanguage) {
      setError('Please select your preferred language.')
      return
    }

    if (step === 2 && draft.description.trim().length < 10) {
      setError('Please provide a little more information (at least 10 characters).')
      return
    }

    setError('')
    setStep((current) => Math.min(current + 1, 3))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.consentConfirmed) {
      setError('Please confirm that you have reviewed the information above.')
      return
    }

    const request = submitSupportRequest(draft)
    setSubmittedReference(request.reference)
    setStep(4)
    setError('')
  }

  if (step === 4) {
    return (
      <div className="request-page">
        <div className="request-success">
          <div className="success-icon">
            <CheckCircle2 size={38} />
          </div>
          <div className="request-eyebrow">REQUEST SUBMITTED</div>
          <h1>Your request has been received.</h1>
          <p>
            Thank you for reaching out. Your demonstration request has been
            recorded successfully.
          </p>

          <div className="reference-card">
            <span>YOUR REFERENCE NUMBER</span>
            <strong>{submittedReference}</strong>
            <small>Keep this number for future reference.</small>
          </div>

          <div className="success-next-step">
            <Clock size={19} />
            <div>
              <strong>What happens next?</strong>
              <p>
                In the completed platform, the appropriate support team will
                receive your request and provide an acknowledgement and next steps.
              </p>
            </div>
          </div>

          <div className="prototype-notice">
            <strong>Demonstration environment:</strong> This request exists only
            in temporary application memory. No support team has been notified.
          </div>

          <Link to="/my-support" className="request-primary-link">
            Continue to my support <ArrowRight size={16} />
          </Link>
          <Link to="/" className="request-secondary-link">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="request-page">
      <Link to="/" className="request-back-link">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="request-heading">
        <div className="request-eyebrow">EMPLOYEE SUPPORT</div>
        <h1>Let's find the right support for you.</h1>
        <p>
          Share only what you feel comfortable sharing. You can review your
          choices before submitting your request.
        </p>
      </div>

      <div className="request-pathway">
        <div className="request-pathway-icon">
          <PathwayIcon size={22} />
        </div>
        <div>
          <span>YOUR SELECTED SUPPORT PATHWAY</span>
          <strong>{pathway.title}</strong>
          <p>{pathway.description}</p>
        </div>
      </div>

      <div className="request-progress">
        <div className="progress-label">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% complete</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
        <div className="progress-steps">
          <span className={step >= 1 ? 'current' : ''}>Contact preferences</span>
          <span className={step >= 2 ? 'current' : ''}>What you'd like help with</span>
          <span className={step >= 3 ? 'current' : ''}>Review and consent</span>
        </div>
      </div>

      <form className="request-form panel" onSubmit={handleSubmit}>
        {step === 1 && (
          <section className="form-step">
            <div className="form-step-heading">
              <h2>How would you prefer us to contact you?</h2>
              <p>These preferences help guide how a support person may reach you.</p>
            </div>

            <label className="field-label" htmlFor="channel">
              Preferred contact method
            </label>
            <select
              id="channel"
              value={draft.preferredChannel}
              onChange={(event) => updateDraft(
                'preferredChannel',
                event.target.value as SupportChannel,
              )}
            >
              {channels.map((channel) => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="language">
              Preferred language
            </label>
            <select
              id="language"
              value={draft.preferredLanguage}
              onChange={(event) => updateDraft('preferredLanguage', event.target.value)}
            >
              {languages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="contact-time">
              Suitable time to contact you
            </label>
            <select
              id="contact-time"
              value={draft.preferredContactTime}
              onChange={(event) => updateDraft('preferredContactTime', event.target.value)}
            >
              {contactTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>

            <div className="safe-contact-box">
              <div className="safe-contact-heading">
                <LockKeyhole size={18} />
                <strong>Is it safe to contact you?</strong>
              </div>
              <p>
                Consider whether a phone call, message or other contact could
                put your privacy or safety at risk.
              </p>

              <label className="radio-option">
                <input
                  type="radio"
                  name="safe-contact"
                  checked={draft.safeToContact}
                  onChange={() => updateDraft('safeToContact', true)}
                />
                Yes, it is safe to contact me using my selected method.
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="safe-contact"
                  checked={!draft.safeToContact}
                  onChange={() => updateDraft('safeToContact', false)}
                />
                No, please do not contact me until a safe arrangement is agreed.
              </label>

              {!draft.safeToContact && (
                <div className="conditional-field">
                  <label className="field-label" htmlFor="safe-instructions">
                    Is there anything we should know about contacting you?
                  </label>
                  <textarea
                    id="safe-instructions"
                    rows={3}
                    value={draft.safeContactInstructions}
                    onChange={(event) => updateDraft(
                      'safeContactInstructions',
                      event.target.value,
                    )}
                    placeholder="For example, please do not leave messages or contact me at work."
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="form-step">
            <div className="form-step-heading">
              <h2>What would you like help with?</h2>
              <p>
                Tell us a little about what you're experiencing or what kind
                of support you're looking for.
              </p>
            </div>

            <label className="field-label" htmlFor="description">
              Your message
            </label>
            <textarea
              id="description"
              className="request-description"
              rows={7}
              maxLength={3000}
              value={draft.description}
              onChange={(event) => updateDraft('description', event.target.value)}
              placeholder="You can share as much or as little as you feel comfortable sharing..."
              required
            />
            <div className="character-count">
              {draft.description.length} / 3,000 characters
            </div>

            <div className="reassurance-note">
              <Heart size={18} />
              <p>
                You do not need to have everything figured out before asking
                for support. Requesting a conversation does not automatically
                mean that you are submitting a formal complaint.
              </p>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="form-step">
            <div className="form-step-heading">
              <h2>Review before submitting</h2>
              <p>
                Please review the information below and understand how your
                request is intended to be handled.
              </p>
            </div>

            <div className="review-section">
              <h3><MessageCircle size={17} /> Your request</h3>
              <div className="review-row">
                <span>Support pathway</span>
                <strong>{pathway.title}</strong>
              </div>
              <div className="review-row">
                <span>Contact method</span>
                <strong>{draft.preferredChannel}</strong>
              </div>
              <div className="review-row">
                <span>Preferred language</span>
                <strong>{draft.preferredLanguage}</strong>
              </div>
              <div className="review-row">
                <span>Contact time</span>
                <strong>{draft.preferredContactTime}</strong>
              </div>
              <div className="review-row">
                <span>Safe to contact</span>
                <strong>{draft.safeToContact ? 'Yes' : 'No — arrange a safe method first'}</strong>
              </div>
              <div className="review-message">
                <span>Your message</span>
                <p>{draft.description}</p>
              </div>
            </div>

            <div className="confidentiality-section">
              <h3><ShieldCheck size={18} /> Confidentiality and information sharing</h3>
              <p>
                Your request is intended for the authorised support person or
                provider responsible for the pathway you selected. It should
                not automatically be made available to your line manager or
                to a person named in your concern.
              </p>
              <p>
                Information may need to be shared with an appropriate person
                where there is a serious safety concern, a legal obligation,
                or another applicable safeguarding requirement. Where possible
                and appropriate, the reasons and next steps should be explained
                to you.
              </p>
              <p>
                If a person assigned to your request has a conflict of interest,
                the request should be redirected to an appropriate alternative
                support person.
              </p>
              <p>
                These are the intended handling principles for the platform.
                Actual confidentiality, access and escalation arrangements
                depend on the organisation's approved policies and appointed
                support providers.
              </p>
            </div>

            <label className="consent-option">
              <input
                type="checkbox"
                checked={draft.consentConfirmed}
                onChange={(event) => updateDraft('consentConfirmed', event.target.checked)}
              />
              <span>
                I have reviewed the information above and understand the
                intended handling of my support request.
              </span>
            </label>
          </section>
        )}

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-actions">
          {step > 1 && (
            <button
              type="button"
              className="request-secondary-button"
              onClick={() => {
                setError('')
                setStep((current) => current - 1)
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              className="request-primary-button"
              onClick={continueStep}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="request-primary-button"
            >
              <Check size={17} /> Submit support request
            </button>
          )}
        </div>
      </form>

      <div className="request-demo-note">
        <LockKeyhole size={15} />
        <span>Prototype demonstration — do not enter real or sensitive personal information.</span>
      </div>
    </div>
  )
}

export default SupportRequestPage
