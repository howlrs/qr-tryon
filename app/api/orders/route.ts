import { NextResponse } from 'next/server';
import { createOrderSchema } from '@/lib/validations/order';
import { rateLimit } from '@/lib/rate-limit';

const MAX_ORDERS = 1000;

interface Order {
    id: number;
    productId: number;
    productName: string;
    variantId: number;
    variantName: string;
    type: 'try-on' | 'purchase';
    deviceId?: string;
    status: 'pending' | 'completed' | 'cancelled';
    read: boolean;
    created_at: string;
}

// Simple in-memory store for demonstration
let orders: Order[] = [];

export async function GET() {
    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    // Content-Length check: reject payloads larger than 1024 bytes
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 1024) {
        return NextResponse.json(
            { message: 'Request body too large. Maximum size is 1024 bytes.' },
            { status: 413 }
        );
    }

    // Parse JSON body
    let rawBody: unknown;
    try {
        rawBody = await request.json();
    } catch {
        return NextResponse.json(
            { message: 'Invalid JSON in request body.' },
            { status: 400 }
        );
    }

    // IP-based rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Global rate limit: 30 requests per minute per IP
    if (!rateLimit(`global:${ip}`, 30, 60000)) {
        return NextResponse.json(
            { message: 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }

    // Validate with Zod schema
    const result = createOrderSchema.safeParse(rawBody);
    if (!result.success) {
        return NextResponse.json(
            {
                message: 'Validation failed.',
                errors: result.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { deviceId, ...orderData } = result.data;

    // Specific rate limit: 3 requests per 5 minutes per IP+product+variant+type
    const specificKey = `specific:${ip}:${orderData.productId}:${orderData.variantId}:${orderData.type}`;
    if (!rateLimit(specificKey, 3, 300000)) {
        return NextResponse.json(
            { message: 'Too many requests for this item. Please try again later.' },
            { status: 429, headers: { 'Retry-After': '300' } }
        );
    }

    // Check for duplicate/continuous requests (deviceId-based, kept as supplementary)
    if (deviceId) {
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

    const newOrder: Order = {
        id: Date.now(),
        ...orderData,
        deviceId,
        status: 'pending',
        read: false,
        created_at: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    // Enforce maximum size limit — drop oldest entries
    if (orders.length > MAX_ORDERS) {
        orders = orders.slice(0, MAX_ORDERS);
    }

    return NextResponse.json(newOrder);
}

export async function PUT() {
    orders = orders.map(order => ({ ...order, read: true }));
    return NextResponse.json({ success: true });
}
