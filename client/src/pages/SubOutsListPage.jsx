import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Filter } from 'lucide-react'
import { useSubOuts } from '../hooks/useSubOuts'
import { useVendors } from '../hooks/useVendors'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Select from '../components/common/Select'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate, formatWeight, formatLoadsProgress } from '../utils/formatters'
import { statusOptions, getRowColor } from '../utils/statusColors'
import clsx from 'clsx'

export default function SubOutsListPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    vendorId: searchParams.get('vendorId') || ''
  })

  const { data, isLoading, error } = useSubOuts(filters)
  const { data: vendorsData } = useVendors()

  const subOuts = data?.data || []
  const vendors = vendorsData?.data || []

  const vendorOptions = vendors.map(v => ({ value: v.VendorID, label: v.VendorName }))
  const statusOpts = statusOptions.map(s => ({ value: s, label: s }))

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All SubOuts</h1>
        <Link to="/subouts/new">
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            New SubOut
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="w-48">
            <Select
              value={filters.vendorId}
              onChange={(e) => setFilters(f => ({ ...f, vendorId: e.target.value }))}
              options={vendorOptions}
              placeholder="All Vendors"
            />
          </div>
          <div className="w-40">
            <Select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              options={statusOpts}
              placeholder="All Status"
            />
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {subOuts.length} results
          </span>
        </div>
      </Card>

      {error ? (
        <div className="text-center py-10 text-red-600">
          Error: {error.message}
        </div>
      ) : subOuts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No sub outs found.</p>
          <Link to="/subouts/new" className="text-blue-600 hover:underline">
            Create the first one
          </Link>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave MFC</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Loads Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship From Sub</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Loads In</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pieces</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subOuts.map(subOut => (
                  <tr
                    key={subOut.SubOutID}
                    className={clsx('hover:bg-gray-50 cursor-pointer', getRowColor(subOut))}
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/subouts/${subOut.SubOutID}`} className="text-blue-600 hover:underline">
                        {subOut.JobDescription || `Job ${subOut.JobCode}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <Link to={`/subouts/${subOut.SubOutID}`} className="text-blue-600 hover:underline">
                        {subOut.Lot}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{subOut.Description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{subOut.SubFabricator || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(subOut.DateToLeaveMFC)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {formatLoadsProgress(subOut.LoadsShippedFromMFC, subOut.LoadsToShipFromMFC)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(subOut.DateToShipFromSub)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {formatLoadsProgress(subOut.LoadsShippedFromSub, subOut.LoadsToShipFromSub)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{formatWeight(subOut.Weight)}</td>
                    <td className="px-4 py-3 text-sm text-center">{subOut.MajorPieces || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={subOut.Status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
