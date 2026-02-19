import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, List, AlertTriangle, Archive, ChevronDown, ChevronRight, AlertCircle, Building2, Clock, Phone, Mail, Users, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import { useGroupedSubOuts } from '../hooks/useSubOuts'
import { useDashboardStats, useActionItems, useVendorSummary, useRecentActivity } from '../hooks/useDashboard'
import { useFollowUps, useCompleteFollowUp } from '../hooks/useCommunications'
import { useVendors } from '../hooks/useVendors'
import JobGroup from '../components/subouts/JobGroup'
import Card from '../components/common/Card'
import StatusBadge from '../components/common/StatusBadge'
import Select from '../components/common/Select'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useApp } from '../context/AppContext'
import { statusOptions } from '../utils/statusColors'
import { formatDate, formatWeight, truncate } from '../utils/formatters'

function PanelHeader({ title, count, icon: Icon, color, open, onToggle, badge }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors rounded-lg"
    >
      <Icon className={clsx('w-4 h-4 flex-shrink-0', color)} />
      <span className="text-sm font-semibold text-gray-800">{title}</span>
      {count > 0 && (
        <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded-full', badge || 'bg-gray-100 text-gray-600')}>
          {count}
        </span>
      )}
      <div className="ml-auto">
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>
    </button>
  )
}

const actionTypeConfig = {
  'Overdue Send': { color: 'bg-red-500', textColor: 'text-red-700', label: 'Overdue Send' },
  'Overdue Receive': { color: 'bg-orange-500', textColor: 'text-orange-700', label: 'Overdue Receive' },
  'Missing Steel': { color: 'bg-pink-500', textColor: 'text-pink-700', label: 'Missing Steel' },
  'Other': { color: 'bg-gray-400', textColor: 'text-gray-600', label: 'Other' }
}

function timeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

const followUpTypeColors = {
  'Call': 'bg-blue-100 text-blue-700',
  'Email': 'bg-purple-100 text-purple-700',
  'Meeting': 'bg-green-100 text-green-700',
  'Quote': 'bg-yellow-100 text-yellow-700',
  'Other': 'bg-gray-100 text-gray-700'
}

