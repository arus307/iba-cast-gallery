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
     * サインイン処理の直前に呼ばれる
     * @param user - Auth.jsが提案するユーザー情報
     * @param account - プロバイダーのアカウント情報（ここでproviderとproviderAccountIdが取れる）
     * @param profile - プロバイダーから返された生のプロフィール情報
     * @returns {boolean | string} trueならサインイン許可, falseなら拒否, 文字列ならそのURLにリダイレクト
     */
    async signIn({ user, account, profile }) {
      console.log("signIn Callback Triggered:", { user, account, profile });
      // TODO ちゃんと実装する

      // Discordプロバイダーからのログインの場合のみ処理を実行
      if (account?.provider === "discord") {
        try {
          // --- ここからがカスタムDB処理 ---

          // 1. データベースリポジトリを取得
          const accountRepository = AppDataSource.getRepository(Account);
          const userRepository = AppDataSource.getRepository(User);

          // 2. このDiscordアカウントが既にDBに登録済みか確認
          const existingAccount = await accountRepository.findOne({
            where: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          });

          if (existingAccount) {
            // 既に存在する場合: 何もせずサインインを許可
            console.log("既存のDiscordアカウントです。サインインを許可します。");
            return true;
          }

          // 3. 初めてこのDiscordアカウントでログインする場合
          console.log("新規のDiscordアカウントです。ユーザーとアカウントを作成します。");

          // 4. 新しいユーザーをusersテーブルに作成
          // profileから名前や画像を取得
          const newUser = userRepository.create({
            name: profile?.username || "New User", // Discordのusernameを利用
            image: profile?.image_url,
          });
          await userRepository.save(newUser);
          console.log("新しいユーザーを作成しました:", newUser);


          // 5. 新しいアカウントをaccountsテーブルに作成
          const newAccount = accountRepository.create({
            userId: newUser.id, // 作成したユーザーのIDをセット
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
          });
          await accountRepository.save(newAccount);
          console.log("新しいアカウントを作成しました:", newAccount);
          
          return true; // すべて成功したのでサインインを許可

        } catch (error) {
          console.error("signInコールバックでエラーが発生しました:", error);
          // エラーが発生した場合はサインインを拒否
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