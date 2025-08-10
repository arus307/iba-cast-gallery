import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

const providers: Array<ReturnType<typeof GitHub> | ReturnType<typeof Credentials>> = [
    GitHub({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
];

if (process.env.E2E_TESTING === "true") {
    providers.push(
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
            },
            async authorize(credentials) {
                if (credentials) {
                    // In E2E tests, we trust the email is the admin email
                    return { id: "1", email: credentials.email as string };
                }
                return null;
            },
        })
    );
}

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
    console.log("process.env");
    console.log(process.env);

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
