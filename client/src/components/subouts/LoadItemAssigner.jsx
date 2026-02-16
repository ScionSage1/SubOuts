import { useState, useMemo } from 'react'
import clsx from 'clsx'
import Modal from '../common/Modal'
import Button from '../common/Button'
import SendTypeBadge from './SendTypeBadge'
import { formatWeight } from '../../utils/formatters'

export default function LoadItemAssigner({ isOpen, onClose, items, pallets, loadId, loadNumber, onAssignItems, onAssignPallets, isAssigning }) {
  const [activeTab, setActiveTab] = useState('items')
  const [selectedItemIds, setSelectedItemIds] = useState([])
  const [selectedPalletIds, setSelectedPalletIds] = useState([])

  // Available items: not on any load, or already on this load
  const availableItems = useMemo(() => {
    return (items || []).filter(item =>
      !item.PalletID && (!item.LoadID || item.LoadID === loadId)
    )
  }, [items, loadId])

  // Available pallets: not on any load, or already on this load
  const availablePallets = useMemo(() => {
    return (pallets || []).filter(p => !p.LoadID || p.LoadID === loadId)
  }, [pallets, loadId])

  const toggleItem = (id) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const togglePallet = (id) => {
    setSelectedPalletIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAllItems = () => {
    setSelectedItemIds(availableItems.filter(i => !i.LoadID).map(i => i.SubOutItemID))
  }

  const selectAllPallets = () => {
    setSelectedPalletIds(availablePallets.filter(p => !p.LoadID).map(p => p.PalletID))
  }

  const handleAssign = () => {
    if (activeTab === 'items' && selectedItemIds.length > 0) {
      onAssignItems(selectedItemIds)
    } else if (activeTab === 'pallets' && selectedPalletIds.length > 0) {
      onAssignPallets(selectedPalletIds)
    }
    setSelectedItemIds([])
    setSelectedPalletIds([])
  }

  const handleClose = () => {
    setSelectedItemIds([])
    setSelectedPalletIds([])
    onClose()
  }

  const itemsSummary = useMemo(() => {
    const selected = availableItems.filter(i => selectedItemIds.includes(i.SubOutItemID))
    return {
      count: selected.length,
      weight: selected.reduce((sum, i) => sum + (parseFloat(i.Weight) || 0), 0)
    }
  }, [selectedItemIds, availableItems])

  const palletsSummary = useMemo(() => {
    const selected = availablePallets.filter(p => selectedPalletIds.includes(p.PalletID))
    return {
      count: selected.length,
      items: selected.reduce((sum, p) => sum + (p.ItemCount || 0), 0),
      weight: selected.reduce((sum, p) => sum + (parseFloat(p.Weight) || 0), 0)
    }
  }, [selectedPalletIds, availablePallets])

  const hasSelection = activeTab === 'items' ? selectedItemIds.length > 0 : selectedPalletIds.length > 0

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Assign to ${loadNumber}`} size="lg">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('items')}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              activeTab === 'items' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Items ({availableItems.length})
          </button>
          <button
            onClick={() => setActiveTab('pallets')}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
              activeTab === 'pallets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Pallets ({availablePallets.length})
          </button>
        </nav>
      </div>

      {activeTab === 'items' ? (
        <>
          {availableItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No unassigned items available (items on pallets are assigned via the Pallets tab).
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <button onClick={selectAllItems} className="text-sm text-blue-600 hover:text-blue-800">
                  Select all unassigned ({availableItems.filter(i => !i.LoadID).length})
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="w-10 px-3 py-2"></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Mark</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Shape</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {availableItems.map(item => (
                      <tr
                        key={item.SubOutItemID}
                        className={clsx(
                          'cursor-pointer',
                          item.LoadID === loadId ? 'bg-green-50' : 'hover:bg-blue-50',
                          selectedItemIds.includes(item.SubOutItemID) && 'bg-blue-100'
                        )}
                        onClick={() => !item.LoadID && toggleItem(item.SubOutItemID)}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(item.SubOutItemID) || item.LoadID === loadId}
                            onChange={() => toggleItem(item.SubOutItemID)}
                            disabled={item.LoadID === loadId}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2"><SendTypeBadge sendType={item.SendType} /></td>
                        <td className="px-3 py-2 text-sm">{item.PieceMark || item.MainMark || '-'}</td>
                        <td className="px-3 py-2 text-sm">{item.Shape || '-'}</td>
                        <td className="px-3 py-2 text-sm text-center">{item.Quantity || 0}</td>
                        <td className="px-3 py-2 text-sm text-right">{formatWeight(item.Weight)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                Selected: {itemsSummary.count} items ({formatWeight(itemsSummary.weight)})
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {availablePallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pallets available. Create pallets first.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <button onClick={selectAllPallets} className="text-sm text-blue-600 hover:text-blue-800">
                  Select all unassigned ({availablePallets.filter(p => !p.LoadID).length})
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="w-10 px-3 py-2"></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Pallet</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Items</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {availablePallets.map(pallet => (
                      <tr
                        key={pallet.PalletID}
                        className={clsx(
                          'cursor-pointer',
                          pallet.LoadID === loadId ? 'bg-green-50' : 'hover:bg-blue-50',
                          selectedPalletIds.includes(pallet.PalletID) && 'bg-blue-100'
                        )}
                        onClick={() => !pallet.LoadID && togglePallet(pallet.PalletID)}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedPalletIds.includes(pallet.PalletID) || pallet.LoadID === loadId}
                            onChange={() => togglePallet(pallet.PalletID)}
                            disabled={pallet.LoadID === loadId}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm font-medium text-purple-700">{pallet.PalletNumber}</td>
                        <td className="px-3 py-2 text-sm text-center">{pallet.ItemCount || 0}</td>
                        <td className="px-3 py-2 text-sm">{pallet.Status}</td>
                        <td className="px-3 py-2 text-sm text-right">{formatWeight(pallet.Weight)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                Selected: {palletsSummary.count} pallets ({palletsSummary.items} items, {formatWeight(palletsSummary.weight)})
              </div>
            </>
          )}
        </>
      )}

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAssign} disabled={!hasSelection} loading={isAssigning}>
          Assign to Load
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
