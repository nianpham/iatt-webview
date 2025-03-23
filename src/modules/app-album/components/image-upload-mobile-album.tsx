import React, { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Crop, PenLine, Upload, X } from "lucide-react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageChange: (
    files: FileList | null,
    removedIndex?: number,
    croppedIndex?: number,
    croppedFile?: File,
    originalFile?: File
  ) => void;
  albumSize?: string;
  newImages?: string[];
  className?: string;
  pageIndex?: number;
}

const ImageUploadMobileAlbum = ({
  onImageChange,
  albumSize,
  newImages = [],
  className,
  pageIndex,
}: ImageUploadProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const mainDialogCloseRef = useRef<HTMLButtonElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 4;

  const layoutOptions = {
    2: [
      { id: "2-1", name: "Layout 1", cols: 2, rows: 1 },
      { id: "2-2", name: "Layout 2", cols: 1, rows: 2 },
    ],
    3: [
      { id: "3-1", name: "Layout 1", cols: 2, rows: 2 },
      { id: "3-2", name: "Layout 2", cols: 2, rows: 2 },
    ],
    4: [{ id: "4-1", name: "Layout 1", cols: 2, rows: 2 }],
  };

  // const renderImageLayout = () => {
  //   const dimensions = getImageDimensions(selectedLayout, 0);
  //   const smallDimensions = selectedLayout.includes("3")
  //     ? getImageDimensions(selectedLayout, 1)
  //     : dimensions;

  //   switch (selectedLayout) {
  //     case "2-1":
  //       return (
  //         <div
  //           className={`border-2 border-gray-300 grid grid-cols-2 p-3 gap-2 !w-full rounded-lg ${
  //             albumSize === "25x25"
  //               ? "h-[300px]"
  //               : albumSize === "30x20"
  //               ? "h-[200px]"
  //               : "h-[250px]"
  //           }`}
  //         >
  //           <div>Layout 2-1</div>
  //         </div>
  //       );
  //     case "2-2":
  //       return (
  //         <div
  //           className={`border-2 border-gray-300 grid grid-rows-2 p-3 gap-2 !w-full rounded-lg ${
  //             albumSize === "25x25"
  //               ? "h-[300px]"
  //               : albumSize === "30x20"
  //               ? "h-[200px]"
  //               : "h-[250px]"
  //           }`}
  //         >
  //           <div>Layout 2-2</div>
  //         </div>
  //       );
  //     case "3-1":
  //       return (
  //         <div
  //           className={`border-2 border-gray-300 grid grid-cols-2 p-3 gap-2 !w-full rounded-lg ${
  //             albumSize === "25x25"
  //               ? "h-[300px]"
  //               : albumSize === "30x20"
  //               ? "h-[200px]"
  //               : "h-[250px]"
  //           }`}
  //         >
  //           <div>Layout 3-1</div>
  //         </div>
  //       );
  //     case "3-2":
  //       return (
  //         <div
  //           className={`border-2 border-gray-300 grid grid-cols-2 p-3 gap-2 !w-full rounded-lg ${
  //             albumSize === "25x25"
  //               ? "h-[300px]"
  //               : albumSize === "30x20"
  //               ? "h-[200px]"
  //               : "h-[250px]"
  //           }`}
  //         >
  //           <div>Layout 3-2</div>
  //         </div>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  const renderLayoutPreview = (option: {
    id: string;
    cols: number;
    rows: number;
  }) => {
    switch (option.id) {
      case "2-1":
        return (
          <div
            className={`grid grid-cols-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[200px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 rounded p-1`}
          >
            <div className="bg-gray-300 rounded"></div>
            <div className="bg-gray-300 rounded"></div>
          </div>
        );
      case "2-2":
        return (
          <div
            className={`grid grid-rows-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[200px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 rounded p-1`}
          >
            <div className="bg-gray-300 rounded"></div>
            <div className="bg-gray-300 rounded"></div>
          </div>
        );
      case "3-1":
        return (
          <div
            className={`grid grid-cols-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[200px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 rounded p-1`}
          >
            <div className="bg-gray-300 rounded grid grid-rows-2"></div>
            <div className="grid grid-rows-2 gap-1">
              <div className="bg-gray-300 rounded"></div>
              <div className="bg-gray-300 rounded"></div>
            </div>
          </div>
        );
      case "3-2":
        return (
          <div
            className={`grid grid-cols-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[200px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 rounded p-1`}
          >
            <div className="grid grid-rows-2 gap-1">
              <div className="bg-gray-300 rounded"></div>
              <div className="bg-gray-300 rounded"></div>
            </div>
            <div className="bg-gray-300 rounded grid grid-rows-2"></div>
          </div>
        );
      case "4-1":
        return (
          <div
            className={`grid grid-cols-2 grid-rows-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[200px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 rounded p-1`}
          >
            <div className="bg-gray-300 rounded"></div>
            <div className="bg-gray-300 rounded"></div>
            <div className="bg-gray-300 rounded"></div>
            <div className="bg-gray-300 rounded"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const [localImages, setLocalImages] = useState<string[]>(newImages);
  const [originalImageFiles, setOriginalImageFiles] = useState<File[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>(
    newImages.length === 2
      ? "2-1"
      : newImages.length === 3
      ? "3-1"
      : newImages.length === 4
      ? "4-1"
      : ""
  );
  const [cropImageIndex, setCropImageIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);

  useEffect(() => {
    setLocalImages(newImages);
  }, [newImages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const totalImages = newImages.length + fileArray.length;

    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Tổng số ảnh không thể quá ${MAX_IMAGES}.`,
        variant: "destructive",
      });
      return;
    }

    if (newImages.length === 0 && fileArray.length < MIN_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Hãy chọn ít nhất ${MIN_IMAGES} ảnh khi album đang trống.`,
        variant: "destructive",
      });
      return;
    }

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Lỗi",
          description: "Mỗi ảnh nên ít hơn 5MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Lỗi",
          description: "Hãy chọn mỗi file ảnh.",
          variant: "destructive",
        });
        return;
      }
    }

    const newImageCount = newImages.length + fileArray.length;
    if (newImageCount !== newImages.length) {
      setSelectedLayout(
        newImageCount === 2
          ? "2-1"
          : newImageCount === 3
          ? "3-1"
          : newImageCount === 4
          ? "4-1"
          : ""
      );
    }

    setOriginalImageFiles((prev) => [...prev, ...fileArray]);
    onImageChange(files);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (newImages.length <= MIN_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Không thể xóa ảnh. Cần ít nhất ${MIN_IMAGES} ảnh.`,
        variant: "destructive",
      });
      return;
    }

    onImageChange(null, indexToRemove);
    setOriginalImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    const newCount = newImages.length - 1;
    setSelectedLayout(
      newCount === 2
        ? "2-1"
        : newCount === 3
        ? "3-1"
        : newCount === 4
        ? "4-1"
        : ""
    );
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const getImageDimensions = (layoutId: string, index: number) => {
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

  const getAspectRatio = (layoutId: string, index: number) => {
    const { width, height } = getImageDimensions(layoutId, index);
    return width / height;
  };

  const renderImageGrid = () => {
    if (localImages.length === 0) {
      return (
        <div
          className={`border-2 border-gray-300 grid grid-cols-2 px-5 gap-5 !w-full rounded-lg ${
            albumSize === "25x25"
              ? "h-[300px]"
              : albumSize === "30x20"
              ? "h-[200px]"
              : "h-[250px]"
          }`}
        >
          <div className="w-full flex justify-center items-center">
            <div className="w-[100%] h-[87%] bg-gray-200 rounded-lg"></div>
          </div>
          <div className="w-full flex justify-center items-center">
            <div className="w-[100%] h-[87%] bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      );
    }

    const dimensions = getImageDimensions(selectedLayout, 0);
    const smallDimensions = selectedLayout.includes("3")
      ? getImageDimensions(selectedLayout, 1)
      : dimensions;

    switch (selectedLayout) {
      case "2-1":
        return (
          <div
            className={`border-2 border-gray-300 grid grid-cols-2 p-3 gap-2 !w-full rounded-lg ${
              albumSize === "25x25"
                ? "h-[300px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            {localImages.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`Image ${index + 1}`}
                width={1000}
                height={1000}
                className={`w-full h-[${dimensions.height}px] object-cover rounded-lg`}
              />
            ))}
          </div>
        );
      case "2-2":
        return (
          <div
            className={`border-2 border-gray-300 grid grid-rows-2 p-3 gap-2 !w-full rounded-lg ${
              albumSize === "25x25"
                ? "h-[300px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            {localImages.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`Image ${index + 1}`}
                width={1000}
                height={1000}
                className={`w-full h-full object-cover rounded-lg`}
              />
            ))}
          </div>
        );
      case "3-1":
        return (
          <div
            className={`border-2 border-gray-300 grid grid-cols-2 p-3 gap-2 !w-full rounded-lg ${
              albumSize === "25x25"
                ? "h-[300px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            <Image
              src={localImages[0]}
              alt="Image 1"
              width={1000}
              height={1000}
              className={`w-full h-[${dimensions.height}px] object-cover rounded-lg`}
            />
            <div className="grid grid-rows-2 gap-2">
              {localImages.slice(1).map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  alt={`Image ${index + 2}`}
                  width={1000}
                  height={1000}
                  className={`w-full h-[${smallDimensions.height}px] object-cover rounded-lg`}
                />
              ))}
            </div>
          </div>
        );
      case "3-2":
        return (
          <div
            className={`border-2 border-gray-300 grid grid-cols-2 p-3 gap-2 !w-full rounded-lg ${
              albumSize === "25x25"
                ? "h-[300px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            <div className="grid grid-rows-2 gap-2">
              {localImages.slice(1).map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  alt={`Image ${index + 2}`}
                  width={1000}
                  height={1000}
                  className={`w-full h-[${smallDimensions.height}px] object-cover rounded-lg`}
                />
              ))}
            </div>
            <Image
              src={localImages[0]}
              alt="Image 1"
              width={1000}
              height={1000}
              className={`w-full h-[${dimensions.height}px] object-cover rounded-lg`}
            />
          </div>
        );
      case "4-1":
      case "4-2":
        return (
          <div
            className={`border-2 border-gray-300 grid grid-cols-2 p-3 gap-2 !w-full rounded-lg ${
              albumSize === "25x25"
                ? "h-[300px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            {localImages.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`Image ${index + 1}`}
                width={1000}
                height={1000}
                className={`w-full h-[${dimensions.height}px] object-cover rounded-lg`}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropSave = useCallback(async () => {
    if (!croppedAreaPixels || cropImageIndex === null) {
      toast({
        title: "Lỗi",
        description: "Không có vùng cắt được chọn.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl: string;
      if (originalImageFiles[cropImageIndex]) {
        imageUrl = URL.createObjectURL(originalImageFiles[cropImageIndex]);
      } else {
        const response = await fetch(newImages[cropImageIndex], {
          mode: "cors",
        });
        if (!response.ok) throw new Error("Không thể tải hình ảnh từ nguồn.");
        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
      }

      const image = new window.Image();
      image.src = imageUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Không thể tải hình ảnh."));
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Không thể tạo context canvas.");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const croppedImageUrl = canvas.toDataURL("image/jpeg");
      const croppedBlob = dataURLtoBlob(croppedImageUrl);
      const croppedFile = new File(
        [croppedBlob],
        `cropped-image-${cropImageIndex}.jpg`,
        { type: "image/jpeg" }
      );

      setLocalImages((prev) => {
        const updated = [...prev];
        updated[cropImageIndex] = croppedImageUrl;
        return updated;
      });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(croppedFile);
      const fileList = dataTransfer.files;

      onImageChange(
        fileList,
        undefined,
        cropImageIndex,
        croppedFile,
        originalImageFiles[cropImageIndex]
      );

      setCropImageIndex(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);

      setIsMainDialogOpen(false);
      if (mainDialogCloseRef.current) {
        mainDialogCloseRef.current.click();
      }

      toast({
        title: "Thành công",
        description: "Thay đổi vị trí hình ảnh thành công.",
        className: "bg-green-500 text-white border-green-600",
      });
    } catch (error) {
      console.error("Error cropping image:", error);
      toast({
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Không thể xử lý hình ảnh.",
        variant: "destructive",
      });
    }
  }, [
    croppedAreaPixels,
    cropImageIndex,
    newImages,
    originalImageFiles,
    onImageChange,
  ]);

  const handleLayoutChange = useCallback((layoutId: string) => {
    setSelectedLayout(layoutId);
    setIsMainDialogOpen(false);
    if (mainDialogCloseRef.current) {
      mainDialogCloseRef.current.click();
    }
    toast({
      title: "Thành công",
      description: "Layout đã được thay đổi.",
      className: "bg-green-500 text-white border-green-600",
    });
  }, []);

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

  return (
    <div
      className={cn(
        "flex justify-center lg:!justify-start lg:items-start !w-full",
        className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      <div className="relative group w-full h-full">
        {newImages.length > 0 && (
          <>
            <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
              <DialogTrigger asChild>
                <div className="absolute -top-3 -right-3 bg-white p-2 rounded-full z-20">
                  <PenLine className="w-4 h-4 text-black cursor-pointer" />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[350px] max-h-[90vh] rounded-lg flex flex-col">
                <DialogHeader>
                  <DialogTitle>
                    Trang Album {pageIndex !== undefined ? pageIndex + 1 : ""}
                  </DialogTitle>
                  <DialogDescription>
                    Tùy chọn hình ảnh trang số{" "}
                    {pageIndex !== undefined ? pageIndex + 1 : ""}.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  {/* THAY DOI LAYOUT */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l text-white text-center py-2 rounded-lg">
                        Thay đổi layout
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[350px] max-h-[90vh] rounded-lg flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Thay đổi layout</DialogTitle>
                        <DialogDescription>
                          Chọn layout cho {newImages.length} ảnh
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto pt-3 px-0">
                        {layoutOptions[
                          newImages.length as keyof typeof layoutOptions
                        ]?.map((option) => (
                          <div
                            key={option.id}
                            className={`p-2 mb-2 rounded-lg cursor-pointer ${
                              selectedLayout === option.id
                                ? "bg-blue-50 border-2 border-blue-300"
                                : "hover:bg-gray-100 border border-gray-100"
                            }`}
                            onClick={() => handleLayoutChange(option.id)}
                          >
                            {renderLayoutPreview(option)}
                            <div className="mt-1 text-center text-sm font-medium">
                              {option.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      <DialogFooter className="px-0">
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="!px-10 !text-[16px] mt-3"
                          >
                            Đóng
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {/* QUAN LI HINH ANH */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl text-white text-center py-2 rounded-lg">
                        Quản lí hình ảnh
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[350px] max-h-[90vh] rounded-lg flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Quản lí hình ảnh</DialogTitle>
                        <DialogDescription>
                          Danh sách hình ảnh trang số{" "}
                          {pageIndex !== undefined ? pageIndex + 1 : ""}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto pt-3 px-2">
                        {localImages.map((img, index) => (
                          <div
                            key={index}
                            className="relative w-full h-[200px] mb-4"
                          >
                            <Image
                              src={img}
                              alt={`Image ${index + 1}`}
                              width={1000}
                              height={1000}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setCropImageIndex(index)}
                              className="absolute -top-2 -left-2 bg-green-100 text-white p-1 rounded-full"
                            >
                              <Crop size={15} color="black" />
                            </button>
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <DialogFooter className="px-2">
                        <DialogClose asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="!px-10 !text-[16px] mt-3"
                          >
                            Huỷ
                          </Button>
                        </DialogClose>
                        <button
                          onClick={handleClick}
                          className="flex justify-center items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm !px-10 !text-[16px] py-2.5"
                        >
                          Thêm ảnh
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <DialogClose ref={mainDialogCloseRef} className="hidden" />
              </DialogContent>
            </Dialog>
            {cropImageIndex !== null && (
              <Dialog
                open={cropImageIndex !== null}
                onOpenChange={() => setCropImageIndex(null)}
              >
                <DialogContent className="max-w-[90vw] max-h-[90vh] rounded-lg">
                  <DialogHeader>
                    <DialogTitle>Cắt ảnh</DialogTitle>
                    <DialogDescription>
                      Điều chỉnh vùng cắt cho ảnh
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative w-full h-[60vh]">
                    <Cropper
                      image={
                        originalImageFiles[cropImageIndex]
                          ? URL.createObjectURL(
                              originalImageFiles[cropImageIndex]
                            )
                          : newImages[cropImageIndex]
                      }
                      crop={crop}
                      zoom={zoom}
                      aspect={getAspectRatio(selectedLayout, cropImageIndex)}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="secondary"
                        onClick={() => setCropImageIndex(null)}
                      >
                        Hủy
                      </Button>
                    </DialogClose>
                    <Button onClick={handleCropSave}>Lưu</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <div className={cn("relative w-full overflow-hidden rounded-lg")}>
              {renderImageGrid()}
            </div>
          </>
        )}
        {newImages.length === 0 && (
          <div
            onClick={handleClick}
            className="flex h-[300px] w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-3 mt-0 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <div className="flex flex-row items-center gap-2">
                <Upload size={20} />
                <span>Tải hình ảnh lên Album</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                Tối thiểu 2 hình, tối đa 4 hình (mỗi hình dưới 5MB)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadMobileAlbum;
