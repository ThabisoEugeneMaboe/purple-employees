import type {
  SupportRequest,
  SupportRequestDraft,
  RetaliationSupportRequestDraft,
  SupportRequestStatus,
  SupportFollowUp,
  CaseAssignment,
  InternalCaseNote,
  CaseNoteType,
  SupportResponder,
  CaseActivity,
  CaseActivityAudience,
} from '../types/support'

// Support requests and follow-ups are stored in memory and reset when the app reloads.
const requests: SupportRequest[] = []
const followUps: SupportFollowUp[] = []

// Demonstration support team.
// These are prototype identities, not authenticated user accounts.
export const supportResponders: SupportResponder[] = [
  {
    id: 'responder-001',
    displayName: 'Support Responder A',
    role: 'Responder',
    active: true,
  },
  {
    id: 'coordinator-001',
    displayName: 'Support Coordinator',
    role: 'Coordinator',
    active: true,
  },
]

// Assignment history is retained rather than overwritten.
const caseAssignments: CaseAssignment[] = []
const internalCaseNotes: InternalCaseNote[] = []
const caseActivities: CaseActivity[] = []

function recordActivity({
  requestId,
  title,
  message,
  actor,
  audience,
}: {
  requestId: string
  title: string
  message: string
  actor: string
  audience: CaseActivityAudience[]
}): CaseActivity {
  const activity: CaseActivity = {
    id: crypto.randomUUID(),
    requestId,
    createdAt: new Date().toISOString(),
    title,
    message,
    actor,
    audience,
  }

  caseActivities.unshift(activity)
  return activity
}

function addJourneyFollowUp({
  requestId,
  type,
  status,
  title,
  message,
  scheduledFor,
}: {
  requestId: string
  type: SupportFollowUp['type']
  status: SupportFollowUp['status']
  title: string
  message: string
  scheduledFor?: string
}): SupportFollowUp {
  const followUp: SupportFollowUp = {
    id: crypto.randomUUID(),
    requestId,
    type,
    status,
    title,
    message,
    createdAt: new Date().toISOString(),
    scheduledFor,
  }

  followUps.unshift(followUp)
  return followUp
}

export function getCaseActivities(
  audience?: CaseActivityAudience,
): CaseActivity[] {
  return caseActivities.filter((activity) =>
    audience ? activity.audience.includes(audience) : true,
  )
}

export function getCaseActivitiesForRequest(
  requestId: string,
  audience?: CaseActivityAudience,
): CaseActivity[] {
  return getCaseActivities(audience).filter(
    (activity) => activity.requestId === requestId,
  )
}

export function isInternalCase(request: SupportRequest): boolean {
  return isEligibleForInternalHandling(request)
}

export function getEmployeeJourneyLabel(request: SupportRequest): string {
  if (request.status === 'Resolved') {
    return 'Resolved'
  }

  if (!isEligibleForInternalHandling(request)) {
    return request.status
  }

  const assignment = getLatestAssignment(request.id)

  if (!assignment) {
    return 'With coordinator'
  }

  if (assignment.status === 'Assigned') {
    return 'Assigned to responder'
  }

  if (assignment.status === 'Accepted') {
    if (request.status === 'Submitted') {
      return 'Responder accepted'
    }

    return request.status
  }

  if (assignment.status === 'Conflict declared') {
    return 'Returning to coordinator'
  }

  return request.status
}

// Generates a human-readable reference using a timestamp fragment and a random number.
function generateReference(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(100 + Math.random() * 900)
  return `MIV-${timestamp}-${random}`
}

// Returns the most recently recorded assignment for a request.
// Reversing a copy preserves the original assignment history.
function getLatestAssignment(
  requestId: string,
): CaseAssignment | undefined {
  return [...caseAssignments]
    .reverse()
    .find((assignment) => assignment.requestId === requestId)
}

// Determines whether a request may enter the internal responder assignment process.
// Retaliation requests qualify only when the employee selected the internal route.
function isEligibleForInternalHandling(request: SupportRequest): boolean {
  if (
    request.type === 'emotional' ||
    request.type === 'workplace' ||
    request.type === 'iod'
  ) {
    return true
  }

  return (
    request.type === 'retaliation' &&
    request.retaliationRoutePreference === 'internal'
  )
}
// Appends an assignment event so previous assignment states remain available.
function addAssignmentHistory(assignment: CaseAssignment): void {
  caseAssignments.push(assignment)
}

// Support request operations

// Creates a standard support request and records its initial submission details.
// Retaliation requests use a separate function because they must reference an original case.
export function submitSupportRequest(
  draft: SupportRequestDraft,
): SupportRequest {
  if (draft.type === 'retaliation') {
    throw new Error(
      'Retaliation support must be linked to an existing support request.',
    )
  }

  const request: SupportRequest = {
    ...draft,
    id: crypto.randomUUID(),
    reference: generateReference(),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  }

  requests.unshift(request)
  recordSubmissionJourney(request)
  return request
}

