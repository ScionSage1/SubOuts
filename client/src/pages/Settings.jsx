import { useState } from 'react'
import { Settings as SettingsIcon, BookOpen, ChevronRight, ChevronDown, LayoutDashboard, Package, Building2, Plus, Edit2, Trash2, Truck, ClipboardList, Filter, Eye, MousePointer, ArrowRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import Card from '../components/common/Card'
import clsx from 'clsx'

function GuideSection({ icon: Icon, title, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100', iconText: 'text-blue-600', headerText: 'text-blue-900' },
    green: { bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-100', iconText: 'text-green-600', headerText: 'text-green-900' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', iconBg: 'bg-purple-100', iconText: 'text-purple-600', headerText: 'text-purple-900' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconText: 'text-orange-600', headerText: 'text-orange-900' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', iconBg: 'bg-teal-100', iconText: 'text-teal-600', headerText: 'text-teal-900' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', iconBg: 'bg-rose-100', iconText: 'text-rose-600', headerText: 'text-rose-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconText: 'text-amber-600', headerText: 'text-amber-900' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', headerText: 'text-indigo-900' },
  }

  const c = colorMap[color] || colorMap.blue

  return (
    <div className={clsx('rounded-xl border-2 overflow-hidden transition-all', c.border, open ? c.bg : 'bg-white')}>
      <button
        onClick={() => setOpen(!open)}
        className={clsx('w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-opacity-80', open ? c.bg : 'hover:bg-gray-50')}
      >
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', c.iconBg)}>
          <Icon className={clsx('w-5 h-5', c.iconText)} />
        </div>
        <span className={clsx('text-lg font-semibold flex-1', c.headerText)}>{title}</span>
        {open
          ? <ChevronDown className="w-5 h-5 text-gray-400" />
          : <ChevronRight className="w-5 h-5 text-gray-400" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  )
}

function Step({ number, children }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
        {number}
      </span>
      <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
    </div>
  )
}

function Tip({ children }) {
  return (
    <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-amber-800">{children}</span>
    </div>
  )
}

function KeyboardBadge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-mono font-semibold">
      {children}
    </span>
  )
}

