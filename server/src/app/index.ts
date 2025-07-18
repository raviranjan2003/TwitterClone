import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import express, { query } from 'express';
import { User } from './user';
import { Tweet } from './tweet';
import cors from 'cors';
import { GraphqlContext } from '../interface';
import JWTServices from '../services/jwt';

export async function initServer() {
    const app = express();

    app.use(bodyParser.json());
    app.use(cors());

    const graphqlServer = new ApolloServer<GraphqlContext>({
        typeDefs: `
            ${User.types}
            ${Tweet.types}

            type Query {
                ${User.queries}
                ${Tweet.queries}
            }
            
            type Mutation {
                ${Tweet.mutations}
                ${User.mutations}
            }
        `,
        resolvers: {
            Query: {
                // sayHello: () => "Hello from GraphQL server",
                // sayHelloToMe: (parent: any, {name}:{name: string}) => `Hello ${name}`
                ...User.resolvers.queries,
                ...Tweet.resolvers.queries,
            },
            Mutation: {
                ...Tweet.resolvers.mutations,
                ...User.resolvers.mutations,
            },
            ...Tweet.resolvers.extraResolver,
            ...User.resolvers.extraResolver,
        }
    });

    await graphqlServer.start();

    app.use('/graphql', expressMiddleware(graphqlServer, {
        context: async ({ req, res }) => {
            return {
                user: req.headers.authorization 
                ? JWTServices.decode(req.headers.authorization.split(" ")[1]) 
                : undefined
            }
        }
    }));

    return app;
}