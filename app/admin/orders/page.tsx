'use client';

import { useEffect, useState } from 'react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }
        };

        fetchOrders();
    }, []);

    const markAllAsRead = async () => {
        try {
            await fetch('/api/orders', { method: 'PUT' });
            // Refresh orders to show updated status (though visually they might look same, 
            // the sidebar badge will clear)
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                    Clear Notifications
                </button>
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Variant</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="p-4 font-medium">#{order.id}</td>
                                    <td className="p-4">{order.productName}</td>
                                    <td className="p-4">{order.variantName}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.type === 'purchase'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.type === 'purchase' ? 'Purchase' : 'Try On'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(order.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
