import React, { useCallback, useMemo } from "react";
import { CgMoreO, CgProfile } from "react-icons/cg";
import { CiBookmark, CiMail } from "react-icons/ci";
import { FaTwitter } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { IoNotifications, IoSearch } from "react-icons/io5";
import Image from "next/image";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { graphqlClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useCurrentUser } from "@/hooks/user";
import Link from "next/link";

//Interface for Sidebar Buttons
interface SidebarMenuButton {
  title: String;
  icon: React.ReactNode;
  link: string;
}

interface TwitterLayoutProps {
  children: React.ReactNode;
}

const TwitterLayout: React.FC<TwitterLayoutProps> = (props) => {
  //Fetching details of current loggedin user
  const { user } = useCurrentUser();

  const queryClient = useQueryClient();

  const sideBarMenuLists: SidebarMenuButton[] = useMemo(
    () => [
      {
        title: "Home",
        icon: <GoHomeFill />,
        link: '/'
      },
      {
        title: "Explore",
        icon: <IoSearch />,
        link: '/'
      },
      {
        title: "Notifications",
        icon: <IoNotifications />,
        link: '/'
      },
      {
        title: "Messages",
        icon: <CiMail />,
        link: '/'
      },
      {
        title: "Bookmarks",
        icon: <CiBookmark />,
        link: '/'
      },
      {
        title: "Profile",
        icon: <CgProfile />,
        link: `/${user?.id}`
      },
      {
        title: "More",
        icon: <CgMoreO />,
        link: '/'
      },
    ],
    []
  );

  const handleLogin = useCallback(
    async (cred: CredentialResponse) => {
      // console.log(cred);
      const googleToken = cred.credential;

      if (!googleToken) return toast.error("Google Token Not Found");

      const { verifyGoogleToken } = await graphqlClient.request(
        verifyUserGoogleTokenQuery,
        { token: googleToken }
      );

      toast.success("Verified Success !");
      console.log(verifyGoogleToken);

      if (verifyGoogleToken) {
        localStorage.setItem("twitter_token", verifyGoogleToken);
      }

      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    [queryClient]
  );
  return (
    <div>
      <div className="grid grid-cols-12 h-screen w-screen px-56 ">
        <div className="pt-2 col-span-3 flex justify-end pr-4 relative">
          <div>
            <div className="text-3xl h-fit w-fit hover:bg-gray-800 rounded-full p-2 cursor-pointer transition-all">
              <FaTwitter />
            </div>
            <div className="mt-4 text-2xl font-medium pr-8">
              <ul>
                {sideBarMenuLists.map((item, ind) => (
                  <li key={ind} >
                    <Link href={item.link}
                        className="flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full w-fit px-5 py-2 mt-1 cursor-pointer"
                    >
                        <span>{item.icon}</span>
                        <span className="hidden sm:block">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button className="hidden sm:block bg-[#1a8cd8] hover:bg-[#4caced] w-full mt-4 rounded-full py-3 transition-all">
                Post
              </button>
              <button className="block sm:hidden bg-[#1a8cd8] hover:bg-[#4caced] w-full mt-4 rounded-full py-3 transition-all justify-center items-center">
                <FaTwitter />
              </button>
            </div>
          </div>
          {user && (
            <div className="mt-4 absolute bottom-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={user?.profileImageUrl || ""}
                    alt="profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="hidden sm:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-6 border-r-[1px] border-l-[1px] border-gray-600 h-screen scrollable">
          {props.children}
        </div>
        <div className="col-span-3 p-5">
          {!user && (
            <div className="p-5 bg-slate-700 rounded-lg">
              <h1 className="my-2 text-xl">New to Twitter?</h1>
              <GoogleLogin onSuccess={(cred) => handleLogin(cred)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwitterLayout;
