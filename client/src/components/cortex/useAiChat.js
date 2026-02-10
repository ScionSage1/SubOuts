import { useState, useCallback, useRef } from 'react'

export default function useAiChat({ appId, userId, serverUrl, apiKey, metadata, onToolResult }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return

    setError(null)
    setIsLoading(true)

    const userMessage = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])

    const assistantId = Date.now()
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      timestamp: new Date(),
      streaming: true
    }])

    try {
      const abortController = new AbortController()
      abortRef.current = abortController

      const response = await fetch(`${serverUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'x-api-key': apiKey } : {})
        },
        body: JSON.stringify({
          message: content,
          appContext: { appId, userId, metadata },
          conversationId
        }),
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let event = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            event = line.slice(7).trim()
          } else if (line.startsWith('data: ') && event) {
            try {
              const data = JSON.parse(line.slice(6))
              handleSSEEvent(event, data, assistantId)
            } catch {
              // Skip malformed JSON
            }
            event = null
          }
        }
      }

      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false } : m
      ))
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      }
    }

    setIsLoading(false)
  }, [appId, userId, serverUrl, apiKey, metadata, conversationId, isLoading, onToolResult])

  function handleSSEEvent(event, data, assistantId) {
    switch (event) {
      case 'message_start':
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }
        break

      case 'content_delta':
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content + (data.text || '') }
            : m
        ))
        break

      case 'tool_use':
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, toolCalls: [...(m.toolCalls || []), { tool: data.tool, input: data.input, status: 'running' }] }
            : m
        ))
        break

      case 'tool_result':
        setMessages(prev => prev.map(m => {
          if (m.id !== assistantId) return m
          const toolCalls = (m.toolCalls || []).map(tc =>
            tc.tool === data.tool && tc.status === 'running'
              ? { ...tc, result: data.result, status: 'done' }
              : tc
          )
          return { ...m, toolCalls }
        }))
        if (onToolResult) {
          onToolResult(data.tool, data.result)
        }
        break

      case 'error':
        setError(data.error || 'Unknown error')
        break
    }
  }

  const clearConversation = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setMessages([])
    setConversationId(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    stopStreaming
  }
}
