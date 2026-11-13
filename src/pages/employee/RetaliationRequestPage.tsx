import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  createRetaliationSupportRequest,
  getSupportRequestById,
} from '../../data/supportRequests'
import type {
  RetaliationSupportRequestDraft,
  SupportRequest,
  SupportChannel,
} from '../../types/support'

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
  'Morning (08:00-12:00)',
  'Afternoon (12:00-17:00)',
  'Evening (after 17:00)',
  'Please arrange a suitable time with me',
]

const initialDraft: RetaliationSupportRequestDraft = {
  description: '',
  preferredChannel: 'Phone call',
  preferredLanguage: 'English',
  preferredContactTime: contactTimes[0],
  safeToContact: true,
  safeContactInstructions: '',
  consentConfirmed: false,
  retaliationRoutePreference: 'unsure',
}

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

function RetaliationRequestPage() {
  const { id } = useParams()
  const originalRequest = id ? getSupportRequestById(id) : undefined

  const [step, setStep] = useState(1)
  const [draft, setDraft] =
    useState<RetaliationSupportRequestDraft>(initialDraft)
  const [error, setError] = useState('')
  const [submittedRequest, setSubmittedRequest] =
    useState<ReturnType<typeof createRetaliationSupportRequest>>()

  if (!originalRequest || originalRequest.type === 'retaliation') {
    return (
      <div className="request-page">
        <div className="request-error">
          <h2>Original support request unavailable</h2>
          <p>
            Retaliation support must be linked to an existing non-retaliation
            support request in your current demonstration session.
          </p>
          <Link to="/my-support" className="request-primary-link">
            <ArrowLeft size={16} /> Return to My Support
          </Link>
        </div>
      </div>
    )
  }

  const originalRequestId = originalRequest.id

  function updateDraft<K extends keyof RetaliationSupportRequestDraft>(
    field: K,
    value: RetaliationSupportRequestDraft[K],
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
      setError(
        'Please provide a little more information (at least 10 characters).',
      )
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

    try {
      const request = createRetaliationSupportRequest({
        originalRequestId,
        draft,
      })

      setSubmittedRequest(request)
      setError('')
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Your retaliation request could not be submitted.',
      )
    }
  }

  if (submittedRequest) {
    return (
      <div className="request-page">
        <div className="request-success">
          <div className="success-icon">
            <CheckCircle2 size={38} />
          </div>
          <div className="request-eyebrow">RETALIATION REPORT RECORDED</div>
          <h1>Your retaliation support request has been recorded.</h1>
          <p>
            This is a separate support record linked to your original case.
            Your original request and its status have not been changed.
          </p>

          <div className="reference-card">
            <span>RETALIATION REFERENCE NUMBER</span>
            <strong>{submittedRequest.reference}</strong>
            <small>Keep this number for future reference.</small>
          </div>

          <div className="success-next-step">
            <ShieldCheck size={19} />
            <div>
              <strong>Your handling preference</strong>
              <p>
                {submittedRequest.retaliationRoutePreference === 'internal'
                  ? 'You indicated a preference for internal support. An appropriate conflict-free handling arrangement would need to be established.'
                  : submittedRequest.retaliationRoutePreference === 'independent'
                    ? 'You indicated a preference for independent support. An external provider has not yet been appointed in this demonstration.'
                    : 'You asked for help deciding the safest handling route. The appropriate route would need to be discussed and agreed.'}
              </p>
            </div>
          </div>

          <div className="prototype-notice">
            <strong>Demonstration environment:</strong> This request exists
            only in temporary application memory. No support team or external
            provider has been notified. The prototype cannot enforce access
            restrictions or guarantee protection from retaliation.
          </div>

          <Link
            to={`/my-support/${submittedRequest.id}`}
            className="request-primary-link"
          >
            View retaliation request <ArrowRight size={16} />
          </Link>
          <Link
            to={`/my-support/${originalRequest.id}`}
            className="request-secondary-link"
          >
            Return to original request
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="request-page">
      <Link
        to={`/my-support/${originalRequest.id}`}
        className="request-back-link"
      >
        <ArrowLeft size={16} /> Back to original request
      </Link>

      <div className="request-heading">
        <div className="request-eyebrow">LINKED RETALIATION SUPPORT</div>
        <h1>You deserve support when speaking up leads to harm.</h1>
        <p>
          Tell us what has happened since or in connection with your original
          support request. Share only what you feel comfortable sharing.
        </p>
      </div>

      <div className="request-pathway">
        <div className="request-pathway-icon">
          <ShieldCheck size={22} />
        </div>
        <div>
          <span>THIS REPORT RELATES TO</span>
          <strong>{originalRequest.reference}</strong>
          <p>{getRequestLabel(originalRequest.type)}</p>
        </div>
      </div>

      <div className="request-progress">
        <div className="progress-label">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% complete</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <div className="progress-steps">
          <span className={step >= 1 ? 'current' : ''}>Contact and safety</span>
          <span className={step >= 2 ? 'current' : ''}>What happened</span>
          <span className={step >= 3 ? 'current' : ''}>Review and consent</span>
        </div>
      </div>

      <form className="request-form panel" onSubmit={handleSubmit}>
        {step === 1 && (
          <section className="form-step">
            <div className="form-step-heading">
              <h2>How can we contact you safely?</h2>
              <p>
                Your preferences help guide how a support person may reach you.
              </p>
            </div>

            <label className="field-label" htmlFor="retaliation-channel">
              Preferred contact method
            </label>
            <select
              id="retaliation-channel"
              value={draft.preferredChannel}
              onChange={(event) =>
                updateDraft(
                  'preferredChannel',
                  event.target.value as SupportChannel,
                )
              }
            >
              {channels.map((channel) => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="retaliation-language">
              Preferred language
            </label>
            <select
              id="retaliation-language"
              value={draft.preferredLanguage}
              onChange={(event) =>
                updateDraft('preferredLanguage', event.target.value)
              }
            >
              {languages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="retaliation-time">
              Suitable time to contact you
            </label>
            <select
              id="retaliation-time"
              value={draft.preferredContactTime}
              onChange={(event) =>
                updateDraft('preferredContactTime', event.target.value)
              }
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
                Consider whether a call, message or other contact could put
                your privacy or safety at risk.
              </p>

              <label className="radio-option">
                <input
                  type="radio"
                  name="retaliation-safe-contact"
                  checked={draft.safeToContact}
                  onChange={() => updateDraft('safeToContact', true)}
                />
                Yes, it is safe to contact me using my selected method.
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="retaliation-safe-contact"
                  checked={!draft.safeToContact}
                  onChange={() => updateDraft('safeToContact', false)}
                />
                No, please agree on a safe arrangement before contacting me.
              </label>

              {!draft.safeToContact && (
                <div className="conditional-field">
                  <label
                    className="field-label"
                    htmlFor="retaliation-safe-instructions"
                  >
                    Is there anything we should know?
                  </label>
                  <textarea
                    id="retaliation-safe-instructions"
                    rows={3}
                    value={draft.safeContactInstructions}
                    onChange={(event) =>
                      updateDraft('safeContactInstructions', event.target.value)
                    }
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
              <h2>What has happened?</h2>
              <p>
                You can describe what happened, when it happened, and how it
                relates to raising a concern or seeking support. You do not
                need to provide every detail.
              </p>
            </div>

            <label className="field-label" htmlFor="retaliation-description">
              Describe what you are experiencing
            </label>
            <textarea
              id="retaliation-description"
              className="request-description"
              rows={7}
              maxLength={3000}
              value={draft.description}
              onChange={(event) =>
                updateDraft('description', event.target.value)
              }
              placeholder="Share only what you feel comfortable sharing..."
              required
            />
            <div className="character-count">
              {draft.description.length} / 3,000 characters
            </div>

            <div className="reassurance-note">
              <MessageCircle size={18} />
              <p>
                Reporting retaliation here creates a linked support request.
                It does not automatically submit a formal complaint or change
                the status of your original request.
              </p>
            </div>

            <div className="form-step-heading" style={{ marginTop: 26 }}>
              <h2>Which handling route feels safest?</h2>
              <p>
                This is your preference, not a guarantee that a particular
                provider or arrangement is already available.
              </p>
            </div>

            <label className="radio-option">
              <input
                type="radio"
                name="retaliation-route"
                checked={draft.retaliationRoutePreference === 'internal'}
                onChange={() =>
                  updateDraft('retaliationRoutePreference', 'internal')
                }
              />
              Internal support, provided a conflict-free arrangement can be made.
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="retaliation-route"
                checked={draft.retaliationRoutePreference === 'independent'}
                onChange={() =>
                  updateDraft('retaliationRoutePreference', 'independent')
                }
              />
              Independent support outside my workplace reporting structure.
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="retaliation-route"
                checked={draft.retaliationRoutePreference === 'unsure'}
                onChange={() =>
                  updateDraft('retaliationRoutePreference', 'unsure')
                }
              />
              I am unsure. I would like help considering the safest route.
            </label>
          </section>
        )}

        {step === 3 && (
          <section className="form-step">
            <div className="form-step-heading">
              <h2>Review before submitting</h2>
              <p>
                Check your information and understand the intended handling
                of this linked request.
              </p>
            </div>

            <div className="review-section">
              <h3><MessageCircle size={17} /> Linked support requests</h3>
              <div className="review-row">
                <span>Original reference</span>
                <strong>{originalRequest.reference}</strong>
              </div>
              <div className="review-row">
                <span>Original pathway</span>
                <strong>{getRequestLabel(originalRequest.type)}</strong>
              </div>
              <div className="review-row">
                <span>Retaliation handling preference</span>
                <strong>
                  {draft.retaliationRoutePreference === 'internal'
                    ? 'Internal support'
                    : draft.retaliationRoutePreference === 'independent'
                      ? 'Independent support'
                      : 'Help choosing a route'}
                </strong>
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
                <strong>{draft.safeToContact ? 'Yes' : 'No - agree a safe method first'}</strong>
              </div>
              <div className="review-message">
                <span>Your description</span>
                <p>{draft.description}</p>
              </div>
            </div>

            <div className="reassurance-note">
              <ShieldCheck size={18} />
              <p>
                <strong>Conflict safeguard:</strong> A person implicated in
                the alleged retaliation should not receive, access or control
                this request. An appropriate conflict-free handling
                arrangement must be established. This prototype cannot enforce
                access restrictions or guarantee protection.
              </p>
            </div>

            <div className="confidentiality-section">
              <h3><ShieldCheck size={18} /> Confidentiality and information sharing</h3>
              <p>
                Your retaliation report is a separate record linked to your
                original support request. The original request is not changed
                by submitting this report.
              </p>
              <p>
                The intended handling is that only an authorised, appropriate
                support person or appointed provider should receive the
                information. A person implicated in the concern should not
                receive or control it.
              </p>
              <p>
                Information may need to be shared where there is a serious
                safety concern, a legal obligation or another applicable
                safeguarding requirement. Where possible and appropriate,
                the reasons and next steps should be explained to you.
              </p>
              <p>
                Independent support is not yet operational in this
                demonstration because an external provider has not been
                appointed. Actual confidentiality and escalation arrangements
                depend on approved policies and appointed providers.
              </p>
            </div>

            <label className="consent-option">
              <input
                type="checkbox"
                checked={draft.consentConfirmed}
                onChange={(event) =>
                  updateDraft('consentConfirmed', event.target.checked)
                }
              />
              <span>
                I have reviewed the information above and understand the
                intended handling of this linked retaliation support request.
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
            <button type="submit" className="request-primary-button">
              <Check size={17} /> Submit retaliation request
            </button>
          )}
        </div>
      </form>

      <div className="request-demo-note">
        <LockKeyhole size={15} />
        <span>
          Prototype demonstration - do not enter real or sensitive personal information.
        </span>
      </div>
    </div>
  )
}

export default RetaliationRequestPage
