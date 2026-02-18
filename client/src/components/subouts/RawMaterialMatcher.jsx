import { useState, useMemo } from 'react'
import clsx from 'clsx'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { useInventoryFilters, useMatchingInventory } from '../../hooks/useTekla'
import { formatWeightLbs } from '../../utils/formatters'

function inchesToFeetStr(inches) {
  if (!inches) return '-'
  const feet = Math.floor(inches / 12)
  const rem = Math.round(inches % 12)
  return rem > 0 ? `${feet}' ${rem}"` : `${feet}' 0"`
}

export default function RawMaterialMatcher({ isOpen, onClose, subOutId, onAddItems, isAdding }) {
  const [selectedShape, setSelectedShape] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSticks, setSelectedSticks] = useState({}) // key -> qty

  // Fetch available shapes and grades
  const { data: filtersData, isLoading: filtersLoading } = useInventoryFilters(isOpen)
  const filters = filtersData?.data || { shapes: [], grades: {} }

  // Available grades for the selected shape
  const availableGrades = selectedShape ? (filters.grades[selectedShape] || []) : []

  // Fetch matching inventory when both shape and grade are selected
  const shapePairs = useMemo(() => {
    if (!selectedShape || !selectedGrade) return []
    return [{ shape: selectedShape, grade: selectedGrade }]
  }, [selectedShape, selectedGrade])

  const { data: matchData, isLoading: matchLoading } = useMatchingInventory(shapePairs, isOpen && shapePairs.length > 0)
  const inventoryGroups = matchData?.data || []

  // Flatten all sticks across groups for display
  const allSticks = useMemo(() => {
    const result = []
    inventoryGroups.forEach((group, gi) => {
      group.sticks.forEach((stick, si) => {
        result.push({
          ...stick,
          groupIdx: gi,
          stickIdx: si,
          dimension: group.dimension,
          shape: group.shape,
          grade: group.grade,
          key: `${gi}-${si}`
        })
      })
    })
    return result
  }, [inventoryGroups])

  const toggleStick = (key) => {
    setSelectedSticks(prev => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = 1
      return next
    })
  }

  const updateStickQty = (key, qty, maxCount) => {
    setSelectedSticks(prev => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: Math.min(qty, maxCount) }
    })
  }

  // Build summary of selections
  const selectionSummary = useMemo(() => {
    let totalSticks = 0
    let totalWeight = 0
    const itemsToAdd = []
    const baseId = Date.now() % 2000000000
    let counter = 0

    for (const [key, qty] of Object.entries(selectedSticks)) {
      const stick = allSticks.find(s => s.key === key)
      if (!stick) continue

      totalSticks += qty
      totalWeight += (stick.weightLbs || 0) * qty

      for (let i = 0; i < qty; i++) {
        itemsToAdd.push({
          sourceTable: 'TeklaInventory',
          sourceId: baseId + (++counter),
          shape: stick.shape,
          dimension: stick.dimension || '',
          grade: stick.grade,
          length: stick.lengthDisplay,
          quantity: 1,
          weight: stick.weightLbs || 0,
          sendType: 'Raw'
        })
      }
    }

    return { totalSticks, totalWeight, itemsToAdd }
  }, [selectedSticks, allSticks])

  const handleAdd = () => {
    if (selectionSummary.itemsToAdd.length === 0) return
    onAddItems(selectionSummary.itemsToAdd)
  }

  const handleClose = () => {
    setSelectedSticks({})
    setSelectedShape('')
    setSelectedGrade('')
    onClose()
  }

  const handleShapeChange = (shape) => {
    setSelectedShape(shape)
    setSelectedGrade('')
    setSelectedSticks({})
  }

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade)
    setSelectedSticks({})
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Raw Material from Inventory" size="xl">
      {/* Shape and Grade selectors */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
          <select
            value={selectedShape}
            onChange={(e) => handleShapeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={filtersLoading}
          >
            <option value="">{filtersLoading ? 'Loading...' : 'Select a shape...'}</option>
            {filters.shapes.map(shape => (
              <option key={shape} value={shape}>{shape}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <select
            value={selectedGrade}
            onChange={(e) => handleGradeChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedShape || availableGrades.length === 0}
          >
            <option value="">{!selectedShape ? 'Select shape first...' : 'Select a grade...'}</option>
            {availableGrades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {!selectedShape || !selectedGrade ? (
        <div className="text-center py-12 text-gray-400">
          Select a shape and grade to see available inventory.
        </div>
      ) : matchLoading ? (
        <div className="text-center py-12 text-gray-500">
          Searching Tekla inventory...
        </div>
      ) : allSticks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No inventory found for <strong>{selectedShape}</strong> / <strong>{selectedGrade}</strong>.
        </div>
      ) : (
        <div className="max-h-[55vh] overflow-y-auto border rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-10 px-3 py-2"></th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Dimension</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Stock Length</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Weight (ea)</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">In Stock</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty to Add</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allSticks.map(stick => {
                const isSelected = !!selectedSticks[stick.key]
                const qty = selectedSticks[stick.key] || 0

                return (
                  <tr
                    key={stick.key}
                    className={clsx(
                      'cursor-pointer',
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    )}
                    onClick={() => toggleStick(stick.key)}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleStick(stick.key)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm font-medium">{stick.dimension || '-'}</td>
                    <td className="px-3 py-2 text-sm">{stick.lengthDisplay}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-600">
                      {stick.weightLbs > 0 ? formatWeightLbs(stick.weightLbs) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-center font-medium">{stick.count}</td>
                    <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                      {isSelected && (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateStickQty(stick.key, qty - 1, stick.count)}
                            className="w-6 h-6 rounded border text-gray-600 hover:bg-gray-100 text-sm"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{qty}</span>
                          <button
                            onClick={() => updateStickQty(stick.key, qty + 1, stick.count)}
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
