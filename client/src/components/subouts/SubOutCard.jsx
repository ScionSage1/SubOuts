import { useNavigate } from 'react-router-dom'
import { Check, AlertCircle, Building2, Calendar, Weight, Package, FileText, Truck } from 'lucide-react'
import clsx from 'clsx'
import StatusBadge from '../common/StatusBadge'
import { getActionBarColor } from '../../utils/statusColors'
import { formatDate, formatWeight, formatLoadsProgress, isLoadsComplete, truncate } from '../../utils/formatters'

export default function SubOutCard({ subOut }) {
  const navigate = useNavigate()
  const barColor = getActionBarColor(subOut)

  const handleClick = () => {
    navigate(`/subouts/${subOut.SubOutID}`)
  }

  const now = new Date()
  const dateToLeave = subOut.DateToLeaveMFC ? new Date(subOut.DateToLeaveMFC) : null
  const dateToShip = subOut.DateToShipFromSub ? new Date(subOut.DateToShipFromSub) : null

  const outShipped = subOut.OutboundDeliveredCount ?? subOut.LoadsShippedFromMFC ?? 0
  const outTotal = subOut.OutboundLoadCount ?? subOut.LoadsToShipFromMFC ?? 0
  const inShipped = subOut.InboundDeliveredCount ?? subOut.LoadsShippedFromSub ?? 0
  const inTotal = subOut.InboundLoadCount ?? subOut.LoadsToShipFromSub ?? 0

  const totalItems = subOut.TotalItemCount || 0
  const loadedItems = subOut.LoadedItemCount || 0
  const pctLoaded = totalItems > 0 ? Math.round((loadedItems / totalItems) * 100) : 0

  const outOverdue = dateToLeave && dateToLeave < now && outShipped < outTotal
  const inOverdue = dateToShip && dateToShip < now && inShipped < inTotal

  // Progress: delivered loads fill fully, in-progress loads fill partially
  const outActive = outTotal - outShipped
  const inActive = inTotal - inShipped
  const outPct = outTotal > 0 ? Math.round(((outShipped + outActive * 0.5) / outTotal) * 100) : 0
  const inPct = inTotal > 0 ? Math.round(((inShipped + inActive * 0.5) / inTotal) * 100) : 0
  const outDone = outTotal > 0 && outShipped >= outTotal
  const inDone = inTotal > 0 && inShipped >= inTotal

  return (
    <div
      className="rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden border border-gray-200"
      onClick={handleClick}
    >
      {/* Top accent bar */}
      <div className={clsx('h-1', barColor)} />

      <div className="p-4">
        {/* Header: Lot + Status */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{subOut.Lot}</h3>
          <StatusBadge status={subOut.Status} />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-3 leading-snug">
          {subOut.Description || 'No description'}
        </p>

        {/* Vendor + Zone */}
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate">{subOut.SubFabricator || 'No vendor'}</span>
          {subOut.Zone && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
              Z{subOut.Zone}
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Leave MFC</div>
            <div className={clsx('text-sm font-medium flex items-center gap-1', outOverdue ? 'text-red-600' : 'text-gray-700')}>
              {outOverdue && <AlertCircle className="w-3 h-3" />}
              {formatDate(subOut.DateToLeaveMFC)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Due to Site</div>
            <div className={clsx('text-sm font-medium flex items-center gap-1', inOverdue ? 'text-orange-600' : 'text-gray-700')}>
              {inOverdue && <AlertCircle className="w-3 h-3" />}
              {formatDate(subOut.DateToShipFromSub)}
            </div>
          </div>
        </div>

        {/* Load progress bars */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Out</span>
              <span className="text-xs text-gray-600 flex items-center gap-1">
                {outTotal > 0 ? `${outShipped}/${outTotal}` : 'none'}
                {outActive > 0 && !outDone && <span className="text-blue-500">({outActive} active)</span>}
                {outDone && <Check className="w-3 h-3 text-green-500" />}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={clsx('h-1.5 rounded-full transition-all', outDone ? 'bg-green-500' : outOverdue ? 'bg-red-400' : 'bg-blue-400')}
                style={{ width: `${Math.min(outPct, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400">In</span>
              <span className="text-xs text-gray-600 flex items-center gap-1">
                {inTotal > 0 ? `${inShipped}/${inTotal}` : 'none'}
                {inActive > 0 && !inDone && <span className="text-blue-500">({inActive} active)</span>}
                {inDone && <Check className="w-3 h-3 text-green-500" />}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={clsx('h-1.5 rounded-full transition-all', inDone ? 'bg-green-500' : inOverdue ? 'bg-orange-400' : 'bg-blue-400')}
                style={{ width: `${Math.min(inPct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats footer */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Weight className="w-3 h-3" />
            {formatWeight(subOut.Weight)}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            {subOut.MajorPieces || 0} pcs
          </span>
          {totalItems > 0 && (
            <span className={clsx('flex items-center gap-1 font-medium', pctLoaded >= 100 ? 'text-green-600' : pctLoaded > 0 ? 'text-blue-600' : 'text-gray-400')}>
              <Truck className="w-3 h-3" />
              {pctLoaded}%
            </span>
          )}
          {subOut.PONumber && (
            <span className="flex items-center gap-1 ml-auto">
              <FileText className="w-3 h-3" />
              {subOut.PONumber}
            </span>
          )}
        </div>

        {/* Missing Steel Warning */}
        {subOut.MissingSteel && (
          <div className="mt-3 flex items-center gap-2 text-pink-700 bg-pink-50 px-2.5 py-1.5 rounded-md text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Missing: {truncate(subOut.MissingSteel, 40)}</span>
          </div>
        )}

        {/* Notes Preview */}
        {subOut.Notes && !subOut.MissingSteel && (
          <p className="mt-2 text-xs text-gray-400 italic leading-snug">
            {truncate(subOut.Notes, 50)}
          </p>
        )}
      </div>
    </div>
  )
}
