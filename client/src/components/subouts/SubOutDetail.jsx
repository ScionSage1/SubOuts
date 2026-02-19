import { Link } from 'react-router-dom'
import { Edit2, Trash2, RotateCcw, Check } from 'lucide-react'
import clsx from 'clsx'
import Card from '../common/Card'
import Button from '../common/Button'
import { statusColors, statusOptions } from '../../utils/statusColors'
import { formatDate, formatWeightLbs, formatCurrency } from '../../utils/formatters'

function StatusStepper({ currentStatus, onStatusChange }) {
  const currentIndex = statusOptions.indexOf(currentStatus)

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {statusOptions.map((status, i) => {
        const isPast = i < currentIndex
        const isCurrent = i === currentIndex
        const colors = statusColors[status] || statusColors.Submitted

        return (
          <div key={status} className="flex items-center">
            <button
              onClick={() => onStatusChange(status)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
                isCurrent
                  ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ${colors.border.replace('border-', 'ring-')}`
                  : isPast
                    ? `${colors.bg} ${colors.text} opacity-80`
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              )}
              title={`Set status to ${status}`}
            >
              {isPast && <Check className="w-3 h-3" />}
              {status}
            </button>
            {i < statusOptions.length - 1 && (
              <div className={clsx('w-4 h-0.5 flex-shrink-0', i < currentIndex ? 'bg-gray-300' : 'bg-gray-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function SubOutDetail({
  subOut,
  onDelete,
  onReopen,
  onStatusChange,
  children
}) {
  if (!subOut) return null

  const handleStatusSelect = (status) => {
    if (status !== subOut.Status && onStatusChange) {
      onStatusChange({ id: subOut.SubOutID, status })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {subOut.JobDescription || `Job ${subOut.JobCode}`}
          </h1>
          <p className="text-lg text-gray-600">
            {subOut.Lot} - {subOut.Description || 'No description'}
          </p>
          {subOut.ProjectManager && (
            <p className="text-sm text-gray-500 mt-1">PM: {subOut.ProjectManager}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(subOut.Status === 'Complete' || subOut.Status === 'OnSite') && onReopen && (
            <Button variant="secondary" size="sm" onClick={onReopen}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reopen
            </Button>
          )}
          <Link to={`/subouts/${subOut.SubOutID}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Stepper */}
      {onStatusChange && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
          <StatusStepper currentStatus={subOut.Status} onStatusChange={handleStatusSelect} />
        </div>
      )}

      {/* Details Card */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold">Details</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">Vendor</span>
              <p className="font-medium">{subOut.SubFabricator || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Zone</span>
              <p className="font-medium">{subOut.Zone || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Weight</span>
              <p className="font-medium">{formatWeightLbs(subOut.Weight)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Major Pieces</span>
              <p className="font-medium">{subOut.MajorPieces || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">PO Number</span>
              <p className="font-medium">{subOut.PONumber || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status</span>
              <p className="font-medium mt-0.5">
                <span className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  statusColors[subOut.Status]?.bg || 'bg-gray-100',
                  statusColors[subOut.Status]?.text || 'text-gray-800'
                )}>
                  {subOut.Status}
                </span>
              </p>
            </div>
            {subOut.EstimatedCost && (
              <div>
                <span className="text-sm text-gray-500">Estimated Cost</span>
                <p className="font-medium">{formatCurrency(subOut.EstimatedCost)}</p>
              </div>
            )}
            {subOut.ActualCost && (
              <div>
                <span className="text-sm text-gray-500">Actual Cost</span>
                <p className="font-medium">{formatCurrency(subOut.ActualCost)}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500">Leave MFC</span>
              <p className="font-medium">{formatDate(subOut.DateToLeaveMFC)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Due from Sub</span>
              <p className="font-medium">{formatDate(subOut.DateToShipFromSub)}</p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Slot for LoadsSection, PalletsSection, Items, etc. */}
      {children}

      {/* Missing Steel */}
      {subOut.MissingSteel && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold">Missing Steel</h2>
          </Card.Header>
          <Card.Body>
            <p className="text-pink-600 bg-pink-50 p-3 rounded">{subOut.MissingSteel}</p>
          </Card.Body>
        </Card>
      )}

      {/* Notes */}
      {subOut.Notes && (
        <Card>
          <Card.Header>
            <h2 className="font-semibold">Notes</h2>
          </Card.Header>
          <Card.Body>
            <p className="text-gray-700 whitespace-pre-wrap">{subOut.Notes}</p>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
