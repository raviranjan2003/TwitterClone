import { PrismaClient, User } from "@prisma/client";
import axios from "axios";
import { prisma } from "../../clients/db";
import JWTServices from "../../services/jwt";
import { GraphqlContext } from "../../interface";

interface GoogleTokenResult {
    iss?: string;
    nbf?: string;
    aud?: string;
    sub?: string;
    email: string;
    email_verified: string;
    azp?: string;
    name?: string;
    picture?: string;
    given_name: string;
    family_name: string;
    iat?: string;
    exp?: string;
    jti?: string;
    alg?: string;
    kid?: string;
    typ?: string;
}

const queries = {
    verifyGoogleToken: async(parent: any, {token} : {token: string}) => {
        const googleToken = token;

        const googleAuthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
        googleAuthURL.searchParams.set('id_token', googleToken);

        const { data } = await axios.get<GoogleTokenResult>(googleAuthURL.toString(), {
            responseType: "json"
        })
        console.log(data);

        const user = await prisma.user.findUnique({ where: { email : data.email }});

        if(!user) {
            await prisma.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name,
                    lastName: data.family_name,
                    profileImageUrl: data.picture
                }
            })
        }
        const userInDb = await prisma.user.findUnique({ where: {email: data.email}});

        if(!userInDb) throw new Error("User with email not found !");

        const jwtToken = await JWTServices.generateToken(userInDb);
        return jwtToken;
    },
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        const id = ctx.user?.id;
        if(!id) return null;

        const user = await prisma.user.findUnique({ where : { id }});

        if(!user) return "User Not Found !";
        return user;
    },

    getUserById: async (parent: any, { id }: {id: string}, ctx: GraphqlContext) => prisma.user.findUnique({ where: { id }}),
}

const extraResolver = {
    User: {
        tweets: (parent: User) => prisma.tweet.findMany({ where : { author: { id : parent.id }}})
    }
}
export const resolvers = { queries, extraResolver };