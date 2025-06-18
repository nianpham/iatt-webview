"use client";

import { ChevronLeft, RefreshCcw, Undo2 } from "lucide-react";
import React from "react";
import ImageUploadMobile from "./components/image-upload-mobile";
import Image from "next/image";
import { IMAGES } from "@/utils/image";
import Link from "next/link";
import { ROUTES } from "@/utils/route";
import { UploadService } from "@/services/upload";
import { SwapService } from "@/services/swap";
import ImageProcessing from "../app-album/components/image-processing";
import { Button } from "@/components/ui/button";

const model = [
  // {
  //   id: "style_01",
  //   name: "Style 01",
  //   image:
  //     "https://res.cloudinary.com/farmcode/image/upload/v1749891322/iatt/nkk3sudgzg4kuqhyq9re.png",
  // },
  {
    id: "style_02",
    name: "Style 02",
    image:
      "https://res.cloudinary.com/farmcode/image/upload/v1749891321/iatt/xeelbb0zjoykqzk2nsfc.png",
  },
  {
    id: "style_03",
    name: "Style 03",
    image:
      "https://res.cloudinary.com/farmcode/image/upload/v1749891319/iatt/dvq3bp7qgbxehz3kloxv.png",
  },
  {
    id: "style_04",
    name: "Style 04",
    image:
      "https://res.cloudinary.com/farmcode/image/upload/v1749891316/iatt/amyneivalvuozcyi5fon.png",
  },
];

export default function AppFrameClient() {
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [currentImage, setCurrentImage] = React.useState<string | null>(null);
  const [refresh, setRefresh] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [imageProcessing, setImageProcessing] = React.useState(false);
  const [deviceHeight, setDeviceHeight] = React.useState("90vh");
  const [progressInterval, setProgressInterval] =
    React.useState<NodeJS.Timeout | null>(null);
  const [checkInterval, setCheckInterval] =
    React.useState<NodeJS.Timeout | null>(null);

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

  const handleImageUpload = async (file: File | null) => {
    if (file) {
      setImageProcessing(true);
      setUploadedFile(file);
      const originalUrl = URL.createObjectURL(file);
      await UploadService.uploadToCloudinary([file])
        .then((res) => {
          if (res && res.length > 0) {
            setCurrentImage(res[0].secure_url);
            setImageProcessing(false);
          } else {
            setCurrentImage(originalUrl);
          }
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
          setCurrentImage(originalUrl);
        });
    }
  };

  const handleCancel = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setLoading(false);
    setProgress(0);
  };

  // const handleSwap = async (targetUrl: string, inputUrl: string) => {
  //   setLoading(true);
  //   setProgress(0);
  //   const taskId = await SwapService.processs(targetUrl, inputUrl);

  //   if (taskId) {
  //     const progressInterval = setInterval(() => {
  //       setProgress((prev) => {
  //         if (prev >= 99) {
  //           clearInterval(progressInterval);
  //           return 99;
  //         }
  //         return prev + 3;
  //       });
  //     }, 200);

  //     const checkInterval = setInterval(async () => {
  //       const result = await SwapService.getResult(taskId);
  //       if (result) {
  //         setCurrentImage(result);
  //         setProgress(100);
  //         clearInterval(checkInterval);
  //         setLoading(false);
  //       }
  //     }, 5000);
  //   }
  // };

  const handleSwap = async (targetUrl: string, inputUrl: string) => {
    setLoading(true);
    setProgress(0);
    const taskId = await SwapService.processs(targetUrl, inputUrl);

    if (taskId) {
      const newProgressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) {
            clearInterval(newProgressInterval);
            return 99;
          }
          return prev + 3;
        });
      }, 200);
      setProgressInterval(newProgressInterval);

      const newCheckInterval = setInterval(async () => {
        const result = await SwapService.getResult(taskId);
        if (result) {
          setCurrentImage(result);
          setProgress(100);
          clearInterval(newCheckInterval);
          setCheckInterval(null);
          setLoading(false);
        }
      }, 5000);
      setCheckInterval(newCheckInterval);
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center"
      style={{ height: deviceHeight }}
    >
      {/* <Image
        src={IMAGES.BACKGROUND_MOBILE}
        alt=""
        fill
        priority
        objectFit="cover"
        className="opacity-20 z-0 h-[100vh]"
      /> */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white px-7 py-8 rounded-lg flex flex-col items-center gap-6">
            <ImageProcessing />
            <div className="text-black font-medium">
              Hình ảnh đang được xử lí...
            </div>
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-64 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#645bff] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-black font-medium">{progress}%</div>
            </div>
            <Button
              type="submit"
              className="bg-gray-200 text-black hover:bg-gray-300 hover:opacity-80 mt-0 w-full"
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}
      {imageProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white px-7 py-8 rounded-lg flex flex-col items-center gap-6">
            <ImageProcessing />
            <div className="text-black font-medium">Đang tải hình ảnh...</div>
          </div>
        </div>
      )}
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
              href={`https://www.inanhtructuyen.com/tao-don-hang?type=frame&frameImage=${encodeURIComponent(
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
          <h1 className="text-lg font-light mb-4">
            Sau đó chọn style yêu thích
          </h1>
          <div className="w-full h-[410px] flex">
            <ImageUploadMobile
              onImageChange={handleImageUpload}
              title={"Chọn hình ảnh bạn muốn tạo với AI"}
              newImage={currentImage ?? undefined}
            />
          </div>
          <div className="w-full grid grid-cols-2 gap-4 mt-4">
            {model?.map((item: any, index: any) => (
              <div
                key={index}
                className="w-full"
                onClick={() => {
                  handleSwap(item.image, currentImage ?? "");
                  setProgress(0);
                }}
              >
                <Image
                  src={item.image}
                  alt=""
                  width={200}
                  height={200}
                  className="w-full rounded-lg"
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
