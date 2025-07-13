import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import {getUserByDiscordId,createNewUserByDiscordId} from "./services/userService";
import { DefaultSession } from "next-auth";

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
     * サインイン処理の直前に呼ばれる
     * @param user - Auth.jsが提案するユーザー情報
     * @param account - プロバイダーのアカウント情報（ここでproviderとproviderAccountIdが取れる）
     * @param profile - プロバイダーから返された生のプロフィール情報
     * @returns {boolean | string} trueならサインイン許可, falseなら拒否, 文字列ならそのURLにリダイレクト
     */
    async signIn({ user, account, profile }) {
      console.log("signIn Callback Triggered:", { user, account, profile });

      // Discordプロバイダーからのログインの場合のみ処理を実行
      if (account?.provider === "discord") {
        try {
          const user = await getUserByDiscordId(profile?.id || "");
          if (user) {
            // 既に存在する場合: サインインを許可
            console.log("既存のDiscordアカウントです。サインインを許可します。");
            return true;
          }

          // 存在しない場合: 新しいユーザーを作成
          console.log("新規のDiscordアカウントです。ユーザーとアカウントを作成します。");
          await createNewUserByDiscordId(profile?.id || "");          
          return true;
        } catch (error) {
          console.error("signInコールバックでエラーが発生しました:", error);
          return false;
        }
      }

      // Discord以外のプロバイダーの場合はデフォルトの動作に任せる（または同様のロジックを記述）
      return true;
    },

    /**
     * JWTを生成・更新する際に呼ばれる
     * @param param0 
     * @returns 
     */
    async jwt({ token, user, account, profile }) {
      console.log("JWT Callback:", { token, user, account, profile });

      if(account && profile && profile.id) {
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
});
