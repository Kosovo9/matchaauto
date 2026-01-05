import { LayoutGrid, Globe, Shield, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminHeader() {
    return (
        <header className="h-16 border-b border-gray-800 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 relative">
                    <Globe className="w-full h-full text-cyan-500 animate-pulse" />
                </div>
                <div className="h-6 w-px bg-gray-800"></div>
                <div className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                    Admin <span className="text-white">Panel</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                    <span className="text-[10px] font-bold text-green-500 uppercase">Network Live</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 border border-white/10 flex items-center justify-center font-bold text-xs">
                    JD
                </div>
            </div>
        </header>
    );
}
