// app/api/auth/[...nextauth]/options.ts
import type {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
                    scope: "openid email profile https://www.googleapis.com/auth/drive"
                }
            }
        }),
    ],
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({token, account}) {
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.expiresAt = account.expires_at;
            }
            return token;
        },
        async session({session, token}) {
            if (session) {
                session.accessToken = token.accessToken;
                // Ensure we're not adding undefined values
                session.user = session.user || {};
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
}