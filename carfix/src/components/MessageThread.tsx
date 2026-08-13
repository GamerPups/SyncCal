import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Message } from '@/types'
import { formatDate } from '@/lib/utils'

interface MessageThreadProps {
  messages: Message[]
  onSend: (sender: string, text: string) => Promise<void>
}

export function MessageThread({ messages, onSend }: MessageThreadProps) {
  const [text, setText] = useState('')
  const [sender, setSender] = useState('You')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      await onSend(sender, text)
      setText('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-1 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <MessageSquare className="size-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Chat with your mechanic, friend, or note issues for yourself</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${msg.sender === 'You' ? 'ml-auto items-end' : 'items-start'}`}
            >
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-xs font-semibold">{msg.sender}</span>
                <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
              </div>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  msg.sender === 'You'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Your name"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-32 text-sm"
          />
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={sending || !text.trim()} size="icon">
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: Share error codes, photos, or questions about repairs with your mechanic.
        </p>
      </div>
    </div>
  )
}
