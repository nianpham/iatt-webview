"use client";

import Image from "next/image";
import { IMAGES } from "@/utils/image";
import logo from "../../../public/logo.png";
import { useEffect, useState } from "react";
import CircularProgressBar from "./circle";
import { useRouter } from "next/navigation";

export default function AppBegin() {

  const router = useRouter();

  // const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setProgress(prev => {
  //       if (prev >= 100) {
  //         clearInterval(interval);
  //         return 100;
  //       }
  //       return prev + 5;
  //     });
  //   }, 100);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    setTimeout(() => {
      router.push("/app-home");
    }, 1000);
  }, []);

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center">
      <Image
        src={IMAGES.LOADING}
        alt=""
        priority
        width={1000}
        height={0}
        className="w-40 h-40 object-contain"
      />
      {/* <div className="relative flex flex-col justify-center items-center w-full z-10">
        <CircularProgressBar value={progress} />
      </div> */}
    </div>
  );
}
