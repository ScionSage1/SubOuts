import { useState, useMemo, Fragment } from 'react'
import { Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import SendTypeBadge from './SendTypeBadge'
import { sendTypeOptions } from '../../utils/statusColors'
import { formatSendType, formatWeight } from '../../utils/formatters'

export default function ItemsTable({ items, onDelete, onEdit, onUpdateSendType, onUpdatePullListSource, onBulkUpdatePullListStatus, pullStatuses, isDeleting }) {
  const [activeTab, setActiveTab] = useState('LongShapes')
  const [expandedBarcodes, setExpandedBarcodes] = useState(new Set())
  const [sendTypeFilter, setSendTypeFilter] = useState('')
  const [editingRMNumber, setEditingRMNumber] = useState({})
  const [selectedPullListIds, setSelectedPullListIds] = useState(new Set())
  const [selectedItemIds, setSelectedItemIds] = useState(new Set())
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchFilter, setSearchFilter] = useState('')

  const tabs = [
    { key: 'LongShapes', label: 'LongShapes' },
    { key: 'Parts', label: 'Parts' },
    { key: 'PullList', label: 'PullList/Raw' },
    { key: 'Combined', label: 'Combined' }
  ]

  // --- Sort helpers ---
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' }
        return { key: null, direction: 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortComparator = (a, b) => {
    if (!sortConfig.key) return 0
    let aVal = a[sortConfig.key]
    let bVal = b[sortConfig.key]
    if (aVal == null) aVal = ''
    if (bVal == null) bVal = ''
    const aNum = Number(aVal)
    const bNum = Number(bVal)
    if (!isNaN(aNum) && !isNaN(bNum) && aVal !== '' && bVal !== '') {
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
    }
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1
    if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  }

  const renderSortHeader = (label, sortKey, options = {}) => {
    const { center = false, px = 'px-4' } = options
    const isActive = sortConfig.key === sortKey
    return (
      <th
        className={clsx(
          px, 'py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700 select-none group',
          center ? 'text-center' : 'text-left'
        )}
        onClick={() => handleSort(sortKey)}
      >
        <div className={clsx('flex items-center gap-1', center && 'justify-center')}>
          {label}
          <span className={clsx('text-[10px]', isActive ? 'text-blue-500' : 'text-gray-300 opacity-0 group-hover:opacity-100')}>
            {isActive ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
          </span>
        </div>
      </th>
    )
  }

  // --- Data pipeline ---
  const allFilteredItems = useMemo(() => {
    let result = items || []
    if (sendTypeFilter) {
      result = result.filter(item => item.SendType === sendTypeFilter)
    }
    if (searchFilter) {
      const search = searchFilter.toLowerCase()
      result = result.filter(item => {
        const fields = [
          item.MainMark, item.PieceMark, item.Shape, item.Dimension,
          item.Grade, item.Barcode, item.RMNumber, item.PalletNumber,
          item.LoadNumber, item.Status, item.SendType
        ]
        if (item.Length != null) fields.push(String(item.Length))
        if (item.Weight != null) fields.push(String(item.Weight))
        return fields.some(val => val && String(val).toLowerCase().includes(search))
      })
    }
    return result
  }, [items, sendTypeFilter, searchFilter])

  const sortedItems = useMemo(() => {
    const tabItems = allFilteredItems.filter(item => item.SourceTable === activeTab)
    if (!sortConfig.key) return tabItems
    return [...tabItems].sort(sortComparator)
  }, [allFilteredItems, activeTab, sortConfig])

  const getCounts = (sourceTable) => {
    if (sourceTable === 'Combined') {
      const pullListItems = allFilteredItems.filter(item => item.SourceTable === 'PullList')
      const longShapesItems = allFilteredItems.filter(item => item.SourceTable === 'LongShapes')
      return pullListItems.length + longShapesItems.length
    }
    return allFilteredItems.filter(item => item.SourceTable === sourceTable).length
  }

  // Build combined hierarchy: PullList -> LongShapes by Barcode
  const combinedData = useMemo(() => {
    if (!allFilteredItems.length) return { hierarchy: [], orphanLongShapes: [] }

    const pullListItems = allFilteredItems.filter(item => item.SourceTable === 'PullList')
    const longShapesItems = allFilteredItems.filter(item => item.SourceTable === 'LongShapes')

    const longShapesByBarcode = {}
    longShapesItems.forEach(item => {
      if (item.Barcode) {
        if (!longShapesByBarcode[item.Barcode]) {
          longShapesByBarcode[item.Barcode] = []
        }
        longShapesByBarcode[item.Barcode].push(item)
      }
    })

    let hierarchy = pullListItems.map(pullItem => ({
      ...pullItem,
      children: pullItem.Barcode ? (longShapesByBarcode[pullItem.Barcode] || []) : []
    }))

    const usedBarcodes = new Set(pullListItems.map(p => p.Barcode).filter(Boolean))
    let orphanLongShapes = longShapesItems.filter(item => !item.Barcode || !usedBarcodes.has(item.Barcode))

    // Apply sorting to hierarchy parents, orphans, and children
    if (sortConfig.key) {
      hierarchy = [...hierarchy].sort(sortComparator)
      orphanLongShapes = [...orphanLongShapes].sort(sortComparator)
      hierarchy = hierarchy.map(item => ({
        ...item,
        children: item.children.length > 1 ? [...item.children].sort(sortComparator) : item.children
      }))
    }

    return { hierarchy, orphanLongShapes }
  }, [allFilteredItems, sortConfig])

  const toggleExpand = (barcode) => {
    setExpandedBarcodes(prev => {
      const next = new Set(prev)
      if (next.has(barcode)) {
        next.delete(barcode)
      } else {
        next.add(barcode)
      }
      return next
    })
  }

  const expandAll = () => {
    const allBarcodes = combinedData.hierarchy
      .filter(item => item.children.length > 0)
      .map(item => item.Barcode)
    setExpandedBarcodes(new Set(allBarcodes))
  }

  const collapseAll = () => {
    setExpandedBarcodes(new Set())
  }

  // --- Cell renderers ---
  const renderWeightCell = (item) => {
    const tekla = item.TeklaWeight != null
    const weight = tekla ? item.TeklaWeight : item.Weight
    return (
      <span className={tekla ? 'text-blue-600' : 'text-gray-600'} title={tekla ? 'From Tekla inventory' : ''}>
        {formatWeight(weight)}
      </span>
    )
  }

  const renderSendTypeCell = (item) => {
    if (!onUpdateSendType) {
      return <SendTypeBadge sendType={item.SendType} />
    }
    return (
      <select
        value={item.SendType || 'Raw'}
        onChange={(e) => onUpdateSendType(item.SubOutItemID, e.target.value)}
        className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {sendTypeOptions.map(opt => (
          <option key={opt} value={opt}>{formatSendType(opt)}</option>
        ))}
      </select>
    )
  }

  const renderPullStatusCell = (item) => {
    if (item.SourceTable !== 'PullList') return null
    if (!onUpdatePullListSource || !pullStatuses?.length) {
      const statusConfig = pullStatuses?.find(s => s.ConfigValue === item.PullStatus)
      return <span className="text-xs text-gray-600">{statusConfig?.ConfigDesc || (item.PullStatus ?? '-')}</span>
    }
    return (
      <select
        value={item.PullStatus ?? ''}
        onChange={(e) => onUpdatePullListSource(item.SourceID, { pullStatus: e.target.value === '' ? null : parseInt(e.target.value) })}
        className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">-</option>
        {pullStatuses.map(s => (
          <option key={s.ConfigValue} value={s.ConfigValue}>{s.ConfigDesc}</option>
        ))}
      </select>
    )
  }

  const renderRMNumberCell = (item) => {
    if (item.SourceTable !== 'PullList') return null
    if (!onUpdatePullListSource) {
      return <span className="text-xs text-gray-600">{item.RMNumber || '-'}</span>
    }

    const isEditing = editingRMNumber[item.SourceID] !== undefined
    const editValue = editingRMNumber[item.SourceID]

    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditingRMNumber(prev => ({ ...prev, [item.SourceID]: e.target.value }))}
          onBlur={() => {
            if (editValue !== (item.RMNumber || '')) {
              onUpdatePullListSource(item.SourceID, { rmNumber: editValue || null })
            }
            setEditingRMNumber(prev => { const next = { ...prev }; delete next[item.SourceID]; return next })
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur()
            if (e.key === 'Escape') {
              setEditingRMNumber(prev => { const next = { ...prev }; delete next[item.SourceID]; return next })
            }
          }}
          autoFocus
          className="text-xs border border-blue-300 rounded px-1.5 py-0.5 w-24 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )
    }

    return (
      <span
        onClick={() => setEditingRMNumber(prev => ({ ...prev, [item.SourceID]: item.RMNumber || '' }))}
        className="text-xs text-gray-600 cursor-pointer hover:text-blue-600 hover:underline min-w-[2rem] inline-block"
        title="Click to edit"
      >
        {item.RMNumber || '-'}
      </span>
    )
  }

  const renderAssignmentCells = (item) => (
    <>
      <td className="px-3 py-3 text-xs text-gray-500">
        {item.PalletNumber || (item.PalletID ? `#${item.PalletID}` : '-')}
      </td>
      <td className="px-3 py-3 text-xs text-gray-500">
        {item.LoadNumber || (item.LoadID ? `#${item.LoadID}` : '-')}
      </td>
    </>
  )

  // --- Multi-select helpers for PullList tab ---
  const pullListFilteredItems = allFilteredItems.filter(item => item.SourceTable === 'PullList')
  const allPullListSelected = pullListFilteredItems.length > 0 && pullListFilteredItems.every(item => selectedPullListIds.has(item.SourceID))

  const togglePullListSelect = (sourceId) => {
    setSelectedPullListIds(prev => {
      const next = new Set(prev)
      if (next.has(sourceId)) next.delete(sourceId)
      else next.add(sourceId)
      return next
    })
  }

  const toggleSelectAllPullList = () => {
    if (allPullListSelected) {
      setSelectedPullListIds(new Set())
    } else {
      setSelectedPullListIds(new Set(pullListFilteredItems.map(item => item.SourceID)))
    }
  }

  const handleBulkPullStatusChange = (pullStatus) => {
    if (selectedPullListIds.size === 0 || !onBulkUpdatePullListStatus) return
    onBulkUpdatePullListStatus(Array.from(selectedPullListIds), pullStatus === '' ? null : parseInt(pullStatus))
    setSelectedPullListIds(new Set())
  }

  const renderBulkActionBar = () => {
    if (selectedPullListIds.size === 0 || !onBulkUpdatePullListStatus) return null
    return (
      <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="text-sm font-medium text-blue-800">{selectedPullListIds.size} selected</span>
        <span className="text-gray-300">|</span>
        <label className="text-sm text-gray-600">Set Pull Status:</label>
        <select
          onChange={(e) => handleBulkPullStatusChange(e.target.value)}
          defaultValue=""
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>Choose...</option>
          {(pullStatuses || []).map(s => (
            <option key={s.ConfigValue} value={s.ConfigValue}>{s.ConfigDesc}</option>
          ))}
        </select>
        <button
          onClick={() => setSelectedPullListIds(new Set())}
          className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
        >
          Clear selection
        </button>
      </div>
    )
  }

  // --- Multi-select helpers for LongShapes/Parts tabs ---
  const currentTabFilteredItems = sortedItems
  const allTabItemsSelected = currentTabFilteredItems.length > 0 && currentTabFilteredItems.every(item => selectedItemIds.has(item.SubOutItemID))

  const toggleItemSelect = (itemId) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const toggleSelectAllItems = () => {
    if (allTabItemsSelected) {
      setSelectedItemIds(new Set())
    } else {
      setSelectedItemIds(new Set(currentTabFilteredItems.map(item => item.SubOutItemID)))
    }
  }

  const handleBulkSendTypeChange = (sendType) => {
    if (selectedItemIds.size === 0 || !onUpdateSendType) return
    selectedItemIds.forEach(id => onUpdateSendType(id, sendType))
    setSelectedItemIds(new Set())
  }

  const renderBulkSendTypeBar = () => {
    if (selectedItemIds.size === 0 || !onUpdateSendType) return null
    return (
      <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="text-sm font-medium text-blue-800">{selectedItemIds.size} selected</span>
        <span className="text-gray-300">|</span>
        <label className="text-sm text-gray-600">Set Send Type:</label>
        <select
          onChange={(e) => handleBulkSendTypeChange(e.target.value)}
          defaultValue=""
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="" disabled>Choose...</option>
          {sendTypeOptions.map(opt => (
            <option key={opt} value={opt}>{formatSendType(opt)}</option>
          ))}
        </select>
        <button
          onClick={() => setSelectedItemIds(new Set())}
          className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
        >
          Clear selection
        </button>
      </div>
    )
  }

  // --- Table renderers ---
  const renderStandardTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-2 py-3">
              <input
                type="checkbox"
                checked={activeTab === 'PullList' ? allPullListSelected : allTabItemsSelected}
                onChange={activeTab === 'PullList' ? toggleSelectAllPullList : toggleSelectAllItems}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            {renderSortHeader('Type', 'SendType', { px: 'px-3' })}
            {activeTab === 'PullList' && (
              <>
                {renderSortHeader('Pull Status', 'PullStatus', { px: 'px-3' })}
                {renderSortHeader('RM#', 'RMNumber', { px: 'px-3' })}
              </>
            )}
            {activeTab !== 'PullList' && (
              <>
                {renderSortHeader('Main Mark', 'MainMark')}
                {renderSortHeader('Piece Mark', 'PieceMark')}
              </>
            )}
            {renderSortHeader('Shape', 'Shape')}
            {renderSortHeader('Size', 'Dimension')}
            {renderSortHeader('Grade', 'Grade')}
            {renderSortHeader('Length', 'Length')}
            {renderSortHeader('Weight', 'Weight')}
            {renderSortHeader('Qty', 'Quantity', { center: true })}
            {renderSortHeader('Pallet', 'PalletNumber', { px: 'px-3' })}
            {renderSortHeader('Load', 'LoadNumber', { px: 'px-3' })}
            {renderSortHeader('Status', 'Status')}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedItems.map(item => {
            const isAssigned = !!(item.PalletID || item.LoadID)
            const rowStrike = isAssigned ? 'line-through text-gray-400' : ''
            return (
            <tr key={item.SubOutItemID} className={clsx('hover:bg-gray-50', isAssigned && 'bg-gray-50/50', activeTab === 'PullList' ? selectedPullListIds.has(item.SourceID) && 'bg-blue-50' : selectedItemIds.has(item.SubOutItemID) && 'bg-blue-50')}>
              <td className="w-10 px-2 py-3">
                <input
                  type="checkbox"
                  checked={activeTab === 'PullList' ? selectedPullListIds.has(item.SourceID) : selectedItemIds.has(item.SubOutItemID)}
                  onChange={() => activeTab === 'PullList' ? togglePullListSelect(item.SourceID) : toggleItemSelect(item.SubOutItemID)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-3 py-3">{renderSendTypeCell(item)}</td>
              {activeTab === 'PullList' && (
                <>
                  <td className="px-3 py-3">{renderPullStatusCell(item)}</td>
                  <td className="px-3 py-3">{renderRMNumberCell(item)}</td>
                </>
              )}
              {activeTab !== 'PullList' && (
                <>
                  <td className={clsx('px-4 py-3 text-sm', rowStrike || 'text-gray-900')}>{item.MainMark || '-'}</td>
                  <td className={clsx('px-4 py-3 text-sm', rowStrike || 'text-gray-900')}>{item.PieceMark || '-'}</td>
                </>
              )}
              <td className={clsx('px-4 py-3 text-sm', rowStrike || 'text-gray-900')}>{item.Shape || '-'}</td>
              <td className={clsx('px-4 py-3 text-sm', rowStrike || 'text-gray-900')}>{item.Dimension || '-'}</td>
              <td className={clsx('px-4 py-3 text-sm', rowStrike || 'text-gray-900')}>{item.Grade || '-'}</td>
              <td className={clsx('px-4 py-3 text-sm', rowStrike || 'text-gray-900')}>{item.Length || '-'}</td>
              <td className={clsx('px-4 py-3 text-sm', isAssigned && 'line-through')}>{renderWeightCell(item)}</td>
              <td className={clsx('px-4 py-3 text-sm text-center', isAssigned && 'line-through text-gray-400')}>
                <span className="font-medium">{item.Quantity || 0}</span>
                <span className={isAssigned ? 'text-gray-400' : 'text-gray-400'}>/{item.QuantitySent || 0}/{item.QuantityReceived || 0}</span>
              </td>
              {renderAssignmentCells(item)}
              <td className="px-4 py-3">
                <StatusBadge status={item.Status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {activeTab !== 'PullList' && (
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item.SubOutItemID)}
                    disabled={isDeleting}
                    className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const renderCombinedTable = () => {
    const { hierarchy, orphanLongShapes } = combinedData

    if (hierarchy.length === 0 && orphanLongShapes.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No PullList or LongShapes items to combine
        </div>
      )
    }

    return (
      <>
        <div className="flex gap-2 mb-3">
          <button onClick={expandAll} className="text-sm text-blue-600 hover:text-blue-800">
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={collapseAll} className="text-sm text-blue-600 hover:text-blue-800">
            Collapse All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-2 py-3"></th>
                {renderSortHeader('Type', 'SendType', { px: 'px-3' })}
                {renderSortHeader('Pull Status', 'PullStatus', { px: 'px-3' })}
                {renderSortHeader('RM#', 'RMNumber', { px: 'px-3' })}
                {renderSortHeader('Barcode', 'Barcode')}
                {renderSortHeader('Main Mark', 'MainMark')}
                {renderSortHeader('Piece Mark', 'PieceMark')}
                {renderSortHeader('Shape', 'Shape')}
                {renderSortHeader('Size', 'Dimension')}
                {renderSortHeader('Grade', 'Grade')}
                {renderSortHeader('Length', 'Length')}
                {renderSortHeader('Weight', 'Weight')}
                {renderSortHeader('Qty', 'Quantity', { center: true })}
                {renderSortHeader('Pallet', 'PalletNumber', { px: 'px-3' })}
                {renderSortHeader('Load', 'LoadNumber', { px: 'px-3' })}
                {renderSortHeader('Status', 'Status')}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hierarchy.map(pullItem => {
                const isExpanded = expandedBarcodes.has(pullItem.Barcode)
                const hasChildren = pullItem.children.length > 0
                const pullAssigned = !!(pullItem.PalletID || pullItem.LoadID)
                const pullStrike = pullAssigned ? 'line-through text-gray-400' : ''

                return (
                  <Fragment key={pullItem.SubOutItemID}>
                    <tr className={clsx('hover:bg-blue-100', pullAssigned ? 'bg-gray-50/50' : 'bg-blue-50')}>
                      <td className="px-2 py-3">
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpand(pullItem.Barcode)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-3">{renderSendTypeCell(pullItem)}</td>
                      <td className="px-3 py-3">{renderPullStatusCell(pullItem)}</td>
                      <td className="px-3 py-3">{renderRMNumberCell(pullItem)}</td>
                      <td className={clsx('px-4 py-3 text-sm font-medium', pullAssigned ? 'line-through text-gray-400' : 'text-blue-800')}>
                        {pullItem.Barcode || '-'}
                        {hasChildren && (
                          <span className={clsx('ml-2 text-xs', pullAssigned ? 'text-gray-400' : 'text-blue-600')}>({pullItem.children.length} shapes)</span>
                        )}
                      </td>
                      <td className={clsx('px-4 py-3 text-sm', pullStrike || 'text-gray-500')}>-</td>
                      <td className={clsx('px-4 py-3 text-sm', pullStrike || 'text-gray-500')}>-</td>
                      <td className={clsx('px-4 py-3 text-sm font-medium', pullStrike || 'text-gray-900')}>{pullItem.Shape || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', pullStrike || 'text-gray-900')}>{pullItem.Dimension || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', pullStrike || 'text-gray-900')}>{pullItem.Grade || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', pullStrike || 'text-gray-900')}>{pullItem.Length || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', pullAssigned && 'line-through')}>{renderWeightCell(pullItem)}</td>
                      <td className={clsx('px-4 py-3 text-sm text-center', pullAssigned && 'line-through text-gray-400')}>
                        <span className="font-medium">{pullItem.Quantity || 0}</span>
                        <span className="text-gray-400">/{pullItem.QuantitySent || 0}/{pullItem.QuantityReceived || 0}</span>
                      </td>
                      {renderAssignmentCells(pullItem)}
                      <td className="px-4 py-3"><StatusBadge status={pullItem.Status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onDelete(pullItem.SubOutItemID)} disabled={isDeleting} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50" title="Remove">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && pullItem.children.map(child => {
                      const childAssigned = !!(child.PalletID || child.LoadID)
                      const childStrike = childAssigned ? 'line-through text-gray-400' : ''
                      return (
                      <tr key={child.SubOutItemID} className={clsx('hover:bg-gray-100', childAssigned ? 'bg-gray-100/50' : 'bg-gray-50')}>
                        <td className="px-2 py-3"></td>
                        <td className="px-3 py-3">{renderSendTypeCell(child)}</td>
                        <td className="px-3 py-3"></td>
                        <td className="px-3 py-3"></td>
                        <td className={clsx('px-4 py-3 text-sm pl-8', childAssigned ? 'line-through text-gray-400' : 'text-gray-400')}>
                          <span className="text-gray-300">└</span> {child.Barcode || '-'}
                        </td>
                        <td className={clsx('px-4 py-3 text-sm', childStrike || 'text-gray-900')}>{child.MainMark || '-'}</td>
                        <td className={clsx('px-4 py-3 text-sm', childStrike || 'text-gray-900')}>{child.PieceMark || '-'}</td>
                        <td className={clsx('px-4 py-3 text-sm', childStrike || 'text-gray-900')}>{child.Shape || '-'}</td>
                        <td className={clsx('px-4 py-3 text-sm', childStrike || 'text-gray-900')}>{child.Dimension || '-'}</td>
                        <td className={clsx('px-4 py-3 text-sm', childStrike || 'text-gray-900')}>{child.Grade || '-'}</td>
                        <td className={clsx('px-4 py-3 text-sm', childStrike || 'text-gray-900')}>{child.Length || '-'}</td>
                        <td className={clsx('px-4 py-3 text-sm', childAssigned && 'line-through')}>{renderWeightCell(child)}</td>
                        <td className={clsx('px-4 py-3 text-sm text-center', childAssigned && 'line-through text-gray-400')}>
                          <span className="font-medium">{child.Quantity || 0}</span>
                          <span className="text-gray-400">/{child.QuantitySent || 0}/{child.QuantityReceived || 0}</span>
                        </td>
                        {renderAssignmentCells(child)}
                        <td className="px-4 py-3"><StatusBadge status={child.Status} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => onEdit(child)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(child.SubOutItemID)} disabled={isDeleting} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50" title="Remove">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      )
                    })}
                  </Fragment>
                )
              })}

              {orphanLongShapes.length > 0 && (
                <>
                  <tr className="bg-yellow-50">
                    <td colSpan="17" className="px-4 py-2 text-sm font-medium text-yellow-800">
                      Unmatched LongShapes ({orphanLongShapes.length})
                    </td>
                  </tr>
                  {orphanLongShapes.map(item => {
                    const oAssigned = !!(item.PalletID || item.LoadID)
                    const oStrike = oAssigned ? 'line-through text-gray-400' : ''
                    return (
                    <tr key={item.SubOutItemID} className={clsx('hover:bg-gray-50', oAssigned && 'bg-gray-50/50')}>
                      <td className="px-2 py-3"></td>
                      <td className="px-3 py-3">{renderSendTypeCell(item)}</td>
                      <td className="px-3 py-3"></td>
                      <td className="px-3 py-3"></td>
                      <td className={clsx('px-4 py-3 text-sm', oStrike || 'text-gray-400')}>{item.Barcode || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', oStrike || 'text-gray-900')}>{item.MainMark || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', oStrike || 'text-gray-900')}>{item.PieceMark || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', oStrike || 'text-gray-900')}>{item.Shape || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', oStrike || 'text-gray-900')}>{item.Dimension || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', oStrike || 'text-gray-900')}>{item.Grade || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', oStrike || 'text-gray-900')}>{item.Length || '-'}</td>
                      <td className={clsx('px-4 py-3 text-sm', oAssigned && 'line-through')}>{renderWeightCell(item)}</td>
                      <td className={clsx('px-4 py-3 text-sm text-center', oAssigned && 'line-through text-gray-400')}>
                        <span className="font-medium">{item.Quantity || 0}</span>
                        <span className="text-gray-400">/{item.QuantitySent || 0}/{item.QuantityReceived || 0}</span>
                      </td>
                      {renderAssignmentCells(item)}
                      <td className="px-4 py-3"><StatusBadge status={item.Status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete(item.SubOutItemID)} disabled={isDeleting} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50" title="Remove">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    setSelectedPullListIds(new Set())
    setSelectedItemIds(new Set())
    setSortConfig({ key: null, direction: 'asc' })
  }

  return (
    <div>
      {/* Filter bar + Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="border-b border-gray-200 flex-1">
          <nav className="flex gap-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label} ({getCounts(tab.key)})
              </button>
            ))}
          </nav>
        </div>
        <div className="ml-4 flex-shrink-0 flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search items..."
              className="text-sm border border-gray-300 rounded-md pl-2 pr-7 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <span className="text-xs font-bold">✕</span>
              </button>
            )}
          </div>
          <select
            value={sendTypeFilter}
            onChange={(e) => setSendTypeFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Send Types</option>
            {sendTypeOptions.map(opt => (
              <option key={opt} value={opt}>{formatSendType(opt)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk action bars */}
      {activeTab === 'PullList' && renderBulkActionBar()}
      {(activeTab === 'LongShapes' || activeTab === 'Parts') && renderBulkSendTypeBar()}

      {/* Table Content */}
      {activeTab === 'Combined' ? (
        renderCombinedTable()
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {activeTab} items {searchFilter ? 'match your search' : 'added yet'}
        </div>
      ) : (
        renderStandardTable()
      )}

      {/* Summary */}
      {items && items.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Total: {allFilteredItems.length}{(sendTypeFilter || searchFilter) ? ` (filtered from ${items.length})` : ''} items |
          {(() => {
            const tabItems = activeTab === 'Combined'
              ? allFilteredItems.filter(i => i.SourceTable === 'PullList' || i.SourceTable === 'LongShapes')
              : allFilteredItems.filter(i => i.SourceTable === activeTab)
            const totalWeight = tabItems.reduce((sum, i) => sum + ((i.TeklaWeight != null ? i.TeklaWeight : i.Weight) || 0) * (i.Quantity || 1), 0)
            return totalWeight > 0 ? <>{' '}Weight: <span className="font-medium">{formatWeight(totalWeight)}</span> |</> : null
          })()}
          {' '}Qty columns: Total / Sent / Received
          {sortConfig.key && (
            <>
              {' | '}
              Sorted by: <span className="font-medium">{sortConfig.key}</span> {sortConfig.direction === 'asc' ? '▲' : '▼'}
              <button onClick={() => setSortConfig({ key: null, direction: 'asc' })} className="ml-1 text-blue-500 hover:text-blue-700">clear</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
