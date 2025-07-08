import { graphqlClient } from "@/clients/api";
import { getCurrentUserQuery } from "@/graphql/query/user";
import { useQuery } from "@tanstack/react-query";
import { GetCurrentUserQuery } from "@/gql/graphql"; // adjust import path as needed

export const useCurrentUser = () => {
    const query = useQuery<GetCurrentUserQuery>({
        queryKey: ['current-user'],
        queryFn: () => graphqlClient.request(getCurrentUserQuery),
    });

    return { ...query, user: query.data?.getCurrentUser };
};