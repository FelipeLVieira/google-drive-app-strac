// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
    interface Session {
        accessToken?: string;
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
        expires: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
    }
}