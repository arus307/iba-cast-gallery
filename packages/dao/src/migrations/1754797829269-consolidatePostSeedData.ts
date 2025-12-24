// @ts-nocheck
// This is a new migration to consolidate all the previous post seeding migrations.

import { Post } from "../entities/Post";
import { MigrationInterface, QueryRunner } from "typeorm";

export class ConsolidatePostSeedData1754797829269 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Query casts directly from the database without using the Cast entity
        const castsResult = await queryRunner.query(`SELECT id FROM casts`);
        const castIds = new Set(castsResult.map((c: any) => c.id));

        // Consolidate posts from all previous migrations
        const posts: Post[] = basePosts.map((basePost) => {
            const post = new Post();
            post.id = basePost.id;
            post.postedAt = basePost.postedAt;
            post.isDeleted = false; // Default to not deleted
            post.castTags = basePost.taggedCastIds.map((castId, index) => {
                if (!castIds.has(castId)) {
                    throw new Error(`Cast with id ${castId} not found`);
                }
                const postCastTag = new (require("../entities/PostCastTag").PostCastTag);
                postCastTag.castid = castId;
                postCastTag.postId = basePost.id;
                postCastTag.order = index;
                return postCastTag;
            });
            return post;
        });

        await queryRunner.manager.save(posts);

        // Update posts that should be marked as deleted
        await queryRunner.manager.createQueryBuilder()
            .update(Post)
            .set({ isDeleted: true })
            .where("id IN (:...ids)", { ids: deletedPostIds })
            .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const idsToDelete = basePosts.map(p => p.id);
        await queryRunner.manager.createQueryBuilder()
            .delete()
            .from(Post)
            .where("id IN (:...ids)", { ids: idsToDelete })
            .execute();
    }
}

const deletedPostIds = [
    '1875806976611102749', '1881537451149476037', '1881627800299565408',
    '1882262384200634748', '1882624801074012358', '1882702860233953636',
    '1885213014464618763', '1893501977658569064', '1898207056508645842',
    '1900394693659418728', '1903283218281009486', '1905106186762129677'
];

const basePosts: {
    id: string;
    postedAt: string;
    taggedCastIds: number[];
}[] = [
    // Data from 1744434707150
    { id: "1863523515242049540", postedAt: "2024-12-02T19:00:13+09:00", taggedCastIds: [11] },
    { id: "1863885898036949230", postedAt: "2024-12-03T19:00:33+09:00", taggedCastIds: [12] },
    { id: "1864248285940134212", postedAt: "2024-12-04T19:00:05+09:00", taggedCastIds: [13] },
    { id: "1864610677970678102", postedAt: "2024-12-05T19:00:23+09:00", taggedCastIds: [14] },
    { id: "1864957970074812418", postedAt: "2024-12-06T18:00:37+09:00", taggedCastIds: [15] },
    { id: "1865320343021510917", postedAt: "2024-12-07T18:00:51+09:00", taggedCastIds: [16] },
    { id: "1865682737044324518", postedAt: "2024-12-08T18:00:09+09:00", taggedCastIds: [17] },
    { id: "1866045128546066870", postedAt: "2024-12-09T18:00:26+09:00", taggedCastIds: [18] },
    { id: "1866407506458628516", postedAt: "2024-12-10T18:00:40+09:00", taggedCastIds: [19] },
    { id: "1866769902364729735", postedAt: "2024-12-11T18:00:57+09:00", taggedCastIds: [20] },
    { id: "1867132291245391919", postedAt: "2024-12-12T18:00:12+09:00", taggedCastIds: [21] },
    { id: "1867494673235030407", postedAt: "2024-12-13T18:00:28+09:00", taggedCastIds: [22] },
    { id: "1867857065991180791", postedAt: "2024-12-14T18:00:46+09:00", taggedCastIds: [23] },
    { id: "1868219445488873908", postedAt: "2024-12-15T18:00:01+09:00", taggedCastIds: [24] },
    { id: "1868581846201540798", postedAt: "2024-12-16T18:00:17+09:00", taggedCastIds: [25] },
    { id: "1868944227335626921", postedAt: "2024-12-17T18:00:41+09:00", taggedCastIds: [26] },
    { id: "1873194540800348304", postedAt: "2024-12-29T11:29:00+09:00", taggedCastIds: [3] },
    { id: "1873202290749739453", postedAt: "2024-12-29T12:00:00+09:00", taggedCastIds: [7] },
    { id: "1873544835459952970", postedAt: "2024-12-30T10:41:00+09:00", taggedCastIds: [4] },
    { id: "1873587315693551743", postedAt: "2024-12-30T13:30:00+09:00", taggedCastIds: [3] },
    { id: "1875806976611102749", postedAt: "2025-01-05T16:30:00+09:00", taggedCastIds: [7, 9] },
    { id: "1877914879153336333", postedAt: "2025-01-11T12:06:00+09:00", taggedCastIds: [1, 8] },
    { id: "1878744119239209193", postedAt: "2025-01-13T19:01:37+09:00", taggedCastIds: [1] },
    { id: "1879091090134864220", postedAt: "2025-01-14T18:00:53+09:00", taggedCastIds: [2] },
    { id: "1879453474661777549", postedAt: "2025-01-15T18:00:08+09:00", taggedCastIds: [3] },
    { id: "1879815861902647388", postedAt: "2025-01-16T18:00:22+09:00", taggedCastIds: [4] },
    { id: "1879831215928446988", postedAt: "2025-01-16T19:01:00+09:00", taggedCastIds: [3, 6, 7, 11, 21] },
    { id: "1880095224854376552", postedAt: "2025-01-17T12:30:00+09:00", taggedCastIds: [1, 7] },
    { id: "1880193349136838830", postedAt: "2025-01-17T19:00:38+09:00", taggedCastIds: [5] },
    { id: "1880540647691587684", postedAt: "2025-01-18T18:00:53+09:00", taggedCastIds: [6] },
    { id: "1880815174992667049", postedAt: "2025-01-19T12:10:00+09:00", taggedCastIds: [4, 8] },
    { id: "1880903030205517885", postedAt: "2025-01-19T18:00:09+09:00", taggedCastIds: [7] },
    { id: "1881182364220494216", postedAt: "2025-01-20T12:30:00+09:00", taggedCastIds: [4, 6] },
    { id: "1881265418603786573", postedAt: "2025-01-20T18:00:26+09:00", taggedCastIds: [8] },
    { id: "1881537451149476037", postedAt: "2025-01-21T12:01:00+09:00", taggedCastIds: [4, 9] },
    { id: "1881627800299565408", postedAt: "2025-01-21T18:00:44+09:00", taggedCastIds: [9] },
    { id: "1881990198072062114", postedAt: "2025-01-22T18:00:59+09:00", taggedCastIds: [10] },
    { id: "1882262384200634748", postedAt: "2025-01-23T12:01:00+09:00", taggedCastIds: [4, 9, 13, 16, 15] },
    { id: "1882624801074012358", postedAt: "2025-01-24T12:01:00+09:00", taggedCastIds: [4, 9, 14, 16, 24] },
    { id: "1882702860233953636", postedAt: "2025-01-24T17:11:00+09:00", taggedCastIds: [1, 9, 15] },
    { id: "1882986731198382263", postedAt: "2025-01-25T11:59:00+09:00", taggedCastIds: [3, 8] },
    { id: "1883746093793706305", postedAt: "2025-01-27T14:17:00+09:00", taggedCastIds: [2, 3, 12, 16, 24] },
    { id: "1883814188273004679", postedAt: "2025-01-27T18:47:00+09:00", taggedCastIds: [2, 4, 7, 21] },
    { id: "1884093389395918902", postedAt: "2025-01-28T13:17:00+09:00", taggedCastIds: [1, 3] },
    { id: "1884849614945452337", postedAt: "2025-01-30T15:22:00+09:00", taggedCastIds: [3, 7] },
    { id: "1885161084950356456", postedAt: "2025-01-31T12:00:00+09:00", taggedCastIds: [4] },
    { id: "1885213014464618763", postedAt: "2025-01-31T15:26:00+09:00", taggedCastIds: [4, 7, 9, 13, 14, 16, 24] },
    { id: "1885523474044903811", postedAt: "2025-02-01T12:00:00+09:00", taggedCastIds: [1, 7] },
    { id: "1885885857237770475", postedAt: "2025-02-02T12:00:00+09:00", taggedCastIds: [1, 7] },
    { id: "1885995193951990214", postedAt: "2025-02-02T19:14:00+09:00", taggedCastIds: [4, 10] },
    { id: "1886249107251147163", postedAt: "2025-02-03T12:03:00+09:00", taggedCastIds: [1, 7] },
    { id: "1886697451790459160", postedAt: "2025-02-04T17:45:00+09:00", taggedCastIds: [4, 7, 11, 20, 21] },
    { id: "1887353106989756603", postedAt: "2025-02-06T13:10:00+09:00", taggedCastIds: [1, 25, 15, 17] },
    { id: "1887730331002020056", postedAt: "2025-02-07T14:09:00+09:00", taggedCastIds: [4, 7] },
    { id: "1889257637247869435", postedAt: "2025-02-11T19:18:53+09:00", taggedCastIds: [27] },
    { id: "1889600335628419178", postedAt: "2025-02-12T18:00:07+09:00", taggedCastIds: [28] },
    { id: "1889962726941929531", postedAt: "2025-02-13T18:00:20+09:00", taggedCastIds: [29] },
    { id: "1890325126941380782", postedAt: "2025-02-14T18:00:38+09:00", taggedCastIds: [30] },
    { id: "1890705595193254286", postedAt: "2025-02-15T12:00:00+09:00", taggedCastIds: [1, 4, 7] },
    { id: "1890687498034053386", postedAt: "2025-02-15T18:00:56+09:00", taggedCastIds: [31] },
    { id: "1891049886948216908", postedAt: "2025-02-16T18:00:07+09:00", taggedCastIds: [32] },
    { id: "1891335257989042368", postedAt: "2025-02-17T12:53:00+09:00", taggedCastIds: [8] },
    { id: "1891412282145673705", postedAt: "2025-02-17T18:00:18+09:00", taggedCastIds: [33] },
    { id: "1891688310898295004", postedAt: "2025-02-18T12:16:00+09:00", taggedCastIds: [10] },
    { id: "1893501977658569064", postedAt: "2025-02-23T12:23:00+09:00", taggedCastIds: [3, 7, 9] },
    { id: "1893923476190233001", postedAt: "2025-02-24T16:18:00+09:00", taggedCastIds: [3, 4, 7] },
    { id: "1894339084098965761", postedAt: "2025-02-25T19:50:00+09:00", taggedCastIds: [3, 6] },
    { id: "1895026879217967374", postedAt: "2025-02-27T17:23:00+09:00", taggedCastIds: [3, 6] },
    { id: "1895322138992836843", postedAt: "2025-02-28T12:56:00+09:00", taggedCastIds: [4, 6, 22, 30, 24] },
    { id: "1895406378891821101", postedAt: "2025-02-28T18:31:00+09:00", taggedCastIds: [3, 7] },
    { id: "1895677974835573083", postedAt: "2025-03-01T12:30:00+09:00", taggedCastIds: [6, 7] },
    { id: "1896046454550249503", postedAt: "2025-03-02T12:54:00+09:00", taggedCastIds: [6] },
    { id: "1896395150571753708", postedAt: "2025-03-03T12:00:00+09:00", taggedCastIds: [7, 8] },
    { id: "1896515926029467682", postedAt: "2025-03-03T20:00:00+09:00", taggedCastIds: [3, 6, 7] },
    { id: "1896809325823410206", postedAt: "2025-03-04T15:25:00+09:00", taggedCastIds: [8, 29, 15, 20] },
    { id: "1897487373036110272", postedAt: "2025-03-06T12:20:00+09:00", taggedCastIds: [1, 15, 21, 13] },
    { id: "1897581532405178554", postedAt: "2025-03-06T18:34:00+09:00", taggedCastIds: [1, 3, 4, 7] },
    { id: "1897847884068028730", postedAt: "2025-03-07T12:12:00+09:00", taggedCastIds: [3, 8, 15, 29, 24] },
    { id: "1897936356845982064", postedAt: "2025-03-07T18:04:00+09:00", taggedCastIds: [6, 7] },
    { id: "1898207056508645842", postedAt: "2025-03-08T12:00:00+09:00", taggedCastIds: [1, 4, 9, 27, 18, 22] },
    { id: "1898252344715772314", postedAt: "2025-03-08T15:00:00+09:00", taggedCastIds: [6] },
    { id: "1898939424337232142", postedAt: "2025-03-10T12:30:00+09:00", taggedCastIds: [2, 15, 25, 29] },
    { id: "1898989910608200103", postedAt: "2025-03-10T15:30:00+09:00", taggedCastIds: [1, 6, 32, 12, 22] },
    { id: "1899303488083185773", postedAt: "2025-03-11T12:36:00+09:00", taggedCastIds: [2, 4, 20, 15, 31] },
    { id: "1900019031463387549", postedAt: "2025-03-13T12:00:00+09:00", taggedCastIds: [1, 3, 15, 17, 29, 34] },
    { id: "1900085416411488684", postedAt: "2025-03-13T16:23:00+09:00", taggedCastIds: [6, 7, 8] },
    { id: "1900394693659418728", postedAt: "2025-03-14T12:52:00+09:00", taggedCastIds: [3, 9, 23, 31, 20] },
    { id: "1900745122834464846", postedAt: "2025-03-15T12:05:00+09:00", taggedCastIds: [4, 7, 8, 18, 27, 17] },
    { id: "1901471553596080220", postedAt: "2025-03-17T12:12:02+09:00", taggedCastIds: [8, 37, 35, 30, 29, 25] },
    { id: "1901520219312664948", postedAt: "2025-03-17T15:25:35+09:00", taggedCastIds: [1, 4, 7] },
    { id: "1901833643255087367", postedAt: "2025-03-18T12:10:25+09:00", taggedCastIds: [3, 4, 17, 22, 29] },
    { id: "1901943093060042812", postedAt: "2025-03-18T19:25:00+09:00", taggedCastIds: [5, 7] },
    { id: "1902570679737970981", postedAt: "2025-03-20T12:59:14+09:00", taggedCastIds: [2, 3, 18, 20, 24, 36] },
    { id: "1902920004288524396", postedAt: "2025-03-21T12:07:35+09:00", taggedCastIds: [3, 8, 11, 12, 13] },
    { id: "1903283218281009486", postedAt: "2025-03-22T03:10:16+09:00", taggedCastIds: [1, 9] },
    { id: "1903650825517629623", postedAt: "2025-03-23T12:31:49+09:00", taggedCastIds: [6, 1, 16, 18, 17] },
    { id: "1903995217197547803", postedAt: "2025-03-24T11:20:34+09:00", taggedCastIds: [8] },
    { id: "1904005284353470820", postedAt: "2025-03-24T12:00:28+09:00", taggedCastIds: [2, 8] },
    { id: "1904370134749413558", postedAt: "2025-03-25T12:09:01+09:00", taggedCastIds: [1, 3, 12, 17, 29] },
    { id: "1904451541521834316", postedAt: "2025-03-25T17:33:33+09:00", taggedCastIds: [1, 2, 3, 7] },
    { id: "1904775601380303266", postedAt: "2025-03-26T15:01:40+09:00", taggedCastIds: [6, 7] },
    { id: "1905106186762129677", postedAt: "2025-03-27T12:54:35+09:00", taggedCastIds: [9, 37, 15, 29, 17] },
    { id: "1905193717893603355", postedAt: "2025-03-27T18:42:23+09:00", taggedCastIds: [4, 7, 19, 14, 25] },
    { id: "1905439699596181863", postedAt: "2025-03-28T11:00:35+09:00", taggedCastIds: [2] },
    { id: "1905457543415300152", postedAt: "2025-03-28T12:10:49+09:00", taggedCastIds: [2, 8, 12, 15, 20] },
    { id: "1905560498726142428", postedAt: "2025-03-28T19:00:20+09:00", taggedCastIds: [1, 35] },
    { id: "1905818059560083525", postedAt: "2025-03-29T12:03:08+09:00", taggedCastIds: [3, 4, 30, 24, 13] },
    { id: "1906180133381357886", postedAt: "2025-03-30T12:02:52+09:00", taggedCastIds: [4] },
    { id: "1906237520633037047", postedAt: "2025-03-30T15:50:52+09:00", taggedCastIds: [1, 7] },
    { id: "1906541975299637575", postedAt: "2025-03-31T12:00:45+09:00", taggedCastIds: [35] },
    { id: "1906990689742725433", postedAt: "2025-04-01T17:43:30+09:00", taggedCastIds: [5, 34] },
    { id: "1907633390448423219", postedAt: "2025-04-03T12:16:50+09:00", taggedCastIds: [37, 6, 2] },
    { id: "1907667548310827086", postedAt: "2025-04-03T14:32:39+09:00", taggedCastIds: [7, 6] },
    { id: "1907993666242953319", postedAt: "2025-04-04T12:08:30+09:00", taggedCastIds: [1, 6, 37, 15, 17, 22] },
    { id: "1908067101434065314", postedAt: "2025-04-04T17:00:14+09:00", taggedCastIds: [1, 7, 37, 16, 28, 11] },
    { id: "1908356413191315728", postedAt: "2025-04-05T12:09:08+09:00", taggedCastIds: [4, 37, 12, 24, 26] },
    { id: "1908716412362981782", postedAt: "2025-04-06T12:00:03+09:00", taggedCastIds: [8, 34, 6, 25, 31, 17] },
    { id: "1909088380119629899", postedAt: "2025-04-07T12:38:14+09:00", taggedCastIds: [3, 7, 16, 20, 22] },
    { id: "1909150153338155203", postedAt: "2025-04-07T16:44:56+09:00", taggedCastIds: [7] },
    // Data from 1744807288406
    { id: "1909442405776113834", postedAt: "2025-04-08T12:05:00+09:00", taggedCastIds: [37, 4, 22, 16, 15] },
    { id: "1910166462553358624", postedAt: "2025-04-10T12:02:00+09:00", taggedCastIds: [36, 6, 29, 22, 15] },
    { id: "1910533159294558531", postedAt: "2025-04-11T12:19:00+09:00", taggedCastIds: [36, 37, 25, 17, 31] },
    { id: "1910615238145171504", postedAt: "2025-04-11T17:45:00+09:00", taggedCastIds: [1, 37, 3, 16, 19, 13] },
    { id: "1910891740443414615", postedAt: "2025-04-12T12:04:00+09:00", taggedCastIds: [37, 8, 18, 11, 27] },
    { id: "1911253566117081478", postedAt: "2025-04-13T12:02:00+09:00", taggedCastIds: [8, 35] },
    { id: "1911615405011112273", postedAt: "2025-04-14T12:00:00+09:00", taggedCastIds: [1, 36] },
    { id: "1911721093628567673", postedAt: "2025-04-14T19:00:00+09:00", taggedCastIds: [35] },
    { id: "1911977941090877490", postedAt: "2025-04-15T12:00:00+09:00", taggedCastIds: [37, 4, 20, 15, 13] },
    { id: "1912043473416724579", postedAt: "2025-04-15T16:21:00+09:00", taggedCastIds: [1, 37, 4, 3, 25, 11, 12] },
    { id: "1912083488758792543", postedAt: "2025-04-15T19:00:00+09:00", taggedCastIds: [36] },
    { id: "1912445864242757802", postedAt: "2025-04-16T19:00:00+09:00", taggedCastIds: [37] },
    // Data from 1745137788142
    { id: "1912702844660322443", postedAt: "2025-04-17T12:01:00+09:00", taggedCastIds: [34, 6, 24, 13, 15], },
    { id: "1912830902922580054", postedAt: "2025-04-17T12:01:00+09:00", taggedCastIds: [34], },
    { id: "1913066864655380630", postedAt: "2025-04-18T12:07:00+09:00", taggedCastIds: [37, 3, 6, 15, 33, 17], },
    { id: "1913122044335870356", postedAt: "2025-04-18T15:46:00+09:00", taggedCastIds: [1, 7, 3, 24, 19, 25], },
    { id: "1913427640385757594", postedAt: "2025-04-19T12:01:00+09:00", taggedCastIds: [37, 6, 30, 16, 12], },
    { id: "1913791315378102533", postedAt: "2025-04-20T12:06:00+09:00", taggedCastIds: [37, 4, 24, 12], },
    // Data from 1745236447444
    { id: "1914154099953877491", postedAt: "2025-04-21T12:07:00+09:00", taggedCastIds: [36, 4, 13, 25, 24,], },
    // Data from 1745501143243
    { id: "1914514500432154700", postedAt: "2025-04-22T12:00:00+09:00", taggedCastIds: [34, 1, 20, 13, 15], },
    { id: "1915240068828319816", postedAt: "2025-04-23T12:03:00+09:00", taggedCastIds: [7, 6, 37, 20, 15, 17], },
    // Data from 1745645058483
    { id: "1915631882144014477", postedAt: "2025-04-25T14:00:00+09:00", taggedCastIds: [6, 37, 25, 16, 13], },
    { id: "1915969731032707300", postedAt: "2025-04-26T12:22:00+09:00", taggedCastIds: [36, 4, 25, 11, 16], },
    // Data from 1745918273553
    { id: "1916689034728128905", postedAt: "2025-04-28T12:00:00+09:00", taggedCastIds: [6, 36, 19, 30, 25], },
    { id: "1916797510217351649", postedAt: "2025-04-28T19:11:00+09:00", taggedCastIds: [35, 3, 7], },
    { id: "1917057688460267747", postedAt: "2025-04-29T12:25:00+09:00", taggedCastIds: [37, 4, 24, 12, 13], },
    // Data from 1746260661499
    { id: "1918141989624979829", postedAt: "2025-05-02T12:14:00+09:00", taggedCastIds: [36, 37, 22, 25, 17], },
    { id: "1918502746790994094", postedAt: "2025-05-03T12:07:00+09:00", taggedCastIds: [8, 36, 37, 24, 19, 22], },
];
