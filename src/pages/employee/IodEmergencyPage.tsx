import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  LockKeyhole,
  ShieldAlert,
  Siren,
  X,
} from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { submitSupportRequest } from '../../data/supportRequests'
import type {
  IodDocumentKind,
  SupportChannel,
  SupportRequestAttachment,
  SupportRequestDraft,
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
  'Morning (08:00–12:00)',
  'Afternoon (12:00–17:00)',
  'Evening (after 17:00)',
  'Please arrange a suitable time with me',
]

const documentOptions: { value: IodDocumentKind; label: string; hint: string }[] =
  [
    {
      value: 'j88',
      label: 'J88 medical report',
      hint: 'Completed by a doctor after an assault or injury that may need a case.',
    },
    {
      value: 'iod-claim',
      label: 'IOD / Compensation Fund form',
      hint: 'Workplace injury or occupational disease claim documents.',
    },
    {
      value: 'medical-certificate',
      label: 'Medical certificate or sick note',
      hint: 'Proof of treatment or time off after the incident.',
    },
    {
      value: 'incident-report',
      label: 'Workplace incident report',
      hint: 'Any form already completed with a supervisor or safety officer.',
    },
    {
      value: 'other',
      label: 'Other supporting document',
      hint: 'Photos of the scene, witness notes, or related paperwork.',
    },
  ]

const MAX_FILES = 5
const MAX_FILE_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const initialDraft: SupportRequestDraft = {
  type: 'iod',
  description: '',
  preferredChannel: 'Phone call',
  preferredLanguage: 'English',
  preferredContactTime: contactTimes[0],
  safeToContact: true,
  safeContactInstructions: '',
  consentConfirmed: false,
  iodIncidentDate: '',
  iodIncidentTime: '',
  iodLocation: '',
  iodMedicalAttended: false,
  iodStillAtWork: true,
  iodDocumentKinds: [],
  attachments: [],
}

