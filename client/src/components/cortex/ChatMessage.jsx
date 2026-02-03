import { User, Bot } from 'lucide-react'
import ChatToolCall from './ChatToolCall'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary-600' : 'bg-slate-200'
      }`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-white" />
          : <Bot className="w-3.5 h-3.5 text-slate-600" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {(message.toolCalls?.length ?? 0) > 0 && (
          <div className="space-y-2 w-full">
            {message.toolCalls.map((tc, i) => (
              <ChatToolCall key={i} toolCall={tc} />
            ))}
          </div>
        )}

        {message.content && (
          <div className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary-600 text-white rounded-br-md'
              : 'bg-slate-100 text-slate-800 rounded-bl-md'
          }`}>
            <MessageContent text={message.content} />
          </div>
        )}

        {message.streaming && !message.content && (message.toolCalls?.length ?? 0) === 0 && (
          <div className="bg-slate-100 rounded-xl px-3.5 py-2.5 rounded-bl-md">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageContent({ text }) {
  const parts = text.split(/(\*\*.*?\*\*|`[^`]+`|\n)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (part === '\n') return <br key={i} />
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1 py-0.5 bg-black/10 rounded text-xs font-mono">
              {part.slice(1, -1)}
            </code>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
