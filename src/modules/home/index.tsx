"use client";

import { IMAGES } from "@/utils/image";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { ROUTES } from "@/utils/route";

export default function HomeClient() {
  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center gap-2">
      <Image
        src={IMAGES.BG}
        alt=""
        fill
        priority
        objectFit="cover"
        className="absolute top-0 left-0 z-0"
      />
      <div
        className="w-full h-full flex flex-col justify-center items-center gap-3 z-10"
      >
        <div className="absolute top-10 w-full flex flex-row justify-center items-center gap-2">
          <h1 className="text-lg text-white font-semibold" style={{ letterSpacing: '0.2em' }}>IN ẢNH</h1>
          <Image
            src={IMAGES.LOGO_TRAN}
            alt="alt"
            width={200}
            height={200}
            className="w-8 h-8"
          />
          <h1 className="text-lg text-white font-semibold" style={{ letterSpacing: '0.2em' }}>TRỰC TUYẾN</h1>
        </div>
        <h1 className="text-4xl text-white font-bold" style={{ lineHeight: '1.3em' }}>Chào bạn đến với<br></br> <span className="border-b-4 border-white pb-1">In Ảnh Trực Tuyến</span></h1>
        <div className="w-full flex flex-col justify-center items-center px-10 text-center mt-4">
          <p className="text-lg text-white font-light">Mang đến cho bạn trải nghiệm thú vị chưa từng có với các hình ảnh trendy</p>
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-3 mt-10">
          <Link href={ROUTES.APP_FRAME} className="w-full flex justify-center items-center gap-4 px-8">
            <div className="w-3/4 h-24 bg-white rounded-3xl p-6 flex flex-col justify-center items-center">
              <div className="w-full flex justify-between items-center">
                <span className="text-lg font-medium">Sáng tạo với AI</span>
                <span></span>
              </div>
              <div className="w-full flex justify-between items-center">
                <span></span>
                <Image
                  src={IMAGES.MAGIC}
                  alt="alt"
                  width={200}
                  height={200}
                  className="w-8 h-8"
                />
              </div>
            </div>
            <div className="w-1/4 h-24 bg-[#E4DFFF] rounded-3xl p-6 flex flex-col justify-center items-center">
              <Image
                src={IMAGES.LOGO_LIGHT}
                alt=""
                width={200}
                height={200}
                className="w-6 h-6"
              />
            </div>
          </Link>
          <Link href={ROUTES.APP_ALBUM} className="w-full flex justify-center items-center gap-4 px-8 mt-2">
            <div className="w-1/4 h-24 bg-[#E4DFFF] rounded-3xl p-6 flex flex-col justify-center items-center">
              <Image
                src={IMAGES.LOGO_LIGHT}
                alt=""
                width={200}
                height={200}
                className="w-6 h-6"
              />
            </div>
            <div className="w-3/4 h-24 bg-[#8E97FD] rounded-3xl p-6 flex flex-col justify-center items-center">
              <div className="w-full flex justify-between items-center">
                <span></span>
                <span className="text-lg font-medium text-white">Tạo album gia đình</span>
              </div>
              <div className="w-full flex justify-between items-center">
                <Image
                  src={IMAGES.ALBUM}
                  alt="alt"
                  width={200}
                  height={200}
                  className="w-8 h-8"
                />
                <span></span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 pb-2 text-white text-sm flex justify-center items-center gap-2">
        <Image
          src={IMAGES.WEB}
          alt="alt"
          width={200}
          height={200}
          className="w-4 h-4 mt-0.5"
        />
        www.inanhtructuyen.com
      </div>
    </div>
  );
}
