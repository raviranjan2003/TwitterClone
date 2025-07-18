import React, { useCallback, useState } from "react";
import localFont from "next/font/local";
import Image from "next/image";
import FeedCard from "@/components/FeedCard";
import { useCurrentUser } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import { BiImage } from "react-icons/bi";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";
import TwitterLayout from "@/components/FeedCard/Layout/TwitterLayout";
import { graphqlClient } from "@/clients/api";
import { getPresignedUrlQuery } from "@/graphql/query/tweet";
import toast from "react-hot-toast";
import axios from "axios";

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





export default function Home() {
  //state for creating tweet
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { mutate } = useCreateTweet();

  const user = useCurrentUser();
  // console.log("User==>", user.user?.profileImageUrl);

  const { tweets } = useGetAllTweets();
  // console.log("tweet==>", tweets);
  
  const handleInputChange = useCallback((input: HTMLInputElement) =>{
    return async (event: Event) => {
      event.preventDefault();
      // console.log(input.files);
      const file : File | null | undefined = input.files?.item(0);
      if(!file) return;

      const { getPresignedUrl } = await graphqlClient.request(getPresignedUrlQuery, {
        imageName: file.name,
        imageType: file.type
      })

      if(getPresignedUrl) {
        toast.loading("Uploading...", { id: "2" });
        await axios.put(getPresignedUrl, file, {
          headers: {
            'Content-Type': file.type
          }
        })

        toast.success("File Uploaded !", { id: "2" });
        const url = new URL(getPresignedUrl);
        const filePath = `${url.origin}${url.pathname}`;
        setImageUrl(filePath);
      }
    }
  }, [])
 

  const handleImageUpload = useCallback(() => {
    const file = document.createElement("input");
    file.setAttribute("type", "file");
    file.setAttribute("accept", "image/*");

    const handlerFn = handleInputChange(file);

    file.addEventListener("change", handlerFn);

    file.click();
  }, [handleInputChange])

  const handleCreateTweet = useCallback(() => {
    mutate({
      content,
      imageUrl
    })
  },[content, mutate, imageUrl]);

  return (
   <div>
    <TwitterLayout>
      <div className="border border-gray-600 border-l-0 border-r-0 border-b-0 p-4 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="grid grid-cols-12 ">
              <div className="col-span-1">
                <Image
                  className="rounded-full"
                  src={user.user?.profileImageUrl || ""}
                  alt="user-avatar"
                  height={50}
                  width={50}
                />
              </div>
              <div className="col-span-11 pl-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-20 bg-transparent border-b-2 border-slate-700 outline-none resize-none text-xl"
                  placeholder="What's happening?"
                />
                {
                  imageUrl && <Image src={imageUrl} alt="Tweet-img" width={300} height={300} />
                }
                <div className="flex justify-between items-center">
                  <BiImage className="text-2xl" onClick={handleImageUpload} />
                  <button
                    className="bg-[#1a8cd8] hover:bg-[#4caced] font-bold py-2 px-4 rounded-full transition-all"
                    onClick={handleCreateTweet}
                  >
                    Tweet
                  </button>
                </div>
              </div>
            </div>
          </div>
          {tweets?.map((tweet) => (
            <FeedCard key={tweet?.id} data={tweet as Tweet} />
          ))}
    </TwitterLayout>
   </div>
  );
}
