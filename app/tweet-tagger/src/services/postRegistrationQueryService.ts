import "server-only";
import "reflect-metadata";
import { Post, Repository, Shift } from "@iba-cast-gallery/dao";
import { ShiftSlot } from "@iba-cast-gallery/types";
import { appDataSource, initializeDatabase } from "../data-source";

export type PostRegistrationDetail = {
    post: Post;
    shift: {
        date: string;
        slot: ShiftSlot;
        castIds: number[];
    } | null;
};

export async function getPostRegistrationDetail(
    postId: string,
): Promise<PostRegistrationDetail | null> {
    await initializeDatabase();

    const postRepository: Repository<Post> = appDataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id: postId } });
    if (!post) {
        return null;
    }

    const shiftRepository: Repository<Shift> =
        appDataSource.getRepository(Shift);
    const shiftRecords = await shiftRepository.find({
        where: { sourcePostId: postId },
        order: { castId: "ASC" },
    });
    const firstShift = shiftRecords[0];

    return {
        post,
        shift: firstShift
            ? {
                date: firstShift.date,
                slot: firstShift.shift,
                castIds: shiftRecords
                    .filter(
                        (record) =>
                            record.date === firstShift.date &&
                            record.shift === firstShift.shift,
                    )
                    .map((record) => record.castId),
            }
            : null,
    };
}
