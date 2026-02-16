import { useState } from 'react'
import { Plus, Edit2, Trash2, Package, ChevronDown, ChevronRight, Truck } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import PalletForm from './PalletForm'
import PalletItemAssigner from './PalletItemAssigner'
import { getPalletStatusColor, palletStatusOptions } from '../../utils/statusColors'
import { formatDimensions, formatWeight } from '../../utils/formatters'

export default function PalletsSection({
  pallets,
  items,
  loads,
  subOutId,
  onCreatePallet,
  onUpdatePallet,
  onDeletePallet,
  onUpdatePalletStatus,
  onAssignItems,
  onRemoveItem,
  onAssignPalletToLoad,
  isCreating,
  isUpdating
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingPallet, setEditingPallet] = useState(null)
  const [assigningPallet, setAssigningPallet] = useState(null)
  const [expandedPallets, setExpandedPallets] = useState(new Set())

  const toggleExpand = (palletId) => {
    setExpandedPallets(prev => {
      const next = new Set(prev)
      if (next.has(palletId)) next.delete(palletId)
      else next.add(palletId)
      return next
    })
  }

  const handleCreate = (data) => {
    onCreatePallet({ subOutId, data })
    setShowForm(false)
  }

  const handleUpdate = (data) => {
    onUpdatePallet({ subOutId, palletId: editingPallet.PalletID, data })
    setEditingPallet(null)
  }

  const handleAssign = (itemIds) => {
    onAssignItems({ subOutId, palletId: assigningPallet.PalletID, itemIds })
    setAssigningPallet(null)
  }

  const getItemsForPallet = (palletId) => {
    return (items || []).filter(item => item.PalletID === palletId)
  }

  const availableLoads = (loads || []).filter(l => l.Direction === 'Outbound')

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold">Pallets ({pallets?.length || 0})</h2>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Pallet
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {(!pallets || pallets.length === 0) ? (
          <div className="text-center py-6 text-gray-500">
            No pallets yet. Create pallets to group parts for shipping.
          </div>
        ) : (
          <div className="space-y-3">
            {pallets.map(pallet => {
              const isExpanded = expandedPallets.has(pallet.PalletID)
              const palletItems = getItemsForPallet(pallet.PalletID)
              const statusColor = getPalletStatusColor(pallet.Status)

              return (
                <div key={pallet.PalletID} className="border rounded-lg overflow-hidden">
                  {/* Pallet header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(pallet.PalletID)}>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <span className="font-medium text-purple-700">{pallet.PalletNumber}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                        {pallet.Status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {pallet.ItemCount || 0} items
                      </span>
                      {pallet.Weight && (
                        <span className="text-sm text-gray-500">{formatWeight(pallet.Weight)}</span>
                      )}
                      {(pallet.Length || pallet.Width || pallet.Height) && (
                        <span className="text-xs text-gray-400">{formatDimensions(pallet.Length, pallet.Width, pallet.Height)}</span>
                      )}
                      {pallet.LoadNumber && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          <Truck className="w-3 h-3 inline mr-1" />{pallet.LoadNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Status dropdown */}
                      <select
                        value={pallet.Status}
                        onChange={(e) => onUpdatePalletStatus({ subOutId, palletId: pallet.PalletID, status: e.target.value })}
                        className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {palletStatusOptions.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {/* Assign to load */}
                      {availableLoads.length > 0 && (
                        <select
                          value={pallet.LoadID || ''}
                          onChange={(e) => onAssignPalletToLoad({
                            subOutId,
                            palletId: pallet.PalletID,
                            loadId: e.target.value ? parseInt(e.target.value) : null
                          })}
                          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">No Load</option>
                          {availableLoads.map(l => (
                            <option key={l.LoadID} value={l.LoadID}>{l.LoadNumber}</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setAssigningPallet(pallet) }}
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="Add items"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingPallet(pallet) }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeletePallet({ subOutId, palletId: pallet.PalletID }) }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && (
                    <div className="border-t">
                      {palletItems.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No items assigned. Click + to add items.
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mark</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Shape</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Size</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Weight</th>
                              <th className="px-4 py-2 w-10"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {palletItems.map(item => (
                              <tr key={item.SubOutItemID} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{item.PieceMark || item.MainMark || '-'}</td>
                                <td className="px-4 py-2 text-sm">{item.Shape || '-'}</td>
                                <td className="px-4 py-2 text-sm">{item.Dimension || '-'}</td>
                                <td className="px-4 py-2 text-sm text-center">{item.Quantity || 0}</td>
                                <td className="px-4 py-2 text-sm text-right">{formatWeight(item.Weight)}</td>
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => onRemoveItem({ subOutId, palletId: pallet.PalletID, itemId: item.SubOutItemID })}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                    title="Remove from pallet"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {pallet.Notes && (
                        <div className="px-4 py-2 text-sm text-gray-500 border-t bg-gray-50">
                          {pallet.Notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card.Body>

      {/* Pallet Form Modal */}
      <PalletForm
        isOpen={showForm || !!editingPallet}
        onClose={() => { setShowForm(false); setEditingPallet(null) }}
        onSubmit={editingPallet ? handleUpdate : handleCreate}
        initialData={editingPallet}
        isLoading={isCreating || isUpdating}
      />

      {/* Item Assigner Modal */}
      {assigningPallet && (
        <PalletItemAssigner
          isOpen={!!assigningPallet}
          onClose={() => setAssigningPallet(null)}
          items={items}
          palletId={assigningPallet.PalletID}
          palletNumber={assigningPallet.PalletNumber}
          onAssign={handleAssign}
          isAssigning={isUpdating}
        />
      )}
    </Card>
  )
}
