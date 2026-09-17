import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/context/AuthContext';

interface WebSocketChatProps {
  orderId: number;
  enabled?: boolean;
}

interface Message {
  id?: number;
  orderId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'message' | 'typing' | 'notification';
  isRead?: boolean;
}

export const WebSocketChat: React.FC<WebSocketChatProps> = ({ orderId, enabled = true }) => {
  const { user } = useAuth();
  const { isConnected, messages, sendMessage, sendTyping } = useWebSocket(orderId, enabled);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected) return;

    setIsSending(true);
    try {
      sendMessage(inputValue.trim());
      setInputValue('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (isConnected && e.target.value.trim()) {
      sendTyping();
    }
  };

  if (!enabled) {
    return <div className="text-center text-muted-foreground py-8">Chat not available</div>;
  }

  return (
    <div className="flex flex-col h-[500px] border border-border/50 rounded-2xl overflow-hidden bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-duwaz-cream/30 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Shop Chat</h3>
        <div className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = msg.senderId === user?.userId;
            const isNotification = msg.type === 'notification';

            if (isNotification) {
              return (
                <div key={idx} className="text-center py-2">
                  <span className="text-xs text-muted-foreground italic">{msg.content}</span>
                </div>
              );
            }

            return (
              <div key={idx} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                    isOwnMessage
                      ? 'bg-duwaz-brown text-white rounded-br-none'
                      : 'bg-muted/60 text-foreground rounded-bl-none'
                  }`}
                >
                  {!isOwnMessage && <p className="text-xs font-semibold mb-0.5 opacity-80">{msg.senderName}</p>}
                  <p className="break-words">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-border/50 flex gap-2">
        <Input
          placeholder="Type your message..."
          value={inputValue}
          onChange={handleTyping}
          disabled={!isConnected || isSending}
          className="flex-1 rounded-full"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!isConnected || isSending || !inputValue.trim()}
          className="rounded-full bg-duwaz-brown hover:bg-duwaz-brown/90"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
