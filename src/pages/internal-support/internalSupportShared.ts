import type { SupportRequest } from '../../types/support'

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getRequestLabel(type: SupportRequest['type']) {
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

export function isInternalSupportRequest(request: SupportRequest) {
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
