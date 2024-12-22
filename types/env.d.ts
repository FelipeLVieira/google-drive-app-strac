// types/env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;
        GOOGLE_CLIENT_ID: string;
        GOOGLE_CLIENT_SECRET: string;
        MAX_FILE_SIZE?: string;
    }
}