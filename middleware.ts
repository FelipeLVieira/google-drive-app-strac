// middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const isDev = process.env.NODE_ENV === 'development';
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}'
            https://*.google.com
            https://apis.google.com
            https://accounts.google.com
            https://*.googleusercontent.com;
        style-src 'self' 'unsafe-inline'
            https://*.googleapis.com
            https://*.google.com
            https://*.googleusercontent.com;
        img-src 'self' blob: data:
            https://*.google.com
            https://*.googleusercontent.com
            https://drive.google.com
            https://www.gstatic.com
            https://*.docs.google.com;
        frame-src 'self' blob: data:
            https://drive.google.com
            https://*.google.com
            https://docs.google.com
            https://accounts.google.com
            https://sheets.google.com
            https://docs.googleusercontent.com;
        connect-src 'self' ${isDev ? "http: ws:" : "https:"}
            https://*.google.com
            https://apis.google.com
            https://www.googleapis.com
            https://accounts.google.com
            https://sheets.googleapis.com
            https://*.googleusercontent.com;
        font-src 'self' https://fonts.gstatic.com;
        object-src 'self' blob: data:;
        media-src 'self' blob: data: https://*.google.com https://*.googleusercontent.com;
    `.replace(/\s{2,}/g, ' ').trim();
    const response = NextResponse.next({
        request: {
            headers: new Headers(request.headers),
        },
    });
    response.headers.delete('Cross-Origin-Embedder-Policy');
    response.headers.delete('Cross-Origin-Resource-Policy');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    if (!isDev) {
        response.headers.set('Content-Security-Policy', cspHeader);
    }
    response.headers.set(
        'Permissions-Policy',
        [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'interest-cohort=()',
            'fullscreen=(self "https://drive.google.com" "https://docs.google.com")',
            'display-capture=(self)',
        ].join(', ')
    );
    return response;
}