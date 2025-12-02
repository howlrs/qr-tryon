'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminSidebar() {
    const pathname = usePathname();
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

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-64 bg-white border-r border-border fixed h-full hidden md:flex flex-col">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold tracking-tight">Store Admin</h2>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin')
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                >
                    <Package size={20} />
                    Products
                </Link>
                <Link
                    href="/admin/orders"
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors justify-between ${isActive('/admin/orders')
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <LayoutDashboard size={20} />
                        Orders
                    </div>
                    {orderCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {orderCount}
                        </span>
                    )}
                </Link>
                <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive('/admin/settings')
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                >
                    <Settings size={20} />
                    Settings
                </Link>
            </nav>
            <div className="p-4 border-t border-border">
                <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-500 hover:bg-red-50 w-full transition-colors">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
