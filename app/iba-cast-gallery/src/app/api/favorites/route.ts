import {auth} from "auth";
import { getUserByDiscordId,getFavoritePosts } from "services/userService";


export async function GET(){
    const session = await auth();

    if(!session || session.user?.discordId === undefined){
        // ユーザーが認証されていない場合、401 Unauthorizedを返す
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    try {

        const user = await getUserByDiscordId(session.user.discordId)       
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }

        // お気に入りのポストを取得
        const favoritePosts = await getFavoritePosts(user);
        return new Response(JSON.stringify(favoritePosts), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });

    }catch (error) {
        console.error("Error fetching favorites:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch favorites" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
