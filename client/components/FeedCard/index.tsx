import React from 'react';
import Image from 'next/image';
import { FaRegHeart, FaRetweet } from 'react-icons/fa';
import { BiMessageRounded, BiRepost } from 'react-icons/bi';
import { IoIosStats } from 'react-icons/io';
import { CiBookmark } from 'react-icons/ci';
import { LuUpload } from 'react-icons/lu';
import { AiOutlineHeart } from 'react-icons/ai';
import { Tweet } from '@/gql/graphql';
import Link from 'next/link';

interface FeedCardProps {
    data: Tweet
}

const FeedCard : React.FC<FeedCardProps> = (props) => {
    const { data } = props;

    return (
        <div className="border border-gray-600 border-l-0 border-r-0 border-b-0 p-4 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="grid grid-cols-12 ">
                <div className="col-span-1">
                    {data.author?.profileImageUrl && <Image 
                        className='rounded-full'
                        src={data?.author?.profileImageUrl}
                        alt='user-avatar'
                        height={50}
                        width={50}
                    />}
                </div>
                <div className="col-span-11 pl-2">
                    <h5>
                        <Link href={`/${data.author?.id}`} className='hover:underline'>
                            {data.author?.firstName} {data.author?.lastName}
                        </Link>
                    </h5>
                    <p>{data?.content}</p>
                    <div className='flex justify-between mt-5 text-xl items-center'>
                        <div>
                            <BiMessageRounded />
                        </div>
                        <div>
                            <FaRetweet />
                        </div>
                        <div>
                            <AiOutlineHeart />
                        </div>
                        <div>
                            <IoIosStats />
                        </div>
                        <div className='flex justify-between'>
                            <CiBookmark />
                            <LuUpload />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeedCard;