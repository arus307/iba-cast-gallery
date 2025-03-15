import dayjs from "dayjs";

export const db: {
    tweets: CastMediaTweet[];
    casts: Cast[];
} =
{
    "tweets":[
        {
            id:"1873194540800348304",
            postedAt: dayjs("2024-12-29T11:29:00+9:00"),
            taggedCastIds:[3]
        },
        {
            id:"1873202290749739453",
            postedAt: dayjs("2024-12-29T12:00:00+9:00"),
            taggedCastIds:[7]
        },
        {
            id:"1873544835459952970",
            postedAt: dayjs("2024-12-30T10:41:00+9:00"),
            taggedCastIds:[4]
        },
        {
            id:"1873587315693551743",
            postedAt: dayjs("2024-12-30T13:30:00+9:00"),
            taggedCastIds:[3]
        },
        {
            id:"1875806976611102749",
            postedAt: dayjs("2025-01-05T16:30:00+9:00"),
            taggedCastIds:[7,9]
        },
        {
            id:"1877914879153336333",
            postedAt: dayjs("2025-01-11T12:06:00+9:00"),
            taggedCastIds:[1,8]
        },
        {
            id:"1879831215928446988",
            postedAt: dayjs("2025-01-16T19:01:00+9:00"),
            taggedCastIds:[3,6,7]
        },
        {
            id:"1880095224854376552",
            postedAt: dayjs("2025-01-17T12:30:00+9:00"),
            taggedCastIds:[1,7]
        },
        {
            id:"1880815174992667049",
            postedAt: dayjs("2025-01-19T12:10:00+9:00"),
            taggedCastIds:[4,8]
        },
        {
            id:"1881182364220494216",
            postedAt: dayjs("2025-01-20T12:30:00+9:00"),
            taggedCastIds:[7,6]
        },
        {
            id:"1881537451149476037",
            postedAt: dayjs("2025-01-21T12:01:00+9:00"),
            taggedCastIds:[4,9]
        },
        {
            id:"1882262384200634748",
            postedAt: dayjs("2025-01-23T12:01:00+9:00"),
            taggedCastIds:[4,9]
        },
        {
            id:"1882624801074012358",
            postedAt: dayjs("2025-01-24T12:01:00+9:00"),
            taggedCastIds:[4,9]
        },
        {
            id:"1882702860233953636",
            postedAt: dayjs("2025-01-24T17:11:00+9:00"),
            taggedCastIds:[1,9]
        },
        {
            id:"1882986731198382263",
            postedAt: dayjs("2025-01-25T11:59:00+9:00"),
            taggedCastIds:[3,8]
        },
        {
            id:"1883746093793706305",
            postedAt: dayjs("2025-01-27T14:17:00+9:00"),
            taggedCastIds:[2,3]
        },
        {
            id:"1883814188273004679",
            postedAt: dayjs("2025-01-27T18:47:00+9:00"),
            taggedCastIds:[2,4,7]
        },
        {
            id:"1884093389395918902",
            postedAt: dayjs("2025-01-28T13:17:00+9:00"),
            taggedCastIds:[1,3]
        },
        {
            id:"1884849614945452337",
            postedAt: dayjs("2025-01-30T15:22:00+9:00"),
            taggedCastIds:[3,7]
        },
        {
            id:"1885161084950356456",
            postedAt: dayjs("2025-01-31T12:00:00+9:00"),
            taggedCastIds:[4]
        },
        {
            id:"1885213014464618763",
            postedAt: dayjs("2025-01-31T15:26:00+9:00"),
            taggedCastIds:[4,7,9]
        }
        // 1月末までのデータ
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
        },
    ]
}