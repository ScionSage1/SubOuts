import { useState } from 'react'
import { Plus, Edit2, Trash2, Truck, ChevronDown, ChevronRight, Zap, Package } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import LoadForm from './LoadForm'
import LoadItemAssigner from './LoadItemAssigner'
import { getLoadStatusColor, loadStatusOptions } from '../../utils/statusColors'
import { formatDate, formatWeight, formatLoadStatus } from '../../utils/formatters'

export default function LoadsSection({
  loads,
  items,
  pallets,
  subOutId,
  dateToLeaveMFC,
  dateToShipFromSub,
  onCreateLoad,
  onUpdateLoad,
  onDeleteLoad,
  onUpdateLoadStatus,
  onAssignItemsToLoad,
  onAssignPalletsToLoad,
  onQuickShipOut,
  onQuickShipIn,
  isCreating,
  isUpdating,
  isQuickShipping
}) {
  const [showForm, setShowForm] = useState(false)
  const [formDirection, setFormDirection] = useState('Outbound')
  const [editingLoad, setEditingLoad] = useState(null)
  const [assigningLoad, setAssigningLoad] = useState(null)
  const [expandedLoads, setExpandedLoads] = useState(new Set())

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

  const renderLoadCard = (load) => {
    const isExpanded = expandedLoads.has(load.LoadID)
    const statusColor = getLoadStatusColor(load.Status)
    const loadItems = getItemsForLoad(load.LoadID)
    const loadPallets = getPalletsForLoad(load.LoadID)

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
              onClick={(e) => { e.stopPropagation(); setEditingLoad(load) }}
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
                {loadPallets.map(p => (
                  <div key={p.PalletID} className="text-xs text-gray-600 ml-4">
                    {p.PalletNumber} - {p.ItemCount || 0} items, {formatWeight(p.Weight)}
                  </div>
                ))}
              </div>
            )}
            {/* Direct items (not on pallets) */}
            {loadItems.length > 0 && (
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-700 mb-1">Direct Items</div>
                {loadItems.map(item => (
                  <div key={item.SubOutItemID} className="text-xs text-gray-600 ml-4">
                    {item.PieceMark || item.MainMark || '-'} - {item.Shape} {item.Dimension}, Qty {item.Quantity}
                  </div>
                ))}
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

  const renderColumn = (title, columnLoads, deliveredCount, direction, scheduledDate, onQuickShip) => (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <p className="text-xs text-gray-500">
            {deliveredCount} of {columnLoads.length} delivered
            {scheduledDate && ` | Due: ${formatDate(scheduledDate)}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onQuickShip} disabled={isQuickShipping} title="Quick ship (no details)">
            <Zap className="w-3.5 h-3.5 mr-1" />
            Quick
          </Button>
          <Button size="sm" onClick={() => openNewLoad(direction)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Load
          </Button>
        </div>
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
            dateToLeaveMFC,
            onQuickShipOut
          )}
          <div className="hidden lg:block border-l border-gray-200" />
          {renderColumn(
            'Inbound (Sub → MFC)',
            inboundLoads,
            inboundDelivered,
            'Inbound',
            dateToShipFromSub,
            onQuickShipIn
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
