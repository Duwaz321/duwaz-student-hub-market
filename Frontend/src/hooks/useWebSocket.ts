import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

interface WebSocketMessage {
  orderId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'message' | 'typing' | 'notification';
  isRead?: boolean;
}

export function useWebSocket(orderId: number, enabled: boolean = true) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const clientRef = useRef<Client | null>(null);
  const typingTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      orderId,
      senderId: 0, // Will be set by server
      senderName: '',
      content,
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    clientRef.current.publish({
      destination: `/app/chat/order/${orderId}`,
      body: JSON.stringify(message),
    });
  }, [orderId]);

  const sendTyping = useCallback(() => {
    if (!clientRef.current || !clientRef.current.connected) return;

    const message: WebSocketMessage = {
      orderId,
      senderId: 0,
      senderName: '',
      content: '',
      timestamp: new Date().toISOString(),
      type: 'typing',
    };

    clientRef.current.publish({
      destination: `/app/typing/order/${orderId}`,
      body: JSON.stringify(message),
    });
  }, [orderId]);

  const notifyUserJoined = useCallback(() => {
    if (!clientRef.current || !clientRef.current.connected) return;

    const message: WebSocketMessage = {
      orderId,
      senderId: 0,
      senderName: '',
      content: 'User joined',
      timestamp: new Date().toISOString(),
      type: 'notification',
    };

    clientRef.current.publish({
      destination: `/app/user-joined/order/${orderId}`,
      body: JSON.stringify(message),
    });
  }, [orderId]);

  const disconnect = useCallback(() => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.deactivate();
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !orderId) return;

    const connect = () => {
      try {
        const token = localStorage.getItem('token');
        const client = new Client({
          brokerURL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/chat`,
          connectHeaders: {
            'Authorization': `Bearer ${token}`,
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('✅ WebSocket connected');
            setIsConnected(true);

            // Subscribe to messages for this order
            client.subscribe(`/topic/order/${orderId}`, (message: IMessage) => {
              try {
                const msg = JSON.parse(message.body) as WebSocketMessage;
                if (msg.type === 'message') {
                  setMessages(prev => [...prev, msg]);
                } else if (msg.type === 'notification') {
                  setMessages(prev => [...prev, msg]);
                }
              } catch (e) {
                console.error('Failed to parse message:', e);
              }
            });

            // Subscribe to typing indicators
            client.subscribe(`/topic/typing/${orderId}`, (message: IMessage) => {
              try {
                const msg = JSON.parse(message.body) as WebSocketMessage;
                setTypingUsers(prev => {
                  const updated = new Set(prev);
                  updated.add(msg.senderId);

                  // Clear typing indicator after 3 seconds
                  const timeout = typingTimeoutsRef.current.get(msg.senderId);
                  if (timeout) clearTimeout(timeout);

                  const newTimeout = setTimeout(() => {
                    setTypingUsers(current => {
                      const copy = new Set(current);
                      copy.delete(msg.senderId);
                      return copy;
                    });
                    typingTimeoutsRef.current.delete(msg.senderId);
                  }, 3000);

                  typingTimeoutsRef.current.set(msg.senderId, newTimeout);
                  return updated;
                });
              } catch (e) {
                console.error('Failed to parse typing indicator:', e);
              }
            });

            // Notify server that user joined
            notifyUserJoined();
          },
          onDisconnect: () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
          },
          onStompError: (error) => {
            console.error('STOMP error:', error);
          },
        });

        clientRef.current = client;
        client.activate();
      } catch (e) {
        console.error('WebSocket connection failed:', e);
      }
    };

    connect();

    return () => {
      // Cleanup on unmount
      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();
      disconnect();
    };
  }, [orderId, enabled, notifyUserJoined, disconnect]);

  return {
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    sendTyping,
    disconnect,
  };
}
