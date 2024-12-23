// app/api/auth/[...nextauth]/options.ts
import type { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
const GOOGLE_SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/documents.readonly',
    'https://www.googleapis.com/auth/presentations.readonly',
    'https://www.googleapis.com/auth/drive.photos.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');
type CustomSession = Session & { error?: string };
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    scope: GOOGLE_SCOPES
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
                token.error = undefined;
            }
            return token;
        },
        async session({ session, token }: { session: CustomSession; token: any }) {
            session.accessToken = token.accessToken;
            session.error = token.error;
            return session;
        }
    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
};