'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { LayoutDashboard, Package, Settings, LogOut, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations('Admin');
    const [orderCount, setOrderCount] = useState(0);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const data = await res.json();
                    const unreadCount = data.filter((order: any) => !order.read).length;
                    setOrderCount(unreadCount);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        // Initial fetch
        fetchOrders();

        // Poll every 2 seconds
        const interval = setInterval(fetchOrders, 2000);

        return () => clearInterval(interval);
    }, []);

    // Body scroll lock when mobile drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const isActive = (path: string) => pathname === path;

    const navContent = (
        <>
            <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">{t('title')}</h2>
                <button
                    onClick={onClose}
                    className="p-1 text-muted-foreground hover:text-foreground md:hidden transition-colors"
                    aria-label="Close menu"
                >
                    <X size={20} />
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                <Link
                    href="/admin"
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin')
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                >
                    <Package size={20} />
                    {t('products')}
                </Link>
                <Link
                    href="/admin/orders"
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors justify-between ${isActive('/admin/orders')
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <LayoutDashboard size={20} />
                        {t('orders')}
                    </div>
                    {orderCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {orderCount}
                        </span>
                    )}
                </Link>
                <Link
                    href="/admin/settings"
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin/settings')
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                >
                    <Settings size={20} />
                    {t('settings')}
                </Link>
            </nav>
            <div className="p-4 border-t border-border">
                <button
                    onClick={async () => {
                        try {
                            await fetch('/api/auth/logout', { method: 'POST' });
                        } catch {
                            // ignore
                        }
                        router.push('/admin/login');
                        router.refresh();
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 w-full transition-colors"
                >
                    <LogOut size={20} />
                    {t('logout')}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="w-64 bg-white border-r border-border fixed h-full hidden md:flex flex-col">
                {navContent}
            </aside>

            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Mobile drawer */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border flex flex-col md:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {navContent}
            </aside>
        </>
    );
}
