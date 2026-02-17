import { useState, useMemo, Fragment } from 'react'
import { Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'
import SendTypeBadge from './SendTypeBadge'
import { sendTypeOptions } from '../../utils/statusColors'
import { formatSendType } from '../../utils/formatters'

export default function ItemsTable({ items, onDelete, onEdit, onUpdateSendType, onUpdatePullListSource, pullStatuses, isDeleting }) {
  const [activeTab, setActiveTab] = useState('LongShapes')
  const [expandedBarcodes, setExpandedBarcodes] = useState(new Set())
  const [sendTypeFilter, setSendTypeFilter] = useState('')
  const [editingRMNumber, setEditingRMNumber] = useState({})

  const tabs = [
    { key: 'LongShapes', label: 'LongShapes' },
    { key: 'Parts', label: 'Parts' },
    { key: 'PullList', label: 'PullList/Raw' },
    { key: 'Combined', label: 'Combined' }
  ]

  const allFilteredItems = useMemo(() => {
    let result = items || []
    if (sendTypeFilter) {
      result = result.filter(item => item.SendType === sendTypeFilter)
    }
    return result
  }, [items, sendTypeFilter])

  const filteredItems = allFilteredItems.filter(item => item.SourceTable === activeTab)

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

    const hierarchy = pullListItems.map(pullItem => ({
      ...pullItem,
      children: pullItem.Barcode ? (longShapesByBarcode[pullItem.Barcode] || []) : []
    }))

    const usedBarcodes = new Set(pullListItems.map(p => p.Barcode).filter(Boolean))
    const orphanLongShapes = longShapesItems.filter(item => !item.Barcode || !usedBarcodes.has(item.Barcode))

    return { hierarchy, orphanLongShapes }
  }, [allFilteredItems])

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

  const renderStandardTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            {activeTab === 'PullList' && (
              <>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pull Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">RM#</th>
              </>
            )}
            {activeTab !== 'PullList' && (
              <>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Main Mark</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Piece Mark</th>
              </>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shape</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Length</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pallet</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredItems.map(item => (
            <tr key={item.SubOutItemID} className="hover:bg-gray-50">
              <td className="px-3 py-3">{renderSendTypeCell(item)}</td>
              {activeTab === 'PullList' && (
                <>
                  <td className="px-3 py-3">{renderPullStatusCell(item)}</td>
                  <td className="px-3 py-3">{renderRMNumberCell(item)}</td>
                </>
              )}
              {activeTab !== 'PullList' && (
                <>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.MainMark || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.PieceMark || '-'}</td>
                </>
              )}
              <td className="px-4 py-3 text-sm text-gray-900">{item.Shape || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.Dimension || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.Grade || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.Length || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-900 text-center">
                <span className="font-medium">{item.Quantity || 0}</span>
                <span className="text-gray-400">/{item.QuantitySent || 0}/{item.QuantityReceived || 0}</span>
              </td>
              {renderAssignmentCells(item)}
              <td className="px-4 py-3">
                <StatusBadge status={item.Status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
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
          ))}
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
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pull Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">RM#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Main Mark</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Piece Mark</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shape</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Length</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pallet</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hierarchy.map(pullItem => {
                const isExpanded = expandedBarcodes.has(pullItem.Barcode)
                const hasChildren = pullItem.children.length > 0

                return (
                  <Fragment key={pullItem.SubOutItemID}>
                    <tr className="bg-blue-50 hover:bg-blue-100">
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
                      <td className="px-4 py-3 text-sm font-medium text-blue-800">
                        {pullItem.Barcode || '-'}
                        {hasChildren && (
                          <span className="ml-2 text-xs text-blue-600">({pullItem.children.length} shapes)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{pullItem.Shape || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{pullItem.Dimension || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{pullItem.Grade || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{pullItem.Length || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        <span className="font-medium">{pullItem.Quantity || 0}</span>
                        <span className="text-gray-400">/{pullItem.QuantitySent || 0}/{pullItem.QuantityReceived || 0}</span>
                      </td>
                      {renderAssignmentCells(pullItem)}
                      <td className="px-4 py-3"><StatusBadge status={pullItem.Status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onEdit(pullItem)} className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDelete(pullItem.SubOutItemID)} disabled={isDeleting} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50" title="Remove">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && pullItem.children.map(child => (
                      <tr key={child.SubOutItemID} className="bg-gray-50 hover:bg-gray-100">
                        <td className="px-2 py-3"></td>
                        <td className="px-3 py-3">{renderSendTypeCell(child)}</td>
                        <td className="px-3 py-3"></td>
                        <td className="px-3 py-3"></td>
                        <td className="px-4 py-3 text-sm text-gray-400 pl-8">
                          <span className="text-gray-300">└</span> {child.Barcode || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{child.MainMark || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{child.PieceMark || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{child.Shape || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{child.Dimension || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{child.Grade || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{child.Length || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">
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
                    ))}
                  </Fragment>
                )
              })}

              {orphanLongShapes.length > 0 && (
                <>
                  <tr className="bg-yellow-50">
                    <td colSpan="16" className="px-4 py-2 text-sm font-medium text-yellow-800">
                      Unmatched LongShapes ({orphanLongShapes.length})
                    </td>
                  </tr>
                  {orphanLongShapes.map(item => (
                    <tr key={item.SubOutItemID} className="hover:bg-gray-50">
                      <td className="px-2 py-3"></td>
                      <td className="px-3 py-3">{renderSendTypeCell(item)}</td>
                      <td className="px-3 py-3"></td>
                      <td className="px-3 py-3"></td>
                      <td className="px-4 py-3 text-sm text-gray-400">{item.Barcode || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.MainMark || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.PieceMark || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.Shape || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.Dimension || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.Grade || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.Length || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
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
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </>
    )
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
                onClick={() => setActiveTab(tab.key)}
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
        <div className="ml-4 flex-shrink-0">
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

      {/* Table Content */}
      {activeTab === 'Combined' ? (
        renderCombinedTable()
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {activeTab} items added yet
        </div>
      ) : (
        renderStandardTable()
      )}

      {/* Summary */}
      {items && items.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Total: {allFilteredItems.length}{sendTypeFilter ? ` (filtered from ${items.length})` : ''} items |
          Qty columns: Total / Sent / Received
        </div>
      )}
    </div>
  )
}
