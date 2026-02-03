import { useState, useEffect, useRef } from 'react'
import useAiChat from './useAiChat'
import ChatHeader from './ChatHeader'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { defaultConfig } from './cortex-config'
import { Brain } from 'lucide-react'

export default function AiChat({
  appId,
  userId,
  serverUrl = defaultConfig.serverUrl,
  apiKey,
  position = defaultConfig.position,
  title = defaultConfig.title,
  placeholder = defaultConfig.placeholder,
  initialMessage = defaultConfig.initialMessage,
  metadata,
  onToolResult
}) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const messagesEndRef = useRef(null)

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    stopStreaming
  } = useAiChat({ appId, userId, serverUrl, apiKey, metadata, onToolResult })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const positionClass = position === 'bottom-left' ? 'left-5' : 'right-5'

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 ${positionClass} z-50 w-14 h-14 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 flex items-center justify-center`}
        title="Open MFCCortex Chat"
      >
        <Brain className="w-6 h-6 text-primary-400" />
      </button>
    )
  }

  const panelWidth = expanded ? 'w-[40vw] min-w-[500px]' : 'w-[400px]'
  const panelHeight = expanded ? 'h-[85vh]' : 'h-[600px]'

  return (
    <div className={`fixed bottom-5 ${positionClass} z-50 ${panelWidth} ${panelHeight} flex flex-col rounded-xl shadow-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-200`}>
      <ChatHeader
        title={title}
        expanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
        onClear={clearConversation}
        onClose={() => setOpen(false)}
      />

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-white">
        {messages.length === 0 && initialMessage && (
          <div className="flex gap-2.5">
            <div className="shrink-0 w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <div className="bg-slate-100 rounded-xl rounded-bl-md px-3.5 py-2.5 text-sm text-slate-800 max-w-[85%]">
              {initialMessage}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={msg.id || i} message={msg} />
        ))}

        {error && (
          <div className="mx-auto max-w-[90%] bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 text-center">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isLoading={isLoading}
        placeholder={placeholder}
      />
    </div>
  )
}
