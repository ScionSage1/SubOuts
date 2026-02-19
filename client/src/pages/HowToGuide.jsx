import { useState } from 'react'
import { BookOpen, ChevronRight, ChevronDown, LayoutDashboard, Package, Building2, Plus, Edit2, Trash2, Truck, ClipboardList, Filter, Eye, MousePointer, ArrowRight, CheckCircle2, AlertTriangle, Info, Layers, Settings as SettingsIcon, History, Clock, Printer, BarChart3, RefreshCw, Link2 } from 'lucide-react'
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

export default function HowToGuide() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">How-To Guide</h1>

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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
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
              <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                <BookOpen className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                <div className="text-xs font-semibold text-indigo-900">How-To Guide</div>
                <div className="text-xs text-indigo-600">This guide</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <SettingsIcon className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                <div className="text-xs font-semibold text-gray-900">Settings</div>
                <div className="text-xs text-gray-600">App info & legends</div>
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

            {/* Card Layout */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                What's on a Card
              </h4>
              <p className="text-sm text-gray-600 mb-2">Each sub out card shows at a glance:</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Top bar</span>
                  <span>Color-coded accent bar (see Colors section)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Header</span>
                  <span>Lot number + status badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Vendor + Zone</span>
                  <span>Sub-fabricator name and optional zone badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Dates</span>
                  <span>"Leave MFC" and "Due to Site" with overdue highlighting (red/orange)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Load progress</span>
                  <span>Out and In progress bars showing delivered/total loads</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Load badges</span>
                  <span>Per-status breakdown below each progress bar: <span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">loading</span> <span className="px-1 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs">loaded</span> <span className="px-1 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs">in transit</span></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Stats footer</span>
                  <span>Weight (lbs), major pieces, percent loaded, PO number</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-gray-800 w-32 flex-shrink-0">Background</span>
                  <span>Heat map gradient based on urgency (see Colors section)</span>
                </div>
              </div>
              <Tip>The "% loaded" tracks how many items are assigned to loads. Barcode-linked items (e.g., a LongShape tied to a PullList item) count as loaded when either is on a load.</Tip>
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

        {/* Dashboard Panels */}
        <GuideSection icon={BarChart3} title="Dashboard Panels & Follow-Ups" color="teal">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-700">
              Between the stats bar and filter bar, four collapsible panels provide quick insights without leaving the Dashboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Action Items
                </h4>
                <p className="text-sm text-gray-600">
                  SubOuts needing attention: overdue sends (red), overdue receives (orange), and missing steel (pink). Each row links to the SubOut detail page.
                </p>
              </div>

              <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Follow-Ups
                </h4>
                <p className="text-sm text-gray-600">
                  Pending follow-ups from the communication log. Shows vendor name, type, due date (red if overdue), and a quick "complete" checkmark button.
                </p>
              </div>

              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Vendor Summary
                </h4>
                <p className="text-sm text-gray-600">
                  Table showing each vendor's active SubOuts broken down by status (pending, in progress, complete) with total weight.
                </p>
              </div>

              <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50">
                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  Recent Activity
                </h4>
                <p className="text-sm text-gray-600">
                  Last 10 updated SubOuts with lot, vendor, status badge, and relative timestamp. Click any to go to its detail page.
                </p>
              </div>
            </div>

            <Tip>Click the panel header to toggle it open or closed. Panel states are remembered during your session.</Tip>
          </div>
        </GuideSection>

        {/* Reading Colors */}
        <GuideSection icon={Eye} title="Understanding Colors & Indicators" color="rose">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-700">
              Cards and table rows use color coding so you can spot issues at a glance.
            </p>

            {/* Card Top Bar Colors */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Card Top Bar Colors</h4>
              <p className="text-sm text-gray-600 mb-3">Each card has a colored accent bar along the top indicating its condition:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 border-t-4 border-t-red-500 bg-red-50 rounded-b-lg px-3 py-2">
                  <span className="text-sm font-semibold text-red-800 w-36">Red - Overdue Send</span>
                  <span className="text-sm text-red-700">Past the "Leave MFC" date and not all loads shipped out yet</span>
                </div>
                <div className="flex items-center gap-3 border-t-4 border-t-orange-500 bg-orange-50 rounded-b-lg px-3 py-2">
                  <span className="text-sm font-semibold text-orange-800 w-36">Orange - Overdue Return</span>
                  <span className="text-sm text-orange-700">Past the "Due to Site" date and not all loads returned</span>
                </div>
                <div className="flex items-center gap-3 border-t-4 border-t-pink-500 bg-pink-50 rounded-b-lg px-3 py-2">
                  <span className="text-sm font-semibold text-pink-800 w-36">Pink - Missing Steel</span>
                  <span className="text-sm text-pink-700">Steel is noted as missing for this sub out</span>
                </div>
                <div className="flex items-center gap-3 border-t-4 border-t-blue-500 bg-blue-50 rounded-b-lg px-3 py-2">
                  <span className="text-sm font-semibold text-blue-800 w-36">Blue - Ready</span>
                  <span className="text-sm text-blue-700">Status is "Ready" - prepared to ship from MFC</span>
                </div>
                <div className="flex items-center gap-3 border-t-4 border-t-yellow-500 bg-yellow-50 rounded-b-lg px-3 py-2">
                  <span className="text-sm font-semibold text-yellow-800 w-36">Yellow - In Progress</span>
                  <span className="text-sm text-yellow-700">Status is Sent, In-Process, or Shipped</span>
                </div>
                <div className="flex items-center gap-3 border-t-4 border-t-green-500 bg-green-50 rounded-b-lg px-3 py-2">
                  <span className="text-sm font-semibold text-green-800 w-36">Green - Complete</span>
                  <span className="text-sm text-green-700">Sub out is fully complete</span>
                </div>
                <div className="flex items-center gap-3 border-t-4 border-t-gray-300 bg-gray-50 rounded-b-lg px-3 py-2">
                  <span className="text-sm font-semibold text-gray-700 w-36">Gray - Submitted</span>
                  <span className="text-sm text-gray-600">Default state, no special condition</span>
                </div>
              </div>
            </div>

            {/* Heat Map Gradient */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Card Heat Map Background</h4>
              <p className="text-sm text-gray-600 mb-3">
                Cards display a subtle background gradient based on urgency — how close the Leave MFC date is versus how much material is loaded:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 border border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(239,200,100,0.10) 0%, white 100%)' }}>
                  <span className="text-sm font-semibold text-yellow-800 w-36">Yellow tint</span>
                  <span className="text-sm text-gray-600">Low urgency — leave date is approaching but material is mostly loaded</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 border border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(230,120,80,0.18) 0%, white 100%)' }}>
                  <span className="text-sm font-semibold text-red-800 w-36">Red tint</span>
                  <span className="text-sm text-gray-600">High urgency — leave date is imminent/overdue and little material loaded</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 border border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, white 100%)' }}>
                  <span className="text-sm font-semibold text-green-800 w-36">Green tint</span>
                  <span className="text-sm text-gray-600">100% of items loaded onto trucks — ready to go</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 border border-gray-200 bg-white">
                  <span className="text-sm font-semibold text-gray-700 w-36">No tint (white)</span>
                  <span className="text-sm text-gray-600">Complete status, no leave date set, or 14+ days until leave date</span>
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
                    <span className="text-gray-500">- Defaults to "Submitted".</span>
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

            {/* Load workflow */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Creating a Load
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
                  { label: 'Loaded', bg: 'bg-indigo-100', text: 'text-indigo-800' },
                  { label: 'In Transit', bg: 'bg-yellow-100', text: 'text-yellow-800' },
                  { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-800' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', s.bg, s.text)}>{s.label}</span>
                    {i < 4 && <ArrowRight className="w-4 h-4 text-gray-300" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Mutual Exclusion */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Raw vs. Cut to Length (Mutual Exclusion)
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                When assigning items to a load, PullList/Raw items and LongShapes items that share the same barcode are <strong>mutually exclusive</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-gray-800 mb-1">Sending Raw</div>
                  <p className="text-xs text-gray-600">If you select PullList/Raw items, the matching LongShapes become unavailable. You're sending raw inventory as-is.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-blue-800 mb-1">Sending Cut to Length</div>
                  <p className="text-xs text-blue-600">If you select LongShapes, the matching PullList/Raw items become unavailable. You're cutting marks first then sending.</p>
                </div>
              </div>
              <Tip>This prevents accidentally loading both the raw material AND its cut pieces onto the same truck. A load should contain one or the other for each barcode.</Tip>
            </div>

            <Tip>Each load card has buttons to: assign items/pallets (+), edit, and delete. Expand a load to see its truck info, pallets, and direct items. Load cards also show remaining truck capacity (default 48,000 lbs) color-coded green/orange/red.</Tip>
          </div>
        </GuideSection>

        {/* Print Bill of Lading */}
        <GuideSection icon={Printer} title="Print Bill of Lading" color="indigo">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-700">
              Each load card has a <strong>print button</strong> (printer icon) that generates a print-friendly Bill of Lading / Load Manifest in a new browser window.
            </p>

            <div className="space-y-3">
              <Step number="1">Open a SubOut's detail page and expand the <strong>Loads Section</strong>.</Step>
              <Step number="2">
                Click the
                <span className="inline-flex items-center mx-1 p-1 rounded border border-gray-300">
                  <Printer className="w-3.5 h-3.5 text-gray-500" />
                </span>
                icon on any load card (between the assign and edit buttons).
              </Step>
              <Step number="3">A new browser window opens with the formatted manifest. It auto-triggers the browser's print dialog.</Step>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                What's on the Print View
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm text-gray-600">
                <div><strong>Header:</strong> "METALSFAB CORPORATION - Bill of Lading / Load Manifest"</div>
                <div><strong>SubOut Info:</strong> Job, Lot, Description, Vendor</div>
                <div><strong>Load Details:</strong> Load Number, Direction, Status, Scheduled/Actual Dates</div>
                <div><strong>Truck Info:</strong> Company, Trailer #, Driver, BOL # (if entered)</div>
                <div><strong>Items Table:</strong> Shape, Mark, Pc Mark, Grade, Length, RM#, Qty, Weight</div>
                <div><strong>Pallets Table:</strong> Pallet #, Item Count, Dimensions, Weight</div>
                <div><strong>Totals:</strong> Total Weight, Total Pieces, Pallet Count</div>
                <div><strong>Signature Lines:</strong> Loaded By, Driver Signature, Received By</div>
              </div>
            </div>

            <Tip>The print layout is optimized for standard letter paper. Use your browser's "Save as PDF" option to create a digital copy.</Tip>
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
                <Step number="2">Fill in weight, dimensions (L x W x H), photo URL, and notes.</Step>
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

        {/* Adding Raw Material */}
        <GuideSection icon={Layers} title="Adding Raw Material from Inventory" color="teal">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-700 mb-2">
              Raw material (plates, angles, channels, etc.) can be added directly from Tekla inventory by selecting a shape and grade.
            </p>

            <div className="space-y-3">
              <Step number="1">
                Open a sub out's detail page and click
                <span className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 text-xs font-semibold">
                  <Layers className="w-3 h-3 mr-1" /> Add Raw Material
                </span>
                above the items table.
              </Step>

              <Step number="2">
                In the Raw Material Matcher modal, <strong>select a Shape</strong> from the dropdown (e.g., PL, L, C, W). Shapes are populated from all available Tekla inventory.
              </Step>

              <Step number="3">
                <strong>Select a Grade</strong> from the dropdown (e.g., A36, 50). Grades are filtered to those available for the selected shape.
              </Step>

              <Step number="4">
                A table shows matching inventory with <strong>dimension</strong>, <strong>stock length</strong>, <strong>weight per piece</strong>, and <strong>in-stock count</strong>. Click a row to select it — a quantity picker appears to choose how many sticks to add.
              </Step>

              <Step number="5">
                Review the selection summary showing total sticks and combined weight, then click
                <span className="inline-flex items-center mx-1 px-3 py-0.5 rounded bg-blue-600 text-white text-xs font-semibold">
                  Add Sticks as Raw Material
                </span>.
              </Step>
            </div>

            <Tip>Raw material items appear on the <strong>PullList/Raw</strong> tab with SendType "Raw" and are selectable when assigning items to loads.</Tip>
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

        {/* Activity Timeline */}
        <GuideSection icon={Clock} title="Activity Timeline" color="indigo">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-700">
              Every SubOut detail page has a collapsible <strong>Activity</strong> section at the bottom that shows an audit trail of changes.
            </p>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Tracked Events
              </h4>
              <p className="text-sm text-gray-600 mb-3">All actions on a SubOut are logged automatically. Events are grouped by category:</p>

              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SubOut & Items</h5>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                  <RefreshCw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-blue-800">Status Change</strong> <span className="text-gray-600">- "Status changed from Ready to Sent"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                  <Edit2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-blue-800">SubOut Edited</strong> <span className="text-gray-600">- "SubOut details updated"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                  <Plus className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-green-800">Items Added</strong> <span className="text-gray-600">- "12 items added from PullList"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-red-800">Item Removed</strong> <span className="text-gray-600">- "Item W14x30 removed"</span></span>
                </div>
              </div>

              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Load Operations</h5>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 bg-purple-50 rounded-lg px-3 py-2 border border-purple-200">
                  <Truck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-purple-800">Load Created / Edited / Deleted</strong> <span className="text-gray-600">- "Load OUT-001 created (Outbound)"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-200">
                  <Truck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-indigo-800">Load Status Change</strong> <span className="text-gray-600">- "Load OUT-001 status changed to Delivered"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-purple-50 rounded-lg px-3 py-2 border border-purple-200">
                  <Link2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-purple-800">Items/Pallets Assigned to Load</strong> <span className="text-gray-600">- "3 item(s) assigned to load OUT-001"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-red-800">Items/Pallets Removed from Load</strong> <span className="text-gray-600">- "Pallet P-001 removed from load OUT-001"</span></span>
                </div>
              </div>

              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pallet Operations</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  <Package className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-amber-800">Pallet Created / Edited / Status Change</strong> <span className="text-gray-600">- "Pallet P-001 status changed from Open to Closed"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-red-800">Pallet Deleted</strong> <span className="text-gray-600">- "Pallet P-001 deleted"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  <Link2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-amber-800">Items Assigned to Pallet</strong> <span className="text-gray-600">- "3 item(s) assigned to pallet P-001"</span></span>
                </div>
                <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm"><strong className="text-red-800">Item Removed from Pallet</strong> <span className="text-gray-600">- "Item removed from pallet P-001"</span></span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Each entry shows the description, who made the change, and when (as relative time like "2h ago"). The timeline auto-refreshes when you make changes.
            </p>

            <Tip>The activity log tracks the logged-in user automatically. Make sure you're signed in (via the user selector) so your changes are attributed correctly.</Tip>
          </div>
        </GuideSection>

        {/* Managing Vendors */}
        <GuideSection icon={Building2} title="Managing Vendors" color="teal">
          <div className="bg-white rounded-lg p-4 space-y-4">
            <p className="text-sm text-gray-700">
              Vendors are the sub-fabrication companies you send work to. Navigate to <strong>Vendors</strong> in the sidebar.
            </p>

            {/* Workload Overview */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Vendor Workload Overview
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                At the top of the Vendors page, a collapsible <strong>Vendor Workload</strong> panel shows active vendors with:
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 space-y-1.5 text-sm text-gray-600">
                <div><strong>Per-vendor cards</strong> showing active SubOut count and total weight</div>
                <div><strong>Stacked progress bar</strong> — green (complete), yellow (in progress), blue (pending)</div>
                <div><strong>Overdue badge</strong> — red count if vendor has overdue SubOuts</div>
              </div>
              <Tip>Only vendors with active SubOuts appear in the workload overview. Toggle the panel by clicking its header.</Tip>
            </div>

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
              Each sub out progresses through these statuses. Update the status by clicking any step on the <strong>status stepper bar</strong> on the detail page, or via the Edit page.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1 py-2">
              {[
                { label: 'Submitted', bg: 'bg-gray-100', text: 'text-gray-800', desc: 'Submitted' },
                { label: 'In-Process', bg: 'bg-orange-100', text: 'text-orange-800', desc: 'Being fabricated' },
                { label: 'Ready', bg: 'bg-blue-100', text: 'text-blue-800', desc: 'Ready to ship from MFC' },
                { label: 'Sent', bg: 'bg-yellow-100', text: 'text-yellow-800', desc: 'Shipped to sub' },
                { label: 'Shipped', bg: 'bg-purple-100', text: 'text-purple-800', desc: 'Shipped back to MFC' },
                { label: 'Received', bg: 'bg-teal-100', text: 'text-teal-800', desc: 'Received at MFC' },
                { label: 'QCd', bg: 'bg-green-100', text: 'text-green-800', desc: 'Quality checked' },
                { label: 'Complete', bg: 'bg-green-200', text: 'text-green-900', desc: 'Done' },
                { label: 'OnSite', bg: 'bg-emerald-200', text: 'text-emerald-900', desc: 'Delivered to site' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="text-center">
                    <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-semibold', s.bg, s.text)}>
                      {s.label}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-0.5">{s.desc}</div>
                  </div>
                  {i < 8 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Status Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-24 px-2 py-1 text-center rounded bg-gray-100 text-gray-800 text-xs font-semibold">Submitted</span>
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
                  <span className="w-24 px-2 py-1 text-center rounded bg-orange-100 text-orange-800 text-xs font-semibold">In-Process</span>
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

            {/* Inline Status Stepper */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Status Stepper Bar
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                On the SubOut detail page, a <strong>clickable status stepper bar</strong> appears below the header. It shows all 8 statuses as connected pills:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span><strong>Past statuses</strong> — filled with color and show a checkmark icon</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full ring-2 ring-blue-500 ring-offset-1 bg-blue-100 flex-shrink-0 mt-0.5"></span>
                  <span><strong>Current status</strong> — highlighted with a ring outline</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex-shrink-0 mt-0.5"></span>
                  <span><strong>Future statuses</strong> — gray, but clickable to jump ahead</span>
                </div>
              </div>
              <Tip>Click any status on the stepper bar to change the SubOut's status instantly. No need to open the Edit page.</Tip>
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

        {/* Recent Changes */}
        <GuideSection icon={History} title="Recent Changes" color="indigo">
          <div className="bg-white rounded-lg p-4 space-y-6">
            {/* Feb 19 Part 5 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">2026-02-19</span>
                <span className="text-xs text-gray-400">Part 5</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Auto-Status Toggle</strong> — SubOut auto-switches between In-Process and Ready based on loaded percentage (100% → Ready, below 100% → In-Process)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">~</span>
                  <span><strong>Decimal Percent Loaded</strong> — cards now show 1-decimal percentage (e.g., "99.6% loaded")</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">~</span>
                  <span><strong>Load Edit Pre-Population</strong> — editing a load pre-fills Weight (formatted with commas) and Piece Count from assigned items</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>RM# on Bill of Lading</strong> — print BOL items table now includes RM Number column</span>
                </div>
              </div>
            </div>

            {/* Feb 19 Part 3 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">2026-02-19</span>
                <span className="text-xs text-gray-400">Part 3</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">~</span>
                  <span><strong>Comprehensive Activity Logging</strong> — all load and pallet operations now tracked (edit, delete, assign/remove items, assign/remove pallets, status changes). 20 event types total with dedicated icons and colors.</span>
                </div>
              </div>
            </div>

            {/* Feb 19 Part 2 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">2026-02-19</span>
                <span className="text-xs text-gray-400">Part 2</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Dashboard Panels</strong> — Action Items, Follow-Ups, Vendor Summary, and Recent Activity panels</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Inline Status Changes</strong> — clickable status stepper bar on SubOut detail page</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Print Bill of Lading</strong> — print button on load cards opens formatted manifest</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Vendor Workload Overview</strong> — per-vendor progress bars and overdue badges on Vendors page</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Activity Timeline</strong> — audit log on SubOut detail page tracking all changes with user attribution</span>
                </div>
              </div>
            </div>

            {/* Feb 19 Part 1 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">2026-02-19</span>
                <span className="text-xs text-gray-400">Part 1</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Heat map gradient</strong> on dashboard cards — urgency-based background color from yellow to red</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Per-status load badges</strong> on cards — shows loading, loaded, in transit counts below progress bars</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Percent loaded</strong> on cards — truck icon with "X% loaded" in stats footer</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>"Loaded" load status</strong> — new status between Loading and In Transit</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Mutual exclusion in load assigner</strong> — Raw and Cut-to-Length items with shared barcodes block each other</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>How-To Guide</strong> moved to its own sidebar menu item</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">~</span>
                  <span>Card label changed from "Due Back" to <strong>"Due to Site"</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold flex-shrink-0">~</span>
                  <span>Card weight now shows as rounded integer with commas (e.g., "48,000 lbs")</span>
                </div>
              </div>
            </div>

            {/* Feb 18 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">2026-02-18</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Raw Material from Tekla Inventory</strong> — add plates, angles, etc. from inventory</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>SubOut card redesign</strong> — top accent bar, progress bars, dates, load info</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Source-type tabs in load assigner</strong> — LongShapes, Parts, PullList/Raw, Pallets</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Load capacity tracking</strong> — 48,000 lb default with live remaining display</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Multi-select bulk Set Send Type</strong> on LongShapes and Parts tabs</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Weight column</strong> on ItemsTable and ItemPicker grids</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Tekla inventory weight enrichment</strong> for PullList items</span>
                </div>
              </div>
            </div>

            {/* Feb 17 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">2026-02-17</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Sortable columns & search filter</strong> on all ItemsTable grids</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>PullStatus & RMNumber columns</strong> — live from source FabTracker.PullList</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Multi-select bulk PullStatus update</strong></span>
                </div>
              </div>
            </div>

            {/* Feb 16 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">2026-02-16</span>
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Send Types</strong> — Raw, Cut to Length, Parts on Pallets</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Pallet tracking</strong> — group parts, auto-numbered P-001, P-002</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold flex-shrink-0">+</span>
                  <span><strong>Load tracking</strong> — full load entities with truck/BOL/status (OUT-001, IN-001)</span>
                </div>
              </div>
            </div>
          </div>
        </GuideSection>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          MFC SubOuts Tracker v1.0 &middot; Internal Use Only
        </div>
      </div>
    </div>
  )
}
