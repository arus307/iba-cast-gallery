import { Tweet } from "@/types/tweet";
import { Dayjs } from "dayjs";


export const db: {
    tweets: Tweet[];
    casts: Cast[];
} =
{
    "tweets":[
        {
            id:"1873194540800348304",
            postedAt: new Dayjs("2024-12-29T11:29:00+9:00"),
        },
        {
            id:"1873202290749739453",
            postedAt: new Dayjs("2024-12-29T12:00:00+9:00"),
        },
        {
            id:"1873544835459952970",
            postedAt: new Dayjs("2024-12-30T10:41:00+9:00"),
        },
        {
            id:"1873587315693551743",
            postedAt: new Dayjs("2024-12-30T13:30:00+9:00"),
        }
    ],
    "casts":[
        {
            id:1,
            name:"メノウ",
            introduceTweetId:"1878744119239209193",
            color:"#00ff00",
        },
        {
            id:2,
            name:"クジャク",
            introduceTweetId:"1879091090134864220",
            color:"#00ffff",
        },
        {
            id:3,
            name:"ルリ",
            introduceTweetId:"1879453474661777549",
            color:"#0000ff",
        },
        {
            id:4,
            name:"スズ",
            introduceTweetId: "1879815861902647388",
            color:"#ff0000"
        },
        {
            id:5,
            name:"シンジュ",
            introduceTweetId:"1880193349136838830",
            color:"#ffff00",
        },
        {
            id:6,
            name:"コハク",
            introduceTweetId:"1880540647691587684",
            color:"#ff00ff",
        },
        {
            id:7,
            name:"ユウレン",
            introduceTweetId:"1880903030205517885",
            color:"#ffff00",
        },
        {
            id:8,
            name:"ヒスイ",
            introduceTweetId:"1881265418603786573",
            color:"#ff00ff",
        },
        {
            id:9,
            name:"ホタル",
            introduceTweetId:"1881627800299565408",
            color:"#ff00ff",
        },
        {
            id:10,
            name:"ザクロ",
            introduceTweetId:"1881990198072062114",
            color:"#ff00ff",
        }
    ]
}