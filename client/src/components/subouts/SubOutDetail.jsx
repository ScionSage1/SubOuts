import { Link } from 'react-router-dom'
import { Edit2, Trash2, RotateCcw } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import { formatDate, formatWeightLbs, formatCurrency } from '../../utils/formatters'

export default function SubOutDetail({
  subOut,
  onDelete,
  onReopen,
  children
}) {
  if (!subOut) return null

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
          {subOut.Status === 'Complete' && onReopen && (
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
              <div className="mt-0.5"><StatusBadge status={subOut.Status} /></div>
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
