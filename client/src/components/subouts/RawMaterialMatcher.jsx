import { useState, useMemo } from 'react'
import clsx from 'clsx'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { useMatchingInventory } from '../../hooks/useTekla'
import { formatWeightLbs } from '../../utils/formatters'

function toInches(val) {
  if (val == null) return null
  const s = String(val).trim()
  const num = parseFloat(s)
  if (!isNaN(num) && !s.includes("'")) return num
  const match = s.match(/(\d+)'\s*(\d+(?:\.\d+)?)?/)
  if (match) {
    const feet = parseInt(match[1]) || 0
    const inches = parseFloat(match[2]) || 0
    return feet * 12 + inches
  }
  return num || null
}

function inchesToFeetStr(inches) {
  if (!inches) return '-'
  const feet = Math.floor(inches / 12)
  const rem = Math.round(inches % 12)
  return rem > 0 ? `${feet}' ${rem}"` : `${feet}' 0"`
}

export default function RawMaterialMatcher({ isOpen, onClose, items, subOutId, onAddItems, isAdding }) {
  const [selectedSticks, setSelectedSticks] = useState({}) // key -> qty
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  // Group SubOut parts by Shape + Grade
  const partGroups = useMemo(() => {
    if (!items || items.length === 0) return []
    const groups = {}
    for (const item of items) {
      if (!item.Shape || !item.Length) continue
      const key = `${(item.Shape || '').trim()}|${(item.Grade || '').trim()}`
      if (!groups[key]) {
        groups[key] = {
          shape: (item.Shape || '').trim(),
          grade: (item.Grade || '').trim(),
          pieces: []
        }
      }
      const lengthIn = toInches(item.Length)
      if (lengthIn) {
        groups[key].pieces.push({
          lengthInches: lengthIn,
          lengthDisplay: inchesToFeetStr(lengthIn),
          quantity: item.Quantity || 1,
          mark: item.PieceMark || item.MainMark || '-',
          dimension: item.Dimension || ''
        })
      }
    }
    return Object.values(groups).filter(g => g.pieces.length > 0)
  }, [items])

  // Build shape+grade pairs for API query
  const shapePairs = useMemo(() => {
    return partGroups.map(g => ({ shape: g.shape, grade: g.grade }))
  }, [partGroups])

  const { data: matchData, isLoading } = useMatchingInventory(shapePairs, isOpen && shapePairs.length > 0)
  const inventoryGroups = matchData?.data || []

  // Match inventory groups to part groups
  const matchedGroups = useMemo(() => {
    return partGroups.map(pg => {
      const normalShape = pg.shape.toLowerCase()
      const normalGrade = pg.grade.toLowerCase()
      // Find matching inventory group
      const inv = inventoryGroups.find(ig =>
        ig.shape.toLowerCase() === normalShape && ig.grade.toLowerCase() === normalGrade
      ) || inventoryGroups.find(ig => {
        // Try with dimension included in shape match
        const invKey = `${ig.shape} ${ig.dimension}`.toLowerCase().trim()
        return invKey === normalShape && ig.grade.toLowerCase() === normalGrade
      })

      // Calculate total linear length needed
      const totalPieces = pg.pieces.reduce((sum, p) => sum + p.quantity, 0)
      const totalLength = pg.pieces.reduce((sum, p) => sum + (p.lengthInches * p.quantity), 0)

      // For each inventory stick, calculate yield
      const sticksWithYield = (inv?.sticks || []).map(stick => {
        // Greedy: how many of each piece length fit?
        const yields = []
        let remaining = stick.lengthInches
        // Sort pieces by length descending for greedy packing
        const sortedPieces = [...pg.pieces].sort((a, b) => b.lengthInches - a.lengthInches)
        for (const piece of sortedPieces) {
          const fits = Math.floor(remaining / piece.lengthInches)
          if (fits > 0) {
            yields.push({
              mark: piece.mark,
              lengthDisplay: piece.lengthDisplay,
              lengthInches: piece.lengthInches,
              fits,
              maxNeeded: piece.quantity
            })
            remaining -= fits * piece.lengthInches
          }
        }
        const totalFits = yields.reduce((sum, y) => sum + y.fits, 0)
        return {
          ...stick,
          yields,
          totalFits,
          waste: remaining,
          wasteDisplay: inchesToFeetStr(remaining),
          wastePct: Math.round((remaining / stick.lengthInches) * 100)
        }
      })

      return {
        ...pg,
        totalPieces,
        totalLength,
        totalLengthDisplay: inchesToFeetStr(totalLength),
        sticks: sticksWithYield,
        hasInventory: sticksWithYield.length > 0
      }
    })
  }, [partGroups, inventoryGroups])

  const toggleGroup = (idx) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const getStickKey = (groupIdx, stickIdx) => `${groupIdx}-${stickIdx}`

  const toggleStick = (groupIdx, stickIdx) => {
    const key = getStickKey(groupIdx, stickIdx)
    setSelectedSticks(prev => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = 1
      return next
    })
  }

  const updateStickQty = (groupIdx, stickIdx, qty) => {
    const key = getStickKey(groupIdx, stickIdx)
    setSelectedSticks(prev => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: qty }
    })
  }

  // Build summary of selections
  const selectionSummary = useMemo(() => {
    let totalSticks = 0
    let totalWeight = 0
    const itemsToAdd = []
    // Use timestamp modded to fit INT range + counter for uniqueness
    const baseId = Date.now() % 2000000000
    let counter = 0

    for (const [key, qty] of Object.entries(selectedSticks)) {
      const [gi, si] = key.split('-').map(Number)
      const group = matchedGroups[gi]
      const stick = group?.sticks?.[si]
      if (!group || !stick) continue

      totalSticks += qty
      totalWeight += (stick.weightLbs || 0) * qty

      for (let i = 0; i < qty; i++) {
        itemsToAdd.push({
          sourceTable: 'TeklaInventory',
          sourceId: baseId + (++counter),
          shape: group.shape,
          dimension: stick.dimension || group.pieces?.[0]?.dimension || '',
          grade: group.grade,
          length: stick.lengthDisplay,
          quantity: 1,
          weight: stick.weightLbs || 0,
          sendType: 'Raw'
        })
      }
    }

    return { totalSticks, totalWeight, itemsToAdd }
  }, [selectedSticks, matchedGroups])

  const handleAdd = () => {
    if (selectionSummary.itemsToAdd.length === 0) return
    onAddItems(selectionSummary.itemsToAdd)
  }

  const handleClose = () => {
    setSelectedSticks({})
    setExpandedGroups(new Set())
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Match Raw Material from Inventory" size="xl">
      {partGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No parts with shape and length data found on this SubOut.
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 text-gray-500">
          Searching Tekla inventory for matching material...
        </div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {matchedGroups.map((group, gi) => {
            const isExpanded = expandedGroups.has(gi)
            const hasSelections = Object.keys(selectedSticks).some(k => k.startsWith(`${gi}-`))

            return (
              <div key={gi} className="border rounded-lg overflow-hidden">
                {/* Group header */}
                <div
                  className={clsx(
                    'flex items-center justify-between px-4 py-3 cursor-pointer',
                    group.hasInventory ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50'
                  )}
                  onClick={() => toggleGroup(gi)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-800">
                      {group.shape} {group.pieces[0]?.dimension || ''}
                    </span>
                    {group.grade && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                        {group.grade}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {group.totalPieces} pcs needed — {group.totalLengthDisplay} total
                    </span>
                    {hasSelections && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {group.hasInventory ? (
                      <span className="text-xs text-blue-600 font-medium">
                        {group.sticks.length} stock length{group.sticks.length !== 1 ? 's' : ''} available
                      </span>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">No matching inventory</span>
                    )}
                    <span className="text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t">
                    {/* Pieces needed summary */}
                    <div className="px-4 py-2 bg-gray-50 border-b">
                      <div className="text-xs font-medium text-gray-600 mb-1">Pieces needed:</div>
                      <div className="flex flex-wrap gap-2">
                        {group.pieces.map((p, pi) => (
                          <span key={pi} className="text-xs bg-white border rounded px-2 py-0.5">
                            {p.quantity}× {p.mark} @ {p.lengthDisplay}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Available inventory sticks */}
                    {group.sticks.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-10 px-3 py-2"></th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Stock Length</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Weight</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">In Stock</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Yield</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Waste</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty to Add</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {group.sticks.map((stick, si) => {
                            const key = getStickKey(gi, si)
                            const isSelected = !!selectedSticks[key]
                            const qty = selectedSticks[key] || 0

                            return (
                              <tr
                                key={si}
                                className={clsx(
                                  'cursor-pointer',
                                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                )}
                                onClick={() => toggleStick(gi, si)}
                              >
                                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleStick(gi, si)}
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm font-medium">{stick.lengthDisplay}</td>
                                <td className="px-3 py-2 text-sm text-right text-gray-600">{stick.weightLbs > 0 ? formatWeightLbs(stick.weightLbs) : '-'}</td>
                                <td className="px-3 py-2 text-sm text-center font-medium">{stick.count}</td>
                                <td className="px-3 py-2">
                                  {stick.yields.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {stick.yields.map((y, yi) => (
                                        <span key={yi} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5">
                                          {y.fits}× {y.lengthDisplay}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">No pieces fit</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-sm text-right">
                                  <span className={clsx(
                                    stick.wastePct > 30 ? 'text-orange-600' : stick.wastePct > 15 ? 'text-yellow-600' : 'text-green-600'
                                  )}>
                                    {stick.wasteDisplay} ({stick.wastePct}%)
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                  {isSelected && (
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => updateStickQty(gi, si, qty - 1)}
                                        className="w-6 h-6 rounded border text-gray-600 hover:bg-gray-100 text-sm"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm font-medium">{qty}</span>
                                      <button
                                        onClick={() => updateStickQty(gi, si, Math.min(qty + 1, stick.count))}
                                        className="w-6 h-6 rounded border text-gray-600 hover:bg-gray-100 text-sm"
                                      >
                                        +
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-4 py-4 text-sm text-gray-500 text-center">
                        No matching inventory found for {group.shape} {group.grade}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Selection summary */}
      {selectionSummary.totalSticks > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <span className="font-medium text-blue-800">
            {selectionSummary.totalSticks} stick{selectionSummary.totalSticks !== 1 ? 's' : ''} selected
          </span>
          {selectionSummary.totalWeight > 0 && (
            <span className="text-blue-600 ml-2">— {formatWeightLbs(selectionSummary.totalWeight)}</span>
          )}
        </div>
      )}

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleAdd}
          disabled={selectionSummary.totalSticks === 0}
          loading={isAdding}
        >
          Add {selectionSummary.totalSticks > 0 ? `${selectionSummary.totalSticks} Stick${selectionSummary.totalSticks !== 1 ? 's' : ''}` : 'Selected'} as Raw Material
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
