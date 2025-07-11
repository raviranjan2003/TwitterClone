import FeedCard from "@/components/FeedCard";
import TwitterLayout from "@/components/FeedCard/Layout/TwitterLayout";
import { Tweet } from "@/gql/graphql";
import { useCurrentUser } from "@/hooks/user";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { BsArrowLeftShort } from "react-icons/bs";

const UserProfilePage: NextPage = () => {
  const { user } = useCurrentUser();

  const router = useRouter();
  console.log(router.query.id);

  return (
    <TwitterLayout>
      <div>
        <nav className="flex items-center gap-3 px-3 py-3">
          <BsArrowLeftShort className="text-4xl" />
          <div>
            <h1 className="text-2xl font-bold">Ravi Ranjan</h1>
            <h1 className="text-md font-bold text-slate-500">100 Tweets</h1>
          </div>
        </nav>
        <div className="border-b border-slate-800 p-4">
          {user?.profileImageUrl && (
            <Image 
                src={user.profileImageUrl} 
                alt="Profile Image" 
                className="rounded-full"
                width={120}
                height={120}
            />
          )}
            <h1 className="text-2xl font-bold mt-4">Ravi Ranjan</h1>
        </div>
        <div>
            { user?.tweets?.map(tweet => <FeedCard key={tweet?.id} data={tweet as Tweet} />)}
        </div>
      </div>
    </TwitterLayout>
  );
};

export default UserProfilePage;
