import { useState, useMemo } from 'react'
import clsx from 'clsx'
import Modal from '../common/Modal'
import Button from '../common/Button'
import SendTypeBadge from './SendTypeBadge'
import { formatWeight, formatWeightLbs } from '../../utils/formatters'

const LOAD_CAPACITY = 48000

const itemTabs = [
  { key: 'LongShapes', label: 'LongShapes' },
  { key: 'Parts', label: 'Parts' },
  { key: 'PullList', label: 'PullList/Raw' },
]

function getItemWeight(item) {
  return item.TeklaWeight != null ? item.TeklaWeight : item.Weight
}

export default function LoadItemAssigner({ isOpen, onClose, items, pallets, loadId, loadNumber, onAssignItems, onAssignPallets, isAssigning }) {
  const [activeTab, setActiveTab] = useState('LongShapes')
  const [selectedItemIds, setSelectedItemIds] = useState([])
  const [selectedPalletIds, setSelectedPalletIds] = useState([])

  // Available items by source: not on a pallet, not on another load (or already on this load)
  const availableItemsBySource = useMemo(() => {
    const base = (items || []).filter(item =>
      !item.PalletID && (!item.LoadID || item.LoadID === loadId)
    )
    return {
      LongShapes: base.filter(i => i.SourceTable === 'LongShapes'),
      Parts: base.filter(i => i.SourceTable === 'Parts'),
      PullList: base.filter(i => i.SourceTable === 'PullList' || i.SourceTable === 'TeklaInventory'),
    }
  }, [items, loadId])

  // Barcodes where any item is on any load — barcode-linked items are effectively unavailable
  const loadedBarcodes = useMemo(() => {
    const barcodes = new Set()
    for (const item of (items || [])) {
      if (item.Barcode && item.LoadID) {
        barcodes.add(item.Barcode)
      }
    }
    return barcodes
  }, [items])

  // Check if an item is effectively unavailable
  const isItemUnavailable = (item) => {
    // Directly on another load
    if (item.LoadID && item.LoadID !== loadId) return true
    // Already on this load (shown as green, not selectable)
    if (item.LoadID === loadId) return false
    // Barcode-linked to an item on any load
    if (item.Barcode && loadedBarcodes.has(item.Barcode)) return true
    return false
  }

  // Weight already on this load (items currently assigned, not being newly selected)
  const currentLoadWeight = useMemo(() => {
    return (items || [])
      .filter(i => i.LoadID === loadId)
      .reduce((sum, i) => sum + ((parseFloat(getItemWeight(i)) || 0) * (i.Quantity || 1)), 0)
  }, [items, loadId])

  // Available pallets: not on any load, or already on this load
  const availablePallets = useMemo(() => {
    return (pallets || []).filter(p => !p.LoadID || p.LoadID === loadId)
  }, [pallets, loadId])

  const currentTabItems = availableItemsBySource[activeTab] || []

  // Build barcode → item IDs map for cross-tab selection
  const barcodeItemMap = useMemo(() => {
    const map = {}
    const allItems = [...(availableItemsBySource.LongShapes || []), ...(availableItemsBySource.Parts || []), ...(availableItemsBySource.PullList || [])]
    for (const item of allItems) {
      if (item.Barcode) {
        if (!map[item.Barcode]) map[item.Barcode] = []
        map[item.Barcode].push(item.SubOutItemID)
      }
    }
    return map
  }, [availableItemsBySource])

  // Reverse: item ID → barcode
  const itemBarcodeMap = useMemo(() => {
    const map = {}
    const allItems = [...(availableItemsBySource.LongShapes || []), ...(availableItemsBySource.Parts || []), ...(availableItemsBySource.PullList || [])]
    for (const item of allItems) {
      if (item.Barcode && !item.LoadID) {
        map[item.SubOutItemID] = item.Barcode
      }
    }
    return map
  }, [availableItemsBySource])

  const toggleItem = (id) => {
    setSelectedItemIds(prev => {
      const isRemoving = prev.includes(id)
      const barcode = itemBarcodeMap[id]
      const linkedIds = barcode ? (barcodeItemMap[barcode] || []) : [id]
      // Only include IDs that are not already on a load
      const allItems = [...(availableItemsBySource.LongShapes || []), ...(availableItemsBySource.Parts || []), ...(availableItemsBySource.PullList || [])]
      const onLoadIds = new Set(allItems.filter(i => i.LoadID).map(i => i.SubOutItemID))
      const toggleIds = linkedIds.filter(lid => !onLoadIds.has(lid))

      if (isRemoving) {
        return prev.filter(i => !toggleIds.includes(i))
      } else {
        const next = new Set(prev)
        toggleIds.forEach(lid => next.add(lid))
        return Array.from(next)
      }
    })
  }

  const togglePallet = (id) => {
    setSelectedPalletIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAllTabItems = () => {
    const unassigned = currentTabItems.filter(i => !isItemUnavailable(i) && i.LoadID !== loadId).map(i => i.SubOutItemID)
    setSelectedItemIds(prev => {
      const existing = new Set(prev)
      unassigned.forEach(id => existing.add(id))
      return Array.from(existing)
    })
  }

  const selectAllPallets = () => {
    setSelectedPalletIds(availablePallets.filter(p => !p.LoadID).map(p => p.PalletID))
  }

  const handleAssign = () => {
    if (selectedItemIds.length > 0) {
      onAssignItems(selectedItemIds)
    }
    if (selectedPalletIds.length > 0) {
      onAssignPallets(selectedPalletIds)
    }
    setSelectedItemIds([])
    setSelectedPalletIds([])
    onClose()
  }

  const handleClose = () => {
    setSelectedItemIds([])
    setSelectedPalletIds([])
    onClose()
  }

  // Summary across all selected items (any tab)
  const itemsSummary = useMemo(() => {
    const allAvailable = [...(availableItemsBySource.LongShapes || []), ...(availableItemsBySource.Parts || []), ...(availableItemsBySource.PullList || [])]
    const selected = allAvailable.filter(i => selectedItemIds.includes(i.SubOutItemID))
    return {
      count: selected.length,
      weight: selected.reduce((sum, i) => sum + ((parseFloat(getItemWeight(i)) || 0) * (i.Quantity || 1)), 0)
    }
  }, [selectedItemIds, availableItemsBySource])

  const palletsSummary = useMemo(() => {
    const selected = availablePallets.filter(p => selectedPalletIds.includes(p.PalletID))
    return {
      count: selected.length,
      items: selected.reduce((sum, p) => sum + (p.ItemCount || 0), 0),
      weight: selected.reduce((sum, p) => sum + (parseFloat(p.Weight) || 0), 0)
    }
  }, [selectedPalletIds, availablePallets])

  const hasSelection = selectedItemIds.length > 0 || selectedPalletIds.length > 0

  // Count selected items per tab for badge display
  const selectedCountForTab = (tabKey) => {
    const tabItemIds = new Set((availableItemsBySource[tabKey] || []).map(i => i.SubOutItemID))
    return selectedItemIds.filter(id => tabItemIds.has(id)).length
  }

  const renderItemTable = () => {
    if (currentTabItems.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No unassigned {activeTab === 'PullList' ? 'PullList/Raw' : activeTab} items available.
        </div>
      )
    }

    const unassignedCount = currentTabItems.filter(i => !isItemUnavailable(i) && i.LoadID !== loadId).length
    const showMainMark = activeTab === 'LongShapes' || activeTab === 'Parts'
    const showPieceMark = activeTab === 'LongShapes' || activeTab === 'Parts'
    const showGrade = activeTab === 'PullList'
    const showLength = activeTab === 'LongShapes' || activeTab === 'PullList'
    const showRMNumber = activeTab === 'LongShapes' || activeTab === 'PullList'

    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <button onClick={selectAllTabItems} className="text-sm text-blue-600 hover:text-blue-800">
            Select all unassigned ({unassignedCount})
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                {showMainMark && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Main Mark</th>}
                {showPieceMark && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Piece Mark</th>}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Shape</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Size</th>
                {showGrade && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Grade</th>}
                {showLength && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Length</th>}
                {showRMNumber && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">RM#</th>}
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTabItems.map(item => {
                const onThisLoad = item.LoadID === loadId
                const unavailable = isItemUnavailable(item)
                const isSelected = selectedItemIds.includes(item.SubOutItemID)
                return (
                  <tr
                    key={item.SubOutItemID}
                    className={clsx(
                      onThisLoad ? 'bg-green-50' : unavailable ? 'bg-gray-50 text-gray-400' : 'cursor-pointer hover:bg-blue-50',
                      isSelected && !unavailable && 'bg-blue-100'
                    )}
                    onClick={() => !onThisLoad && !unavailable && toggleItem(item.SubOutItemID)}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected || onThisLoad}
                        onChange={() => toggleItem(item.SubOutItemID)}
                        disabled={onThisLoad || unavailable}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-3 py-2"><SendTypeBadge sendType={item.SendType} /></td>
                    {showMainMark && <td className="px-3 py-2 text-sm">{item.MainMark || '-'}</td>}
                    {showPieceMark && <td className="px-3 py-2 text-sm">{item.PieceMark || '-'}</td>}
                    <td className="px-3 py-2 text-sm">{item.Shape || '-'}</td>
                    <td className="px-3 py-2 text-sm">{item.Dimension || '-'}</td>
                    {showGrade && <td className="px-3 py-2 text-sm">{item.Grade || '-'}</td>}
                    {showLength && <td className="px-3 py-2 text-sm">{item.Length || '-'}</td>}
                    {showRMNumber && <td className="px-3 py-2 text-sm text-gray-600">{item.RMNumber || '-'}</td>}
                    <td className="px-3 py-2 text-sm text-center">{item.Quantity || 0}</td>
                    <td className="px-3 py-2 text-sm text-right">
                      <span className={item.TeklaWeight != null ? 'text-blue-600' : ''}>
                        {formatWeight(getItemWeight(item))}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const renderPalletsTable = () => {
    if (availablePallets.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No pallets available. Create pallets first.
        </div>
      )
    }

    return (
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
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
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
      </>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Assign to ${loadNumber}`} size="lg">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex gap-2">
          {itemTabs.map(tab => {
            const count = (availableItemsBySource[tab.key] || []).filter(i => !isItemUnavailable(i) && i.LoadID !== loadId).length
            const selCount = selectedCountForTab(tab.key)
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'px-3 py-2 text-sm font-medium border-b-2 -mb-px',
                  activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                {tab.label} ({count})
                {selCount > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5">{selCount}</span>}
              </button>
            )
          })}
          <button
            onClick={() => setActiveTab('pallets')}
            className={clsx(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px',
              activeTab === 'pallets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Pallets ({availablePallets.filter(p => !p.LoadID).length})
            {selectedPalletIds.length > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-1.5">{selectedPalletIds.length}</span>}
          </button>
        </nav>
      </div>

      {activeTab === 'pallets' ? renderPalletsTable() : renderItemTable()}

      {/* Capacity bar */}
      {(() => {
        const addingWeight = itemsSummary.weight + palletsSummary.weight
        const projectedTotal = currentLoadWeight + addingWeight
        const remaining = LOAD_CAPACITY - projectedTotal
        const fillPct = Math.min((projectedTotal / LOAD_CAPACITY) * 100, 100)
        const barColor = remaining < 0 ? 'bg-red-500' : remaining < LOAD_CAPACITY * 0.25 ? 'bg-orange-400' : 'bg-green-500'
        const textColor = remaining < 0 ? 'text-red-600' : remaining < LOAD_CAPACITY * 0.25 ? 'text-orange-600' : 'text-green-600'

        return (
          <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-600">
                Load: {formatWeightLbs(currentLoadWeight)}
                {addingWeight > 0 && <> + <span className="font-medium text-blue-600">{formatWeightLbs(addingWeight)}</span></>}
                {' '}/ {formatWeightLbs(LOAD_CAPACITY)}
              </span>
              <span className={clsx('font-medium', textColor)}>
                {remaining < 0 ? `${formatWeightLbs(Math.abs(remaining))} over` : `${formatWeightLbs(remaining)} avail`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={clsx(barColor, 'h-2 rounded-full transition-all')} style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        )
      })()}

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAssign} disabled={!hasSelection} loading={isAssigning}>
          Assign to Load
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
