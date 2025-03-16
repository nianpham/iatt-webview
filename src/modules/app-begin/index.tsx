"use client";

import { CustomProgress } from "./progress";
import Image from "next/image";
import { IMAGES } from "@/utils/image";
import logo from "../../../public/logo.png";
import { useEffect } from "react";

export default function AppBegin() {
  useEffect(() => {
    setTimeout(() => {
      window.location.href = "/app-home";
    }, 3000);
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center">
      <Image
        src={IMAGES.BACKGROUND_MOBILE}
        alt=""
        fill
        priority
        className="object-cover opacity-50 z-0"
      />
      <div className="relative flex flex-col justify-center items-center w-full z-10">
        <Image
          src={logo}
          alt=""
          width={1000}
          height={1000}
          className="w-32 h-32"
        />
        <div className="font-medium uppercase text-2xl mb-20 mt-5">
          In ảnh trực tuyến
        </div>
        <CustomProgress />
      </div>
    </div>
  );
}
