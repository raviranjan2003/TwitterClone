import { PrismaClient, User } from "@prisma/client";
import axios from "axios";
import { prisma } from "../../clients/db";
import JWTServices from "../../services/jwt";
import { GraphqlContext } from "../../interface";
import UserService from "../../services/user";



const queries = {
    verifyGoogleToken: async(parent: any, {token} : {token: string}) => {
        const resultToken = await UserService.verifyGoogleAuthToken(token);

        return resultToken;
    },
    getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
        const id = ctx.user?.id;
        if(!id) return null;

        const user = await UserService.getUserById(id);

        if(!user) return "User Not Found !";
        return user;
    },

    getUserById: async (parent: any, { id }: {id: string}, ctx: GraphqlContext) => UserService.getUserById(id),
}

const extraResolver = {
  User: {
    tweets: (parent: User) =>
      prisma.tweet.findMany({ where: { author: { id: parent.id } } }),
    followers: async (parent: User) => {
      const result = await prisma.follows.findMany({
        where: { following: { id: parent.id } }, 
        include: { followers: true },
      });
      return result.map(el => el.followers);
    },
    following: async (parent: User) => {
      const result = await prisma.follows.findMany({
        where: { followers: { id: parent.id } },
        include: { following: true },
      });
      return result.map(el => el.following);
    },
  },
};

const mutations = {
    followUser: async (parent: any, { to }:{to: string}, ctx: GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated User!");

        const res = await UserService.followUser(ctx.user.id, to);
        console.log("Res===>", res);
        return true;
    },
    unfollowUser: async (parent: any, { to }:{to: string}, ctx: GraphqlContext) => {
        if(!ctx.user || !ctx.user.id) throw new Error("Unauthenticated User!");

        const res = await UserService.unfollowUser(ctx.user.id, to);
        console.log("Res===>", res);
        return true;
    }
}
export const resolvers = { queries, extraResolver, mutations };