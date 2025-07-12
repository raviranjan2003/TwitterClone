export const queries = `#graphql
    getAllTweets: [Tweet]
    getPresignedUrl(imageName: String!, imageType: String!): String!
`