// Identifies the main support pathway selected for a request.
export type SupportRequestType =
  | 'emotional'
  | 'workplace'
  | 'independent'
  | 'retaliation'
  | 'iod'

export type IodDocumentKind =
  | 'j88'
  | 'iod-claim'
  | 'medical-certificate'
  | 'incident-report'
  | 'other'

export interface SupportRequestAttachment {
  id: string
  name: string
  size: number
  mimeType: string
  kind: IodDocumentKind
  dataUrl: string
}

// Categories used to describe the type of independent support being requested.
export type IndependentSupportCategory =
  | 'wellbeing'
  | 'workplace-concerns'
  | 'harassment-discrimination'
  | 'retaliation'
  | 'guidance'
  | 'other'
// Records the employee's preferred route for handling a retaliation-related request.
export type RetaliationRoutePreference =
  | 'internal'
  | 'independent'
  | 'unsure'

// Communication methods an employee may choose for support contact.
export type SupportChannel =
  | 'Phone call'
  | 'Email'
  | 'In-person conversation'
  | 'Secure message'

// Lifecycle statuses used to track a support request.
export type SupportRequestStatus =
  | 'Submitted'
  | 'Acknowledged'
  | 'In progress'
  | 'Resolved'

// Complete support request record, including generated identifiers and submission details.
export interface SupportRequest {
  id: string
  reference: string
  type: SupportRequestType
  originalRequestId?: string
  retaliationRoutePreference?: RetaliationRoutePreference
  independentSupportCategories?: IndependentSupportCategory[]
  independentSupportDetails?: string
  iodIncidentDate?: string
  iodIncidentTime?: string
  iodLocation?: string
  iodMedicalAttended?: boolean
  iodStillAtWork?: boolean
  iodDocumentKinds?: IodDocumentKind[]
  attachments?: SupportRequestAttachment[]
  description: string
  preferredChannel: SupportChannel
  preferredLanguage: string
  preferredContactTime: string
  safeToContact: boolean
  safeContactInstructions: string
  consentConfirmed: boolean
  status: SupportRequestStatus
  createdAt: string
}

// Information collected before a standard support request is created.
// The request ID, reference, status and creation timestamp are generated separately.
export interface SupportRequestDraft {
  type: SupportRequestType
  retaliationRoutePreference?: RetaliationRoutePreference
  independentSupportCategories?: IndependentSupportCategory[]
  independentSupportDetails?: string
  iodIncidentDate?: string
  iodIncidentTime?: string
  iodLocation?: string
  iodMedicalAttended?: boolean
  iodStillAtWork?: boolean
  iodDocumentKinds?: IodDocumentKind[]
  attachments?: SupportRequestAttachment[]
  description: string
  preferredChannel: SupportChannel
  preferredLanguage: string
  preferredContactTime: string
  safeToContact: boolean
  safeContactInstructions: string
  consentConfirmed: boolean
}
// Specialised request draft that requires an explicit retaliation route preference.
export type RetaliationSupportRequestDraft = Omit<
  SupportRequestDraft,
  'type' | 'retaliationRoutePreference'
> & {
  retaliationRoutePreference: RetaliationRoutePreference
}

// Classifies the kind of update or interaction recorded against a support request.
export type FollowUpType =
  | 'Acknowledgement'
  | 'Contact attempt'
  | 'Progress update'
  | 'Scheduled conversation'
  | 'Next step'
  | 'Resolution'

// Describes the current state of an employee-visible follow-up.
export type FollowUpStatus = 'Update' | 'Scheduled' | 'Completed'

// Employee-visible update or scheduled activity associated with a support request.
export interface SupportFollowUp {
  id: string
  requestId: string
  type: FollowUpType
  status: FollowUpStatus
  title: string
  message: string
  createdAt: string
  scheduledFor?: string
}

export type CaseActivityAudience = 'employee' | 'coordinator'

export interface CaseActivity {
  id: string
  requestId: string
  createdAt: string
  title: string
  message: string
  actor: string
  audience: CaseActivityAudience[]
}
/* Internal support case management */

// States used to track the assignment and handling of an internal support case.
export type AssignmentStatus =
  | 'Unassigned'
  | 'Assigned'
  | 'Accepted'
  | 'Conflict declared'
  | 'Reassignment requested'

// Classifies notes recorded within the internal case-management process.
export type CaseNoteType =
  | 'Internal note'
  | 'Conflict declaration'
  | 'Assignment note'

// Records which responder is assigned to a case and the relevant assignment history details.
export interface CaseAssignment {
  requestId: string
  responderId: string
  responderName: string
  status: AssignmentStatus
  assignedAt: string
  assignedBy: string
  acceptedAt?: string
  conflictReason?: string
  reassignmentReason?: string
}

// Private internal record associated with a support case, separate from employee-visible follow-ups.
export interface InternalCaseNote {
  id: string
  requestId: string
  responderId: string
  responderName: string
  type: CaseNoteType
  content: string
  createdAt: string
}

// Describes a responder or coordinator available to the internal support workspace.
export interface SupportResponder {
  id: string
  displayName: string
  role: 'Responder' | 'Coordinator'
  active: boolean
}


