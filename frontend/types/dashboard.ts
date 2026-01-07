import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export interface SidebarItem {
    title: string;
    href: string;
    icon: LucideIcon;
    submenu?: SidebarItem[];
}

export interface DashboardLayoutProps {
    children: ReactNode;
}
