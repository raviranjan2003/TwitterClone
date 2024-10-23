import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import express, { query } from 'express';
import { User } from './user';

export async function initServer() {
    const app = express();

    app.use(bodyParser.json());

    const graphqlServer = new ApolloServer({
        typeDefs: `
            ${User.types}

            type Query {
                ${User.queries}
            }
        `,
        resolvers: {
            Query: {
                // sayHello: () => "Hello from GraphQL server",
                // sayHelloToMe: (parent: any, {name}:{name: string}) => `Hello ${name}`
                ...User.resolvers.queries,
            }
        }
    });

    await graphqlServer.start();

    app.use('/graphql', expressMiddleware(graphqlServer));

    return app;
}