import {auth} from "auth";


export async function GET(){
    const session = await auth();

    if(!session){
        // ユーザーが認証されていない場合、401 Unauthorizedを返す
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    


    try {
        // TODO ユーザーのお気に入りを取得




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