export default function Dashboard() {
  const { viewMode, setViewMode } = useApp()

  const [filters, setFilters] = useState({
    jobCode: '',
    vendorId: '',
    status: '',
    actionItemsOnly: false,
    showArchived: false
  })

  const [panels, setPanels] = useState({
    actions: true,
    followUps: false,
    vendors: false,
    recent: false
  })

  const togglePanel = (key) => setPanels(p => ({ ...p, [key]: !p[key] }))

  const { data: groupedData, isLoading, error } = useGroupedSubOuts(
    filters.showArchived ? { includeArchived: true } : {}
  )
  const { data: statsData } = useDashboardStats()
  const { data: vendorsData } = useVendors()
  const { data: actionData } = useActionItems()
  const { data: vendorSummaryData } = useVendorSummary()
  const { data: recentData } = useRecentActivity(10)
  const { data: followUpsData } = useFollowUps()
  const completeFollowUpMutation = useCompleteFollowUp()

  const stats = statsData?.data || {}
  const vendors = vendorsData?.data || []
  const jobs = groupedData?.data || []
  const actionItems = actionData?.data || []
  const vendorSummary = vendorSummaryData?.data || []
  const recentItems = recentData?.data || []
  const followUps = followUpsData?.data || []

  const now = new Date()
  const overdueFollowUps = followUps.filter(f => f.FollowUpDate && new Date(f.FollowUpDate) < now)

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
        subOuts = subOuts.filter(s => {
          const dateToLeave = s.DateToLeaveMFC ? new Date(s.DateToLeaveMFC) : null
          const dateToShip = s.DateToShipFromSub ? new Date(s.DateToShipFromSub) : null
          const outShipped = s.OutboundDeliveredCount ?? s.LoadsShippedFromMFC
          const outTotal = s.OutboundLoadCount ?? s.LoadsToShipFromMFC
          const inShipped = s.InboundDeliveredCount ?? s.LoadsShippedFromSub
          const inTotal = s.InboundLoadCount ?? s.LoadsToShipFromSub
          const overdueSend = dateToLeave && dateToLeave < now && outShipped < outTotal
          const overdueReceive = dateToShip && dateToShip < now && inShipped < inTotal
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
          <div className="text-2xl font-bold text-green-600">{stats.Archived || 0}</div>
          <div className="text-sm text-gray-500">Archived</div>
        </Card>
      </div>

      {/* Panels */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 divide-y divide-gray-100">
        {/* Action Items */}
        <div>
          <PanelHeader
            title="Action Items"
            count={actionItems.length}
            icon={AlertCircle}
            color="text-red-500"
            badge="bg-red-100 text-red-700"
            open={panels.actions}
            onToggle={() => togglePanel('actions')}
          />
          {panels.actions && actionItems.length > 0 && (
            <div className="px-4 pb-3">
              <div className="space-y-1">
                {actionItems.map(item => {
                  const cfg = actionTypeConfig[item.ActionType] || actionTypeConfig.Other
                  return (
                    <Link
                      key={item.SubOutID}
                      to={`/subouts/${item.SubOutID}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <span className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', cfg.color)} />
                      <span className="text-sm font-medium text-gray-900 w-24 truncate">{item.Lot}</span>
                      <span className="text-sm text-gray-500 truncate flex-1">{item.SubFabricator || 'No vendor'}</span>
                      <span className={clsx('text-xs font-medium px-2 py-0.5 rounded', cfg.textColor, cfg.color.replace('bg-', 'bg-').replace('500', '100'))}>{cfg.label}</span>
                      <span className="text-xs text-gray-400 w-16 text-right">{formatDate(item.DateToLeaveMFC)}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
          {panels.actions && actionItems.length === 0 && (
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-400 text-center py-2">No action items - everything is on track</p>
            </div>
          )}
        </div>

        {/* Follow-Ups */}
        <div>
          <PanelHeader
            title="Pending Follow-Ups"
            count={followUps.length}
            icon={Phone}
            color="text-purple-500"
            badge={overdueFollowUps.length > 0 ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}
            open={panels.followUps}
            onToggle={() => togglePanel('followUps')}
          />
          {panels.followUps && followUps.length > 0 && (
            <div className="px-4 pb-3">
              <div className="space-y-1">
                {followUps.map(fu => {
                  const isOverdue = fu.FollowUpDate && new Date(fu.FollowUpDate) < now
                  const typeColor = followUpTypeColors[fu.FollowUpType] || followUpTypeColors.Other
                  return (
                    <div
                      key={fu.CommunicationLogID}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className={clsx('text-xs font-medium px-2 py-0.5 rounded', typeColor)}>
                        {fu.FollowUpType || 'Other'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate w-32">{fu.VendorName || 'Unknown'}</span>
                      <span className="text-sm text-gray-500 truncate flex-1">{truncate(fu.FollowUpNotes || fu.Summary, 60)}</span>
                      <span className={clsx('text-xs font-medium w-16 text-right', isOverdue ? 'text-red-600' : 'text-gray-400')}>
                        {formatDate(fu.FollowUpDate)}
                      </span>
                      <button
                        onClick={() => completeFollowUpMutation.mutate(fu.CommunicationLogID)}
                        className="flex-shrink-0 p-1 rounded hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors"
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {panels.followUps && followUps.length === 0 && (
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-400 text-center py-2">No pending follow-ups</p>
            </div>
          )}
        </div>

        {/* Vendor Summary */}
        <div>
          <PanelHeader
            title="Vendor Workload"
            count={vendorSummary.filter(v => v.TotalSubOuts > 0).length}
            icon={Building2}
            color="text-blue-500"
            badge="bg-blue-100 text-blue-700"
            open={panels.vendors}
            onToggle={() => togglePanel('vendors')}
          />
          {panels.vendors && (
            <div className="px-4 pb-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider">
                      <th className="text-left py-1.5 pr-4">Vendor</th>
                      <th className="text-center py-1.5 px-2">Active</th>
                      <th className="text-center py-1.5 px-2">Submitted</th>
                      <th className="text-center py-1.5 px-2">In Progress</th>
                      <th className="text-center py-1.5 px-2">Complete</th>
                      <th className="text-right py-1.5 pl-2">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vendorSummary.filter(v => v.TotalSubOuts > 0).map(v => (
                      <tr key={v.VendorID} className="hover:bg-gray-50">
                        <td className="py-1.5 pr-4 font-medium text-gray-900">{v.VendorName}</td>
                        <td className="text-center py-1.5 px-2 font-semibold text-gray-800">{v.TotalSubOuts}</td>
                        <td className="text-center py-1.5 px-2">
                          {v.Submitted > 0 && <span className="text-blue-600 font-medium">{v.Submitted}</span>}
                          {!v.Submitted && <span className="text-gray-300">-</span>}
                        </td>
                        <td className="text-center py-1.5 px-2">
                          {v.InProgress > 0 && <span className="text-yellow-600 font-medium">{v.InProgress}</span>}
                          {!v.InProgress && <span className="text-gray-300">-</span>}
                        </td>
                        <td className="text-center py-1.5 px-2">
                          {v.Complete > 0 && <span className="text-green-600 font-medium">{v.Complete}</span>}
                          {!v.Complete && <span className="text-gray-300">-</span>}
                        </td>
                        <td className="text-right py-1.5 pl-2 text-gray-600">{formatWeight(v.TotalWeight)}</td>
                      </tr>
                    ))}
                    {vendorSummary.filter(v => v.TotalSubOuts > 0).length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-3 text-gray-400">No vendor data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <PanelHeader
            title="Recent Activity"
            count={recentItems.length}
            icon={Clock}
            color="text-gray-500"
            badge="bg-gray-100 text-gray-600"
            open={panels.recent}
            onToggle={() => togglePanel('recent')}
          />
          {panels.recent && recentItems.length > 0 && (
            <div className="px-4 pb-3">
              <div className="space-y-1">
                {recentItems.map(item => (
                  <Link
                    key={item.SubOutID}
                    to={`/subouts/${item.SubOutID}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 w-24 truncate">{item.Lot}</span>
                    <span className="text-sm text-gray-500 truncate flex-1">{item.SubFabricator || 'No vendor'}</span>
                    <StatusBadge status={item.Status} />
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {timeAgo(item.UpdatedAt || item.CreatedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {panels.recent && recentItems.length === 0 && (
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-400 text-center py-2">No recent activity</p>
            </div>
          )}
        </div>
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showArchived}
              onChange={(e) => setFilters(f => ({ ...f, showArchived: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              <Archive className="inline w-4 h-4 mr-1 text-gray-500" />
              Show Archived
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
