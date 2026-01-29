import { useState, useMemo, Fragment } from 'react'
import { Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import Button from '../common/Button'
import StatusBadge from '../common/StatusBadge'

export default function ItemsTable({ items, onDelete, onEdit, isDeleting }) {
  const [activeTab, setActiveTab] = useState('LongShapes')
  const [expandedBarcodes, setExpandedBarcodes] = useState(new Set())

  const tabs = [
    { key: 'LongShapes', label: 'LongShapes' },
    { key: 'Parts', label: 'Parts' },
    { key: 'PullList', label: 'PullList/Raw' },
    { key: 'Combined', label: 'Combined' }
  ]

  const filteredItems = items?.filter(item => item.SourceTable === activeTab) || []

  const getCounts = (sourceTable) => {
    if (sourceTable === 'Combined') {
      const pullListItems = items?.filter(item => item.SourceTable === 'PullList') || []
      const longShapesItems = items?.filter(item => item.SourceTable === 'LongShapes') || []
      return pullListItems.length + longShapesItems.length
    }
    return items?.filter(item => item.SourceTable === sourceTable).length || 0
  }

  // Build combined hierarchy: PullList -> LongShapes by Barcode
  const combinedData = useMemo(() => {
    if (!items) return []

    const pullListItems = items.filter(item => item.SourceTable === 'PullList')
    const longShapesItems = items.filter(item => item.SourceTable === 'LongShapes')

    // Group LongShapes by Barcode
    const longShapesByBarcode = {}
    longShapesItems.forEach(item => {
      if (item.Barcode) {
        if (!longShapesByBarcode[item.Barcode]) {
          longShapesByBarcode[item.Barcode] = []
        }
        longShapesByBarcode[item.Barcode].push(item)
      }
    })

    // Build hierarchy
    const hierarchy = pullListItems.map(pullItem => ({
      ...pullItem,
      children: pullItem.Barcode ? (longShapesByBarcode[pullItem.Barcode] || []) : []
    }))

    // Find orphan LongShapes (those without matching PullList barcode)
    const usedBarcodes = new Set(pullListItems.map(p => p.Barcode).filter(Boolean))
    const orphanLongShapes = longShapesItems.filter(item => !item.Barcode || !usedBarcodes.has(item.Barcode))

    return { hierarchy, orphanLongShapes }
  }, [items])

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

  const renderStandardTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredItems.map(item => (
            <tr key={item.SubOutItemID} className="hover:bg-gray-50">
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
        {/* Expand/Collapse buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={expandAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Collapse All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-2 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Main Mark</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Piece Mark</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shape</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Length</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* PullList items with their LongShapes children */}
              {hierarchy.map(pullItem => {
                const isExpanded = expandedBarcodes.has(pullItem.Barcode)
                const hasChildren = pullItem.children.length > 0

                return (
                  <Fragment key={pullItem.SubOutItemID}>
                    {/* PullList parent row */}
                    <tr className="bg-blue-50 hover:bg-blue-100">
                      <td className="px-2 py-3">
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpand(pullItem.Barcode)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-800">
                        {pullItem.Barcode || '-'}
                        {hasChildren && (
                          <span className="ml-2 text-xs text-blue-600">
                            ({pullItem.children.length} shapes)
                          </span>
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
                      <td className="px-4 py-3">
                        <StatusBadge status={pullItem.Status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onEdit(pullItem)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(pullItem.SubOutItemID)}
                            disabled={isDeleting}
                            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* LongShapes children rows */}
                    {isExpanded && pullItem.children.map(child => (
                      <tr key={child.SubOutItemID} className="bg-gray-50 hover:bg-gray-100">
                        <td className="px-2 py-3"></td>
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
                        <td className="px-4 py-3">
                          <StatusBadge status={child.Status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => onEdit(child)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(child.SubOutItemID)}
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
                  </Fragment>
                )
              })}

              {/* Orphan LongShapes (no matching PullList) */}
              {orphanLongShapes.length > 0 && (
                <>
                  <tr className="bg-yellow-50">
                    <td colSpan="11" className="px-4 py-2 text-sm font-medium text-yellow-800">
                      Unmatched LongShapes ({orphanLongShapes.length})
                    </td>
                  </tr>
                  {orphanLongShapes.map(item => (
                    <tr key={item.SubOutItemID} className="hover:bg-gray-50">
                      <td className="px-2 py-3"></td>
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label} ({getCounts(tab.key)})
            </button>
          ))}
        </nav>
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
          Total: {items.length} items |
          Qty columns: Total / Sent / Received
        </div>
      )}
    </div>
  )
}
