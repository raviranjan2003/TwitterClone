import { Tweet } from "@prisma/client";
import { prisma } from "../../clients/db";
import { GraphqlContext } from "../../interface";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl} from "@aws-sdk/s3-request-presigner"
import UserService from "../../services/user";

interface CreateTweetPayload {
    content: string;
    imageUrl: string
}

const s3Client = new S3Client({ 
    region: process.env.AWS_DEFAULT_REGION,
});

const queries = {
    getAllTweets: () => prisma.tweet.findMany({ orderBy: { createdAt: "desc" }}),
    getPresignedUrl: async (parent: any, { imageName, imageType }:{ imageName: string, imageType: string }, ctx: GraphqlContext)  => {
        if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated User!!");

        const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
        
        if(!allowedTypes.includes(imageType)) throw new Error("Unsupported Image Type!");
        console.log(process.env.AWS_S3_BUCKET_NAME);
        const putObjectCommand = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now().toString()}.${imageType}`
        })

        const signedUrl = await getSignedUrl(s3Client, putObjectCommand);

        return signedUrl;

    }
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
        author: (parent: Tweet) => UserService.getUserById(parent.authorId),
    }
}
export const resolvers = { mutations, extraResolver, queries };