function recordSubmissionJourney(request: SupportRequest) {
  const internal = isEligibleForInternalHandling(request)

  recordActivity({
    requestId: request.id,
    actor: 'Employee',
    audience: ['employee', 'coordinator'],
    title: internal
      ? 'Request received by Internal Support'
      : 'Request submitted',
    message: internal
      ? `Request ${request.reference} is with a coordinator for assignment.`
      : `Request ${request.reference} has been submitted.`,
  })

  if (internal) {
    addJourneyFollowUp({
      requestId: request.id,
      type: 'Progress update',
      status: 'Update',
      title: 'Your request is with a coordinator',
      message:
        'Internal Support has received your request. A coordinator will assign a responder, and you will see each stage here until it is resolved.',
    })
  }
}

// Creates a retaliation request linked to an existing non-retaliation support request.
export function createRetaliationSupportRequest({
  originalRequestId,
  draft,
}: {
  originalRequestId: string
  draft: RetaliationSupportRequestDraft
}): SupportRequest {
  const originalRequest = getSupportRequestById(originalRequestId)

  if (!originalRequest) {
    throw new Error('The original support request could not be found.')
  }

  if (originalRequest.type === 'retaliation') {
    throw new Error(
      'A retaliation request cannot be linked to another retaliation request.',
    )
  }

  const request: SupportRequest = {
    ...draft,
    type: 'retaliation',
    originalRequestId,
    id: crypto.randomUUID(),
    reference: generateReference(),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  }

  requests.unshift(request)
  recordSubmissionJourney(request)
  return request
}

export function getSupportRequests(): SupportRequest[] {
  return [...requests]
}

export function getSupportRequestById(
  id: string,
): SupportRequest | undefined {
  return requests.find((request) => request.id === id)
}

// Updates the status of an existing request; returns undefined when the request is not found.
export function updateSupportRequestStatus(
  id: string,
  status: SupportRequestStatus,
): SupportRequest | undefined {
  const request = requests.find((request) => request.id === id)

  if (!request) return undefined

  request.status = status
  return { ...request }
}

// Employee-visible follow-ups

// Adds an employee-visible follow-up after confirming that its parent request exists.
export function addSupportFollowUp(
  followUp: Omit<SupportFollowUp, 'id'>,
): SupportFollowUp {
  const requestExists = requests.some(
    (request) => request.id === followUp.requestId,
  )

  if (!requestExists) {
    throw new Error('The associated support request does not exist.')
  }

  const newFollowUp: SupportFollowUp = {
    ...followUp,
    id: crypto.randomUUID(),
  }

  followUps.unshift(newFollowUp)

  recordActivity({
    requestId: followUp.requestId,
    actor: 'Internal Support Responder',
    audience: ['coordinator'],
    title: newFollowUp.title,
    message: `Employee update recorded for this case: ${newFollowUp.message}`,
  })

  return newFollowUp
}

// Retrieves follow-ups for a specified set of requests, newest first.
export function getFollowUpsForRequests(
  requestIds: string[],
): SupportFollowUp[] {
  const allowedRequestIds = new Set(requestIds)

  return followUps
    .filter((followUp) => allowedRequestIds.has(followUp.requestId))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
}

export function getFollowUpsForRequest(
  requestId: string,
): SupportFollowUp[] {
  return getFollowUpsForRequests([requestId])
}

// Responder and assignment operations

// Returns active responders as copies so callers do not receive the original array objects.
export function getSupportResponders(): SupportResponder[] {
  return supportResponders
    .filter((responder) => responder.active)
    .map((responder) => ({ ...responder }))
}

export function getCaseAssignment(
  requestId: string,
): CaseAssignment | undefined {
  const assignment = getLatestAssignment(requestId)
  return assignment ? { ...assignment } : undefined
}

export function getAllCaseAssignments(): CaseAssignment[] {
  return [...caseAssignments]
}

