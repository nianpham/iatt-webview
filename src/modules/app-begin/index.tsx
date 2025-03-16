"use client";

import { useEffect } from "react";
import { CustomProgress } from "./progress";

export default function AppBegin() {

  useEffect(() => {
    setTimeout(() => {
      window.location.href = "/app-home"
    }, 700)
  }, [])

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <CustomProgress />
    </div>
  );
}
