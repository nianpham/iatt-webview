"use client";

import React, { useEffect, useState } from "react";
import { ChooseOption } from "./dialog/choose-option";
import ImageUploadMobileAlbum from "./components/image-upload-mobile-album";
import { UploadService } from "@/services/upload";
import Image from "next/image";
import { IMAGES } from "@/utils/image";
import Link from "next/link";
import { ChevronLeft, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OrderService } from "@/services/order";
import { ROUTES } from "@/utils/route";
import ImageProcessing from "./components/image-processing";

type LayoutDimensions =
  | { width: number; height: number }
  | {
      large: { width: number; height: number };
      small: { width: number; height: number };
    };

export default function AppAlbumClient() {
  const [isOpen, setIsOpen] = useState(true);
  const [albumConfig, setAlbumConfig] = useState({
    size: "",
    pages: 0,
  });

  const [pageFiles, setPageFiles] = useState<{ [key: number]: File[] }>({});
  const [previewUrls, setPreviewUrls] = useState<{ [key: number]: string[] }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 4;
  const QUALITY_SCALE = 2;

  const handleSaveConfig = (size: string, pages: number) => {
    setAlbumConfig({ size, pages });
  };

  const validateFiles = (files: File[], currentFiles: File[]): boolean => {
    const totalImages = currentFiles.length + files.length;
    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Tổng số ảnh không được quá ${MAX_IMAGES} ảnh. Hiện tại có ${currentFiles.length} ảnh, vui lòng chỉ thêm ${files.length} ảnh.`,
        variant: "destructive",
      });
      return false;
    }
    if (currentFiles.length === 0 && files.length < MIN_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Vui lòng tải lên ít nhất ${MIN_IMAGES} ảnh khi album trống.`,
        variant: "destructive",
      });
      return false;
    }
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Lỗi",
        description: `Tất cả hình phải dưới 5MB.`,
        variant: "destructive",
      });
      return false;
    }
    const nonImageFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (nonImageFiles.length > 0) {
      toast({
        title: "Lỗi",
        description: `Chỉ nhận file hình ảnh.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleImageUpload = async (
    pageIndex: number,
    files: FileList | null,
    removedIndex?: number,
    croppedIndex?: number,
    croppedFile?: File,
    reorderedFiles?: File[]
  ) => {
    const currentFiles = pageFiles[pageIndex] || [];

    if (reorderedFiles) {
      setPageFiles((prev) => ({
        ...prev,
        [pageIndex]: reorderedFiles,
      }));
      setPreviewUrls((prev) => ({
        ...prev,
        [pageIndex]: reorderedFiles.map((file) => URL.createObjectURL(file)),
      }));
    } else if (
      files &&
      removedIndex === undefined &&
      croppedIndex === undefined
    ) {
      const fileArray = Array.from(files);
      if (!validateFiles(fileArray, currentFiles)) return;

      const newPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => ({
        ...prev,
        [pageIndex]: [...(prev[pageIndex] || []), ...newPreviewUrls],
      }));
      setPageFiles((prev) => ({
        ...prev,
        [pageIndex]: [...currentFiles, ...fileArray],
      }));
    } else if (removedIndex !== undefined) {
      const updatedFiles = currentFiles.filter(
        (_, idx) => idx !== removedIndex
      );
      const updatedUrls = (previewUrls[pageIndex] || []).filter(
        (_, idx) => idx !== removedIndex
      );

      setPageFiles((prev) => ({
        ...prev,
        [pageIndex]: updatedFiles,
      }));
      setPreviewUrls((prev) => ({
        ...prev,
        [pageIndex]: updatedUrls,
      }));
    } else if (croppedIndex !== undefined && croppedFile) {
      const updatedFiles = [...currentFiles];
      updatedFiles[croppedIndex] = croppedFile;

      const updatedUrls = [...(previewUrls[pageIndex] || [])];
      if (updatedUrls[croppedIndex]?.startsWith("blob:")) {
        URL.revokeObjectURL(updatedUrls[croppedIndex]);
      }
      updatedUrls[croppedIndex] = URL.createObjectURL(croppedFile);

      setPageFiles((prev) => ({
        ...prev,
        [pageIndex]: updatedFiles,
      }));
      setPreviewUrls((prev) => ({
        ...prev,
        [pageIndex]: updatedUrls,
      }));
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const preloadImages = (files: File[]): Promise<HTMLImageElement[]> => {
    const urls = files.map((file) => URL.createObjectURL(file));
    const promises = urls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });
    });
    return Promise.all(promises);
  };

  const getLayoutDimensions = (
    albumSize: string,
    layout: string
  ): LayoutDimensions => {
    const padding = 12;
    const border = 4;
    const baseHeight =
      albumSize === "25x25" ? 327 : albumSize === "30x20" ? 230 : 250;
    const baseWidth =
      albumSize === "25x25" ? 370 : albumSize === "30x20" ? 315 : 320;
    const totalWidth = baseWidth;
    const totalHeight = baseHeight;

    switch (layout) {
      case "2-1":
      case "2-2":
        return { width: totalWidth / 2, height: totalHeight };
      case "3-1":
      case "3-2":
        return {
          large: { width: totalWidth / 2, height: totalHeight },
          small: { width: totalWidth / 2, height: totalHeight / 2 - 2 },
        };
      case "4-1":
        return { width: totalWidth / 2 - 2, height: totalHeight / 2 - 2 };
      default:
        return { width: totalWidth / 2, height: totalHeight };
    }
  };

  const getImageDimensions = (
    albumSize: string,
    layoutId: string,
    index: number
  ) => {
    switch (albumSize) {
      case "25x25":
        return layoutId === "2-1"
          ? { width: 135, height: 270 }
          : layoutId === "2-2"
          ? { width: 270, height: 135 }
          : layoutId.includes("3") && index === 0
          ? { width: 135, height: 270 }
          : layoutId.includes("3")
          ? { width: 135, height: 130 }
          : { width: 135, height: 130 };
      case "30x20":
        return layoutId === "2-1"
          ? { width: 90, height: 120 }
          : layoutId === "2-2"
          ? { width: 170, height: 50 }
          : layoutId.includes("3") && index === 0
          ? { width: 90, height: 120 }
          : layoutId.includes("3")
          ? { width: 90, height: 55 }
          : { width: 90, height: 55 };
      case "35x25":
        return layoutId === "2-1"
          ? { width: 110, height: 173 }
          : layoutId === "2-2"
          ? { width: 220, height: 93 }
          : layoutId.includes("3") && index === 0
          ? { width: 110, height: 160 }
          : layoutId.includes("3")
          ? { width: 110, height: 75 }
          : { width: 110, height: 75 };
      default:
        return { width: 100, height: 100 };
    }
  };

  const renderToCanvas = async (
    files: File[],
    layout: string,
    albumSize: string
  ): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create canvas context");

    const dims = getLayoutDimensions(albumSize, layout);
    const baseHeight =
      albumSize === "25x25" ? 327 : albumSize === "30x20" ? 230 : 250;
    const baseWidth =
      albumSize === "25x25" ? 370 : albumSize === "30x20" ? 315 : 320;
    const totalWidth = baseWidth;
    const totalHeight = baseHeight;

    canvas.width = totalWidth * QUALITY_SCALE;
    canvas.height = totalHeight * QUALITY_SCALE;
    ctx.scale(QUALITY_SCALE, QUALITY_SCALE);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalWidth, totalHeight);
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, totalWidth, totalHeight);

    const loadedImages = await preloadImages(files);

    const hasWidthHeight = (
      dims: LayoutDimensions
    ): dims is { width: number; height: number } => {
      return "width" in dims && "height" in dims;
    };

    switch (layout) {
      case "2-1":
        if (!hasWidthHeight(dims))
          throw new Error("Invalid dimensions for 2-1");
        loadedImages.forEach((img, idx) => {
          const x = idx * (dims.width + 2);
          ctx.drawImage(img, x, 0, dims.width, dims.height);
        });
        break;
      case "2-2":
        if (!hasWidthHeight(dims))
          throw new Error("Invalid dimensions for 2-2");
        loadedImages.forEach((img, idx) => {
          const y = idx * (dims.height / 2 + 2);
          ctx.drawImage(img, 0, y, totalWidth, dims.height / 2);
        });
        break;
      case "3-1":
        if ("large" in dims) {
          ctx.drawImage(
            loadedImages[0],
            0,
            0,
            dims.large.width,
            dims.large.height
          );
          loadedImages.slice(1).forEach((img, idx) => {
            const y = idx * (dims.small.height + 2);
            ctx.drawImage(
              img,
              dims.large.width + 2,
              y,
              dims.small.width,
              dims.small.height
            );
          });
        }
        break;
      case "3-2":
        if ("large" in dims) {
          ctx.drawImage(
            loadedImages[0],
            dims.large.width + 2,
            0,
            dims.large.width,
            dims.large.height
          );
          loadedImages.slice(1).forEach((img, idx) => {
            const y = idx * (dims.small.height + 2);
            ctx.drawImage(img, 0, y, dims.small.width, dims.small.height);
          });
        }
        break;
      case "4-1":
        if (hasWidthHeight(dims)) {
          loadedImages.forEach((img, idx) => {
            const x = (idx % 2) * (dims.width + 2);
            const y = Math.floor(idx / 2) * (dims.height + 2);
            ctx.drawImage(img, x, y, dims.width, dims.height);
          });
        }
        break;
      default:
        throw new Error(`Unsupported layout: ${layout}`);
    }

    return canvas.toDataURL("image/jpeg", 0.95);
  };

  const getAspectRatio = (
    layoutId: string,
    index: number,
    albumSize: string
  ) => {
    const { width, height } = getImageDimensions(albumSize, layoutId, index);
    return width / height;
  };

  const validateImageDimensions = async (
    files: File[],
    layout: string,
    albumSize: string
  ): Promise<boolean> => {
    const loadedImages = await preloadImages(files);
    for (let idx = 0; idx < loadedImages.length; idx++) {
      const img = loadedImages[idx];
      const expected = getImageDimensions(albumSize, layout, idx);
      const actualAspectRatio = img.width / img.height;
      const expectedAspectRatio = expected.width / expected.height;

      const tolerance = 0.05;
      if (
        Math.abs(actualAspectRatio - expectedAspectRatio) /
          expectedAspectRatio >
        tolerance
      ) {
        return false;
      }
    }
    return true;
  };

  const getLayoutForPage = (imageCount: number, pageIndex: number): string => {
    const node = document.querySelector(
      `.album-page-${pageIndex} [data-screenshot="true"]`
    );
    if (!node) return "";
    const classList = node.className;

    if (imageCount === 2) {
      if (classList.includes("grid-cols-2")) return "2-1";
      if (classList.includes("grid-rows-2")) return "2-2";
    } else if (imageCount === 3) {
      if (classList.includes("grid-cols-2")) {
        const firstChild = node.querySelector(":first-child");
        const hasNestedGrid = firstChild?.querySelector(".grid-rows-2");
        if (hasNestedGrid) return "3-2";
        return "3-1";
      }
    } else if (imageCount === 4) {
      if (
        classList.includes("grid-cols-2") &&
        classList.includes("grid-rows-2")
      ) {
        return "4-1";
      }
    }
    return "";
  };

  const validatePages = async (): Promise<boolean> => {
    for (let index = 0; index < albumConfig.pages; index++) {
      const files = pageFiles[index] || [];
      if (files.length < MIN_IMAGES) {
        toast({
          title: "Lỗi",
          description: `Trang ${
            index + 1
          } nên có ít nhất ${MIN_IMAGES} ảnh. Hiện tại đang có ${
            files.length
          } ảnh.`,
          variant: "destructive",
        });
        return false;
      }

      const layout = getLayoutForPage(files.length, index);
      if (!layout) {
        toast({
          title: "Lỗi",
          description: `Không thể nhận layout cho trang số ${index + 1}`,
          variant: "destructive",
        });
        return false;
      }

      const isValid = await validateImageDimensions(
        files,
        layout,
        albumConfig.size
      );
      if (!isValid) {
        toast({
          title: "Lỗi",
          description: `Vài ảnh ở trang ${
            index + 1
          } không vừa với layout (${layout}). Vui lòng cắt ảnh.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (albumConfig.pages === 0) {
      toast({
        title: "Lỗi",
        description: `Không tìm thấy album. Vui lòng chọn lại.`,
        variant: "destructive",
      });
      return false;
    }

    const isValid = await validatePages();
    if (!isValid) return;

    setLoading(true);
    const albumSubmission = [];

    try {
      for (let index = 0; index < albumConfig.pages; index++) {
        const files = pageFiles[index] || [];
        if (files.length === 0) {
          toast({
            title: "Lỗi",
            description: `Không tìm thấy hình ở trang ${index + 1}`,
            variant: "destructive",
          });
          return false;
        }

        const layout = getLayoutForPage(files.length, index);
        if (!layout) {
          toast({
            title: "Lỗi",
            description: `Không thể nhận layout cho trang ${index + 1}.`,
            variant: "destructive",
          });
          return false;
        }

        const dataUrl = await renderToCanvas(files, layout, albumConfig.size);
        const blob = dataURLtoBlob(dataUrl);
        const file = new File([blob], `album-page-${index + 1}.jpg`, {
          type: "image/jpeg",
        });

        const uploadResult = await UploadService.uploadToCloudinary([file]);
        if (uploadResult === false) {
          toast({
            title: "Lỗi",
            description: `Không thể up hình ở trang ${index + 1}`,
            variant: "destructive",
          });
          return false;
        }

        albumSubmission.push(uploadResult[0].secure_url);
      }

      const payload = {
        pages: albumConfig.pages,
        size: albumConfig.size,
        album_data: albumSubmission,
      };

      const response = await OrderService.createOrderAlbum(payload);
      if (response === false) {
        toast({
          title: "Lỗi",
          description: `Tạo đơn thất bại.`,
          variant: "destructive",
        });
      } else {
        // const newTabUrl = `https://www.inanhtructuyen.com/tai-khoan?tab=order-album&orderAlbumID=${response.data.order_id}`;
        // const newWindow = window.open(newTabUrl, "_blank");
        // if (newWindow) {
        //   newWindow.focus();
        // } else {
        //   toast({
        //     title: "Thông báo",
        //     description: "Đang chuyển hướng trang. Vui lòng đợi.",
        //     variant: "default",
        //   });
        //   window.location.href = newTabUrl;
        // }
      }
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to process album submission"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((urls) =>
        urls.forEach((url) => URL.revokeObjectURL(url))
      );
    };
  }, [previewUrls]);

  return (
    <div className="relative w-full flex flex-col justify-center items-center">
      {!isOpen ? (
        <Image
          src={IMAGES.BACKGROUND_MOBILE}
          alt=""
          fill
          priority
          objectFit="cover"
          className="opacity-50 z-0 h-[100vh]"
        />
      ) : (
        <Image
          src={IMAGES.BACKGROUND_MOBILE}
          alt=""
          width={1000}
          height={1000}
          objectFit="cover"
          className="opacity-50 z-0 h-[100vh]"
        />
      )}
      <ChooseOption
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSave={handleSaveConfig}
      />
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white px-7 py-8 rounded-lg flex flex-col items-center gap-6">
            <ImageProcessing />
            <div className="text-black font-medium">
              Hình ảnh đang được xử lí...
            </div>
          </div>
        </div>
      )}
      <div className="w-full h-full flex flex-col z-10">
        <header className="w-full text-white pt-3 p-2 text-center shrink-0">
          <div className="flex flex-row justify-between items-center">
            <Link href={ROUTES.HOME}>
              <ChevronLeft color="black" />
            </Link>
            <div className="flex flex-row justify-center items-center gap-3 ml-12">
              <RefreshCcw color="black" onClick={handleRefresh} />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl text-white font-medium text-sm px-3 py-2 rounded-lg"
            >
              Tiếp tục
            </button>
          </div>
        </header>
        <main className="w-full flex-grow mt-4 p-4 overflow-auto flex flex-col gap-4">
          {albumConfig.pages > 0 &&
            Array.from({ length: albumConfig.pages }).map((_, index) => (
              <div key={index} className={`album-page-${index}`}>
                <div className="mb-2">Trang {index + 1}</div>
                <div className="w-full items-center">
                  <ImageUploadMobileAlbum
                    onImageChange={handleImageUpload}
                    albumSize={albumConfig.size}
                    newImages={previewUrls[index] || []}
                    originalFiles={pageFiles[index] || []}
                    pageIndex={index}
                  />
                </div>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
}
