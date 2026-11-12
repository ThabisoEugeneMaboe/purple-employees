export type SupportRequestType =
  | 'emotional'
  | 'workplace'
  | 'independent'
  | 'retaliation'

export type RetaliationRoutePreference =
  | 'internal'
  | 'independent'
  | 'unsure'

export type SupportChannel =
  | 'Phone call'
  | 'Email'
  | 'In-person conversation'
  | 'Secure message'

export type SupportRequestStatus =
  | 'Submitted'
  | 'Acknowledged'
  | 'In progress'
  | 'Resolved'

export interface SupportRequest {
  id: string
  reference: string
  type: SupportRequestType
  retaliationRoutePreference?: RetaliationRoutePreference
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

export interface SupportRequestDraft {
  type: SupportRequestType
  retaliationRoutePreference?: RetaliationRoutePreference
  description: string
  preferredChannel: SupportChannel
  preferredLanguage: string
  preferredContactTime: string
  safeToContact: boolean
  safeContactInstructions: string
  consentConfirmed: boolean
}

export type FollowUpType =
  | 'Acknowledgement'
  | 'Contact attempt'
  | 'Progress update'
  | 'Scheduled conversation'
  | 'Next step'
  | 'Resolution'

export type FollowUpStatus = 'Update' | 'Scheduled' | 'Completed'

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