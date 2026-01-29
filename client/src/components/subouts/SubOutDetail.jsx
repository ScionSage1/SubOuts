import { Link } from 'react-router-dom'
import { Edit2, Trash2, Plus, Minus, Check } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import { formatDate, formatDateLong, formatWeight, formatWeightLbs, formatCurrency, formatLoadsProgress, isLoadsComplete } from '../../utils/formatters'

export default function SubOutDetail({
  subOut,
  onIncrementLoadsOut,
  onIncrementLoadsIn,
  onDelete,
  isUpdating
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details Card */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold">Details</h2>
          </Card.Header>
          <Card.Body className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Vendor</span>
              <span className="font-medium">{subOut.SubFabricator || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Zone</span>
              <span className="font-medium">{subOut.Zone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Weight</span>
              <span className="font-medium">{formatWeightLbs(subOut.Weight)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Major Pieces</span>
              <span className="font-medium">{subOut.MajorPieces || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">PO Number</span>
              <span className="font-medium">{subOut.PONumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <StatusBadge status={subOut.Status} />
            </div>
            {subOut.EstimatedCost && (
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Cost</span>
                <span className="font-medium">{formatCurrency(subOut.EstimatedCost)}</span>
              </div>
            )}
            {subOut.ActualCost && (
              <div className="flex justify-between">
                <span className="text-gray-500">Actual Cost</span>
                <span className="font-medium">{formatCurrency(subOut.ActualCost)}</span>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Shipment Tracking Card */}
        <Card>
          <Card.Header>
            <h2 className="font-semibold">Shipment Tracking</h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 gap-6">
              {/* From MFC */}
              <div className="text-center">
                <h3 className="text-sm text-gray-500 mb-2">FROM MFC</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    {formatLoadsProgress(subOut.LoadsShippedFromMFC, subOut.LoadsToShipFromMFC)}
                    {isLoadsComplete(subOut.LoadsShippedFromMFC, subOut.LoadsToShipFromMFC) && (
                      <Check className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Leave: {formatDate(subOut.DateToLeaveMFC)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={onIncrementLoadsOut}
                  disabled={isUpdating || subOut.LoadsShippedFromMFC >= subOut.LoadsToShipFromMFC}
                  loading={isUpdating}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  +1 Load Out
                </Button>
              </div>

              {/* From Sub */}
              <div className="text-center">
                <h3 className="text-sm text-gray-500 mb-2">FROM SUB</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold flex items-center justify-center gap-2">
                    {formatLoadsProgress(subOut.LoadsShippedFromSub, subOut.LoadsToShipFromSub)}
                    {isLoadsComplete(subOut.LoadsShippedFromSub, subOut.LoadsToShipFromSub) && (
                      <Check className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {formatDate(subOut.DateToShipFromSub)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={onIncrementLoadsIn}
                  disabled={isUpdating || subOut.LoadsShippedFromSub >= subOut.LoadsToShipFromSub}
                  loading={isUpdating}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  +1 Load In
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Missing Steel */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold">Missing Steel</h2>
        </Card.Header>
        <Card.Body>
          {subOut.MissingSteel ? (
            <p className="text-pink-600 bg-pink-50 p-3 rounded">{subOut.MissingSteel}</p>
          ) : (
            <p className="text-gray-400 italic">No missing steel</p>
          )}
        </Card.Body>
      </Card>

      {/* Notes */}
      <Card>
        <Card.Header>
          <h2 className="font-semibold">Notes</h2>
        </Card.Header>
        <Card.Body>
          {subOut.Notes ? (
            <p className="text-gray-700 whitespace-pre-wrap">{subOut.Notes}</p>
          ) : (
            <p className="text-gray-400 italic">No notes</p>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}
