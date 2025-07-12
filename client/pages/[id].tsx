import { graphqlClient } from "@/clients/api";
import FeedCard from "@/components/FeedCard";
import TwitterLayout from "@/components/FeedCard/Layout/TwitterLayout";
import { Tweet, User, GetUserByIdQuery } from "@/gql/graphql";
import { getUserByIdQuery } from "@/graphql/query/user";
import { useCurrentUser } from "@/hooks/user";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { BsArrowLeftShort } from "react-icons/bs";

interface ServerProps {
  userInfo?: User
}

const UserProfilePage: NextPage<ServerProps> = (props) => {
  const { user } = useCurrentUser();
  const router = useRouter();
  
  // Use the user data from server-side props or fallback to current user
  const profileUser = props.userInfo || user;

  return (
    <TwitterLayout>
      <div>
        <nav className="flex items-center gap-3 px-3 py-3">
          <BsArrowLeftShort 
            className="text-4xl cursor-pointer hover:bg-gray-800 rounded-full p-1" 
            onClick={() => router.back()}
          />
          <div>
            <h1 className="text-2xl font-bold">{profileUser?.firstName} {profileUser?.lastName}</h1>
            <h1 className="text-md font-bold text-slate-500">{profileUser?.tweets?.length || 0} Tweets</h1>
          </div>
        </nav>
        <div className="border-b border-slate-800 p-4">
          {profileUser?.profileImageUrl && (
            <Image 
                src={profileUser.profileImageUrl} 
                alt="Profile Image" 
                className="rounded-full"
                width={120}
                height={120}
            />
          )}
            <h1 className="text-2xl font-bold mt-4">{profileUser?.firstName} {profileUser?.lastName}</h1>
        </div>
        <div>
            { profileUser?.tweets?.map(tweet => <FeedCard key={tweet?.id} data={tweet as Tweet} />)}
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
