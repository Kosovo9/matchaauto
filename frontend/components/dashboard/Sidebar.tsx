'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Map,
    Activity,
    Truck,
    Settings,
    Shield,
    Navigation,
    Box,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { SidebarItem } from '@/types/dashboard';
import { NexusShield } from './NexusShield';

const items: SidebarItem[] = [
    { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Live Tracking', href: '/dashboard/tracking', icon: Map },
    { title: 'Geofencing', href: '/dashboard/geofencing', icon: Shield },
    { title: 'Logistics', href: '/dashboard/logistics', icon: Truck },
    { title: 'Geo Operations', href: '/dashboard/geo-ops', icon: Box },
    { title: 'Analytics', href: '/dashboard/analytics', icon: Activity },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Menu />}
            </button>

            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-100 transition-transform duration-300 transform border-r border-slate-800",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:translate-x-0 md:static md:h-screen"
            )}>
                <div className="flex items-center justify-center h-16 border-b border-slate-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        MatchaAuto
                        <span className="text-xs ml-1 text-slate-400 font-normal">Command</span>
                    </h1>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-4 py-3 rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-slate-800 text-blue-400 border border-slate-700/50"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 mr-3 group-hover:scale-110 transition-transform", isActive ? "text-blue-400" : "text-slate-500")} />
                                <span className="font-medium text-sm">{item.title}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-6 px-4 w-full space-y-4">
                    <NexusShield />
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">System Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
