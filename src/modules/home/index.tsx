"use client";

import { IMAGES } from "@/utils/image";
import { Aperture, SquareLibrary } from "lucide-react";
import Image from "next/image";
import React from "react";
import Link from "next/link";

export default function HomeClient() {
  return (
    <div
      className="relative w-full min-h-screen flex flex-col justify-center items-center gap-2"
    >
      <Image
        src={IMAGES.BACKGROUND_MOBILE}
        alt=""
        fill
        priority
        objectFit="cover"
        className="opacity-50 absolute top-0 left-0 z-0"
      />
      <div
        className="w-full h-full flex flex-col justify-center items-center gap-3 z-10"
      >
        <div className="flex-1 w-full flex flex-col justify-center items-center gap-1">
          <Image
            src={IMAGES.LOGO}
            alt="alt"
            width={200}
            height={200}
            className="w-16 h-16"
          />
          <h1 className="text-lg text-gray-700 font-bold mb-10 mt-4">In Ảnh Trực Tuyến</h1>
        </div>
        <div className="flex-2 w-4/5 flex flex-col justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l rounded-lg z-10">
          <Link
            href="/app-frame?function=md"
            className="w-full flex justify-center items-center gap-3 text-white font-medium text-[16px] py-4 text-center"
          >
            <Aperture />
            Sáng tạo hình ảnh cá nhân
          </Link>
        </div>

        <div className="w-4/5 flex flex-col justify-center items-center gap-3 bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl rounded-lg z-10">
          <button
            onClick={() => (window.location.href = "/app-album")}
            type="button"
            className="w-full flex justify-center items-center gap-3 text-white  font-medium text-[16px] py-4 text-center"
          >
            <SquareLibrary />
            Tạo album cá nhân hoá
          </button>
        </div>
      </div>
      <div className="absolute bottom-2 pb-2 text-gray-400 text-[14px]">
        www.inanhtructuyen.com
      </div>
    </div>
  );
}
