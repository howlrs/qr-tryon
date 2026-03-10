import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-dev-secret'
);

async function verifyTokenInMiddleware(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is an admin route (but not the login page)
    // Pattern: /{locale}/admin/... but NOT /{locale}/admin/login
    const adminRouteRegex = /^\/[a-z]{2}\/admin(\/.*)?$/;
    const loginRouteRegex = /^\/[a-z]{2}\/admin\/login$/;

    if (adminRouteRegex.test(pathname) && !loginRouteRegex.test(pathname)) {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            // Extract locale from pathname
            const locale = pathname.split('/')[1] || 'ja';
            return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
        }

        const payload = await verifyTokenInMiddleware(token);
        if (!payload) {
            const locale = pathname.split('/')[1] || 'ja';
            return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
        }
    }

    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
