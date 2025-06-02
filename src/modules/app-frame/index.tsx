"use client";

import { ChevronLeft, RefreshCcw, Undo2 } from "lucide-react";
import React from "react";
import ImageUploadMobile from "./components/image-upload-mobile";
import Image from "next/image";
import { IMAGES } from "@/utils/image";
import Link from "next/link";
import { ROUTES } from "@/utils/route";

export default function AppFrameClient() {

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [currentImage, setCurrentImage] = React.useState<string | null>(null);
  const [refresh, setRefresh] = React.useState(false);

  const [deviceHeight, setDeviceHeight] = React.useState("90vh");

  React.useEffect(() => {
    const updateHeight = () => {
      setDeviceHeight(`${window.innerHeight}px`);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleImageUpload = (file: File | null) => {
    if (file) {
      setUploadedFile(file);
      const originalUrl = URL.createObjectURL(file);
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center"
      style={{ height: deviceHeight }}
    >
      <div
        className="w-full h-full flex flex-col z-10"
        style={{ height: deviceHeight }}
      >
        <header className="w-full text-white pt-4 p-2 text-center shrink-0">
          <div className="flex flex-row justify-between items-center">
            <Link href={ROUTES.HOME} className="ml-1">
              <ChevronLeft className="text-[#4B5563]" />
            </Link>
            <div className="flex flex-row justify-center items-center gap-8 ml-8">
              <Undo2 className="text-[#4B5563]" />
              <RefreshCcw
                className="text-[#4B5563]"
                onClick={() => {
                  handleRefresh();
                  setRefresh(!refresh);
                }}
              />
              <Undo2 className="scale-x-[-1] text-[#4B5563] z-0" />
            </div>
            <a
              href={`https://www.inanhtructuyen.com/tai-khoan?tab=order-single&frameImage=${encodeURIComponent(
                currentImage ?? ""
              )}`}
              target="_blank"
              className="bg-[#8E97FD] text-white font-medium text-md px-4 py-2 mr-2 rounded-full"
            >
              Tiếp tục
            </a>
          </div>
        </header>
        <main className="w-full flex flex-col flex-1 p-4">
          <h1 className="text-2xl font-bold">Tải hỉnh ảnh của bạn</h1>
          <h1 className="text-lg font-light mb-4">Sau đó chọn style yêu thích</h1>
          <div className="w-full h-80 flex">
            <ImageUploadMobile
              onImageChange={handleImageUpload}
              title={"Chọn hình ảnh bạn muốn tạo với AI"}
              newImage={currentImage ?? undefined}
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-4 mt-4">
            {
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
                <div
                  key={index}
                  className="w-full"
                >
                  <Image
                    src={IMAGES.STYLE_01}
                    alt=""
                    width={200}
                    height={200}
                    className="w-full rounded-lg"
                  />
                </div>
              ))
            }
          </div>
        </main>
      </div>
    </div>
  );
}
