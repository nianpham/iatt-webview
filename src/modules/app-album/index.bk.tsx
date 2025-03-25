"use client";

import React, { useEffect, useState } from "react";
import { ChooseOption } from "./dialog/choose-option";
import ImageUploadMobileAlbum from "./components/image-upload-mobile-album";
import { UploadService } from "@/services/upload";
import ImageProcessing from "../app-frame/components/image-processing";
import Image from "next/image";
import { IMAGES } from "@/utils/image";
import Link from "next/link";
import { ChevronLeft, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type LayoutDimensions =
  | { width: number; height: number } // For layouts "2-1", "2-2", "4-1"
  | {
      large: { width: number; height: number };
      small: { width: number; height: number };
    }; // For layouts "3-1", "3-2"

export default function AppAlbumClient() {
  const [isOpen, setIsOpen] = useState(true);
  const [albumConfig, setAlbumConfig] = useState({
    size: "",
    pages: 0,
  });

  const [pageImages, setPageImages] = useState<{ [key: number]: string[] }>({});
  const [previewImages, setPreviewImages] = useState<{
    [key: number]: string[];
  }>({});
  const [originalFiles, setOriginalFiles] = useState<{ [key: number]: File[] }>(
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

  const validateFiles = (files: File[], currentImages: string[]): boolean => {
    const totalImages = currentImages.length + files.length;
    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Tổng số ảnh không vượt quá ${MAX_IMAGES}. Hiện tại có ${currentImages.length} ảnh, Vui lòng thêm ${files.length} ảnh.`,
        variant: "destructive",
      });
      return false;
    }
    if (currentImages.length === 0 && files.length < MIN_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Vui lòng tải lên tối thiểu ${MIN_IMAGES} ảnh khi album đang trống.`,
        variant: "destructive",
      });
      return false;
    }
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Lỗi",
        description: `Tất cả ảnh không vượt quá 5MB.`,
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
        description: `Vui lòng tải lên tệp hình ảnh.`,
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
    originalFile?: File,
    reorderedImages?: string[]
  ) => {
    if (reorderedImages) {
      setPageImages((prev) => ({
        ...prev,
        [pageIndex]: reorderedImages,
      }));
      setPreviewImages((prev) => ({
        ...prev,
        [pageIndex]: reorderedImages,
      }));
      setOriginalFiles((prev) => {
        const currentFiles = prev[pageIndex] || [];
        const reorderedFiles = reorderedImages.map((src) => {
          const index = pageImages[pageIndex]?.indexOf(src);
          return index !== undefined && index !== -1
            ? currentFiles[index]
            : currentFiles[0];
        });
        return { ...prev, [pageIndex]: reorderedFiles };
      });
    } else if (
      files &&
      removedIndex === undefined &&
      croppedIndex === undefined
    ) {
      const fileArray = Array.from(files);
      const currentImages = pageImages[pageIndex] || [];

      if (!validateFiles(fileArray, currentImages)) return;

      const newPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => ({
        ...prev,
        [pageIndex]: [...(prev[pageIndex] || []), ...newPreviewUrls],
      }));

      try {
        setLoading(true);
        const uploadResults = await UploadService.uploadToCloudinary(fileArray);
        if (uploadResults === false) {
          throw new Error("Upload failed");
        }

        const secureUrls = uploadResults.map(
          (result: any) => result.secure_url
        );

        setPageImages((prev) => ({
          ...prev,
          [pageIndex]: [...(prev[pageIndex] || []), ...secureUrls],
        }));
        setOriginalFiles((prev) => ({
          ...prev,
          [pageIndex]: [...(prev[pageIndex] || []), ...fileArray],
        }));

        setPreviewImages((prev) => {
          const existingPreviews = (prev[pageIndex] || []).filter(
            (url) => !newPreviewUrls.includes(url)
          );
          existingPreviews.forEach((url) => URL.revokeObjectURL(url));
          return {
            ...prev,
            [pageIndex]: [...(pageImages[pageIndex] || []), ...secureUrls],
          };
        });

        setLoading(false);
        setError(null);
      } catch (error) {
        setError("Failed to upload images to Cloudinary");
        console.error(error);
        setLoading(false);
        setPreviewImages((prev) => ({
          ...prev,
          [pageIndex]: pageImages[pageIndex] || [],
        }));
      }
    } else if (removedIndex !== undefined) {
      setPageImages((prev) => {
        const currentImages = prev[pageIndex] || [];
        const updatedImages = currentImages.filter(
          (_, idx) => idx !== removedIndex
        );
        return { ...prev, [pageIndex]: updatedImages };
      });
      setPreviewImages((prev) => {
        const currentPreviews = prev[pageIndex] || [];
        const updatedPreviews = currentPreviews.filter(
          (_, idx) => idx !== removedIndex
        );
        updatedPreviews.forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return { ...prev, [pageIndex]: updatedPreviews };
      });
      setOriginalFiles((prev) => {
        const currentFiles = prev[pageIndex] || [];
        const updatedFiles = currentFiles.filter(
          (_, idx) => idx !== removedIndex
        );
        return { ...prev, [pageIndex]: updatedFiles };
      });
    } else if (croppedIndex !== undefined && croppedFile) {
      try {
        setLoading(true);
        const uploadResult = await UploadService.uploadToCloudinary([
          croppedFile,
        ]);
        if (uploadResult === false) {
          throw new Error("Upload failed");
        }

        const secureUrl = uploadResult[0].secure_url;

        setPageImages((prev) => {
          const currentImages = prev[pageIndex] || [];
          const updatedImages = [...currentImages];
          updatedImages[croppedIndex] = secureUrl;
          return { ...prev, [pageIndex]: updatedImages };
        });
        setPreviewImages((prev) => {
          const currentPreviews = prev[pageIndex] || [];
          const updatedPreviews = [...currentPreviews];
          if (updatedPreviews[croppedIndex]?.startsWith("blob:")) {
            URL.revokeObjectURL(updatedPreviews[croppedIndex]);
          }
          updatedPreviews[croppedIndex] = secureUrl;
          return { ...prev, [pageIndex]: updatedPreviews };
        });
        setOriginalFiles((prev) => {
          const currentFiles = prev[pageIndex] || [];
          const updatedFiles = [...currentFiles];
          updatedFiles[croppedIndex] = croppedFile;
          return { ...prev, [pageIndex]: updatedFiles };
        });

        setLoading(false);
        setError(null);
      } catch (error) {
        setError("Failed to upload cropped image to Cloudinary");
        console.error(error);
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const preloadImages = (urls: string[]): Promise<HTMLImageElement[]> => {
    const promises = urls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.src = url;
        img.crossOrigin = "anonymous";
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
    const padding = 12; // 3px padding on each side (p-3) * 2
    const border = 4; // 2px border on each side
    const baseHeight =
      albumSize === "25x25" ? 300 : albumSize === "30x20" ? 200 : 250;
    const baseWidth =
      albumSize === "25x25" ? 370 : albumSize === "30x20" ? 270 : 320;
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
          small: { width: totalWidth / 2, height: totalHeight / 2 - 2 }, // 2px gap
        };
      case "4-1":
        return { width: totalWidth / 2 - 2, height: totalHeight / 2 - 2 }; // 2px gap
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
          ? { width: 90, height: 170 }
          : layoutId === "2-2"
          ? { width: 170, height: 85 }
          : layoutId.includes("3") && index === 0
          ? { width: 90, height: 170 }
          : layoutId.includes("3")
          ? { width: 90, height: 80 }
          : { width: 90, height: 80 };
      case "35x25":
        return layoutId === "2-1"
          ? { width: 110, height: 220 }
          : layoutId === "2-2"
          ? { width: 220, height: 110 }
          : layoutId.includes("3") && index === 0
          ? { width: 110, height: 220 }
          : layoutId.includes("3")
          ? { width: 110, height: 105 }
          : { width: 110, height: 105 };
      default:
        return { width: 100, height: 100 };
    }
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
    images: string[],
    layout: string,
    albumSize: string
  ): Promise<boolean> => {
    const loadedImages = await preloadImages(images);
    for (let idx = 0; idx < loadedImages.length; idx++) {
      const img = loadedImages[idx];
      const expected = getImageDimensions(albumSize, layout, idx);
      const actualAspectRatio = img.width / img.height;
      const expectedAspectRatio = expected.width / expected.height;

      // Allow a small tolerance (e.g., 5%) for aspect ratio comparison
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

  const renderToCanvas = async (
    images: string[],
    layout: string,
    albumSize: string
  ): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to create canvas context");
    }

    // Get layout dimensions
    const dims = getLayoutDimensions(albumSize, layout);
    const padding = 12; // 3px padding on each side (p-3) * 2
    const border = 4; // 2px border on each side
    const baseHeight =
      albumSize === "25x25" ? 300 : albumSize === "30x20" ? 200 : 250;
    const baseWidth =
      albumSize === "25x25" ? 370 : albumSize === "30x20" ? 270 : 320;
    const totalWidth = baseWidth;
    const totalHeight = baseHeight;

    // Set canvas dimensions with quality scaling
    const QUALITY_SCALE = 2; // Define QUALITY_SCALE here or pass it as a parameter
    canvas.width = totalWidth * QUALITY_SCALE;
    canvas.height = totalHeight * QUALITY_SCALE;
    ctx.scale(QUALITY_SCALE, QUALITY_SCALE);

    // Draw background and border
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalWidth, totalHeight);
    ctx.strokeStyle = "#d1d5db"; // gray-300
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, totalWidth, totalHeight);

    // Preload images
    const loadedImages = await preloadImages(images);

    // Helper function to check if dims has width and height directly
    const hasWidthHeight = (
      dims: LayoutDimensions
    ): dims is { width: number; height: number } => {
      return "width" in dims && "height" in dims;
    };

    // Draw images based on layout
    switch (layout) {
      case "2-1":
        if (!hasWidthHeight(dims)) {
          throw new Error("Expected width and height for layout 2-1");
        }
        loadedImages.forEach((img, idx) => {
          const x = idx * (dims.width + 2); // 2px gap
          ctx.drawImage(img, x, 0, dims.width, dims.height);
          // Draw rounded corners (clipping path)
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + 8, 0);
          ctx.lineTo(x + dims.width - 8, 0);
          ctx.quadraticCurveTo(x + dims.width, 0, x + dims.width, 8);
          ctx.lineTo(x + dims.width, dims.height - 8);
          ctx.quadraticCurveTo(
            x + dims.width,
            dims.height,
            x + dims.width - 8,
            dims.height
          );
          ctx.lineTo(x + 8, dims.height);
          ctx.quadraticCurveTo(x, dims.height, x, dims.height - 8);
          ctx.lineTo(x, 8);
          ctx.quadraticCurveTo(x, 0, x + 8, 0);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x, 0, dims.width, dims.height);
          ctx.restore();
        });
        break;

      case "2-2":
        if (!hasWidthHeight(dims)) {
          throw new Error("Expected width and height for layout 2-2");
        }
        loadedImages.forEach((img, idx) => {
          const y = idx * (dims.height / 2 + 2); // 2px gap
          ctx.drawImage(img, 0, y, dims.width * 2, dims.height / 2);
          // Draw rounded corners
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0 + 8, y);
          ctx.lineTo(dims.width * 2 - 8, y);
          ctx.quadraticCurveTo(dims.width * 2, y, dims.width * 2, y + 8);
          ctx.lineTo(dims.width * 2, y + dims.height / 2 - 8);
          ctx.quadraticCurveTo(
            dims.width * 2,
            y + dims.height / 2,
            dims.width * 2 - 8,
            y + dims.height / 2
          );
          ctx.lineTo(8, y + dims.height / 2);
          ctx.quadraticCurveTo(
            0,
            y + dims.height / 2,
            0,
            y + dims.height / 2 - 8
          );
          ctx.lineTo(0, y + 8);
          ctx.quadraticCurveTo(0, y, 8, y);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 0, y, dims.width * 2, dims.height / 2);
          ctx.restore();
        });
        break;

      case "3-1":
        if (hasWidthHeight(dims)) {
          throw new Error("Expected large and small dimensions for layout 3-1");
        }
        // Large image on the left
        ctx.drawImage(
          loadedImages[0],
          0,
          0,
          dims.large.width,
          dims.large.height
        );
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(dims.large.width - 8, 0);
        ctx.quadraticCurveTo(dims.large.width, 0, dims.large.width, 8);
        ctx.lineTo(dims.large.width, dims.large.height - 8);
        ctx.quadraticCurveTo(
          dims.large.width,
          dims.large.height,
          dims.large.width - 8,
          dims.large.height
        );
        ctx.lineTo(8, dims.large.height);
        ctx.quadraticCurveTo(0, dims.large.height, 0, dims.large.height - 8);
        ctx.lineTo(0, 8);
        ctx.quadraticCurveTo(0, 0, 8, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          loadedImages[0],
          0,
          0,
          dims.large.width,
          dims.large.height
        );
        ctx.restore();

        // Two small images on the right
        loadedImages.slice(1).forEach((img, idx) => {
          const y = idx * (dims.small.height + 2); // 2px gap
          const x = dims.large.width + 2; // 2px gap
          ctx.drawImage(img, x, y, dims.small.width, dims.small.height);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + 8, y);
          ctx.lineTo(x + dims.small.width - 8, y);
          ctx.quadraticCurveTo(
            x + dims.small.width,
            y,
            x + dims.small.width,
            y + 8
          );
          ctx.lineTo(x + dims.small.width, y + dims.small.height - 8);
          ctx.quadraticCurveTo(
            x + dims.small.width,
            y + dims.small.height,
            x + dims.small.width - 8,
            y + dims.small.height
          );
          ctx.lineTo(x + 8, y + dims.small.height);
          ctx.quadraticCurveTo(
            x,
            y + dims.small.height,
            x,
            y + dims.small.height - 8
          );
          ctx.lineTo(x, y + 8);
          ctx.quadraticCurveTo(x, y, x + 8, y);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x, y, dims.small.width, dims.small.height);
          ctx.restore();
        });
        break;

      case "3-2":
        if (hasWidthHeight(dims)) {
          throw new Error("Expected large and small dimensions for layout 3-2");
        }
        // Two small images on the left
        loadedImages.slice(1).forEach((img, idx) => {
          const y = idx * (dims.small.height + 2); // 2px gap
          ctx.drawImage(img, 0, y, dims.small.width, dims.small.height);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(8, y);
          ctx.lineTo(dims.small.width - 8, y);
          ctx.quadraticCurveTo(dims.small.width, y, dims.small.width, y + 8);
          ctx.lineTo(dims.small.width, y + dims.small.height - 8);
          ctx.quadraticCurveTo(
            dims.small.width,
            y + dims.small.height,
            dims.small.width - 8,
            y + dims.small.height
          );
          ctx.lineTo(8, y + dims.small.height);
          ctx.quadraticCurveTo(
            0,
            y + dims.small.height,
            0,
            y + dims.small.height - 8
          );
          ctx.lineTo(0, y + 8);
          ctx.quadraticCurveTo(0, y, 8, y);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 0, y, dims.small.width, dims.small.height);
          ctx.restore();
        });

        // Large image on the right
        ctx.drawImage(
          loadedImages[0],
          dims.small.width + 2,
          0,
          dims.large.width,
          dims.large.height
        );
        ctx.save();
        ctx.beginPath();
        const x = dims.small.width + 2;
        ctx.moveTo(x + 8, 0);
        ctx.lineTo(x + dims.large.width - 8, 0);
        ctx.quadraticCurveTo(x + dims.large.width, 0, x + dims.large.width, 8);
        ctx.lineTo(x + dims.large.width, dims.large.height - 8);
        ctx.quadraticCurveTo(
          x + dims.large.width,
          dims.large.height,
          x + dims.large.width - 8,
          dims.large.height
        );
        ctx.lineTo(x + 8, dims.large.height);
        ctx.quadraticCurveTo(x, dims.large.height, x, dims.large.height - 8);
        ctx.lineTo(x, 8);
        ctx.quadraticCurveTo(x, 0, x + 8, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          loadedImages[0],
          dims.small.width + 2,
          0,
          dims.large.width,
          dims.large.height
        );
        ctx.restore();
        break;

      case "4-1":
        if (!hasWidthHeight(dims)) {
          throw new Error("Expected width and height for layout 4-1");
        }
        loadedImages.forEach((img, idx) => {
          const row = Math.floor(idx / 2);
          const col = idx % 2;
          const x = col * (dims.width + 2); // 2px gap
          const y = row * (dims.height + 2); // 2px gap
          ctx.drawImage(img, x, y, dims.width, dims.height);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x + 8, y);
          ctx.lineTo(x + dims.width - 8, y);
          ctx.quadraticCurveTo(x + dims.width, y, x + dims.width, y + 8);
          ctx.lineTo(x + dims.width, y + dims.height - 8);
          ctx.quadraticCurveTo(
            x + dims.width,
            y + dims.height,
            x + dims.width - 8,
            y + dims.height
          );
          ctx.lineTo(x + 8, y + dims.height);
          ctx.quadraticCurveTo(x, y + dims.height, x, y + dims.height - 8);
          ctx.lineTo(x, y + 8);
          ctx.quadraticCurveTo(x, y, x + 8, y);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, x, y, dims.width, dims.height);
          ctx.restore();
        });
        break;

      default:
        throw new Error(`Unsupported layout: ${layout}`);
    }

    return canvas.toDataURL("image/png", 1.0); // Maximum quality
  };

  const getLayoutForPage = (imageCount: number, pageIndex: number): string => {
    const node = document.querySelector(
      `.album-page-${pageIndex} [data-screenshot="true"]`
    );
    if (!node) return "";
    const classList = node.className;
    if (imageCount === 2) {
      return classList.includes("grid-cols-2") ? "2-1" : "2-2";
    } else if (imageCount === 3) {
      return classList.includes("grid-cols-2") ? "3-1" : "3-2";
    } else if (imageCount === 4) {
      return "4-1";
    }
    return "";
  };

  const validatePages = async (): Promise<boolean> => {
    // Validate that each page has at least MIN_IMAGES
    for (let index = 0; index < albumConfig.pages; index++) {
      const images = pageImages[index] || previewImages[index] || [];
      if (images.length < MIN_IMAGES) {
        toast({
          title: "Lỗi",
          description: `Trang ${
            index + 1
          } nên có ít nhất ${MIN_IMAGES} ảnh. Hiện tại có ${
            images.length
          } ảnh.`,
          variant: "destructive",
        });
        return false;
      }

      // Validate that each image is cropped to fit the grid
      const layout = getLayoutForPage(images.length, index);
      if (!layout) {
        toast({
          title: "Lỗi",
          description: `Không thể xác định layout cho trang ${index + 1}`,
          variant: "destructive",
        });
        return false;
      }

      const isValid = await validateImageDimensions(
        images,
        layout,
        albumConfig.size
      );
      if (!isValid) {
        toast({
          title: "Lỗi",
          description: `Một số ảnh trên trang ${
            index + 1
          } chưa được cắt vừa vào layout (${layout}). Vui lòng cắt ảnh.`,
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
        description: `Không tìm thấy cấu hình album`,
        variant: "destructive",
      });
      return false;
    }

    // Validate pages and image cropping
    const isValid = await validatePages();
    if (!isValid) {
      return;
    }

    setLoading(true);
    const albumSubmission = [];

    try {
      for (let index = 0; index < albumConfig.pages; index++) {
        const images = pageImages[index] || previewImages[index] || [];
        if (images.length === 0) {
          toast({
            title: "Lỗi",
            description: `Không có hình ảnh ở trang ${index + 1}`,
            variant: "destructive",
          });
          return false;
          // throw new Error(`No images found for page ${index + 1}`);
        }

        const layout = getLayoutForPage(images.length, index);
        if (!layout) {
          toast({
            title: "Lỗi",
            description: `Không thể xác định layout cho trang ${index + 1}`,
            variant: "destructive",
          });
          return false;
          // throw new Error(`Could not determine layout for page ${index + 1}`);
        }

        // Render the images to a canvas
        const dataUrl = await renderToCanvas(images, layout, albumConfig.size);

        const blob = dataURLtoBlob(dataUrl);
        const file = new File([blob], `album-page-${index + 1}.png`, {
          type: "image/png",
        });

        // Upload to Cloudinary
        const uploadResult = await UploadService.uploadToCloudinary([file]);
        if (uploadResult === false) {
          toast({
            title: "Lỗi",
            description: `Tải ảnh thất bại trên trang ${index + 1}`,
            variant: "destructive",
          });
          return false;
          // throw new Error(`Upload failed for page ${index + 1}`);
        }

        const secureUrl = uploadResult[0].secure_url;
        albumSubmission.push({
          page: index + 1,
          url: secureUrl,
        });
      }

      console.log("Submitted Album List:", albumSubmission);
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
      Object.values(previewImages).forEach((page) =>
        page.forEach((url) => URL.revokeObjectURL(url))
      );
    };
  }, [previewImages]);

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
            <Link href="/app-home">
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
        <main className="w-full flex-grow p-4 overflow-auto flex flex-col gap-4">
          {albumConfig.pages > 0 &&
            Array.from({ length: albumConfig.pages }).map((_, index) => (
              <div key={index} className={`album-page-${index}`}>
                <div className="mb-2">Trang {index + 1}</div>
                <div className="w-full items-center">
                  <ImageUploadMobileAlbum
                    onImageChange={(
                      files,
                      removedIndex,
                      croppedIndex,
                      croppedFile,
                      originalFile,
                      reorderedImages
                    ) =>
                      handleImageUpload(
                        index,
                        files,
                        removedIndex,
                        croppedIndex,
                        croppedFile,
                        originalFile,
                        reorderedImages
                      )
                    }
                    albumSize={albumConfig.size}
                    newImages={previewImages[index] || pageImages[index] || []}
                    originalFiles={originalFiles[index] || []}
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
