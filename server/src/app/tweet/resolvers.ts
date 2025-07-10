import { prisma } from "../../clients/db";
import { GraphqlContext } from "../../interface";

interface CreateTweetPayload {
    content: string;
    imageUrl: string
}

const mutations = {
    createTweet: async (parent: any, { payload }:{ payload: CreateTweetPayload}, ctx: GraphqlContext) => {
        if(!ctx.user) throw new Error("You are not authenticated!");

        const tweet = await prisma.tweet.create({
            data: {
                content: payload.content,
                imageUrl: payload.imageUrl,
                author: { connect: { id: ctx.user.id }}
            }
        })
        return tweet;
    }
}

export const resolvers = { mutations };