// Validates and records a new assignment for an eligible request.
// A new assignment is allowed when no assignment exists or the previous one requires resolution.
export function assignSupportRequest({
  requestId,
  responderId,
  assignedBy,
}: {
  requestId: string
  responderId: string
  assignedBy: string
}): CaseAssignment {
  const request = getSupportRequestById(requestId)

  if (!request) {
    throw new Error('The support request could not be found.')
  }

  
  if (!isEligibleForInternalHandling(request)) {
    throw new Error(
      'This support request is not eligible for internal assignment.',
    )
  }
  const responder = supportResponders.find(
    (item) => item.id === responderId && item.active,
  )

  if (!responder || responder.role !== 'Responder') {
    throw new Error('The selected responder is unavailable.')
  }

  const currentAssignment = getLatestAssignment(requestId)

  if (
    currentAssignment &&
    !['Conflict declared', 'Reassignment requested'].includes(
      currentAssignment.status,
    )
  ) {
    throw new Error('This request already has an active assignment.')
  }

  const assignment: CaseAssignment = {
    requestId,
    responderId: responder.id,
    responderName: responder.displayName,
    status: 'Assigned',
    assignedAt: new Date().toISOString(),
    assignedBy,
  }

  addAssignmentHistory(assignment)

  addJourneyFollowUp({
    requestId,
    type: 'Progress update',
    status: 'Update',
    title: 'A responder has been assigned',
    message: `${responder.displayName} has been assigned to your request. They will accept the case next, then keep you updated until it is resolved.`,
  })

  recordActivity({
    requestId,
    actor: 'Internal Support Coordinator',
    audience: ['employee', 'coordinator'],
    title: `Assigned ${request.reference}`,
    message: `Assigned to ${responder.displayName}. The employee has been notified.`,
  })

  return { ...assignment }
}

// Accepts the current assignment only when it belongs to the specified responder.
export function acceptSupportAssignment(
  requestId: string,
  responderId: string,
): CaseAssignment {
  const request = getSupportRequestById(requestId)

  if (!request || !isEligibleForInternalHandling(request)) {
    throw new Error(
      'This support request is not eligible for internal assignment.',
    )
  }

  const current = getLatestAssignment(requestId)

  if (
    !current ||
    current.responderId !== responderId ||
    current.status !== 'Assigned'
  ) {
    throw new Error('This assignment cannot be accepted.')
  }

  const updated: CaseAssignment = {
    ...current,
    status: 'Accepted',
    acceptedAt: new Date().toISOString(),
  }

  addAssignmentHistory(updated)

  addJourneyFollowUp({
    requestId,
    type: 'Progress update',
    status: 'Update',
    title: 'Your responder has accepted the case',
    message:
      'A support responder is now looking after your request. You will receive updates as they acknowledge, contact you, and work towards resolution.',
  })

  recordActivity({
    requestId,
    actor: 'Internal Support Responder',
    audience: ['employee', 'coordinator'],
    title: `Responder accepted ${request.reference}`,
    message:
      'The assigned responder accepted the case. The employee has been kept in the loop.',
  })

  return { ...updated }
}

// Records a conflict declaration against the responder's current assigned or accepted case.
export function declareSupportConflict(
  requestId: string,
  responderId: string,
  reason: string,
): CaseAssignment {
  const current = getLatestAssignment(requestId)

  if (
    !current ||
    current.responderId !== responderId ||
    !['Assigned', 'Accepted'].includes(current.status)
  ) {
    throw new Error('You cannot declare a conflict for this assignment.')
  }

  if (!reason.trim()) {
    throw new Error('Please provide a reason for the conflict declaration.')
  }

  const updated: CaseAssignment = {
    ...current,
    status: 'Conflict declared',
    conflictReason: reason.trim(),
  }

  addAssignmentHistory(updated)

  return { ...updated }
}

// Returns eligible requests that are unassigned or available for reassignment.
export function getUnassignedSupportRequests(): SupportRequest[] {
  return requests.filter((request) => {
    if (!isEligibleForInternalHandling(request)) {
      return false
    }

    const assignment = getLatestAssignment(request.id)

    return (
      !assignment ||
      ['Conflict declared', 'Reassignment requested'].includes(
        assignment.status,
      )
    )
  })
}

// Returns eligible requests currently assigned to the specified responder.
export function getAssignedSupportRequests(
  responderId: string,
): SupportRequest[] {
  return requests.filter((request) => {
    if (!isEligibleForInternalHandling(request)) {
      return false
    }

    const assignment = getLatestAssignment(request.id)

    return (
      assignment?.responderId === responderId &&
      ['Assigned', 'Accepted'].includes(assignment.status)
    )
  })
}

// Private internal case notes.
// These are separate from employee-visible follow-ups.

// Private internal case notes.
// Only the responder who has accepted the current assignment
// may add or retrieve private notes for that case.

// Checks whether the specified active responder has accepted the request's latest assignment.
// This client-side check is not a substitute for backend authorisation in a production system.
function canAccessPrivateCaseNotes(
  requestId: string,
  responderId: string,
): boolean {
  const request = getSupportRequestById(requestId)

  if (!request || !isEligibleForInternalHandling(request)) {
    return false
  }

  const responder = supportResponders.find(
    (item) => item.id === responderId && item.active,
  )

  if (!responder || responder.role !== 'Responder') {
    return false
  }

  const assignment = getLatestAssignment(requestId)

  return (
    assignment?.responderId === responderId &&
    assignment.status === 'Accepted'
  )
}

