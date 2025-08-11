import NextAuth from 'next-auth';
import { authConfig } from 'auth.config';
import { JWT, JWTDecodeParams, JWTEncodeParams } from 'next-auth/jwt';

/**
 * E2Eテスト時の設定
 */
const jwtTestEnv = {
  async encode(params: JWTEncodeParams<JWT>): Promise<string> {
    return "dummy";
  },
  async decode(params: JWTDecodeParams): Promise<JWT | null> {
    return {
      name: "user",
      email: process.env.ADMIN_EMAIL,
      picture: "https://avatars.githubusercontent.com/u/000000",
      sub: "dummy",
    };
  },
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  ...(process.env.E2E_TESTING === "true" ? { jwt: jwtTestEnv } : {}),
});