function readFile(file: File): Promise<SupportRequestAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        kind: 'other',
        dataUrl: String(reader.result),
      })
    }
    reader.onerror = () => reject(new Error('The file could not be read.'))
    reader.readAsDataURL(file)
  })
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function IodEmergencyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<SupportRequestDraft>(initialDraft)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  function updateDraft<K extends keyof SupportRequestDraft>(
    field: K,
    value: SupportRequestDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function toggleDocumentKind(kind: IodDocumentKind) {
    const current = draft.iodDocumentKinds ?? []
    const next = current.includes(kind)
      ? current.filter((item) => item !== kind)
      : [...current, kind]
    updateDraft('iodDocumentKinds', next)
  }

  function continueStep() {
    if (step === 1) {
      if (!draft.iodIncidentDate || !draft.iodLocation?.trim()) {
        setError('Please add the incident date and where it happened.')
        return
      }
    }

    if (step === 2 && draft.description.trim().length < 10) {
      setError(
        'Please describe what happened, even briefly (at least 10 characters).',
      )
      return
    }

    setError('')
    setStep((current) => Math.min(current + 1, 4))
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (files.length === 0) {
      return
    }

    const existing = draft.attachments ?? []
    if (existing.length + files.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} documents.`)
      return
    }

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} is larger than 4 MB.`)
        return
      }

      if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        setError('Please upload PDF, Word, JPG or PNG files.')
        return
      }
    }

    setUploading(true)
    setError('')

    try {
      const uploaded = await Promise.all(files.map(readFile))
      updateDraft('attachments', [...existing, ...uploaded])
    } catch {
      setError('One of the files could not be added. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function removeAttachment(id: string) {
    updateDraft(
      'attachments',
      (draft.attachments ?? []).filter((item) => item.id !== id),
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.consentConfirmed) {
      setError('Please confirm that you have reviewed the information above.')
      return
    }

    const request = submitSupportRequest(draft)
    navigate(
      `/received/${request.id}?ref=${encodeURIComponent(request.reference)}&type=iod`,
      { replace: true },
    )
  }

  return (
    <div className="request-page">
      <Link to="/" className="request-back-link">
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="request-heading">
        <div className="request-eyebrow">WORKPLACE SOS</div>
        <h1>Injury on duty and J88 support.</h1>
        <p>
          Use this if you were hurt at work, need an IOD claim started, or have
          a J88 or other medical form to upload. If anyone is in immediate
          danger, get emergency help first.
        </p>
      </div>

      <div className="iod-emergency-banner">
        <Siren size={20} />
        <div>
          <strong>If this is happening now</strong>
          <p>
            Call 112 or 10177 for an ambulance, or go to your nearest first
            aider / clinic. Complete this form once you are safe.
          </p>
        </div>
      </div>

      <div className="progress-steps">
        {['Incident', 'What happened', 'Documents', 'Review'].map(
          (label, index) => (
            <span
              key={label}
              className={step === index + 1 ? 'active' : ''}
            >
              {index + 1}. {label}
            </span>
          ),
        )}
      </div>

      <form className="request-form" onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div className="request-pathway">
              <ShieldAlert size={22} />
              <div>
                <strong>Workplace injury or emergency paperwork</strong>
                <p>
                  This route is for injury on duty, occupational incidents, and
                  J88 / Compensation Fund documents — not for general wellbeing
                  chat.
                </p>
              </div>
            </div>

            <label className="field-label" htmlFor="iod-date">
              Date of the incident
            </label>
            <input
              id="iod-date"
              type="date"
              value={draft.iodIncidentDate}
              onChange={(event) =>
                updateDraft('iodIncidentDate', event.target.value)
              }
              required
            />

            <label className="field-label" htmlFor="iod-time">
              Approximate time (optional)
            </label>
            <input
              id="iod-time"
              type="time"
              value={draft.iodIncidentTime}
              onChange={(event) =>
                updateDraft('iodIncidentTime', event.target.value)
              }
            />

            <label className="field-label" htmlFor="iod-location">
              Where did it happen?
            </label>
            <input
              id="iod-location"
              type="text"
              value={draft.iodLocation}
              onChange={(event) =>
                updateDraft('iodLocation', event.target.value)
              }
              placeholder="e.g. Warehouse floor, client site, parking area"
            />

            <fieldset className="iod-choice-set">
              <legend>Are you still at the workplace?</legend>
              <label>
                <input
                  type="radio"
                  name="still-at-work"
                  checked={draft.iodStillAtWork === true}
                  onChange={() => updateDraft('iodStillAtWork', true)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="still-at-work"
                  checked={draft.iodStillAtWork === false}
                  onChange={() => updateDraft('iodStillAtWork', false)}
                />
                No, I have left the site
              </label>
            </fieldset>

            <fieldset className="iod-choice-set">
              <legend>Have you already seen a nurse or doctor?</legend>
              <label>
                <input
                  type="radio"
                  name="medical"
                  checked={draft.iodMedicalAttended === true}
                  onChange={() => updateDraft('iodMedicalAttended', true)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="medical"
                  checked={draft.iodMedicalAttended === false}
                  onChange={() => updateDraft('iodMedicalAttended', false)}
                />
                Not yet
              </label>
            </fieldset>
          </>
        )}

        {step === 2 && (
          <>
            <label className="field-label" htmlFor="iod-description">
              What happened?
            </label>
            <textarea
              id="iod-description"
              rows={7}
              value={draft.description}
              onChange={(event) =>
                updateDraft('description', event.target.value)
              }
              placeholder="Describe the injury or incident in your own words. You do not need to name anyone if you are not ready."
            />

            <h3 className="iod-docs-heading">Which documents do you have?</h3>
            <p className="independent-category-note">
              Select every form that applies. You can upload files on the next
              step, even if a form is not complete yet.
            </p>
            <div className="independent-category-options">
              {documentOptions.map((option) => (
                <label
                  className="independent-category-option"
                  key={option.value}
                >
                  <input
                    type="checkbox"
                    checked={(draft.iodDocumentKinds ?? []).includes(
                      option.value,
                    )}
                    onChange={() => toggleDocumentKind(option.value)}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.hint}</small>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="request-pathway">
              <FileUp size={22} />
              <div>
                <strong>Upload IOD, J88 or supporting files</strong>
                <p>
                  PDF, Word, JPG or PNG. Up to 5 files, 4 MB each. Files stay in
                  this demonstration session only.
                </p>
              </div>
            </div>

            <label className="iod-upload-drop" htmlFor="iod-files">
              <FileUp size={22} />
              <span>
                {uploading ? 'Adding files…' : 'Choose files to upload'}
              </span>
            </label>
            <input
              id="iod-files"
              className="iod-file-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
              onChange={handleFiles}
            />

            {(draft.attachments ?? []).length > 0 && (
              <ul className="iod-file-list">
                {(draft.attachments ?? []).map((file) => (
                  <li key={file.id}>
                    <div>
                      <strong>{file.name}</strong>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      className="iod-file-remove"
                      onClick={() => removeAttachment(file.id)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <label className="field-label" htmlFor="preferred-channel">
              Preferred contact method
            </label>
            <select
              id="preferred-channel"
              value={draft.preferredChannel}
              onChange={(event) =>
                updateDraft(
                  'preferredChannel',
                  event.target.value as SupportChannel,
                )
              }
            >
              {channels.map((channel) => (
                <option key={channel}>{channel}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="preferred-language">
              Preferred language
            </label>
            <select
              id="preferred-language"
              value={draft.preferredLanguage}
              onChange={(event) =>
                updateDraft('preferredLanguage', event.target.value)
              }
            >
              {languages.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>

            <label className="field-label" htmlFor="preferred-time">
              Suitable time to contact you
            </label>
            <select
              id="preferred-time"
              value={draft.preferredContactTime}
              onChange={(event) =>
                updateDraft('preferredContactTime', event.target.value)
              }
            >
              {contactTimes.map((time) => (
                <option key={time}>{time}</option>
              ))}
            </select>
          </>
        )}

        {step === 4 && (
          <>
            <h3>Review before submitting</h3>
            <div className="request-review-list">
              <p>
                <strong>Incident date:</strong> {draft.iodIncidentDate}
                {draft.iodIncidentTime ? ` · ${draft.iodIncidentTime}` : ''}
              </p>
              <p>
                <strong>Location:</strong> {draft.iodLocation}
              </p>
              <p>
                <strong>Medical care:</strong>{' '}
                {draft.iodMedicalAttended ? 'Already attended' : 'Not yet'}
              </p>
              <p>
                <strong>Documents selected:</strong>{' '}
                {(draft.iodDocumentKinds ?? []).length === 0
                  ? 'None selected yet'
                  : (draft.iodDocumentKinds ?? [])
                      .map(
                        (kind) =>
                          documentOptions.find((option) => option.value === kind)
                            ?.label,
                      )
                      .join(', ')}
              </p>
              <p>
                <strong>Files uploaded:</strong>{' '}
                {(draft.attachments ?? []).length === 0
                  ? 'None'
                  : (draft.attachments ?? [])
                      .map((file) => file.name)
                      .join(', ')}
              </p>
              <p>
                <strong>What happened:</strong> {draft.description}
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
                I confirm this is an accurate account of a workplace incident
                and I understand it will be routed to Internal Support for
                IOD / J88 follow-up.
              </span>
            </label>
          </>
        )}

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-actions">
          {step > 1 && (
            <button
              type="button"
              className="request-secondary-button"
              onClick={() => setStep((current) => current - 1)}
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              className="request-primary-button"
              onClick={continueStep}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" className="request-primary-button">
              <Check size={16} /> Submit IOD / J88 report
            </button>
          )}
        </div>

        <p className="request-demo-note">
          <LockKeyhole size={13} />
          This demonstration stores your report and uploads in this browser
          session only.
        </p>
      </form>
    </div>
  )
}

export default IodEmergencyPage