// Creates a private note after checking assignment access and validating its content.
export function addInternalCaseNote({
  requestId,
  responderId,
  type,
  content,
}: {
  requestId: string
  responderId: string
  type: CaseNoteType
  content: string
}): InternalCaseNote {
  const request = getSupportRequestById(requestId)

  if (!request) {
    throw new Error('The support request could not be found.')
  }

  
  if (!canAccessPrivateCaseNotes(requestId, responderId)) {
    throw new Error(
      'Only the responder who has accepted this assignment may add private case notes.',
    )
  }

  if (!content.trim()) {
    throw new Error('An internal note cannot be empty.')
  }

  const responder = supportResponders.find(
    (item) => item.id === responderId,
  )!

  const note: InternalCaseNote = {
    id: crypto.randomUUID(),
    requestId,
    responderId,
    responderName: responder.displayName,
    type,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  }

  internalCaseNotes.unshift(note)

  recordActivity({
    requestId,
    actor: responder.displayName,
    audience: ['coordinator'],
    title: `Internal note added on ${request.reference}`,
    message:
      'The responder saved a private case note. The note itself is not visible to the employee.',
  })

  return { ...note }
}

export type EmployeeJourneyStep = {
  id: string
  label: string
  detail: string
  completed: boolean
  current: boolean
  at?: string
}

export function getEmployeeJourney(request: SupportRequest): EmployeeJourneyStep[] {
  const assignment = getLatestAssignment(request.id)
  const internal = isEligibleForInternalHandling(request)
  const resolved = request.status === 'Resolved'

  if (!internal) {
    const steps = [
      {
        id: 'submitted',
        label: 'Request submitted',
        detail: 'Your request was received.',
        at: request.createdAt,
        completed: true,
      },
      {
        id: 'acknowledged',
        label: 'Acknowledgement',
        detail: 'Support has acknowledged your request.',
        completed:
          request.status === 'Acknowledged' ||
          request.status === 'In progress' ||
          resolved,
      },
      {
        id: 'progress',
        label: 'Support in progress',
        detail: 'Your support is being followed up.',
        completed: request.status === 'In progress' || resolved,
      },
      {
        id: 'resolved',
        label: 'Resolved',
        detail: 'This request has been closed.',
        completed: resolved,
      },
    ]

    const currentIndex = steps.findIndex((step) => !step.completed)
    return steps.map((step, index) => ({
      ...step,
      current:
        currentIndex === -1
          ? index === steps.length - 1
          : index === currentIndex,
    }))
  }

  const steps = [
    {
      id: 'submitted',
      label: 'Request submitted',
      detail: 'You sent this request from your employee workspace.',
      at: request.createdAt,
      completed: true,
    },
    {
      id: 'coordinator',
      label: 'With coordinator',
      detail: 'A coordinator is reviewing who should help you.',
      completed: Boolean(assignment),
    },
    {
      id: 'assigned',
      label: 'Assigned to a responder',
      detail: assignment
        ? `Assigned to ${assignment.responderName}.`
        : 'Waiting for a coordinator to assign a responder.',
      at: assignment?.assignedAt,
      completed: Boolean(assignment),
    },
    {
      id: 'accepted',
      label: 'Responder accepted',
      detail: 'Your responder has taken ownership of the case.',
      at: assignment?.acceptedAt,
      completed:
        request.status === 'Acknowledged' ||
        request.status === 'In progress' ||
        resolved,
    },
    {
      id: 'progress',
      label: 'Support in progress',
      detail: 'Updates and conversations will appear in your follow-ups.',
      completed: request.status === 'In progress' || resolved,
    },
    {
      id: 'resolved',
      label: 'Resolved',
      detail: 'The support process for this request is complete.',
      completed: resolved,
    },
  ]

  const currentIndex = steps.findIndex((step) => !step.completed)
  return steps.map((step, index) => ({
    ...step,
    current:
      currentIndex === -1
        ? index === steps.length - 1
        : index === Math.max(currentIndex - 0, currentIndex),
  }))
}

// Retrieves private notes for an authorised responder, ordered from newest to oldest.
export function getInternalCaseNotes(
  requestId: string,
  responderId: string,
): InternalCaseNote[] {
  if (!canAccessPrivateCaseNotes(requestId, responderId)) {
    throw new Error(
      'You are not authorised to view private notes for this case.',
    )
  }

  return internalCaseNotes
    .filter((note) => note.requestId === requestId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .map((note) => ({ ...note }))
}



