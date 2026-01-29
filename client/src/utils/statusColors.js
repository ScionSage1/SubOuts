export const statusColors = {
  'Pending':    { bg: 'bg-gray-100',    text: 'text-gray-800',    border: 'border-gray-300' },
  'Ready':      { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300' },
  'Sent':       { bg: 'bg-yellow-100',  text: 'text-yellow-800',  border: 'border-yellow-300' },
  'InProcess':  { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-300' },
  'Shipped':    { bg: 'bg-purple-100',  text: 'text-purple-800',  border: 'border-purple-300' },
  'Received':   { bg: 'bg-teal-100',    text: 'text-teal-800',    border: 'border-teal-300' },
  'QCd':        { bg: 'bg-green-100',   text: 'text-green-800',   border: 'border-green-300' },
  'Complete':   { bg: 'bg-green-200',   text: 'text-green-900',   border: 'border-green-400' }
}

export const actionColors = {
  overdueSend:     'border-l-4 border-l-red-500',
  overdueReceive:  'border-l-4 border-l-orange-500',
  missingSteel:    'border-l-4 border-l-pink-500',
  readyToShip:     'border-l-4 border-l-blue-500',
  inProgress:      'border-l-4 border-l-yellow-500',
  complete:        'border-l-4 border-l-green-500',
  default:         'border-l-4 border-l-gray-300'
}

export const rowColors = {
  missingSteel: 'bg-pink-50',
  complete: 'bg-green-50',
  partial: 'bg-yellow-50',
  default: 'bg-white'
}

export function getStatusColor(status) {
  return statusColors[status] || statusColors['Pending']
}

export function getActionColor(subOut) {
  const now = new Date()
  const dateToLeave = subOut.DateToLeaveMFC ? new Date(subOut.DateToLeaveMFC) : null
  const dateToShip = subOut.DateToShipFromSub ? new Date(subOut.DateToShipFromSub) : null

  // Check overdue send
  if (dateToLeave && dateToLeave < now && subOut.LoadsShippedFromMFC < subOut.LoadsToShipFromMFC) {
    return actionColors.overdueSend
  }

  // Check overdue receive
  if (dateToShip && dateToShip < now && subOut.LoadsShippedFromSub < subOut.LoadsToShipFromSub) {
    return actionColors.overdueReceive
  }

  // Check missing steel
  if (subOut.MissingSteel) {
    return actionColors.missingSteel
  }

  // Check complete
  if (subOut.Status === 'Complete') {
    return actionColors.complete
  }

  // Check in progress
  if (['Sent', 'InProcess', 'Shipped'].includes(subOut.Status)) {
    return actionColors.inProgress
  }

  // Check ready to ship
  if (subOut.Status === 'Ready') {
    return actionColors.readyToShip
  }

  return actionColors.default
}

export function getRowColor(subOut) {
  // Missing steel - pink
  if (subOut.MissingSteel) {
    return rowColors.missingSteel
  }

  // Complete - green
  if (subOut.Status === 'Complete' ||
      (subOut.LoadsShippedFromSub >= subOut.LoadsToShipFromSub &&
       subOut.LoadsToShipFromSub > 0)) {
    return rowColors.complete
  }

  // Partial - yellow
  if (subOut.LoadsShippedFromMFC > 0 || subOut.LoadsShippedFromSub > 0) {
    return rowColors.partial
  }

  return rowColors.default
}

export const statusOptions = [
  'Pending',
  'Ready',
  'Sent',
  'InProcess',
  'Shipped',
  'Received',
  'QCd',
  'Complete'
]
