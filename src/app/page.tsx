"use client";

import AppBegin from "@/modules/app-begin";
import AppHome from "@/modules/app-home";
import HomeClient from "@/modules/home";
import { Loader } from "lucide-react";
import React, { Suspense } from "react";

export default function Home() {
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <Suspense
        fallback={
          <div className="w-full h-[500px] flex flex-col justify-center items-center">
            <Loader className="animate-spin" size={24} />
          </div>
        }
      >
        <AppHome  />
      </Suspense>
    </div>
  );
}
