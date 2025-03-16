"use client";

import { IMAGES } from "@/utils/image";
import { Aperture, SquareLibrary } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "../../../public/logo.png";
import React from "react";

export default function AppHome() {
  const [deviceHeight, setDeviceHeight] = React.useState("90vh");

  React.useEffect(() => {
    const updateHeight = () => {
      setDeviceHeight(`${window.innerHeight}px`);
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      className="relative w-full flex flex-col justify-center items-center gap-2"
      style={{ height: deviceHeight }}
    >
      <Image
        src={IMAGES.BACKGROUND_MOBILE}
        alt=""
        fill
        priority
        className="object-cover opacity-50 z-0"
      />
      <div
        className="w-full flex flex-col justify-center items-center gap-3 z-10"
        style={{ height: deviceHeight }}
      >
        <div className="w-full flex flex-col justify-center items-center gap-1">
          <Image
            src={IMAGES.LOGO}
            alt=""
            width={200}
            height={200}
            className="w-16 h-16"
          />
          <Image
            src={IMAGES.TITLE_MOBILE}
            alt=""
            width={200}
            height={200}
            className="w-2/3 h-full mb-10"
          />
        </div>
        <div className="w-4/5 flex flex-col justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l rounded-lg z-10">
          <button
            onClick={() => (window.location.href = "/app-frame")}
            type="button"
            className="w-full flex justify-center items-center gap-3 text-white font-medium text-[16px] py-4 text-center"
          >
            <Aperture />
            Sáng tạo hình ảnh cá nhân
          </button>
        </div>
        {/* <Dialog>
        <DialogTrigger asChild>
          <div className="w-4/5 flex flex-col justify-center items-center gap-2 bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl rounded-lg z-10">
            <button
              // onClick={() => (window.location.href = "/app-album")}
              type="button"
              // bg-[#4285F4]
              className="w-4/5 flex justify-center items-center gap-4 text-white  font-medium text-[16px] py-4 text-center"
            >
              <SquareLibrary />
              Tạo album cá nhân hoá
            </button>
          </div>
        </DialogTrigger>
        <DialogContent
          className="max-w-[350px] max-h-[90vh] rounded-lg flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <div className="flex flex-col justify-center items-center overflow-y-auto pt-3 px-3">
            <Image
              src={logo}
              alt=""
              width={1000}
              height={1000}
              className="w-12 h-12"
            />
            <div className="text-center text-[15px] font-medium mt-3">
              Chức năng đang được phát triển. Vui lòng quay trở lại sau.
            </div>
          </div>
          <DialogFooter className="px-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-10 !text-[16px] mt-3"
              >
                Quay lại
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

        <div className="w-4/5 flex flex-col justify-center items-center gap-2 bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl rounded-lg z-10">
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
      <footer className="pb-2 text-gray-400 text-[14px]">
        inanhtructuyen.com
      </footer>
    </div>
  );
}
