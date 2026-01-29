import clsx from 'clsx'
import { getStatusColor } from '../../utils/statusColors'

export default function StatusBadge({ status, className }) {
  const colors = getStatusColor(status)

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {status}
    </span>
  )
}
