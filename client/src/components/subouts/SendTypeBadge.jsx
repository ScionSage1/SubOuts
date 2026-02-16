import { getSendTypeColor } from '../../utils/statusColors'
import { formatSendType } from '../../utils/formatters'

export default function SendTypeBadge({ sendType, className = '' }) {
  const colors = getSendTypeColor(sendType)

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} ${className}`}>
      {formatSendType(sendType)}
    </span>
  )
}
