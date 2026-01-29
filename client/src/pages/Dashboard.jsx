import { useState } from 'react'
import { LayoutGrid, List, AlertTriangle, Filter } from 'lucide-react'
import clsx from 'clsx'
import { useGroupedSubOuts } from '../hooks/useSubOuts'
import { useDashboardStats } from '../hooks/useDashboard'
import { useVendors } from '../hooks/useVendors'
import JobGroup from '../components/subouts/JobGroup'
import Card from '../components/common/Card'
import Select from '../components/common/Select'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useApp } from '../context/AppContext'
import { statusOptions } from '../utils/statusColors'

export default function Dashboard() {
  const { viewMode, setViewMode } = useApp()
  const { data: groupedData, isLoading, error } = useGroupedSubOuts()
  const { data: statsData } = useDashboardStats()
  const { data: vendorsData } = useVendors()

  const [filters, setFilters] = useState({
    jobCode: '',
    vendorId: '',
    status: '',
    actionItemsOnly: false
  })

  const stats = statsData?.data || {}
  const vendors = vendorsData?.data || []
  const jobs = groupedData?.data || []

  // Filter jobs and their sub outs
  const filteredJobs = jobs
    .map(job => {
      let subOuts = job.subOuts || []

      if (filters.vendorId) {
        subOuts = subOuts.filter(s => s.VendorID === parseInt(filters.vendorId))
      }
      if (filters.status) {
        subOuts = subOuts.filter(s => s.Status === filters.status)
      }
      if (filters.actionItemsOnly) {
        const now = new Date()
        subOuts = subOuts.filter(s => {
          const dateToLeave = s.DateToLeaveMFC ? new Date(s.DateToLeaveMFC) : null
          const dateToShip = s.DateToShipFromSub ? new Date(s.DateToShipFromSub) : null
          const overdueSend = dateToLeave && dateToLeave < now && s.LoadsShippedFromMFC < s.LoadsToShipFromMFC
          const overdueReceive = dateToShip && dateToShip < now && s.LoadsShippedFromSub < s.LoadsToShipFromSub
          const hasMissingSteel = s.MissingSteel
          return overdueSend || overdueReceive || hasMissingSteel
        })
      }

      return { ...job, subOuts }
    })
    .filter(job => {
      if (filters.jobCode && job.JobCode !== parseInt(filters.jobCode)) {
        return false
      }
      return job.subOuts.length > 0
    })

  const vendorOptions = vendors.map(v => ({ value: v.VendorID, label: v.VendorName }))
  const statusOpts = statusOptions.map(s => ({ value: s, label: s }))
  const jobOptions = jobs.map(j => ({ value: j.JobCode, label: j.JobDescription || `Job ${j.JobCode}` }))

  if (isLoading) {
    return <LoadingSpinner className="py-20" size="lg" />
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Error loading data: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.TotalActive || 0}</div>
          <div className="text-sm text-gray-500">Total Active</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.PendingShipment || 0}</div>
          <div className="text-sm text-gray-500">Pending Shipment</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.InProgress || 0}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.ActionRequired || 0}</div>
          <div className="text-sm text-gray-500">Action Required</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.CompleteThisMonth || 0}</div>
          <div className="text-sm text-gray-500">Complete This Month</div>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-48">
            <Select
              value={filters.jobCode}
              onChange={(e) => setFilters(f => ({ ...f, jobCode: e.target.value }))}
              options={jobOptions}
              placeholder="All Jobs"
            />
          </div>
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.actionItemsOnly}
              onChange={(e) => setFilters(f => ({ ...f, actionItemsOnly: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              <AlertTriangle className="inline w-4 h-4 mr-1 text-orange-500" />
              Action Items Only
            </span>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">View:</span>
            <button
              onClick={() => setViewMode('cards')}
              className={clsx(
                'p-2 rounded',
                viewMode === 'cards' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={clsx(
                'p-2 rounded',
                viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No sub outs found matching the filters.</p>
        </div>
      ) : (
        <div>
          {filteredJobs.map(job => (
            <JobGroup key={job.JobCode} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
