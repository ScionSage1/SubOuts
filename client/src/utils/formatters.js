// Date formatters
export function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  })
}

export function formatDateLong(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateInput(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Weight formatters
export function formatWeight(weight) {
  if (!weight && weight !== 0) return '-'
  const num = parseFloat(weight)
  if (num >= 2000) {
    return `${(num / 2000).toFixed(1)}T`
  }
  return `${num.toLocaleString()} lbs`
}

export function formatWeightLbs(weight) {
  if (!weight && weight !== 0) return '-'
  return `${parseFloat(weight).toLocaleString()} lbs`
}

// Number formatters
export function formatNumber(num) {
  if (!num && num !== 0) return '-'
  return parseFloat(num).toLocaleString()
}

// Currency formatters
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Loads progress formatter
export function formatLoadsProgress(shipped, total) {
  return `${shipped || 0} of ${total || 0}`
}

export function isLoadsComplete(shipped, total) {
  return total > 0 && shipped >= total
}

// Truncate text
export function truncate(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Generate lot number
export function generateLotNumber(existingLots = []) {
  const numbers = existingLots
    .map(lot => {
      const match = lot.match(/SUB#(\d+)/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(n => n > 0)

  const max = numbers.length > 0 ? Math.max(...numbers) : 0
  const next = max + 1
  return `SUB#${String(next).padStart(3, '0')}`
}
