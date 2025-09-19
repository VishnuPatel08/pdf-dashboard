// apps/web/src/lib/config.ts
export const config = {
apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
isDevelopment: process.env.NODE_ENV === 'development',
isProduction: process.env.NODE_ENV === 'production',
};
// Validate required environment variables
if (typeof window === 'undefined') {
// Server-side validation
const requiredEnvVars = ['NEXT_PUBLIC_API_URL'];
for (const envVar of requiredEnvVars) {
if (!process.env[envVar] && config.isProduction) {
throw new Error(`Missing required environment variable: ${envVar}`);
}
}
}