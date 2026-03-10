'use client';

import { useState } from 'react';
import { usePathname } from '@/i18n/routing';
import AdminSidebar from './components/AdminSidebar';
import MobileHeader from './components/MobileHeader';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Login page renders without sidebar
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex bg-muted/20">
            {/* Mobile Header */}
            <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 pt-24 md:pt-8">
                {children}
            </main>
        </div>
    );
}
