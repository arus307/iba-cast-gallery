import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';

const providers: Array<ReturnType<typeof GitHub>> = [
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
];

export const authConfig = {
    providers,
    secret: getAuthSecret(),
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.email = user.email;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.email = token.email as string;
            }
            return session;
        },
    }
} satisfies NextAuthConfig;

function getAuthSecret() {
    if (process.env.AUTH_SECRET) {  
        return process.env.AUTH_SECRET;  
    }  
    // Allow fallback only in development or E2E testing  
    const env = process.env.NODE_ENV;  
    if (env === "development" || process.env.E2E_TESTING === "true") {  
        return "dummy_secret_for_local_development";  
    }  
    throw new Error("AUTH_SECRET environment variable must be set in production.");  
}  
