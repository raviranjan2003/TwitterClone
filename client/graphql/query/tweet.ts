import { graphql } from "@/gql";

export const getAllTweetsQuery = graphql(`#graphql
    query GetAllTweets {
        getAllTweets {
            id
            content
            imageUrl
            author {
                id
                firstName
                lastName
                profileImageUrl
            }
        }
    }
`)

export const getPresignedUrlQuery = graphql(`#graphql
    query GetPresignedUrl($imageName: String!, $imageType: String!) {
        getPresignedUrl(imageName: $imageName, imageType: $imageType)
    }
`)