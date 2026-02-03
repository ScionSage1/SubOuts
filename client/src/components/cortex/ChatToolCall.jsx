import { useState } from 'react'
import { Wrench, ChevronDown, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react'

export default function ChatToolCall({ toolCall }) {
  const [expanded, setExpanded] = useState(false)
  const isRunning = toolCall.status === 'running'

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
      >
        {isRunning
          ? <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
          : <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
        <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-mono text-xs text-slate-700 flex-1 truncate">{toolCall.tool}</span>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-200 px-3 py-2 space-y-2">
          {toolCall.input && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Input</p>
              <pre className="text-xs font-mono text-slate-600 bg-slate-50 rounded p-2 overflow-x-auto max-h-32 overflow-y-auto">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.result && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Result</p>
              <pre className="text-xs font-mono text-slate-600 bg-green-50 rounded p-2 overflow-x-auto max-h-40 overflow-y-auto">
                {JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
