// middleware.ts
import {type NextRequest, NextResponse} from 'next/server';

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const isDev = process.env.NODE_ENV === 'development';

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' ${isDev ? "'unsafe-eval'" : ''} https: http:;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://drive.google.com https://lh3.googleusercontent.com;
        font-src 'self';
        frame-src 'self' https://drive.google.com;
        connect-src 'self' ${isDev ? "http: ws:" : "https:"};
        media-src 'self';
        worker-src 'self' blob:;
    `.replace(/\s{2,}/g, ' ').trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (!isDev) {
        response.headers.set('Content-Security-Policy', cspHeader);
    }

    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Set secure cookie policy
    const cookiePolicy = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/'
    };

    // Handle cookies if present
    const cookies = request.cookies;
    cookies.getAll().forEach(cookie => {
        response.cookies.set({
            name: cookie.name,
            value: cookie.value,
            ...cookiePolicy
        });
    });

    return response;
}