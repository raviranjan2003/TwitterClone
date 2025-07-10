import { Tweet } from "@prisma/client";
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

const extraResolver = {
    Tweet: {
        author: (parent: Tweet) => prisma.user.findUnique({ where : { id: parent.authorId }}),
    }
}
export const resolvers = { mutations, extraResolver };