'use client';

import { useState, useEffect, useCallback } from 'react';

export const useChat = (roomId: string) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/api/chat/ws/${roomId}`);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'history') {
                setMessages(data.messages);
            } else if (data.type === 'new_message') {
                setMessages((prev) => [...prev, data.message]);
            }
        };

        setWs(socket);
        return () => socket.close();
    }, [roomId]);

    const sendMessage = useCallback((content: string, userId: string, userName: string) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'message',
                roomId,
                userId,
                userName,
                content,
            }));
        }
    }, [ws, roomId]);

    return { messages, sendMessage };
};
