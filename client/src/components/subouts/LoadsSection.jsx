import { useState } from 'react'
import clsx from 'clsx'
import { Plus, Edit2, Trash2, Truck, ChevronDown, ChevronRight, Package, X, Printer } from 'lucide-react'
import { openPrintView } from './LoadPrintView'
import Card from '../common/Card'
import Button from '../common/Button'
import LoadForm from './LoadForm'
import LoadItemAssigner from './LoadItemAssigner'
import { getLoadStatusColor, loadStatusOptions } from '../../utils/statusColors'
import { formatDate, formatWeight, formatWeightLbs, formatLoadStatus } from '../../utils/formatters'

const LOAD_CAPACITY = 48000

export default function LoadsSection({
  loads,
  items,
  pallets,
  subOutId,
  subOut,
  dateToLeaveMFC,
  dateToShipFromSub,
  onCreateLoad,
  onUpdateLoad,
  onDeleteLoad,
  onUpdateLoadStatus,
  onAssignItemsToLoad,
  onAssignPalletsToLoad,
  onRemoveItemFromLoad,
  onRemovePalletFromLoad,
  isCreating,
  isUpdating
}) {
  const [showForm, setShowForm] = useState(false)
  const [formDirection, setFormDirection] = useState('Outbound')
  const [editingLoad, setEditingLoad] = useState(null)
  const [assigningLoad, setAssigningLoad] = useState(null)
  const [expandedLoads, setExpandedLoads] = useState(new Set())
  const [expandedPallets, setExpandedPallets] = useState(new Set())

  const outboundLoads = (loads || []).filter(l => l.Direction === 'Outbound')
  const inboundLoads = (loads || []).filter(l => l.Direction === 'Inbound')
  const outboundDelivered = outboundLoads.filter(l => l.Status === 'Delivered').length
  const inboundDelivered = inboundLoads.filter(l => l.Status === 'Delivered').length

  const toggleExpand = (loadId) => {
    setExpandedLoads(prev => {
      const next = new Set(prev)
      if (next.has(loadId)) next.delete(loadId)
      else next.add(loadId)
      return next
    })
  }

  const openNewLoad = (direction) => {
    setFormDirection(direction)
    setShowForm(true)
  }

  const handleCreate = (data) => {
    onCreateLoad({ subOutId, data })
    setShowForm(false)
  }

  const handleUpdate = (data) => {
    onUpdateLoad({ subOutId, loadId: editingLoad.LoadID, data })
    setEditingLoad(null)
  }

  const handleAssignItems = (itemIds) => {
    onAssignItemsToLoad({ subOutId, loadId: assigningLoad.LoadID, itemIds })
  }

  const handleAssignPallets = (palletIds) => {
    onAssignPalletsToLoad({ subOutId, loadId: assigningLoad.LoadID, palletIds })
  }

  const getItemsForLoad = (loadId) => {
    return (items || []).filter(item => item.LoadID === loadId && !item.PalletID)
  }

  const getPalletsForLoad = (loadId) => {
    return (pallets || []).filter(p => p.LoadID === loadId)
  }

  const getItemsForPallet = (palletId) => {
    return (items || []).filter(item => item.PalletID === palletId)
  }

  const togglePalletExpand = (palletId) => {
    setExpandedPallets(prev => {
      const next = new Set(prev)
      if (next.has(palletId)) next.delete(palletId)
      else next.add(palletId)
      return next
    })
  }

  const renderLoadCard = (load) => {
    const isExpanded = expandedLoads.has(load.LoadID)
    const statusColor = getLoadStatusColor(load.Status)
    const loadItems = getItemsForLoad(load.LoadID)
    const loadPallets = getPalletsForLoad(load.LoadID)
    // Total weight: all items on this load (direct + via pallets)
    const allLoadItems = (items || []).filter(i => i.LoadID === load.LoadID)
    const totalWeight = allLoadItems.reduce((sum, i) => sum + ((i.TeklaWeight != null ? i.TeklaWeight : i.Weight) || 0) * (i.Quantity || 1), 0)
    const remaining = LOAD_CAPACITY - totalWeight

    return (
      <div key={load.LoadID} className="border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100">
          <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => toggleExpand(load.LoadID)}>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            <span className="font-medium text-sm">{load.LoadNumber}</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
              {formatLoadStatus(load.Status)}
            </span>
            {load.ScheduledDate && (
              <span className="text-xs text-gray-500">{formatDate(load.ScheduledDate)}</span>
            )}
            {(load.ItemCount > 0 || load.PalletCount > 0) && (
              <span className="text-xs text-gray-400">
                {load.ItemCount > 0 && `${load.ItemCount} items`}
                {load.ItemCount > 0 && load.PalletCount > 0 && ', '}
                {load.PalletCount > 0 && `${load.PalletCount} pallets`}
                {totalWeight > 0 && ` — ${formatWeightLbs(totalWeight)}`}
              </span>
            )}
            {totalWeight > 0 && (
              <span className={clsx('text-xs font-medium', remaining < 0 ? 'text-red-600' : remaining < LOAD_CAPACITY * 0.25 ? 'text-orange-500' : 'text-green-600')}>
                ({remaining < 0 ? `${formatWeightLbs(Math.abs(remaining))} over` : `${formatWeightLbs(remaining)} avail`})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <select
              value={load.Status}
              onChange={(e) => onUpdateLoadStatus({ subOutId, loadId: load.LoadID, status: e.target.value })}
              className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {loadStatusOptions.map(s => (
                <option key={s} value={s}>{formatLoadStatus(s)}</option>
              ))}
            </select>
            <button
              onClick={(e) => { e.stopPropagation(); setAssigningLoad(load) }}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Assign items/pallets"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const directItems = (items || []).filter(i => i.LoadID === load.LoadID && !i.PalletID)
                const palletsList = (pallets || []).filter(p => p.LoadID === load.LoadID)
                const palletItemsList = (items || []).filter(i => i.LoadID === load.LoadID && i.PalletID)
                openPrintView({ subOut: subOut || {}, load, loadItems: directItems, loadPallets: palletsList, allPalletItems: palletItemsList })
              }}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Print BOL"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const computedWeight = totalWeight > 0 ? Math.round(totalWeight) : load.Weight
                const computedCount = allLoadItems.length > 0
                  ? allLoadItems.reduce((sum, i) => sum + (i.Quantity || 1), 0)
                  : (load.ItemCount || load.PieceCount)
                setEditingLoad({ ...load, Weight: computedWeight != null ? Math.round(computedWeight).toLocaleString() : '', PieceCount: computedCount ?? '' })
              }}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteLoad({ subOutId, loadId: load.LoadID }) }}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t text-sm">
            {/* Truck info */}
            {(load.TruckCompany || load.TrailerNumber || load.DriverName || load.BOLNumber) && (
              <div className="px-3 py-2 bg-blue-50 text-xs text-gray-600 flex gap-4 flex-wrap">
                {load.TruckCompany && <span>Truck: {load.TruckCompany}</span>}
                {load.TrailerNumber && <span>Trailer: {load.TrailerNumber}</span>}
                {load.DriverName && <span>Driver: {load.DriverName}</span>}
                {load.BOLNumber && <span>BOL: {load.BOLNumber}</span>}
              </div>
            )}
            {/* Load pallets */}
            {loadPallets.length > 0 && (
              <div className="px-3 py-2 border-b">
                <div className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Pallets
                </div>
                {loadPallets.map(p => {
                  const palletItems = getItemsForPallet(p.PalletID)
                  const isPalletExpanded = expandedPallets.has(p.PalletID)
                  const palletWeight = palletItems.reduce((sum, i) => sum + ((i.TeklaWeight != null ? i.TeklaWeight : i.Weight) || 0) * (i.Quantity || 1), 0)
                  return (
                    <div key={p.PalletID} className="ml-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-1 cursor-pointer text-xs text-gray-600 hover:text-purple-700"
                          onClick={() => togglePalletExpand(p.PalletID)}
                        >
                          {isPalletExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <span className="font-medium text-purple-700">{p.PalletNumber}</span>
                          <span>- {p.ItemCount || 0} items{palletWeight > 0 && `, ${formatWeightLbs(palletWeight)}`}</span>
                        </div>
                        {onRemovePalletFromLoad && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemovePalletFromLoad({ subOutId, loadId: load.LoadID, palletId: p.PalletID }) }}
                            className="p-0.5 text-gray-400 hover:text-red-500 flex-shrink-0"
                            title="Remove pallet from load"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {isPalletExpanded && palletItems.length > 0 && (
                        <div className="ml-5 mt-1 mb-1 border-l-2 border-purple-200 pl-2">
                          {palletItems.map(item => {
                            const weight = item.TeklaWeight != null ? item.TeklaWeight : item.Weight
                            return (
                              <div key={item.SubOutItemID} className="text-xs text-gray-500">
                                {item.PieceMark || item.MainMark || '-'} - {item.Shape} {item.Dimension || ''}, Qty {item.Quantity}
                                {weight ? `, ${formatWeightLbs(weight)}` : ''}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {/* Direct items (not on pallets) */}
            {loadItems.length > 0 && (
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-700 mb-1">Direct Items</div>
                {loadItems.map(item => {
                  const weight = item.TeklaWeight != null ? item.TeklaWeight : item.Weight
                  return (
                    <div key={item.SubOutItemID} className="text-xs text-gray-600 ml-4 flex items-center justify-between group">
                      <span>
                        {item.SourceTable === 'PullList'
                          ? `${item.Shape} ${item.Dimension || ''} ${item.Grade || ''} ${item.Length || ''}`
                          : `${item.PieceMark || item.MainMark || '-'} - ${item.Shape} ${item.Dimension || ''}`
                        }, Qty {item.Quantity}
                        {weight ? `, ${formatWeightLbs(weight)}` : ''}
                      </span>
                      {onRemoveItemFromLoad && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveItemFromLoad({ subOutId, loadId: load.LoadID, itemId: item.SubOutItemID }) }}
                          className="p-0.5 text-gray-400 hover:text-red-500 flex-shrink-0"
                          title="Remove from load"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {loadPallets.length === 0 && loadItems.length === 0 && (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">
                No items or pallets assigned. Click + to add.
              </div>
            )}
            {load.Notes && (
              <div className="px-3 py-2 text-xs text-gray-500 border-t bg-gray-50">{load.Notes}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderColumn = (title, columnLoads, deliveredCount, direction, scheduledDate) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500">
            {deliveredCount} of {columnLoads.length} delivered
            {scheduledDate && ` | Due: ${formatDate(scheduledDate)}`}
          </p>
        </div>
        <Button size="sm" onClick={() => openNewLoad(direction)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Load
        </Button>
      </div>

      {/* Progress bar */}
      {columnLoads.length > 0 && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${columnLoads.length > 0 ? (deliveredCount / columnLoads.length * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {columnLoads.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-400">No loads yet</div>
        ) : (
          columnLoads.map(load => renderLoadCard(load))
        )}
      </div>
    </div>
  )

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold">Loads ({(loads || []).length})</h2>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderColumn(
            'Outbound (MFC → Sub)',
            outboundLoads,
            outboundDelivered,
            'Outbound',
            dateToLeaveMFC
          )}
          <div className="hidden lg:block border-l border-gray-200" />
          {renderColumn(
            'Inbound (Sub → MFC)',
            inboundLoads,
            inboundDelivered,
            'Inbound',
            dateToShipFromSub
          )}
        </div>
      </Card.Body>

      {/* Load Form Modal */}
      <LoadForm
        isOpen={showForm || !!editingLoad}
        onClose={() => { setShowForm(false); setEditingLoad(null) }}
        onSubmit={editingLoad ? handleUpdate : handleCreate}
        initialData={editingLoad}
        defaultDirection={formDirection}
        isLoading={isCreating || isUpdating}
      />

      {/* Load Item Assigner Modal */}
      {assigningLoad && (
        <LoadItemAssigner
          isOpen={!!assigningLoad}
          onClose={() => setAssigningLoad(null)}
          items={items}
          pallets={pallets}
          loadId={assigningLoad.LoadID}
          loadNumber={assigningLoad.LoadNumber}
          onAssignItems={handleAssignItems}
          onAssignPallets={handleAssignPallets}
          isAssigning={isUpdating}
        />
      )}
    </Card>
  )
}
