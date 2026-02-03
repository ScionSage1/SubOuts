import { Brain, Minimize2, Maximize2, Trash2, X } from 'lucide-react'

export default function ChatHeader({ title, expanded, onToggleExpand, onClear, onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-t-xl">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary-400" />
        <span className="text-sm font-semibold">{title || 'MFCCortex'}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onClear}
          className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          title="Clear conversation"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <button
          onClick={onToggleExpand}
          className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded
            ? <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-slate-700 transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  )
}
