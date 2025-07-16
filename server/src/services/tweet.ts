import { prisma } from "../clients/db";

export interface CreateTweetPayload {
    content: string;
    imageUrl: string;
    userId: string;
}

class TweetService {
    public static createTweet(data: CreateTweetPayload) {
        return prisma.tweet.create({
            data: {
                content: data.content,
                imageUrl: data.imageUrl,
                author: { connect: { id: data.userId }}
            }
        })
    }

    public static getAllTweets() {
        return prisma.tweet.findMany({ orderBy: { createdAt: "desc" }});
    }
}

export default TweetService;