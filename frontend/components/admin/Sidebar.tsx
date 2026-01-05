import React from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-gray-900/80 text-white fixed inset-y-0 left-0 hidden md:block">
            <nav className="mt-10 space-y-2">
                <a href="/admin" className="flex items-center px-4 py-2 hover:bg-gray-800">
                    <Menu className="h-5 w-5 mr-3" />
                    <span>Dashboard</span>
                </a>
                <a href="/admin/reports" className="flex items-center px-4 py-2 hover:bg-gray-800">
                    <Settings className="h-5 w-5 mr-3" />
                    <span>Reports</span>
                </a>
                <a href="/logout" className="flex items-center px-4 py-2 hover:bg-gray-800">
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                </a>
            </nav>
        </aside>
    );
}
