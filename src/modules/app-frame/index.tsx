"use client";

import { Ban, ChevronLeft, RefreshCcw, Undo2 } from "lucide-react";
import React, { useEffect } from "react";
import NavigationBar from "./components/navigation-bar";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUploadMobile from "./components/image-upload-mobile";
import { toast } from "@/hooks/use-toast";
import { UploadService } from "@/services/upload";
import { MobileService } from "@/services/mobile";
import { DATA } from "@/utils/data";
import Image from "next/image";
import ImageProcessing from "./components/image-processing";
import ImageComposer from "./components/compile-image";
import { IMAGES } from "@/utils/image";
import Link from "next/link";
import UploadBackground from "./components/upload-background";
import { ROUTES } from "@/utils/route";

export default function AppFrameClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("function");
  const router = useRouter();

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [currentImage, setCurrentImage] = React.useState<string | null>(null);
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [responseImage1, setResponseImage1] = React.useState<string | null>(
    null
  ); // face2paint
  const [responseImage2, setResponseImage2] = React.useState<string | null>(
    null
  ); // paprika
  const [responseImage3, setResponseImage3] = React.useState<string | null>(
    null
  );
  const [selectedStyle, setSelectedStyle] = React.useState<string>("original");
  const [loading, setLoading] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);
  const [customBackgrounds, setCustomBackgrounds] = React.useState<
    { id: number; url: string }[]
  >([]);
  const [removeBackground, setRemoveBackground] = React.useState(false);
  const [selectedBackground, setSelectedBackground] = React.useState<
    string | null
  >(null);
  const [selectedSmoothSkin, setSelectedSmoothSkin] = React.useState<
    string | null
  >(null);
  const [isIOS, setIsIOS] = React.useState(false);
  const [selectedQuality, setSelectedQuality] = React.useState<string | null>(
    null
  );

  // Detect iOS device
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  const [deviceHeight, setDeviceHeight] = React.useState("90vh");

  React.useEffect(() => {
    const updateHeight = () => {
      setDeviceHeight(`${window.innerHeight}px`);
    };

    updateHeight();

    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    // Revoke object URLs to prevent memory leaks
    if (currentImage) {
      URL.revokeObjectURL(currentImage);
    }
    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }

    // Reset all states to initial values
    setUploadedFile(null);
    setCurrentImage(null);
    setOriginalImage(null);
    setResponseImage1(null);
    setResponseImage2(null);
    setResponseImage3(null);
    setSelectedStyle("original");
    setLoading(false);
    setRefresh(false);
    setCustomBackgrounds([]);
    setRemoveBackground(false);
    setSelectedBackground(null);
    setSelectedSmoothSkin(null);
    setSelectedQuality(null);

    // On iOS, trigger a refresh when tab changes to ensure clean state for new image upload
    if (isIOS) {
      window.location.reload();
    }
  }, [tab, isIOS]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleImageUpload = (file: File | null) => {
    if (file) {
      setUploadedFile(file);
      const originalUrl = URL.createObjectURL(file);
      setCurrentImage(originalUrl);
      setOriginalImage(originalUrl);
      setSelectedStyle("original");
    }
  };

  const handleStyleSelect = (style: string) => {
    if (style === "original") {
      setSelectedStyle(style);
      setCurrentImage(originalImage);
      return;
    }

    let hasResult = false;
    switch (style) {
      case "face2paint":
        if (responseImage1) {
          setCurrentImage(responseImage1);
          hasResult = true;
        }
        break;
      case "paprika":
        if (responseImage2) {
          setCurrentImage(responseImage2);
          hasResult = true;
        }
        break;
      case "webtoon":
        if (responseImage3) {
          setCurrentImage(responseImage3);
          hasResult = true;
        }
        break;
    }

    if (hasResult) {
      setSelectedStyle(style);
    } else {
      toast({
        title: "",
        description: "Vui lòng tạo ảnh AI trước khi chọn kiểu này!",
        variant: "destructive",
      });
    }
  };

  const addCustomBackground = (newBackgroundUrl: string) => {
    setCustomBackgrounds((prev) => [
      ...prev,
      { id: Date.now(), url: newBackgroundUrl },
    ]);
    setSelectedBackground(newBackgroundUrl);
  };

  const handleBackgroundSelect = (backgroundUrl: string | null) => {
    if (!removeBackground) {
      toast({
        title: "",
        description: "Vui lòng xóa phông nền trước khi chọn nền mới!",
        variant: "destructive",
      });
      return;
    }
    setSelectedBackground(backgroundUrl);
  };

  const handleSmoothSkin: (smoothSkinUrl: string | null) => void = (
    smoothSkinUrl
  ) => {
    // if (!removeBackground) {
    //   toast({
    //     title: "",
    //     description: "Vui lòng làm mịn da trước khi chọn kiểu làm mịn!",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    setSelectedSmoothSkin(smoothSkinUrl);
  };

  const handleQualitySelect = (qualityUrl: string | null) => {
    // if (!removeBackground) {
    //   toast({
    //     title: "",
    //     description: "Vui lòng xóa phông nền trước khi chọn nền mới!",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    setSelectedQuality(qualityUrl);
  };

  const validateForm = () => {
    if (!uploadedFile) {
      toast({
        title: "",
        description: "Vui lòng tải lên một hình ảnh!",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const upload: any = await UploadService.uploadToCloudinary([
        uploadedFile,
      ]);

      let response;
      if (tab === "md") {
        response = await MobileService.smoothSkin(upload[0].secure_url);
      } else if (tab === "cl") {
        response = await MobileService.increaseQuality(upload[0].secure_url);
      } else if (tab === "ai") {
        const [res1, res2, res3] = await Promise.all([
          MobileService.imageAI(upload[0].secure_url, "face2paint"),
          MobileService.imageAI(upload[0].secure_url, "paprika"),
          MobileService.imageAI(upload[0].secure_url, "webtoon"),
        ]);
        if (res1.data && res2.data && res3.data) {
          response = res1;
        }
        setResponseImage1(res1.data);
        setResponseImage2(res2.data);
        setResponseImage3(res3.data);
        setCurrentImage(res1.data);
        setSelectedStyle("face2paint");
      } else if (tab === "xp") {
        response = await MobileService.removeBackground(upload[0].secure_url);
        setRemoveBackground(true);
      }

      if (response && response.data) {
        if (currentImage) {
          URL.revokeObjectURL(currentImage);
        }
        setCurrentImage(response.data);
      } else {
        toast({
          title: "",
          description: "Đã xảy ra lỗi khi xử lí ảnh, vui lòng thử lại!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "",
        description: "Đã xảy ra lỗi khi xử lí ảnh, vui lòng thử lại!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const hasResult =
      currentImage || responseImage1 || responseImage2 || responseImage3;

    if (hasResult) {
      let resultImage = currentImage;
      if (selectedStyle === "face2paint" && responseImage1)
        resultImage = responseImage1;
      else if (selectedStyle === "paprika" && responseImage2)
        resultImage = responseImage2;
      else if (selectedStyle === "webtoon" && responseImage3)
        resultImage = responseImage3;

      router.push(
        `https://www.inanhtructuyen.com/tai-khoan?tab=order-single&frameImage=${encodeURIComponent(
          resultImage ?? ""
        )}`
      );
    } else {
      toast({
        title: "",
        description: "Vui lòng tạo kết quả trước khi tiếp tục!",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-center items-center"
      style={{ height: deviceHeight }}
    >
      {/* PROCESSING  */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 z-20">
          <div
            className="w-full bg-black bg-opacity-50 flex flex-col gap-10 justify-center items-center"
            style={{ height: deviceHeight }}
          >
            <div className="bg-white px-7 py-8 rounded-lg flex flex-col items-center gap-6">
              <ImageProcessing />
              <div className="text-black font-medium">
                Hình ảnh đang được xử lí...
              </div>
            </div>
          </div>
        </div>
      )}
      <Image
        src={IMAGES.BACKGROUND_MOBILE}
        alt=""
        fill
        priority
        objectFit="cover"
        className="opacity-50 absolute top-0 left-0 z-0"
      />
      <div
        className="w-full h-full flex flex-col z-10"
        style={{ height: deviceHeight }}
      >
        <header className="w-full text-white pt-3 p-2 text-center shrink-0">
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
              className="bg-[#645bff] text-white font-medium text-sm px-3 py-2 mr-2 rounded-lg"
            >
              Tiếp tục
            </a>
          </div>
        </header>
        {/* MIN DA  */}
        {tab === "md" && (
          <main className="w-full flex flex-col flex-1 p-4">
            <div className="flex-1">
              <ImageUploadMobile
                onImageChange={handleImageUpload}
                title={"Chọn hình ảnh bạn muốn làm mịn da"}
                newImage={currentImage ?? undefined}
              />
            </div>
            <div className="flex flex-row gap-4 py-4">
              <div
                className={`flex justify-center items-center w-16 h-full object-cover rounded-lg border-2 ${
                  selectedSmoothSkin === null
                    ? "border-[#645bff]"
                    : "border-white"
                } cursor-pointer`}
                onClick={() => handleSmoothSkin(null)}
              >
                <Ban size={25} />
              </div>
              <div className="h-1/2 w-0.5 bg-indigo-300 my-auto"></div>
              <div className="flex flex-row gap-4">
                {DATA.SMOOTH_SKIN.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    onClick={() => handleSmoothSkin(item?.style)}
                  >
                    <Image
                      src={item.url}
                      alt=""
                      width={1000}
                      height={1000}
                      className={`w-16 h-[90px] rounded-lg border-2 ${
                        selectedSmoothSkin === item?.style
                          ? "border-[#645bff]"
                          : "border-white"
                      } cursor-pointer object-cover`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              onClick={handleSubmit}
              className={`bg-[#645bff] rounded-lg py-3 text-center text-white mb-[4.5rem] ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Đang xử lý..." : "Bắt đầu làm mịn"}
            </div>
            <div className="w-full text-white text-center shrink-0">
              <NavigationBar action={tab} />
            </div>
          </main>
        )}
        {/* CHAT LUONG  */}
        {tab === "cl" && (
          <main className="w-full flex flex-col flex-1 p-4">
            <div className="flex-1">
              <ImageUploadMobile
                onImageChange={handleImageUpload}
                title={"Chọn hình ảnh bạn muốn tăng chất lượng"}
                newImage={currentImage ?? undefined}
              />
            </div>
            <div className="flex flex-row gap-4 py-4">
              <div
                className={`flex justify-center items-center w-16 h-full object-cover rounded-lg border-2 ${
                  selectedQuality === null ? "border-[#645bff]" : "border-white"
                } cursor-pointer`}
                onClick={() => handleQualitySelect(null)}
              >
                <Ban size={25} />
              </div>
              <div className="h-1/2 w-0.5 bg-indigo-300 my-auto"></div>
              <div className="flex flex-row gap-4">
                {DATA.QUALITY.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    onClick={() => handleQualitySelect(item?.style)}
                    className={`bg-white w-16 h-[90px] flex justify-center items-center p-2 rounded-lg border-2 ${
                      selectedQuality === item?.style
                        ? "border-[#645bff]"
                        : "border-white"
                    } cursor-pointer`}
                  >
                    <Image
                      src={item.url}
                      alt=""
                      width={1000}
                      height={1000}
                      className={`w-16 cursor-pointer`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              onClick={handleSubmit}
              className={`bg-[#645bff] rounded-lg py-3 text-center text-white mb-[4.5rem] ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Đang xử lý..." : "Tăng chất lượng"}
            </div>
            <div className="w-full text-white text-center shrink-0">
              <NavigationBar action={tab} />
            </div>
          </main>
        )}
        {/* XOA PHONG  */}
        {tab === "xp" && (
          <main className="w-full flex flex-col flex-1 p-4">
            <div className="flex-1">
              {removeBackground && (
                <ImageComposer
                  foregroundImage={currentImage}
                  backgroundImage={selectedBackground}
                />
              )}
              {!removeBackground && (
                <ImageUploadMobile
                  onImageChange={handleImageUpload}
                  title={"Chọn hình ảnh bạn muốn xóa phông"}
                  newImage={currentImage ?? undefined}
                />
              )}
            </div>
            <div className="flex flex-row gap-4 py-4 overflow-x-auto scroll-bar-style">
              <div className="flex flex-row gap-4">
                <div
                  className={`flex justify-center items-center mx-auto w-[64px] h-[90px] object-cover rounded-lg border-2 ${
                    selectedBackground === null
                      ? "border-[#645bff]"
                      : "border-white"
                  } cursor-pointer`}
                  onClick={() => handleBackgroundSelect(null)}
                >
                  <Ban size={25} />
                </div>
                <div className="h-1/2 w-0.5 bg-indigo-300 my-auto"></div>
              </div>
              <div className="flex flex-row gap-4">
                <div
                  className={`bg-indigo-50 flex justify-center items-center w-16 h-[90px] object-cover rounded-lg border-2 ${
                    selectedBackground === null
                      ? "border-white"
                      : "border-white"
                  } cursor-pointer`}
                >
                  <UploadBackground
                    onBackgroundAdd={addCustomBackground}
                    // result={removeBackground}
                  />
                </div>
                {customBackgrounds
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.id}
                      className="cursor-pointer flex-shrink-0"
                      onClick={() => handleBackgroundSelect(item.url)}
                    >
                      <Image
                        src={item.url}
                        alt=""
                        width={1000}
                        height={1000}
                        className={`w-16 h-[90px] object-cover rounded-lg border-2 ${
                          selectedBackground === item.url
                            ? "border-[#645bff]"
                            : "border-white"
                        }`}
                      />
                    </div>
                  ))}
                {DATA.BACKGROUND.map((item) => (
                  <div
                    key={item.id}
                    className="cursor-pointer flex-shrink-0"
                    onClick={() => handleBackgroundSelect(item.url)}
                  >
                    <Image
                      src={item.url}
                      alt=""
                      width={1000}
                      height={1000}
                      className={`w-16 h-[90px] object-cover rounded-lg border-2 ${
                        selectedBackground === item.url
                          ? "border-[#645bff]"
                          : "border-white"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              onClick={handleSubmit}
              className={`bg-[#645bff] rounded-lg py-3 text-center text-white mb-[4.5rem] ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Đang xử lý..." : "Bắt đầu xử lý"}
            </div>
            <div className="w-full text-white text-center shrink-0">
              <NavigationBar action={tab} />
            </div>
          </main>
        )}
        {/* AI  */}
        {tab === "ai" && (
          <main className="w-full flex flex-col flex-1 p-4">
            <div className="flex-1">
              <ImageUploadMobile
                onImageChange={handleImageUpload}
                title={"Chọn hình ảnh bạn muốn tạo với AI"}
                newImage={currentImage ?? undefined}
              />
            </div>
            <div className="flex flex-row gap-4 py-4">
              <div
                className={`flex justify-center items-center w-16 h-full object-cover rounded-lg border-2 ${
                  selectedBackground === null
                    ? "border-[#645bff]"
                    : "border-white"
                } cursor-pointer`}
                onClick={() => handleBackgroundSelect(null)}
              >
                <Ban size={25} />
              </div>
              <div className="h-1/2 w-0.5 bg-indigo-300 my-auto"></div>
              <div className="flex flex-row gap-4">
                {DATA.AI_STYLE.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    onClick={() => handleStyleSelect(item?.style)}
                    className={`bg-white w-16 h-[90px] flex justify-center items-center p-2 rounded-lg border-2 ${
                      selectedStyle === item?.style
                        ? "border-[#645bff]"
                        : "border-white"
                    } cursor-pointer`}
                  >
                    <Image
                      src={item.url}
                      alt=""
                      width={1000}
                      height={1000}
                      className={`w-16 cursor-pointer`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              onClick={handleSubmit}
              className={`bg-[#645bff] rounded-lg py-3 text-center text-white mb-[4.5rem] ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Đang xử lý..." : "Tạo ảnh AI"}
            </div>
            <div className="w-full text-white text-center shrink-0">
              <NavigationBar action={tab} />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
