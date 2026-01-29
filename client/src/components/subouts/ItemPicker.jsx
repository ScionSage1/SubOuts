import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import clsx from 'clsx'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Select from '../common/Select'
import LoadingSpinner from '../common/LoadingSpinner'
import { useAvailableItems, usePackages } from '../../hooks/useCutlists'
import { formatWeight } from '../../utils/formatters'

export default function ItemPicker({ isOpen, onClose, jobCode, onAdd, isAdding }) {
  const [selectedPackage, setSelectedPackage] = useState('')
  const { data: packagesData, isLoading: packagesLoading } = usePackages(jobCode)
  const { data, isLoading } = useAvailableItems(jobCode, selectedPackage)
  const [activeTab, setActiveTab] = useState('longShapes')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState([])

  const packages = packagesData?.data || []
  const packageOptions = packages.map(p => ({ value: p, label: p }))

  const tabs = [
    { key: 'longShapes', label: 'LongShapes' },
    { key: 'parts', label: 'Parts' },
    { key: 'pullList', label: 'PullList/Raw' }
  ]

  const sourceTableMap = {
    longShapes: 'LongShapes',
    parts: 'Parts',
    pullList: 'PullList'
  }

  const items = useMemo(() => {
    if (!data?.data) return []
    const allItems = data.data[activeTab] || []

    if (!searchQuery) return allItems

    const query = searchQuery.toLowerCase()
    return allItems.filter(item =>
      (item.MainMark || '').toLowerCase().includes(query) ||
      (item.PieceMark || '').toLowerCase().includes(query) ||
      (item.Shape || '').toLowerCase().includes(query)
    )
  }, [data, activeTab, searchQuery])

  const availableItems = items.filter(item => !item.AssignedToSubOutID)

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const key = `${activeTab}-${item.ID}`
      const exists = prev.find(i => `${i.sourceTable}-${i.sourceId}` === key)
      if (exists) {
        return prev.filter(i => `${i.sourceTable}-${i.sourceId}` !== key)
      }
      return [...prev, {
        sourceTable: sourceTableMap[activeTab],
        sourceId: item.ID,
        mainMark: item.MainMark,
        pieceMark: item.PieceMark,
        shape: item.Shape,
        dimension: item.Dimension,
        grade: item.Grade,
        length: item.Length,
        quantity: item.Quantity,
        weight: item.Weight,
        heatNumber: item.HeatNumber,
        certNumber: item.CertNumber,
        barcode: item.Barcode
      }]
    })
  }

  const isSelected = (item) => {
    const key = `${sourceTableMap[activeTab]}-${item.ID}`
    return selectedItems.some(i => `${i.sourceTable}-${i.sourceId}` === key)
  }

  const selectAll = () => {
    const newItems = availableItems.map(item => ({
      sourceTable: sourceTableMap[activeTab],
      sourceId: item.ID,
      mainMark: item.MainMark,
      pieceMark: item.PieceMark,
      shape: item.Shape,
      dimension: item.Dimension,
      grade: item.Grade,
      length: item.Length,
      quantity: item.Quantity,
      weight: item.Weight,
      heatNumber: item.HeatNumber,
      certNumber: item.CertNumber,
      barcode: item.Barcode
    }))

    // Add items from this tab that aren't already selected
    setSelectedItems(prev => {
      const existingKeys = new Set(prev.map(i => `${i.sourceTable}-${i.sourceId}`))
      const filtered = newItems.filter(i => !existingKeys.has(`${i.sourceTable}-${i.sourceId}`))
      return [...prev, ...filtered]
    })
  }

  const handleAdd = () => {
    onAdd(selectedItems)
    setSelectedItems([])
  }

  const handleClose = () => {
    setSelectedItems([])
    setSearchQuery('')
    setSelectedPackage('')
    onClose()
  }

  const selectedSummary = useMemo(() => {
    const totalQty = selectedItems.reduce((sum, i) => sum + (i.quantity || 0), 0)
    const totalWeight = selectedItems.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0)
    return { count: selectedItems.length, qty: totalQty, weight: totalWeight }
  }, [selectedItems])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Items" size="xl">
      {/* Package Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Package
        </label>
        <Select
          value={selectedPackage}
          onChange={(e) => {
            setSelectedPackage(e.target.value)
            setSelectedItems([])
          }}
          options={packageOptions}
          placeholder={packagesLoading ? 'Loading packages...' : 'Select a package...'}
          disabled={packagesLoading}
        />
      </div>

      {!selectedPackage ? (
        <div className="text-center py-12 text-gray-500">
          Please select a package to view available items
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex gap-4">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label} ({data?.data?.[tab.key]?.length || 0})
                </button>
              ))}
            </nav>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search marks, shapes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={selectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Select all available ({availableItems.length})
            </button>
            <span className="text-sm text-gray-500">
              {items.length - availableItems.length} already assigned
            </span>
          </div>

          {/* Items Table */}
          {isLoading ? (
            <LoadingSpinner className="py-8" />
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-10 px-3 py-2"></th>
                    {activeTab !== 'pullList' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Main Mark</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Piece Mark</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shape</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(item => {
                    const assigned = item.AssignedToSubOutID
                    return (
                      <tr
                        key={item.ID}
                        className={clsx(
                          'cursor-pointer',
                          assigned ? 'bg-gray-50 text-gray-400' : 'hover:bg-blue-50',
                          isSelected(item) && 'bg-blue-100'
                        )}
                        onClick={() => !assigned && toggleItem(item)}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected(item)}
                            onChange={() => toggleItem(item)}
                            disabled={assigned}
                            className="rounded border-gray-300"
                          />
                        </td>
                        {activeTab !== 'pullList' && (
                          <>
                            <td className="px-3 py-2 text-sm">{item.MainMark || '-'}</td>
                            <td className="px-3 py-2 text-sm">{item.PieceMark || '-'}</td>
                          </>
                        )}
                        <td className="px-3 py-2 text-sm">{item.Shape || '-'}</td>
                        <td className="px-3 py-2 text-sm">{item.Dimension || '-'}</td>
                        <td className="px-3 py-2 text-sm">{item.Quantity || '-'}</td>
                        <td className="px-3 py-2 text-sm">
                          {assigned ? (
                            <span className="text-orange-600">{item.AssignedToLot}</span>
                          ) : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Selection Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <span className="text-sm text-gray-600">
              Selected: {selectedSummary.count} items ({selectedSummary.qty} pieces, {formatWeight(selectedSummary.weight)})
            </span>
          </div>
        </>
      )}

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          disabled={selectedItems.length === 0}
          loading={isAdding}
        >
          Add Selected Items
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
