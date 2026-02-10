import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, RotateCcw } from 'lucide-react'
import { useSubOuts, useUpdateStatus } from '../hooks/useSubOuts'
import { useVendors } from '../hooks/useVendors'
import Card from '../components/common/Card'
import Select from '../components/common/Select'
import StatusBadge from '../components/common/StatusBadge'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate, formatWeight, formatLoadsProgress } from '../utils/formatters'

export default function ArchivedPage() {
  const { data, isLoading, error } = useSubOuts({ archivedOnly: true })
  const { data: vendorsData } = useVendors()
  const updateStatusMutation = useUpdateStatus()

  const [vendorFilter, setVendorFilter] = useState('')
  const [reopenTarget, setReopenTarget] = useState(null)

  const allSubOuts = data?.data || []
  const vendors = vendorsData?.data || []

  const subOuts = vendorFilter
    ? allSubOuts.filter(s => s.VendorID === parseInt(vendorFilter))
    : allSubOuts

  const vendorOptions = vendors.map(v => ({ value: v.VendorID, label: v.VendorName }))

  const handleReopen = async () => {
    if (!reopenTarget) return
    try {
      await updateStatusMutation.mutateAsync({ id: reopenTarget.SubOutID, status: 'Received' })
      setReopenTarget(null)
    } catch (err) {
      alert('Failed to reopen: ' + err.message)
    }
  }

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Archive className="w-6 h-6 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Archived SubOuts</h1>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-48">
            <Select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              options={vendorOptions}
              placeholder="All Vendors"
            />
          </div>
          <span className="text-sm text-gray-500 ml-auto">
            {subOuts.length} archived
          </span>
        </div>
      </Card>

      {error ? (
        <div className="text-center py-10 text-red-600">
          Error: {error.message}
        </div>
      ) : subOuts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Archive className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No archived sub outs.</p>
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pieces</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subOuts.map(subOut => (
                  <tr key={subOut.SubOutID} className="bg-green-50 hover:bg-green-100">
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
                    <td className="px-4 py-3 text-sm text-right">{formatWeight(subOut.Weight)}</td>
                    <td className="px-4 py-3 text-sm text-center">{subOut.MajorPieces || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={subOut.Status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setReopenTarget(subOut)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reopen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reopen Confirmation Modal */}
      <Modal
        isOpen={!!reopenTarget}
        onClose={() => setReopenTarget(null)}
        title="Reopen SubOut"
        size="sm"
      >
        <p className="text-gray-600">
          Are you sure you want to reopen <strong>{reopenTarget?.Lot}</strong>?
          Its status will be set to "Received" and it will appear in active views.
        </p>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setReopenTarget(null)}>
            Cancel
          </Button>
          <Button
            onClick={handleReopen}
            loading={updateStatusMutation.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reopen
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
