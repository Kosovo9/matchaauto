'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, CheckCheck, Loader2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

export const RealTimeChat: React.FC<{ listingId: string }> = ({ listingId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: 'current-user',
            text: input,
            timestamp: new Date().toISOString(),
            status: 'sent',
        };
        setMessages([...messages, newMessage]);
        setInput('');
        // Simular respuesta automática 10x
        setTimeout(() => {
            const reply: Message = {
                id: (Date.now() + 1).toString(),
                senderId: 'other-user',
                text: '¡Hola! Estoy interesado en el vehículo. ¿Sigue disponible?',
                timestamp: new Date().toISOString(),
                status: 'read',
            };
            setMessages(prev => [...prev, reply]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-nasa-blue/20 rounded-full flex items-center justify-center border border-nasa-blue/30">
                        <User className="text-nasa-blue" size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Vendedor Profesional</h3>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Online
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex flex-col max-w-[80%]",
                            msg.senderId === 'current-user' ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        <div className={cn(
                            "p-4 rounded-2xl text-sm",
                            msg.senderId === 'current-user'
                                ? "bg-nasa-blue text-white rounded-br-none"
                                : "bg-gray-800 text-gray-200 rounded-bl-none"
                        )}>
                            {msg.text}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {msg.senderId === 'current-user' && <CheckCheck size={12} className="text-nasa-blue" />}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex items-center gap-3">
                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Paperclip size={20} />
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-nasa-blue transition-colors"
                />
                <button
                    onClick={handleSend}
                    className="p-2 bg-nasa-blue text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-nasa-blue/20"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};
