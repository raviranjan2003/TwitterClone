import { graphqlClient } from "@/clients/api";
import FeedCard from "@/components/FeedCard";
import TwitterLayout from "@/components/FeedCard/Layout/TwitterLayout";
import { Tweet, User, GetUserByIdQuery } from "@/gql/graphql";
import { followUserMutation, unfollowUserMutation } from "@/graphql/mutation/user";
import { getUserByIdQuery } from "@/graphql/query/user";
import { useCurrentUser, useUserById } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { BsArrowLeftShort } from "react-icons/bs";

interface ServerProps {
  userInfo?: User
}

const UserProfilePage: NextPage<ServerProps> = (props) => {
  const { user } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Use the user data from server-side props as initial data, but prefer real-time data
  const profileUser = props.userInfo;
  const { user: realTimeUser } = useUserById(profileUser?.id || '');

  // Use real-time user data if available, otherwise fall back to server-side props
  const displayUser = realTimeUser || profileUser;

  // Add local state for optimistic updates
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState<boolean | null>(null);

  // Check if current user is following the profile user
  // We need to check if the profile user is in the current user's following list
  const isFollowing = useMemo(() => {
    if (isFollowingOptimistic !== null) return isFollowingOptimistic;
    if (!user || !displayUser) return false;
    
    // Check if the profile user is in the current user's following list
    return user.following?.some(followingUser => followingUser?.id === displayUser.id) ?? false;
  }, [user, displayUser, isFollowingOptimistic]);

  const handleFollow = useCallback(async () => {
    if (!displayUser?.id) return;

    // Optimistic update
    setIsFollowingOptimistic(true);

    try {
      await graphqlClient.request(followUserMutation, { to: displayUser.id });
      
      // Invalidate both current user and the specific user profile queries
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await queryClient.invalidateQueries({ queryKey: ["getUserById", displayUser.id] });
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowingOptimistic(null);
      console.error("Error following user:", error);
    }
  }, [displayUser?.id, queryClient]);

  const handleUnfollow = useCallback(async () => {
    if (!displayUser?.id) return;

    // Optimistic update
    setIsFollowingOptimistic(false);

    try {
      await graphqlClient.request(unfollowUserMutation, { to: displayUser.id });
      
      // Invalidate both current user and the specific user profile queries
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await queryClient.invalidateQueries({ queryKey: ["getUserById", displayUser.id] });
    } catch (error) {
      // Revert optimistic update on error
      setIsFollowingOptimistic(null);
      console.error("Error unfollowing user:", error);
    }
  }, [displayUser?.id, queryClient]);

  return (
    <TwitterLayout>
      <div>
        <nav className="flex items-center gap-3 px-3 py-3">
          <BsArrowLeftShort 
            className="text-4xl cursor-pointer hover:bg-gray-800 rounded-full p-1" 
            onClick={() => router.back()}
          />
          <div>
            <h1 className="text-2xl font-bold">{displayUser?.firstName} {displayUser?.lastName}</h1>
            <h1 className="text-md font-bold text-slate-500">{displayUser?.tweets?.length || 0} Tweets</h1>
          </div>
        </nav>
        <div className="border-b border-slate-800 p-4">
          {displayUser?.profileImageUrl && (
            <Image 
                src={displayUser.profileImageUrl} 
                alt="Profile Image" 
                className="rounded-full"
                width={120}
                height={120}
            />
          )}
            <h1 className="text-2xl font-bold mt-4">{displayUser?.firstName} {displayUser?.lastName}</h1>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span>{displayUser?.followers?.length || 0} followers</span>
                <span>{displayUser?.following?.length || 0} following</span>
              </div>
              {
                user?.id === displayUser?.id ? (
                  <button className="bg-white text-black px-3 py-1 rounded-full font-bold">Edit Profile</button>
                ) : (
                  isFollowing ? (
                    <button 
                      className="bg-white text-black px-3 py-1 rounded-full font-bold"
                      onClick={handleUnfollow}
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button 
                      className="bg-white text-black px-3 py-1 rounded-full font-bold"
                      onClick={handleFollow}
                    >
                      Follow
                    </button>
                  )
                )
              }
            </div>
        </div>
        <div>
            { displayUser?.tweets?.map(tweet => <FeedCard key={tweet?.id} data={tweet as Tweet} />)}
        </div>
      </div>
    </TwitterLayout>
  );
};

export const getServerSideProps: GetServerSideProps<ServerProps> = async (context) => {
  const id = context.query.id as string | undefined;

  if(!id) return { notFound: true, props: { userInfo: undefined } };

  try {
    const userInfo = await graphqlClient.request(getUserByIdQuery, { id });

    if(!userInfo?.getUserById) return { notFound: true, props: { userInfo: undefined }};

    return {
      props: {
        userInfo: userInfo.getUserById as User
      }
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return { notFound: true, props: { userInfo: undefined } };
  }
}

export default UserProfilePage;
