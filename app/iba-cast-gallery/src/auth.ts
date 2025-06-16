import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"


/**
 * 一部型定義を拡張
 */
declare module "next-auth" {

  /**
   * セッションの型定義を拡張(UserId/DiscordのIDを追加)
   */
  interface Session {
    user: {
      id: string; // あなたのDBのUser ID
      discordId?: string; // DiscordのID (オプショナル)
    } & DefaultSession["user"]; // name, email, imageを継承
  }
}

/**
 * JWTの型定義を拡張
 */
declare module "@auth/core/jwt" {
  interface JWT {
    discordId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord],
  callbacks:{
    /**
     * JWTを生成・更新する際に呼ばれる
     * @param param0 
     * @returns 
     */
    async jwt({ token, user, account, profile }) {
      console.log("JWT Callback:", { token, user, account, profile });

      if(account && profile) {
        switch(account.provider) {
          case "discord":
            // Discordのアカウント情報をトークンに保存
            token.discordId = profile.id;
            break;
        }
      }

      return token;
    },

    /**
     * セッションがチェックされるたびに呼ばれる
     */
    async session({ session, token, user }) {
      console.log("Session Callback:", { session, token, user });

      // tokenから各プロバイダーのIDをsession.userに追加
      session.user.discordId = token.discordId;
      
      // DBのUser IDをセッションに追加
      if (token.sub) {
        session.user.id = token.sub; 
      }

      return session;
    },
  }
})