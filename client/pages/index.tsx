import React, { useCallback } from "react";
import localFont from "next/font/local";
import { FaTwitter } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { IoNotifications, IoSearch } from "react-icons/io5";
import { CiBookmark, CiMail } from "react-icons/ci";
import { CgMoreO, CgProfile } from "react-icons/cg";
import FeedCard from "@/components/FeedCard";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { graphqlCLient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

//Interface for Sidebar Buttons
interface SidebarMenuButton {
  title: String;
  icon: React.ReactNode;
}

const sideBarMenuLists: SidebarMenuButton[] = [
  {
    title: "Home",
    icon: <GoHomeFill />
  },
  {
    title: "Explore",
    icon: <IoSearch />
  },
  {
    title: "Notifications",
    icon: <IoNotifications />
  },
  {
    title: "Messages",
    icon: <CiMail />
  },
  {
    title: "Bookmarks",
    icon: <CiBookmark />
  },
  {
    title: "Profile",
    icon: <CgProfile />
  },
  {
    title: "More",
    icon: <CgMoreO />
  },
  
]

export default function Home() {

  const handleLogin = useCallback(async (cred: CredentialResponse) => {
    console.log(cred);
    const googleToken = cred.credential;

    if(!googleToken) return toast.error("Google Token Not Found");

    const { verifyGoogleToken } = await graphqlCLient.request(
      verifyUserGoogleTokenQuery, {token: googleToken}
    )

    toast.success("Verified Success !");
    console.log(verifyGoogleToken);

    if(verifyGoogleToken) {
      localStorage.setItem("twitter_token", verifyGoogleToken);
    }
    
  }, [])

  return (
   <div>
    <div className="grid grid-cols-12 h-screen w-screen px-56 ">
      <div className="pt-2 col-span-3">
        <div className="text-3xl h-fit w-fit hover:bg-gray-800 rounded-full p-2 cursor-pointer transition-all">
          <FaTwitter />
        </div>
        <div className="mt-4 text-2xl font-medium pr-8">
          <ul>
            {sideBarMenuLists.map((item, ind) => (
              <li className="flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full w-fit px-5 py-2 mt-1 cursor-pointer" key={ind}>
                <span>{item.icon}</span>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
          <button className="bg-[#1a8cd8] hover:bg-[#4caced] w-full mt-4 rounded-full py-3 transition-all">
            Post
          </button>
        </div>
      </div>
      <div className="col-span-6 border-r-[1px] border-l-[1px] border-gray-600 h-screen scrollable">
        <FeedCard />
        <FeedCard />
        <FeedCard />
        <FeedCard />
        <FeedCard />
        <FeedCard />
        <FeedCard />
      </div>
      <div className="col-span-3 p-5">
        <div className="p-5 bg-slate-700 rounded-lg">
          <h1 className="my-2 text-xl">New to Twitter?</h1>
          <GoogleLogin onSuccess={ cred => handleLogin(cred)} />
        </div>
      </div>
    </div>
   </div>
  );
}
