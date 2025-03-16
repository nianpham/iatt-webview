"use client";

import { Aperture, SquareLibrary } from "lucide-react";

export default function AppHome() {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-2">
      <button onClick={() => window.location.href = "/app-frame"} type="button" className="w-3/4 flex justify-center items-center gap-4 text-white bg-[#3b5998] font-medium rounded-lg text-[16px] py-4 text-center me-2 mb-2">
        <Aperture />
        Sáng tạo hình ảnh cá nhân
      </button>
      <button onClick={() => window.location.href = "/app-album"} type="button" className="w-3/4 flex justify-center items-center gap-4 text-white bg-[#4285F4] font-medium rounded-lg text-[16px] py-4 text-center me-2 mb-2">
        <SquareLibrary />
        Tạo album cá nhân hoá
      </button>
    </div>
  );
}
