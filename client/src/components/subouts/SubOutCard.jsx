import { useNavigate } from 'react-router-dom'
import { Check, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import Card from '../common/Card'
import StatusBadge from '../common/StatusBadge'
import { getActionColor } from '../../utils/statusColors'
import { formatDate, formatWeight, formatLoadsProgress, isLoadsComplete, truncate } from '../../utils/formatters'

export default function SubOutCard({ subOut }) {
  const navigate = useNavigate()
  const actionColor = getActionColor(subOut)

  const handleClick = () => {
    navigate(`/subouts/${subOut.SubOutID}`)
  }

  return (
    <Card
      className={clsx('overflow-hidden', actionColor)}
      onClick={handleClick}
    >
      <Card.Body className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{subOut.Lot}</h3>
            <p className="text-sm text-gray-600">{subOut.Description || 'No description'}</p>
          </div>
          <StatusBadge status={subOut.Status} />
        </div>

        {/* Vendor */}
        <p className="text-sm text-gray-500 mb-3">
          {subOut.SubFabricator || 'No vendor assigned'}
        </p>

        {/* Loads Progress */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Out:</span>
            <span className="text-sm font-medium">
              {formatLoadsProgress(subOut.LoadsShippedFromMFC, subOut.LoadsToShipFromMFC)}
            </span>
            {isLoadsComplete(subOut.LoadsShippedFromMFC, subOut.LoadsToShipFromMFC) && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">In:</span>
            <span className="text-sm font-medium">
              {formatLoadsProgress(subOut.LoadsShippedFromSub, subOut.LoadsToShipFromSub)}
            </span>
            {isLoadsComplete(subOut.LoadsShippedFromSub, subOut.LoadsToShipFromSub) && (
              <Check className="w-4 h-4 text-green-500" />
            )}
          </div>
        </div>

        {/* Date & Stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Ship: {formatDate(subOut.DateToShipFromSub)}
          </span>
          <span className="text-gray-600">
            {subOut.MajorPieces || '-'} pcs | {formatWeight(subOut.Weight)}
          </span>
        </div>

        {/* Missing Steel Warning */}
        {subOut.MissingSteel && (
          <div className="mt-3 flex items-center gap-2 text-pink-600 bg-pink-50 px-2 py-1 rounded text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>Missing: {truncate(subOut.MissingSteel, 30)}</span>
          </div>
        )}

        {/* Notes Preview */}
        {subOut.Notes && !subOut.MissingSteel && (
          <p className="mt-3 text-xs text-gray-500 italic">
            {truncate(subOut.Notes, 50)}
          </p>
        )}
      </Card.Body>
    </Card>
  )
}
