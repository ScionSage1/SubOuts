import { useState, useMemo } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { formatWeight } from '../../utils/formatters'

export default function PalletItemAssigner({ isOpen, onClose, items, palletId, palletNumber, onAssign, isAssigning }) {
  const [selectedIds, setSelectedIds] = useState([])

  // Show items with SendType='PartsOnPallets' that are not on another pallet
  const availableItems = useMemo(() => {
    return (items || []).filter(item =>
      item.SendType === 'PartsOnPallets' && (!item.PalletID || item.PalletID === palletId)
    )
  }, [items, palletId])

  const toggleItem = (itemId) => {
    setSelectedIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const selectAll = () => {
    const unassigned = availableItems.filter(i => !i.PalletID).map(i => i.SubOutItemID)
    setSelectedIds(unassigned)
  }

  const handleAssign = () => {
    onAssign(selectedIds)
    setSelectedIds([])
  }

  const handleClose = () => {
    setSelectedIds([])
    onClose()
  }

  const summary = useMemo(() => {
    const selected = availableItems.filter(i => selectedIds.includes(i.SubOutItemID))
    return {
      count: selected.length,
      weight: selected.reduce((sum, i) => sum + (parseFloat(i.Weight) || 0), 0)
    }
  }, [selectedIds, availableItems])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Assign Items to ${palletNumber}`} size="lg">
      {availableItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No items with "Parts on Pallets" send type available.
          <br />
          <span className="text-sm">Change item send types to "Parts on Pallets" first.</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <button onClick={selectAll} className="text-sm text-blue-600 hover:text-blue-800">
              Select all unassigned ({availableItems.filter(i => !i.PalletID).length})
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="w-10 px-3 py-2"></th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mark</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shape</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pallet</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableItems.map(item => {
                  const onOtherPallet = item.PalletID && item.PalletID !== palletId
                  return (
                    <tr
                      key={item.SubOutItemID}
                      className={onOtherPallet ? 'bg-gray-50 text-gray-400' : 'hover:bg-blue-50 cursor-pointer'}
                      onClick={() => !onOtherPallet && toggleItem(item.SubOutItemID)}
                    >
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.SubOutItemID)}
                          onChange={() => toggleItem(item.SubOutItemID)}
                          disabled={onOtherPallet}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm">{item.PieceMark || item.MainMark || '-'}</td>
                      <td className="px-3 py-2 text-sm">{item.Shape || '-'}</td>
                      <td className="px-3 py-2 text-sm">{item.Dimension || '-'}</td>
                      <td className="px-3 py-2 text-sm text-center">{item.Quantity || 0}</td>
                      <td className="px-3 py-2 text-sm">
                        {item.PalletID === palletId ? (
                          <span className="text-green-600">This pallet</span>
                        ) : item.PalletNumber ? (
                          <span className="text-orange-600">{item.PalletNumber}</span>
                        ) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-600">
              Selected: {summary.count} items ({formatWeight(summary.weight)})
            </span>
          </div>
        </>
      )}

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAssign} disabled={selectedIds.length === 0} loading={isAssigning}>
          Assign to Pallet
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
