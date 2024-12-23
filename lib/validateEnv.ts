// lib/validateEnv.ts
export function validateEnv() {
    const requiredEnvVars = [
        'NEXTAUTH_URL',
        'NEXTAUTH_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET'
    ];
    const missingEnvVars = requiredEnvVars.filter(
        (envVar) => !process.env[envVar]
    );
    if (missingEnvVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingEnvVars.join(', ')}`
        );
    }
}