function FieldLabel({ children, required }) {
  return (
    <span className="font-semibold text-gray-900">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('settings')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('settings')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'settings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <SettingsIcon className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'guide'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <BookOpen className="w-4 h-4" />
          How-To Guide
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <h2 className="font-semibold">Application Info</h2>
            </Card.Header>
            <Card.Body className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Environment</span>
                <span className="font-medium">{import.meta.env.MODE}</span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="font-semibold">Database</h2>
            </Card.Header>
            <Card.Body className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Server</span>
                <span className="font-medium">Voltron</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Database</span>
                <span className="font-medium">FabTracker</span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="font-semibold">Status Legend</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-gray-100 text-gray-800">Pending</span>
                  <span className="text-gray-600">Initial state, awaiting action</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-blue-100 text-blue-800">Ready</span>
                  <span className="text-gray-600">Ready to ship from MFC</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-yellow-100 text-yellow-800">Sent</span>
                  <span className="text-gray-600">Shipped from MFC to sub</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-orange-100 text-orange-800">InProcess</span>
                  <span className="text-gray-600">Being fabricated at sub</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-purple-100 text-purple-800">Shipped</span>
                  <span className="text-gray-600">Shipped from sub back to MFC</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-teal-100 text-teal-800">Received</span>
                  <span className="text-gray-600">Received at MFC</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-green-100 text-green-800">QCd</span>
                  <span className="text-gray-600">Quality checked</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-green-200 text-green-900">Complete</span>
                  <span className="text-gray-600">Fully complete</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="font-semibold">Card Border Colors</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-red-500 rounded"></span>
                  <span className="text-gray-600">Overdue - past leave date, not fully shipped</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-orange-500 rounded"></span>
                  <span className="text-gray-600">Overdue receive - past ship date, not received</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-pink-500 rounded"></span>
                  <span className="text-gray-600">Missing steel</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-blue-500 rounded"></span>
                  <span className="text-gray-600">Ready to ship</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                  <span className="text-gray-600">In progress</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-green-500 rounded"></span>
                  <span className="text-gray-600">Complete</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* How-To Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8" />
              <h2 className="text-2xl font-bold">SubOuts Tracker Guide</h2>
            </div>
            <p className="text-blue-100 max-w-2xl">
              Everything you need to know about using the MFC Sub Fabrication Tracker.
              Click any section below to expand it.
            </p>
          </div>

          {/* Quick Start */}
          <GuideSection icon={ArrowRight} title="Quick Start Overview" color="indigo" defaultOpen={true}>
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                SubOuts tracks fabrication work sent to outside sub-fabricators. The typical workflow is:
              </p>
              <div className="flex flex-wrap gap-2 items-center justify-center py-3">
                {[
                  { label: 'Create SubOut', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                  { label: 'Add Items', color: 'bg-purple-100 text-purple-800 border-purple-300' },
                  { label: 'Ship to Sub', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                  { label: 'Track Progress', color: 'bg-orange-100 text-orange-800 border-orange-300' },
                  { label: 'Receive Back', color: 'bg-teal-100 text-teal-800 border-teal-300' },
                  { label: 'QC & Complete', color: 'bg-green-100 text-green-800 border-green-300' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold border', step.color)}>
                      {step.label}
                    </span>
                    {i < 5 && <ArrowRight className="w-4 h-4 text-gray-300" />}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <LayoutDashboard className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-blue-900">Dashboard</div>
                  <div className="text-xs text-blue-600">Main overview</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                  <Package className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-purple-900">All SubOuts</div>
                  <div className="text-xs text-purple-600">Full list view</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                  <Building2 className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-orange-900">Vendors</div>
                  <div className="text-xs text-orange-600">Manage contacts</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                  <SettingsIcon className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-gray-900">Settings</div>
                  <div className="text-xs text-gray-600">Info & this guide</div>
                </div>
              </div>
            </div>
          </GuideSection>

          {/* Dashboard */}
          <GuideSection icon={LayoutDashboard} title="Using the Dashboard" color="blue">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                The Dashboard is your primary working screen. It groups all active sub outs by job and provides at-a-glance status information.
              </p>

              {/* Stats Bar */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Stats Bar
                </h4>
                <p className="text-sm text-gray-600 mb-3">Five summary cards across the top of the dashboard:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2 text-center border">
                    <div className="text-lg font-bold text-gray-900">--</div>
                    <div className="text-xs text-gray-500">Total Active</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                    <div className="text-lg font-bold text-blue-600">--</div>
                    <div className="text-xs text-blue-600">Pending Shipment</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-600">--</div>
                    <div className="text-xs text-yellow-600">In Progress</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center border border-red-200">
                    <div className="text-lg font-bold text-red-600">--</div>
                    <div className="text-xs text-red-600">Action Required</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                    <div className="text-lg font-bold text-green-600">--</div>
                    <div className="text-xs text-green-600">Complete This Month</div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Filtering
                </h4>
                <p className="text-sm text-gray-600 mb-2">Use the filter bar to narrow down what you see:</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Job</strong> - Show only sub outs for a specific job</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Vendor</strong> - Filter by sub-fabricator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Status</strong> - Show only a specific status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Action Items Only</strong> - Show only overdue or missing-steel items</span>
                  </li>
                </ul>
              </div>

              {/* View Modes */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  View Modes
                </h4>
                <p className="text-sm text-gray-600 mb-2">Toggle between two views using the icons in the filter bar:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Card View</span>
                    </div>
                    <p className="text-xs text-blue-700">Sub outs displayed as visual cards grouped under each job. Best for quick scanning.</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-900">Table View</span>
                    </div>
                    <p className="text-xs text-purple-700">Sub outs in rows with all details visible. Best for comparing data.</p>
                  </div>
                </div>
              </div>
            </div>
          </GuideSection>

          {/* Reading Colors */}
          <GuideSection icon={Eye} title="Understanding Colors & Indicators" color="rose">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                Cards and table rows use color coding so you can spot issues at a glance.
              </p>

              {/* Card Border Colors */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Card Left Border Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 border-l-4 border-l-red-500 bg-red-50 rounded-r-lg px-3 py-2">
                    <span className="text-sm font-semibold text-red-800 w-36">Red - Overdue Send</span>
                    <span className="text-sm text-red-700">Past the "Leave MFC" date and not all loads shipped out yet</span>
                  </div>
                  <div className="flex items-center gap-3 border-l-4 border-l-orange-500 bg-orange-50 rounded-r-lg px-3 py-2">
                    <span className="text-sm font-semibold text-orange-800 w-36">Orange - Overdue Return</span>
                    <span className="text-sm text-orange-700">Past the "Ship from Sub" date and not all loads returned</span>
                  </div>
                  <div className="flex items-center gap-3 border-l-4 border-l-pink-500 bg-pink-50 rounded-r-lg px-3 py-2">
                    <span className="text-sm font-semibold text-pink-800 w-36">Pink - Missing Steel</span>
                    <span className="text-sm text-pink-700">Steel is noted as missing for this sub out</span>
                  </div>
                  <div className="flex items-center gap-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg px-3 py-2">
                    <span className="text-sm font-semibold text-blue-800 w-36">Blue - Ready</span>
                    <span className="text-sm text-blue-700">Status is "Ready" - prepared to ship from MFC</span>
                  </div>
                  <div className="flex items-center gap-3 border-l-4 border-l-yellow-500 bg-yellow-50 rounded-r-lg px-3 py-2">
                    <span className="text-sm font-semibold text-yellow-800 w-36">Yellow - In Progress</span>
                    <span className="text-sm text-yellow-700">Status is Sent, InProcess, or Shipped</span>
                  </div>
                  <div className="flex items-center gap-3 border-l-4 border-l-green-500 bg-green-50 rounded-r-lg px-3 py-2">
                    <span className="text-sm font-semibold text-green-800 w-36">Green - Complete</span>
                    <span className="text-sm text-green-700">Sub out is fully complete</span>
                  </div>
                  <div className="flex items-center gap-3 border-l-4 border-l-gray-300 bg-gray-50 rounded-r-lg px-3 py-2">
                    <span className="text-sm font-semibold text-gray-700 w-36">Gray - Pending</span>
                    <span className="text-sm text-gray-600">Default state, no special condition</span>
                  </div>
                </div>
              </div>

              {/* Table Row Colors */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Table Row Background Colors</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-pink-50 rounded-lg px-3 py-2 border border-pink-200">
                    <span className="w-5 h-5 rounded bg-pink-200 flex-shrink-0"></span>
                    <span className="text-sm"><strong className="text-pink-800">Pink</strong> <span className="text-gray-600">- Missing steel noted</span></span>
                  </div>
                  <div className="flex items-center gap-3 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                    <span className="w-5 h-5 rounded bg-green-200 flex-shrink-0"></span>
                    <span className="text-sm"><strong className="text-green-800">Green</strong> <span className="text-gray-600">- Complete or all return loads received</span></span>
                  </div>
                  <div className="flex items-center gap-3 bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
                    <span className="w-5 h-5 rounded bg-yellow-200 flex-shrink-0"></span>
                    <span className="text-sm"><strong className="text-yellow-800">Yellow</strong> <span className="text-gray-600">- Partially shipped (some loads sent or received)</span></span>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <span className="w-5 h-5 rounded bg-gray-100 flex-shrink-0"></span>
                    <span className="text-sm"><strong className="text-gray-700">White</strong> <span className="text-gray-600">- Default, no loads shipped yet</span></span>
                  </div>
                </div>
              </div>

              <Tip>Colors are evaluated in priority order. Overdue send (red) takes priority over overdue return (orange), which takes priority over missing steel (pink), etc.</Tip>
            </div>
          </GuideSection>

          {/* Creating a SubOut */}
          <GuideSection icon={Plus} title="Creating a New SubOut" color="green">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <div className="space-y-3">
                <Step number="1">
                  Navigate to <strong>All SubOuts</strong> in the sidebar, then click the
                  <span className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold">
                    <Plus className="w-3 h-3" /> New SubOut
                  </span>
                  button. Or navigate directly to <KeyboardBadge>/subouts/new</KeyboardBadge>.
                </Step>

                <Step number="2">
                  Fill in the <strong>Job & Basic Info</strong> section:
                  <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <FieldLabel required>Job</FieldLabel>
                      <span className="text-gray-500">- Select from active jobs. Locked after creation.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FieldLabel required>Lot Number</FieldLabel>
                      <span className="text-gray-500">- Unique ID like <KeyboardBadge>SUB#001</KeyboardBadge>. Locked after creation.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FieldLabel>Description</FieldLabel>
                      <span className="text-gray-500">- What's being fabricated (e.g. "Columns", "Beams").</span>
                    </div>
                  </div>
                </Step>

                <Step number="3">
                  Set the <strong>Vendor & Status</strong>:
                  <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <FieldLabel>Vendor</FieldLabel>
                      <span className="text-gray-500">- Which sub-fabricator is doing the work.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FieldLabel>Status</FieldLabel>
                      <span className="text-gray-500">- Defaults to "Pending".</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FieldLabel>Zone</FieldLabel>
                      <span className="text-gray-500">- Optional project zone (e.g. "2", "3").</span>
                    </div>
                  </div>
                </Step>

                <Step number="4">
                  Configure <strong>Shipping</strong> dates and planned load counts:
                  <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="space-y-1 text-sm">
                      <div><strong>Date to Leave MFC</strong> - When steel should ship out</div>
                      <div><strong>Date to Ship from Sub</strong> - When fabricated steel should return</div>
                      <div><strong>Planned Outbound Loads</strong> - Estimated truckloads going out (default 1)</div>
                      <div><strong>Planned Inbound Loads</strong> - Estimated return loads (default 1)</div>
                    </div>
                  </div>
                  <Tip>Detailed load tracking (truck info, items, pallets) is managed on the detail page after creation.</Tip>
                </Step>

                <Step number="5">
                  Fill in <strong>Details</strong>: Weight, Major Pieces, PO Number, Estimated/Actual Cost, Missing Steel notes, and any additional Notes.
                </Step>

                <Step number="6">
                  Click
                  <span className="inline-flex items-center mx-1 px-3 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold">
                    Create SubOut
                  </span>
                  to save. You'll be taken to the new record's detail page.
                </Step>
              </div>
            </div>
          </GuideSection>

          {/* Send Types */}
          <GuideSection icon={ClipboardList} title="Send Types" color="teal">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                Each item has a <strong>Send Type</strong> that describes how it will be handled. A single sub out can mix all three types.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">Raw</span>
                  <p className="text-sm text-gray-600 mt-2">Send raw inventory lengths as-is to the sub-fabricator.</p>
                  <p className="text-xs text-gray-400 mt-1">Default for PullList/Raw items</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">Cut to Length</span>
                  <p className="text-sm text-gray-600 mt-2">Cut main marks to length at MFC before sending to sub.</p>
                  <p className="text-xs text-gray-400 mt-1">Default for LongShapes items</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300">Parts on Pallets</span>
                  <p className="text-sm text-gray-600 mt-2">Burn/cut parts, place on pallets, then ship to sub.</p>
                  <p className="text-xs text-gray-400 mt-1">Default for Parts items</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  How to Set Send Types
                </h4>
                <ul className="text-sm text-gray-600 space-y-1.5 ml-4">
                  <li><strong>When adding items:</strong> The Item Picker defaults the send type based on the active tab. Override with the dropdown in the selection summary.</li>
                  <li><strong>After adding:</strong> Change any item's send type inline on the Items table using the dropdown in the "Type" column.</li>
                  <li><strong>Filtering:</strong> Use the send type dropdown above the tabs to show only items of a specific type.</li>
                </ul>
              </div>

              <Tip>Only items with type "Parts on Pallets" can be assigned to pallets.</Tip>
            </div>
          </GuideSection>

          {/* Managing Loads */}
          <GuideSection icon={Truck} title="Managing Loads" color="orange">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                The <strong>Loads Section</strong> on the detail page tracks every shipment with full details. Two columns show Outbound (MFC → Sub) and Inbound (Sub → MFC) loads.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-900 mb-3 text-center">Outbound (MFC → Sub)</h4>
                  <p className="text-sm text-blue-800 text-center mb-3">Steel going from MFC to the sub-fabricator</p>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }} />
                    </div>
                    <p className="text-xs text-gray-500 text-center">1 of 2 delivered</p>
                  </div>
                  <p className="text-xs text-blue-700">Auto-numbered: OUT-001, OUT-002...</p>
                </div>

                <div className="border-2 border-teal-200 rounded-xl p-4 bg-teal-50">
                  <h4 className="font-semibold text-teal-900 mb-3 text-center">Inbound (Sub → MFC)</h4>
                  <p className="text-sm text-teal-800 text-center mb-3">Fabricated steel returning from sub to MFC</p>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }} />
                    </div>
                    <p className="text-xs text-gray-500 text-center">0 of 2 delivered</p>
                  </div>
                  <p className="text-xs text-teal-700">Auto-numbered: IN-001, IN-002...</p>
                </div>
              </div>

              {/* Two workflows */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Quick Ship (Simple)
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  For fast recording without details, click the
                  <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 text-xs font-semibold">Quick</span>
                  button. This creates a Delivered load instantly — same as the old "+1 Load" workflow.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Detailed Load (Full Tracking)
                </h4>
                <div className="space-y-2">
                  <Step number="1">
                    Click
                    <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold">
                      <Plus className="w-3 h-3 mr-1" /> Load
                    </span>
                    in the appropriate column.
                  </Step>
                  <Step number="2">Fill in truck company, trailer number, driver, BOL, dates, weight, notes.</Step>
                  <Step number="3">Click <strong>Create Load</strong>. The load appears as a card.</Step>
                  <Step number="4">Assign items or pallets using the <strong>+</strong> button on the load card.</Step>
                  <Step number="5">Update status as it progresses using the inline dropdown.</Step>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Load Status Flow
                </h4>
                <div className="flex flex-wrap items-center gap-1 py-2">
                  {[
                    { label: 'Planned', bg: 'bg-gray-100', text: 'text-gray-800' },
                    { label: 'Loading', bg: 'bg-blue-100', text: 'text-blue-800' },
                    { label: 'In Transit', bg: 'bg-yellow-100', text: 'text-yellow-800' },
                    { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-800' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', s.bg, s.text)}>{s.label}</span>
                      {i < 3 && <ArrowRight className="w-4 h-4 text-gray-300" />}
                    </div>
                  ))}
                </div>
              </div>

              <Tip>Each load card has buttons to: assign items/pallets (+), edit, and delete. Expand a load to see its truck info, pallets, and direct items.</Tip>
            </div>
          </GuideSection>

          {/* Managing Pallets */}
          <GuideSection icon={Package} title="Managing Pallets" color="purple">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                The <strong>Pallets Section</strong> lets you group "Parts on Pallets" items into named pallets before assigning them to loads.
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Creating a Pallet
                </h4>
                <div className="space-y-2">
                  <Step number="1">
                    Click
                    <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold">
                      <Plus className="w-3 h-3 mr-1" /> New Pallet
                    </span>
                    in the Pallets section.
                  </Step>
                  <Step number="2">Fill in weight, dimensions (L × W × H), photo URL, and notes.</Step>
                  <Step number="3">Click <strong>Create Pallet</strong>. Auto-numbered as P-001, P-002, etc.</Step>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Adding Items to a Pallet
                </h4>
                <div className="space-y-2">
                  <Step number="1">Click the <strong>+</strong> icon on a pallet card to open the item assigner.</Step>
                  <Step number="2">Select items from the list (only shows "Parts on Pallets" type items not already on another pallet).</Step>
                  <Step number="3">Click <strong>Assign to Pallet</strong>.</Step>
                </div>
                <Tip>Expand a pallet to see all its assigned items. Click the trash icon on an item to remove it from the pallet.</Tip>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Pallet Status Flow
                </h4>
                <div className="flex flex-wrap items-center gap-1 py-2">
                  {[
                    { label: 'Open', bg: 'bg-gray-100', text: 'text-gray-800' },
                    { label: 'Closed', bg: 'bg-blue-100', text: 'text-blue-800' },
                    { label: 'Loaded', bg: 'bg-yellow-100', text: 'text-yellow-800' },
                    { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-800' },
                    { label: 'Received', bg: 'bg-green-100', text: 'text-green-800' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', s.bg, s.text)}>{s.label}</span>
                      {i < 4 && <ArrowRight className="w-4 h-4 text-gray-300" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  <strong>Assigning to a load:</strong> Use the load dropdown on each pallet card to assign it to an outbound load. This also moves all items on the pallet to that load.
                </p>
              </div>
            </div>
          </GuideSection>

          {/* Adding Items */}
          <GuideSection icon={ClipboardList} title="Adding Items from Cutlists" color="purple">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700 mb-2">
                Items are pulled from the job's cutlist data (LongShapes, Parts, or PullList) and linked to a sub out for tracking.
              </p>

              <div className="space-y-3">
                <Step number="1">
                  Open a sub out's detail page and click
                  <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 text-xs font-semibold">
                    <Plus className="w-3 h-3 mr-1" /> Add Items
                  </span>
                  above the items table.
                </Step>

                <Step number="2">
                  In the Item Picker modal, <strong>select a Package</strong> from the dropdown. Packages are loaded from the job's cutlist data.
                </Step>

                <Step number="3">
                  Choose a tab to browse items. Each tab sets a default <strong>send type</strong>:
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="px-3 py-1 rounded-t-lg bg-blue-100 text-blue-700 text-xs font-semibold border-b-2 border-blue-500">LongShapes</span>
                      <span className="text-xs text-gray-400">→ Cut to Length</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-3 py-1 rounded-t-lg bg-gray-100 text-gray-600 text-xs font-semibold">Parts</span>
                      <span className="text-xs text-gray-400">→ Parts on Pallets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="px-3 py-1 rounded-t-lg bg-gray-100 text-gray-600 text-xs font-semibold">PullList/Raw</span>
                      <span className="text-xs text-gray-400">→ Raw</span>
                    </div>
                  </div>
                </Step>

                <Step number="4">
                  Use the <strong>search box</strong> to filter by mark, piece mark, or shape. Click individual rows to select them, or click <strong>"Select all available"</strong> for bulk selection.
                </Step>

                <Step number="5">
                  Items already assigned to another sub out appear <strong>grayed out</strong> with the assigned lot shown in
                  <span className="text-orange-600 font-semibold mx-1">orange</span>.
                </Step>

                <Step number="6">
                  Review the selection summary showing count, pieces, weight, and the <strong>send type selector</strong>. Override the default send type if needed, then click
                  <span className="inline-flex items-center mx-1 px-3 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold">
                    Add Selected Items
                  </span>.
                </Step>
              </div>

              <Tip>Items track their source (LongShapes, Parts, PullList), send type (Raw, Cut to Length, Parts on Pallets), and carry material data like Heat Number, Cert Number, and Barcode when available.</Tip>
            </div>
          </GuideSection>

          {/* Editing & Deleting */}
          <GuideSection icon={Edit2} title="Editing & Deleting SubOuts" color="amber">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Editing</h4>
                  </div>
                  <div className="space-y-2">
                    <Step number="1">Open the sub out detail page</Step>
                    <Step number="2">
                      Click
                      <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 text-xs font-semibold">
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </span>
                      in the top-right
                    </Step>
                    <Step number="3">Modify fields as needed</Step>
                    <Step number="4">Click <strong>Update SubOut</strong> to save</Step>
                  </div>
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-amber-800"><strong>Note:</strong> Job and Lot Number cannot be changed after creation.</span>
                  </div>
                </div>

                <div className="border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-900">Deleting</h4>
                  </div>
                  <div className="space-y-2">
                    <Step number="1">Open the sub out detail page</Step>
                    <Step number="2">
                      Click
                      <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-red-600 text-white text-xs font-semibold">
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </span>
                      in the top-right
                    </Step>
                    <Step number="3">Confirm in the modal</Step>
                  </div>
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-red-800"><strong>Warning:</strong> This permanently deletes the sub out and all its items, pallets, and loads. This cannot be undone.</span>
                  </div>
                </div>
              </div>
            </div>
          </GuideSection>

          {/* Managing Vendors */}
          <GuideSection icon={Building2} title="Managing Vendors" color="teal">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                Vendors are the sub-fabrication companies you send work to. Navigate to <strong>Vendors</strong> in the sidebar.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Add */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Add Vendor</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <Step number="1">
                      Click
                      <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold">
                        <Plus className="w-3 h-3 mr-1" /> Add Vendor
                      </span>
                    </Step>
                    <Step number="2">Fill in Vendor Name (required), Contact, Phone, Email, Address, Notes</Step>
                    <Step number="3">Click <strong>Create</strong></Step>
                  </div>
                </div>

                {/* Edit */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Edit Vendor</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <Step number="1">
                      Click the <Edit2 className="w-3 h-3 inline text-gray-400" /> pencil icon on the vendor card
                    </Step>
                    <Step number="2">Update any fields</Step>
                    <Step number="3">Click <strong>Update</strong></Step>
                  </div>
                </div>

                {/* Deactivate */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-red-900">Deactivate Vendor</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <Step number="1">
                      Click the <Trash2 className="w-3 h-3 inline text-gray-400" /> trash icon on the vendor card
                    </Step>
                    <Step number="2">Confirm deactivation</Step>
                  </div>
                  <div className="mt-2 text-xs text-red-700">
                    Vendors are <strong>soft-deleted</strong> (marked inactive, shown faded). They are not permanently removed.
                  </div>
                </div>
              </div>
            </div>
          </GuideSection>

          {/* Status Flow */}
          <GuideSection icon={CheckCircle2} title="Status Flow & Lifecycle" color="green">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <p className="text-sm text-gray-700">
                Each sub out progresses through these statuses. Update the status via the Edit page.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1 py-2">
                {[
                  { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-800', desc: 'Awaiting action' },
                  { label: 'Ready', bg: 'bg-blue-100', text: 'text-blue-800', desc: 'Ready to ship from MFC' },
                  { label: 'Sent', bg: 'bg-yellow-100', text: 'text-yellow-800', desc: 'Shipped to sub' },
                  { label: 'InProcess', bg: 'bg-orange-100', text: 'text-orange-800', desc: 'Being fabricated' },
                  { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-800', desc: 'Shipped back to MFC' },
                  { label: 'Received', bg: 'bg-teal-100', text: 'text-teal-800', desc: 'Received at MFC' },
                  { label: 'QCd', bg: 'bg-green-100', text: 'text-green-800', desc: 'Quality checked' },
                  { label: 'Complete', bg: 'bg-green-200', text: 'text-green-900', desc: 'Done' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="text-center">
                      <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-semibold', s.bg, s.text)}>
                        {s.label}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">{s.desc}</div>
                    </div>
                    {i < 7 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Status Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-gray-100 text-gray-800 text-xs font-semibold">Pending</span>
                    <span className="text-sm text-gray-600">Initial state when a sub out is first created. No action has been taken.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-blue-100 text-blue-800 text-xs font-semibold">Ready</span>
                    <span className="text-sm text-gray-600">Steel is staged and ready to load at MFC for shipment to the sub-fabricator.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Sent</span>
                    <span className="text-sm text-gray-600">Steel has left MFC and is in transit or delivered to the sub-fabricator.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-orange-100 text-orange-800 text-xs font-semibold">InProcess</span>
                    <span className="text-sm text-gray-600">The sub-fabricator is actively working on fabrication.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-purple-100 text-purple-800 text-xs font-semibold">Shipped</span>
                    <span className="text-sm text-gray-600">Fabricated steel has been shipped from the sub back toward MFC.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-teal-100 text-teal-800 text-xs font-semibold">Received</span>
                    <span className="text-sm text-gray-600">Steel has been received back at MFC.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-green-100 text-green-800 text-xs font-semibold">QCd</span>
                    <span className="text-sm text-gray-600">Quality control check has been performed on the returned steel.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 px-2 py-1 text-center rounded bg-green-200 text-green-900 text-xs font-semibold">Complete</span>
                    <span className="text-sm text-gray-600">All work is done. No further action required.</span>
                  </div>
                </div>
              </div>
            </div>
          </GuideSection>

          {/* All SubOuts List & Job View */}
          <GuideSection icon={Package} title="All SubOuts List & Job View" color="purple">
            <div className="bg-white rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-purple-200 rounded-xl p-4">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    All SubOuts Page
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    A flat table of every sub out record in the system. Access via <strong>All SubOuts</strong> in the sidebar.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Filter by <strong>Vendor</strong> or <strong>Status</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Shows result count</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Columns: Job, Lot, Description, Vendor, Dates, Loads, Weight, Pieces, Status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MousePointer className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Click any row to open its detail page</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-indigo-200 rounded-xl p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    Job View Page
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    See all sub outs for a single job. Access by clicking a job name anywhere in the app.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>Shows job code, description, and project manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>Sub outs displayed as cards in a responsive grid</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MousePointer className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span>Click any card to open the sub out detail</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </GuideSection>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 py-4">
            MFC SubOuts Tracker v1.0 &middot; Internal Use Only
          </div>
        </div>
      )}
    </div>
  )
}
