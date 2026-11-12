
import type {
  SupportRequest,
  SupportRequestDraft,
  SupportRequestStatus,
} from '../types/support'

import type { SupportFollowUp } from '../types/support'


const requests: SupportRequest[] = []

function generateReference(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(100 + Math.random() * 900)

  return `MIV-${timestamp}-${random}`
}

export function submitSupportRequest(
  draft: SupportRequestDraft,
): SupportRequest {
  const request: SupportRequest = {
    ...draft,
    id: crypto.randomUUID(),
    reference: generateReference(),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  }

  requests.unshift(request)

  return request
}

export function getSupportRequests(): SupportRequest[] {
  return [...requests]
}


export function getSupportRequestById(id: string): SupportRequest | undefined {
  return requests.find((request) => request.id === id)
}

export function updateSupportRequestStatus(
  id: string,
  status: SupportRequestStatus,
): SupportRequest | undefined {
  const request = requests.find(
    (request) => request.id === id,
  )

  if (!request) {
    return undefined
  }

  request.status = status

  return { ...request }
}

const followUps: SupportFollowUp[] = []

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

  return newFollowUp
}

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
