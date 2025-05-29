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
// Define the shape of the state for each tab
interface TabState {
  uploadedFile: File | null;
  currentImage: string | null;
  originalImage: string | null;
  responseImage: string | null;
}

// Define the tabs and their initial state
const initialTabState: TabState = {
  uploadedFile: null,
  currentImage: null,
  originalImage: null,
  responseImage: null,
};

export default function AppFrameClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("function") || "md"; // Default to 'md' if no tab is specified
  const router = useRouter();

  // State to hold tab-specific data
  const [tabStates, setTabStates] = React.useState<{
    [key: string]: TabState;
  }>({
    md: { ...initialTabState },
    cl: { ...initialTabState },
    xp: { ...initialTabState },
    ai: { ...initialTabState },
  });

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
  const [selectedQuality, setSelectedQuality] = React.useState<string | null>(
    null
  );
  const [deviceHeight, setDeviceHeight] = React.useState("90vh");

  // Update device height on resize
  React.useEffect(() => {
    const updateHeight = () => {
      setDeviceHeight(`${window.innerHeight}px`);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(tabStates).forEach((tabState) => {
        if (tabState.currentImage) URL.revokeObjectURL(tabState.currentImage);
        if (tabState.originalImage) URL.revokeObjectURL(tabState.originalImage);
        if (tabState.responseImage) URL.revokeObjectURL(tabState.responseImage);
      });
    };
  }, [tabStates]);

  // Reset states when tab changes
  useEffect(() => {
    setSelectedStyle("original");
    setLoading(false);
    setRefresh(false);
    setCustomBackgrounds([]);
    setRemoveBackground(false);
    setSelectedBackground(null);
    setSelectedSmoothSkin(null);
    setSelectedQuality(null);
  }, [tab]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleImageUpload = (file: File | null) => {
    setTabStates((prev) => {
      const newState = { ...prev };
      if (file) {
        const originalUrl = URL.createObjectURL(file);
        newState[tab] = {
          uploadedFile: file,
          currentImage: originalUrl,
          originalImage: originalUrl,
          responseImage: null,
        };
      } else {
        newState[tab] = { ...initialTabState };
      }
      return newState;
    });
  };

  const handleStyleSelect = (style: string) => {
    if (style === "original") {
      setSelectedStyle(style);
      setTabStates((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          currentImage: prev[tab].originalImage,
        },
      }));
      return;
    }

    const hasResult = tabStates[tab].responseImage && style !== "original";
    if (hasResult) {
      setSelectedStyle(style);
      setTabStates((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          currentImage: prev[tab].responseImage,
        },
      }));
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

  const handleSmoothSkin = (smoothSkinUrl: string | null) => {
    setSelectedSmoothSkin(smoothSkinUrl);
  };

  const handleQualitySelect = (qualityUrl: string | null) => {
    setSelectedQuality(qualityUrl);
  };

  const validateForm = () => {
    if (!tabStates[tab].uploadedFile) {
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
        tabStates[tab].uploadedFile,
      ]);

      let response;
      if (tab === "md") {
        response = await MobileService.smoothSkin(upload[0].secure_url);
      } else if (tab === "cl") {
        response = await MobileService.increaseQuality(upload[0].secure_url);
      } else if (tab === "xp") {
        response = await MobileService.removeBackground(upload[0].secure_url);
        setRemoveBackground(true);
      } else if (tab === "ai") {
        response = await MobileService.imageAI(
          upload[0].secure_url,
          selectedStyle
        );
      }

      if (response && response.data) {
        setTabStates((prev) => ({
          ...prev,
          [tab]: {
            ...prev[tab],
            currentImage: response.data,
            responseImage: response.data,
          },
        }));
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
      tabStates[tab].currentImage || tabStates[tab].responseImage;
    if (hasResult) {
      router.push(
        `https://www.inanhtructuyen.com/tai-khoan?tab=order-single&frameImage=${encodeURIComponent(
          tabStates[tab].currentImage ?? ""
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
                tabStates[tab].currentImage ?? ""
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
                newImage={tabStates[tab].currentImage ?? undefined}
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
                newImage={tabStates[tab].currentImage ?? undefined}
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
                  foregroundImage={tabStates[tab].currentImage}
                  backgroundImage={selectedBackground}
                />
              )}
              {!removeBackground && (
                <ImageUploadMobile
                  onImageChange={handleImageUpload}
                  title={"Chọn hình ảnh bạn muốn xóa phông"}
                  newImage={tabStates[tab].currentImage ?? undefined}
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
                  <UploadBackground onBackgroundAdd={addCustomBackground} />
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
                newImage={tabStates[tab].currentImage ?? undefined}
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
