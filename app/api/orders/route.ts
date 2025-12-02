import { NextResponse } from 'next/server';

// Simple in-memory store for demonstration
let orders: any[] = [];

export async function GET() {
    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    const body = await request.json();

    const { deviceId, ...orderData } = body;

    // Check for duplicate/continuous requests
    if (deviceId) {
        // Find the last order from this deviceId that matches the current action
        const lastMatchingOrder = orders.find(o =>
            o.deviceId === deviceId &&
            o.productId === orderData.productId &&
            o.variantId === orderData.variantId &&
            o.type === orderData.type
        );

        if (lastMatchingOrder) {
            const timeDiff = Date.now() - new Date(lastMatchingOrder.created_at).getTime();

            // Prevent same action within 1 minute
            if (timeDiff < 60000) {
                return NextResponse.json(
                    { message: 'You have already sent a request for this item recently.' },
                    { status: 429 }
                );
            }
        }
    }

    const newOrder = {
        id: Date.now(),
        ...orderData,
        deviceId,
        status: 'pending',
        read: false,
        created_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    return NextResponse.json(newOrder);
}

export async function PUT() {
    orders = orders.map(order => ({ ...order, read: true }));
    return NextResponse.json({ success: true });
}
