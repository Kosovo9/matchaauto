"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageSquare, User, MoreVertical, Paperclip, Smile, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backendClient } from '@/lib/backend-client';

// --- TYPES ---
interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

interface QuantumChatProps {
    listingId?: string;
    sellerName?: string;
    sellerAvatar?: string;
    onClose: () => void;
}

export default function QuantumChat({
    listingId = "suburban-2021",
    sellerName = "Quantum Sales AI",
    sellerAvatar,
    onClose
}: QuantumChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: '¡Bienvenido! Soy tu asistente de ventas Quantum. ¿En qué puedo ayudarte hoy?', sender: 'them', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'read' },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // REAL-TIME SALES AI CLOSER
        setIsTyping(true);
        try {
            const chatHistory = messages.map(m => ({
                role: m.sender === 'me' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const response = await backendClient.post('/api/chat/ai-close', {
                message: userText,
                carDetails: {
                    make: 'Cadillac',
                    model: 'Suburban',
                    year: 2021,
                    price: 850000,
                    features: ['Piel', 'V8', 'LTZ']
                },
                history: chatHistory
            });

            if (response.data.success) {
                const reply: Message = {
                    id: Date.now().toString(),
                    text: response.data.reply,
                    sender: 'them',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'delivered'
                };
                setMessages(prev => [...prev, reply]);
            }
        } catch (e) {
            console.error("AI Sales Chat failed:", e);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-full max-w-[400px] h-[600px] bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden z-[100] backdrop-blur-3xl"
        >
            {/* HEADER: WHATSAPP PREMIUM STYLE */}
            <div className="p-5 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#39FF14] to-blue-500 p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                {sellerAvatar ? <img src={sellerAvatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-white" />}
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#39FF14] border-2 border-black rounded-full shadow-[0_0_10px_rgba(57,255,20,0.5)]"></div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold leading-tight">{sellerName}</h4>
                        <p className="text-[10px] text-[#39FF14] font-mono tracking-widest uppercase">EN LÍNEA</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500"><MoreVertical className="w-5 h-5" /></button>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* MESSAGE AREA */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth bg-[url('https://w0.peakpx.com/wallpaper/580/101/HD-wallpaper-whatsapp-dark-backround-graphy-black.jpg')] bg-repeat opacity-90"
            >
                <div className="text-center mb-6">
                    <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-500 font-mono uppercase tracking-[0.2em]">
                        Hoy, {new Date().toLocaleDateString()}
                    </span>
                </div>

                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: msg.sender === 'me' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "flex flex-col max-w-[80%] space-y-1",
                            msg.sender === 'me' ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                    >
                        <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm relative",
                            msg.sender === 'me'
                                ? "bg-[#39FF14] text-black font-medium rounded-tr-none shadow-[0_4px_15px_rgba(57,255,20,0.2)]"
                                : "bg-[#222] text-white rounded-tl-none border border-white/5 shadow-xl"
                        )}>
                            {msg.text}
                        </div>
                        <div className="flex items-center gap-1 px-1">
                            <span className="text-[9px] text-gray-500 font-mono">{msg.timestamp}</span>
                            {msg.sender === 'me' && (
                                <CheckCheck className={cn("w-3 h-3", msg.status === 'read' ? "text-blue-400" : "text-gray-600")} />
                            )}
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-gray-500 italic text-[10px] ml-2 font-mono">
                        Escribiendo...
                    </motion.div>
                )}
            </div>

            {/* INPUT AREA */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
                <div className="flex items-center gap-3 bg-[#1A1A1A] border border-white/5 rounded-2xl px-4 py-2 focus-within:border-[#39FF14]/50 transition-all shadow-inner">
                    <button className="text-gray-500 hover:text-white transition-colors"><Smile className="w-5 h-5" /></button>
                    <button className="text-gray-500 hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
                    <input
                        type="text"
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white py-2"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            inputValue.trim() ? "bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]" : "bg-white/5 text-gray-600"
                        )}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
