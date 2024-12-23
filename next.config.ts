// next.config.ts
import type {NextConfig} from "next";
const nextConfig: NextConfig = {
    poweredByHeader: false,
    images: {
        domains: ['drive.google.com', 'lh3.googleusercontent.com'],
    },
    webpack: (config) => {
        config.ignoreWarnings = [
            {module: /node_modules\/punycode/}
        ];
        return config;
    },
    headers: async () => {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    }
                ]
            }
        ];
    }
};
export default nextConfig;