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
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  MultiBackend,
  TouchTransition,
  MouseTransition,
} from "react-dnd-multi-backend";

interface ImageUploadProps {
  onImageChange: (
    pageIndex: number,
    files: FileList | null,
    removedIndex?: number,
    croppedIndex?: number,
    croppedFile?: File,
    reorderedFiles?: File[]
  ) => void;
  albumSize?: string;
  newImages?: string[];
  originalFiles?: File[];
  className?: string;
  pageIndex?: number;
}

interface DivProps {
  src: string;
  title?: string;
  id: string;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  albumSize: string;
  imageHeight: string;
}

const DND_BACKEND = {
  backends: [
    { id: "html5", backend: HTML5Backend, transition: MouseTransition },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
  ],
};

const Div: React.FC<DivProps> = ({
  src,
  title,
  id,
  index,
  moveImage,
  albumSize,
  imageHeight,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: "image",
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.2s ease",
      }}
      className={`relative w-full ${imageHeight} mb-0 cursor-move touch-none`}
    >
      <Image
        src={src}
        alt={title || `Image ${index + 1}`}
        width={1000}
        height={1000}
        className={`w-full h-full object-contain rounded border border-gray-500`}
      />
    </div>
  );
};

const ImageUploadMobileAlbum = ({
  onImageChange,
  albumSize,
  newImages = [],
  originalFiles = [],
  className,
  pageIndex = 0,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainDialogCloseRef = useRef<HTMLButtonElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MIN_IMAGES = 2;
  const MAX_IMAGES = 4;

  const [localFiles, setLocalFiles] = useState<File[]>(originalFiles);
  const [localPreviews, setLocalPreviews] = useState<string[]>(newImages);
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
  const [isReordered, setIsReordered] = useState(false);

  useEffect(() => {
    setLocalFiles(originalFiles);
    setLocalPreviews(newImages);
    setIsReordered(false);
  }, [originalFiles, newImages]);

  const moveImage = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setLocalFiles((prev) => {
        const clonedFiles = [...prev];
        const [movedFile] = clonedFiles.splice(dragIndex, 1);
        clonedFiles.splice(hoverIndex, 0, movedFile);

        const clonedPreviews = [...localPreviews];
        const [movedPreview] = clonedPreviews.splice(dragIndex, 1);
        clonedPreviews.splice(hoverIndex, 0, movedPreview);

        setLocalPreviews(clonedPreviews);
        setIsReordered(true);
        return clonedFiles;
      });
    },
    [localPreviews]
  );

  const handleSaveReorderedImages = useCallback(() => {
    onImageChange(pageIndex, null, undefined, undefined, undefined, localFiles);
    setIsReordered(false);
    toast({
      title: "Thành công",
      description: "Vị trí hình ảnh đã được lưu.",
      className: "bg-green-500 text-white border-green-600",
    });
  }, [localFiles, onImageChange, pageIndex]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const totalImages = localFiles.length + fileArray.length;

    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Tổng số ảnh không thể quá ${MAX_IMAGES}.`,
        variant: "destructive",
      });
      return;
    }

    if (localFiles.length === 0 && fileArray.length < MIN_IMAGES) {
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

    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setLocalFiles((prev) => [...prev, ...fileArray]);
    setLocalPreviews((prev) => [...prev, ...newPreviews]);
    onImageChange(pageIndex, files);

    const newImageCount = localFiles.length + fileArray.length;
    setSelectedLayout(
      newImageCount === 2
        ? "2-1"
        : newImageCount === 3
        ? "3-1"
        : newImageCount === 4
        ? "4-1"
        : ""
    );
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (localFiles.length <= MIN_IMAGES) {
      toast({
        title: "Lỗi",
        description: `Không thể xóa ảnh. Cần ít nhất ${MIN_IMAGES} ảnh.`,
        variant: "destructive",
      });
      return;
    }

    const removedUrl = localPreviews[indexToRemove];
    if (removedUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(removedUrl);
    }

    setLocalFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setLocalPreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    onImageChange(pageIndex, null, indexToRemove);

    const newCount = localFiles.length - 1;
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

  const handleCropButtonClick = (index: number) => {
    if (isReordered) {
      toast({
        title: "Cảnh báo",
        description: "Vui lòng lưu vị trí hình ảnh mới trước khi cắt ảnh.",
        variant: "destructive",
      });
    } else {
      setCropImageIndex(index);
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

  const getAspectRatio = (layoutId: string, index: number) => {
    const { width, height } = getImageDimensions(layoutId, index);
    return width / height;
  };

  const renderImageGrid = () => {
    const images = localFiles.map((file) => URL.createObjectURL(file));

    switch (selectedLayout) {
      case "2-1":
        return (
          <div
            data-screenshot="true"
            className={`border-2 border-gray-300 grid grid-cols-2 p-1 gap-1 !w-full ${
              albumSize === "25x25"
                ? "h-[284px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            {images.map((src, index) => (
              <img
                onClick={() => handleCropButtonClick(index)}
                key={`img-${index}-${Date.now()}`}
                src={src}
                alt={`Image ${index + 1}`}
                className={`w-full ${
                  albumSize === "25x25"
                    ? "h-[273px]"
                    : albumSize === "30x20"
                    ? "h-[189px]"
                    : "h-[239px]"
                } object-cover border border-gray-500`}
                crossOrigin="anonymous"
              />
            ))}
          </div>
        );
      case "2-2":
        return (
          <div
            data-screenshot="true"
            className={`border-2 border-gray-300 grid grid-rows-2 p-1 gap-1 !w-full ${
              albumSize === "25x25"
                ? "h-[284px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            {images.map((src, index) => (
              <img
                onClick={() => handleCropButtonClick(index)}
                key={`img-${index}-${Date.now()}`}
                src={src}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover border border-gray-500"
                crossOrigin="anonymous"
              />
            ))}
          </div>
        );
      case "3-1":
        return (
          <div
            data-screenshot="true"
            className={`border-2 border-gray-300 grid grid-cols-2 p-1 gap-1 !w-full ${
              albumSize === "25x25"
                ? "h-[298px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            <img
              onClick={() => handleCropButtonClick(0)}
              src={images[0]}
              alt="Image 1"
              className={`w-full ${
                albumSize === "25x25"
                  ? "h-[287px]"
                  : albumSize === "30x20"
                  ? "h-[189px]"
                  : "h-[239px]"
              } object-cover border border-gray-500`}
              crossOrigin="anonymous"
            />
            <div className="grid grid-rows-2 gap-1">
              {images.slice(1).map((src, index) => (
                <img
                  onClick={() => handleCropButtonClick(index + 1)}
                  key={`img-${index + 1}-${Date.now()}`}
                  src={src}
                  alt={`Image ${index + 2}`}
                  className={`w-full ${
                    albumSize === "25x25"
                      ? "h-[141px]"
                      : albumSize === "30x20"
                      ? "h-[92px]"
                      : "h-[117px]"
                  } object-cover border border-gray-500`}
                  crossOrigin="anonymous"
                />
              ))}
            </div>
          </div>
        );
      case "3-2":
        return (
          <div
            data-screenshot="true"
            className={`border-2 border-gray-300 grid grid-cols-2 p-1 gap-1 !w-full ${
              albumSize === "25x25"
                ? "h-[298px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            <div className="grid grid-rows-2 gap-1">
              {images.slice(1).map((src, index) => (
                <img
                  onClick={() => handleCropButtonClick(index + 1)}
                  key={`img-${index + 1}-${Date.now()}`}
                  src={src}
                  alt={`Image ${index + 2}`}
                  className={`w-full ${
                    albumSize === "25x25"
                      ? "h-[141px]"
                      : albumSize === "30x20"
                      ? "h-[92px]"
                      : "h-[117px]"
                  } object-cover border border-gray-500`}
                  crossOrigin="anonymous"
                />
              ))}
            </div>
            <img
              onClick={() => handleCropButtonClick(0)}
              src={images[0]}
              alt="Image 1"
              className={`w-full ${
                albumSize === "25x25"
                  ? "h-[287px]"
                  : albumSize === "30x20"
                  ? "h-[189px]"
                  : "h-[238px]"
              } object-cover border border-gray-500`}
              crossOrigin="anonymous"
            />
          </div>
        );
      case "4-1":
        return (
          <div
            data-screenshot="true"
            className={`border-2 border-gray-300 grid grid-cols-2 grid-rows-2 p-1 gap-1 !w-full ${
              albumSize === "25x25"
                ? "h-[284px]"
                : albumSize === "30x20"
                ? "h-[200px]"
                : "h-[250px]"
            }`}
          >
            {images.map((src, index) => (
              <img
                onClick={() => handleCropButtonClick(index)}
                key={`img-${index}-${Date.now()}`}
                src={src}
                alt={`Image ${index + 1}`}
                className={`w-full ${
                  albumSize === "25x25"
                    ? "h-[134px]"
                    : albumSize === "30x20"
                    ? "h-[92px]"
                    : "h-[117px]"
                } object-cover border border-gray-500`}
                crossOrigin="anonymous"
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderImageGridManage = () => {
    const imageHeight2 =
      albumSize === "25x25"
        ? selectedLayout === "2-1"
          ? "h-[246px]"
          : "h-[130px]"
        : albumSize === "30x20"
        ? selectedLayout === "2-1"
          ? "h-[166px]"
          : "h-[75px]"
        : selectedLayout === "2-1"
        ? "h-[194px]"
        : "h-[108px]";

    const imageHeight3 =
      albumSize === "25x25"
        ? "h-[120px]"
        : albumSize === "30x20"
        ? "h-[79px]"
        : "h-[85px]";
    const imageHeight4 =
      albumSize === "25x25"
        ? "h-[120px]"
        : albumSize === "30x20"
        ? "h-[77px]"
        : "h-[85px]";

    return (
      <DndProvider backend={MultiBackend} options={DND_BACKEND}>
        <div className="w-full">
          {selectedLayout === "2-1" && (
            <div
              className={`border-2 border-gray-300 grid grid-cols-2 p-1 gap-2 !w-full rounded ${
                albumSize === "25x25"
                  ? "h-[275px]"
                  : albumSize === "30x20"
                  ? "h-[195px]"
                  : "h-[222px]"
              }`}
            >
              {localFiles.map((file, index) => (
                <div key={`${index}-${Date.now()}`} className="relative">
                  <Div
                    src={URL.createObjectURL(file)}
                    title={`Image ${index + 1}`}
                    id={`${index}-${Date.now()}`}
                    index={index}
                    moveImage={moveImage}
                    albumSize={albumSize || "25x25"}
                    imageHeight={imageHeight2}
                  />
                  {/* <button
                    onClick={() => handleCropButtonClick(index)}
                    className="absolute -bottom-2 -left-1.5 bg-green-100 text-white p-1 rounded-full"
                  >
                    <Crop size={15} color="black" />
                  </button> */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-1.5 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {selectedLayout === "2-2" && (
            <div
              className={`border-2 border-gray-300 grid grid-rows-2 p-1 gap-2 !w-full rounded ${
                albumSize === "25x25"
                  ? "h-[300px]"
                  : albumSize === "30x20"
                  ? "h-[190px]"
                  : "h-[250px]"
              }`}
            >
              {localFiles.map((file, index) => (
                <div key={`${index}-${Date.now()}`} className="relative">
                  <Div
                    src={URL.createObjectURL(file)}
                    title={`Image ${index + 1}`}
                    id={`${index}-${Date.now()}`}
                    index={index}
                    moveImage={moveImage}
                    albumSize={albumSize || "25x25"}
                    imageHeight={imageHeight2}
                  />
                  {/* <button
                    onClick={() => handleCropButtonClick(index)}
                    className="absolute -bottom-2 -left-1.5 bg-green-100 text-white p-1 rounded-full"
                  >
                    <Crop size={15} color="black" />
                  </button> */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-1.5 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {selectedLayout === "3-1" && (
            <div
              className={`border-2 border-gray-300 grid grid-cols-2 p-1 gap-2 !w-full rounded ${
                albumSize === "25x25"
                  ? "h-[276px]"
                  : albumSize === "30x20"
                  ? "h-[193px]"
                  : "h-[208px]"
              }`}
            >
              <div className="relative">
                <Div
                  src={URL.createObjectURL(localFiles[0])}
                  title="Image 1"
                  id={`0-${Date.now()}`}
                  index={0}
                  moveImage={moveImage}
                  albumSize={albumSize || "25x25"}
                  imageHeight={
                    albumSize === "25x25"
                      ? "h-[248px]"
                      : albumSize === "30x20"
                      ? "h-[165px]"
                      : "h-[180px]"
                  }
                />
                {/* <button
                  onClick={() => handleCropButtonClick(0)}
                  className="absolute -bottom-2 -left-2 bg-green-100 text-white p-1 rounded-full"
                >
                  <Crop size={15} color="black" />
                </button> */}
                <button
                  onClick={() => handleRemoveImage(0)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-rows-2 gap-2">
                {localFiles.slice(1).map((file, idx) => (
                  <div key={`${idx + 1}-${Date.now()}`} className="relative">
                    <Div
                      src={URL.createObjectURL(file)}
                      title={`Image ${idx + 2}`}
                      id={`${idx + 1}-${Date.now()}`}
                      index={idx + 1}
                      moveImage={moveImage}
                      albumSize={albumSize || "25x25"}
                      imageHeight={imageHeight3}
                    />
                    {/* <button
                      onClick={() => handleCropButtonClick(idx + 1)}
                      className="absolute -bottom-2 -left-2 bg-green-100 text-white p-1 rounded-full"
                    >
                      <Crop size={15} color="black" />
                    </button> */}
                    <button
                      onClick={() => handleRemoveImage(idx + 1)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedLayout === "3-2" && (
            <div
              className={`border-2 border-gray-300 grid grid-cols-2 p-1 gap-2 !w-full rounded ${
                albumSize === "25x25"
                  ? "h-[276px]"
                  : albumSize === "30x20"
                  ? "h-[193px]"
                  : "h-[208px]"
              }`}
            >
              <div className="grid grid-rows-2 gap-2">
                {localFiles.slice(1).map((file, idx) => (
                  <div key={`${idx + 1}-${Date.now()}`} className="relative">
                    <Div
                      src={URL.createObjectURL(file)}
                      title={`Image ${idx + 2}`}
                      id={`${idx + 1}-${Date.now()}`}
                      index={idx + 1}
                      moveImage={moveImage}
                      albumSize={albumSize || "25x25"}
                      imageHeight={imageHeight3}
                    />
                    {/* <button
                      onClick={() => handleCropButtonClick(idx + 1)}
                      className="absolute -bottom-2 -left-2 bg-green-100 text-white p-1 rounded-full"
                    >
                      <Crop size={15} color="black" />
                    </button> */}
                    <button
                      onClick={() => handleRemoveImage(idx + 1)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <Div
                  src={URL.createObjectURL(localFiles[0])}
                  title="Image 1"
                  id={`0-${Date.now()}`}
                  index={0}
                  moveImage={moveImage}
                  albumSize={albumSize || "25x25"}
                  imageHeight={
                    albumSize === "25x25"
                      ? "h-[248px]"
                      : albumSize === "30x20"
                      ? "h-[165px]"
                      : "h-[180px]"
                  }
                />
                {/* <button
                  onClick={() => handleCropButtonClick(0)}
                  className="absolute -bottom-2 -left-2 bg-green-100 text-white p-1 rounded-full"
                >
                  <Crop size={15} color="black" />
                </button> */}
                <button
                  onClick={() => handleRemoveImage(0)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}
          {selectedLayout === "4-1" && (
            <div
              className={`border-2 border-gray-300 grid grid-cols-2 grid-rows-2 p-1 gap-2 !w-full rounded ${
                albumSize === "25x25"
                  ? "h-[276px]"
                  : albumSize === "30x20"
                  ? "h-[193px]"
                  : "h-[208px]"
              }`}
            >
              {localFiles.map((file, index) => (
                <div key={`${index}-${Date.now()}`} className="relative">
                  <Div
                    src={URL.createObjectURL(file)}
                    title={`Image ${index + 1}`}
                    id={`${index}-${Date.now()}`}
                    index={index}
                    moveImage={moveImage}
                    albumSize={albumSize || "25x25"}
                    imageHeight={imageHeight4}
                  />
                  {/* <button
                    onClick={() => handleCropButtonClick(index)}
                    className="absolute -bottom-2 -left-2 bg-green-100 text-white p-1 rounded-full"
                  >
                    <Crop size={15} color="black" />
                  </button> */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DndProvider>
    );
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropSave = useCallback(async () => {
    if (!croppedAreaPixels || cropImageIndex === null) return;

    const image = new window.Image();
    image.src = URL.createObjectURL(localFiles[cropImageIndex]);
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
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

    const croppedUrl = canvas.toDataURL("image/jpeg");
    const croppedBlob = dataURLtoBlob(croppedUrl);
    const croppedFile = new File(
      [croppedBlob],
      `cropped-image-${cropImageIndex}.jpg`,
      { type: "image/jpeg" }
    );

    setLocalFiles((prev) => {
      const updated = [...prev];
      updated[cropImageIndex] = croppedFile;
      return updated;
    });
    setLocalPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[cropImageIndex]);
      updated[cropImageIndex] = croppedUrl;
      return updated;
    });

    onImageChange(pageIndex, null, undefined, cropImageIndex, croppedFile);
    setCropImageIndex(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsMainDialogOpen(false);

    toast({
      title: "Thành công",
      description: "Ảnh đã được cắt thành công.",
      className: "bg-green-500 text-white border-green-600",
    });
  }, [croppedAreaPixels, cropImageIndex, localFiles, onImageChange, pageIndex]);

  const handleLayoutChange = useCallback((layoutId: string) => {
    setSelectedLayout(layoutId);
    setIsMainDialogOpen(false);
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
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

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

  // const renderLayoutPreview = (option: {
  //   id: string;
  //   cols: number;
  //   rows: number;
  // }) => {
  //   switch (option.id) {
  //     case "2-1":
  //       return (
  //         <div
  //           className={`grid grid-cols-2 gap-1 w-full ${albumSize === "25x25"
  //             ? "h-[200px]"
  //             : albumSize === "30x20"
  //               ? "h-[150px]"
  //               : "h-[167px]"
  //             } border border-gray-300 rounded p-1`}
  //         >
  //           <div className="bg-gray-300 rounded"></div>
  //           <div className="bg-gray-300 rounded"></div>
  //         </div>
  //       );
  //     case "2-2":
  //       return (
  //         <div
  //           className={`grid grid-rows-2 gap-1 w-full ${albumSize === "25x25"
  //             ? "h-[200px]"
  //             : albumSize === "30x20"
  //               ? "h-[150px]"
  //               : "h-[167px]"
  //             } border border-gray-300 rounded p-1`}
  //         >
  //           <div className="bg-gray-300 rounded"></div>
  //           <div className="bg-gray-300 rounded"></div>
  //         </div>
  //       );
  //     case "3-1":
  //       return (
  //         <div
  //           className={`grid grid-cols-2 gap-1 w-full ${albumSize === "25x25"
  //             ? "h-[200px]"
  //             : albumSize === "30x20"
  //               ? "h-[150px]"
  //               : "h-[167px]"
  //             } border border-gray-300 rounded p-1`}
  //         >
  //           <div className="bg-gray-300 rounded grid grid-rows-2"></div>
  //           <div className="grid grid-rows-2 gap-1">
  //             <div className="bg-gray-300 rounded"></div>
  //             <div className="bg-gray-300 rounded"></div>
  //           </div>
  //         </div>
  //       );
  //     case "3-2":
  //       return (
  //         <div
  //           className={`grid grid-cols-2 gap-1 w-full ${albumSize === "25x25"
  //             ? "h-[200px]"
  //             : albumSize === "30x20"
  //               ? "h-[150px]"
  //               : "h-[167px]"
  //             } border border-gray-300 rounded p-1`}
  //         >
  //           <div className="grid grid-rows-2 gap-1">
  //             <div className="bg-gray-300 rounded"></div>
  //             <div className="bg-gray-300 rounded"></div>
  //           </div>
  //           <div className="bg-gray-300 rounded grid grid-rows-2"></div>
  //         </div>
  //       );
  //     case "4-1":
  //       return (
  //         <div
  //           className={`grid grid-cols-2 grid-rows-2 gap-1 w-full ${albumSize === "25x25"
  //             ? "h-[200px]"
  //             : albumSize === "30x20"
  //               ? "h-[150px]"
  //               : "h-[167px]"
  //             } border border-gray-300 rounded p-1`}
  //         >
  //           <div className="bg-gray-300 rounded"></div>
  //           <div className="bg-gray-300 rounded"></div>
  //           <div className="bg-gray-300 rounded"></div>
  //           <div className="bg-gray-300 rounded"></div>
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
    const images = localFiles.map((file) => URL.createObjectURL(file));

    // Define heights for different layouts and album sizes
    const getPreviewHeightFor3 = (layoutId: string, index: number) => {
      switch (albumSize) {
        case "25x25":
          return layoutId === "3-1" && index === 0
            ? "h-[197px]"
            : layoutId === "3-2" && index === 0
            ? "h-[197px]"
            : "h-[96px]"; // Adjusted for smaller preview grid
        case "30x20":
          return layoutId === "3-1" && index === 0
            ? "h-[140px]"
            : layoutId === "3-2" && index === 0
            ? "h-[140px]"
            : "h-[68px]";
        case "35x25":
          return layoutId === "3-1" && index === 0
            ? "h-[157px]"
            : layoutId === "3-2" && index === 0
            ? "h-[157px]"
            : "h-[76.5px]";
        default:
          return "h-[96px]";
      }
    };

    const getPreviewHeightFor2 = () => {
      switch (albumSize) {
        case "25x25":
          return "h-[200px]";
        case "30x20":
          return "h-[150px]";
        case "35x25":
          return "h-[167px]";
        default:
          return "h-[200px]";
      }
    };

    switch (option.id) {
      case "2-1":
        return (
          <div
            className={`grid grid-cols-2 gap-1 w-full ${getPreviewHeightFor2()} border border-gray-300 p-1`}
          >
            {images.slice(0, 2).map((src, index) => (
              <img
                key={`preview-2-1-${index}`}
                src={src}
                alt={`Preview ${index + 1}`}
                className={`w-full ${
                  albumSize === "25x25"
                    ? "h-[191px]"
                    : albumSize === "30x20"
                    ? "h-[140px]"
                    : "h-[157px]"
                } object-cover border border-gray-500`}
                crossOrigin="anonymous"
              />
            ))}
          </div>
        );
      case "2-2":
        return (
          <div
            className={`grid grid-rows-2 gap-1 w-full ${getPreviewHeightFor2()} border border-gray-300 p-1`}
          >
            {images.slice(0, 2).map((src, index) => (
              <img
                key={`preview-2-2-${index}`}
                src={src}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover border border-gray-500"
                crossOrigin="anonymous"
              />
            ))}
          </div>
        );
      case "3-1":
        return (
          <div
            className={`grid grid-cols-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[208px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 p-1`}
          >
            <img
              src={images[0]}
              alt="Preview 1"
              className={`w-full ${getPreviewHeightFor3(
                "3-1",
                0
              )} object-cover border border-gray-500`}
              crossOrigin="anonymous"
            />
            <div className="grid grid-rows-2 gap-1">
              {images.slice(1, 3).map((src, index) => (
                <img
                  key={`preview-3-1-${index + 1}`}
                  src={src}
                  alt={`Preview ${index + 2}`}
                  className={`w-full ${getPreviewHeightFor3(
                    "3-1",
                    index + 1
                  )} object-cover border border-gray-500`}
                  crossOrigin="anonymous"
                />
              ))}
            </div>
          </div>
        );
      case "3-2":
        return (
          <div
            className={`grid grid-cols-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[208px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 p-1`}
          >
            <div className="grid grid-rows-2 gap-1">
              {images.slice(1, 3).map((src, index) => (
                <img
                  key={`preview-3-2-${index + 1}`}
                  src={src}
                  alt={`Preview ${index + 2}`}
                  className={`w-full ${getPreviewHeightFor3(
                    "3-2",
                    index + 1
                  )} object-cover border border-gray-500`}
                  crossOrigin="anonymous"
                />
              ))}
            </div>
            <img
              src={images[0]}
              alt="Preview 1"
              className={`w-full ${getPreviewHeightFor3(
                "3-2",
                0
              )} object-cover border border-gray-500`}
              crossOrigin="anonymous"
            />
          </div>
        );
      case "4-1":
        return (
          <div
            className={`grid grid-cols-2 grid-rows-2 gap-1 w-full ${
              albumSize === "25x25"
                ? "h-[206px]"
                : albumSize === "30x20"
                ? "h-[150px]"
                : "h-[167px]"
            } border border-gray-300 p-1`}
          >
            {images.slice(0, 4).map((src, index) => (
              <img
                key={`preview-4-1-${index}`}
                src={src}
                alt={`Preview ${index + 1}`}
                className={`w-full ${
                  albumSize === "25x25"
                    ? "h-[96px]"
                    : albumSize === "30x20"
                    ? "h-[68px]"
                    : "h-[77px]"
                } object-cover border border-gray-500`}
                crossOrigin="anonymous"
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
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
          {localFiles.length > 0 && (
            <>
              <Dialog
                open={isMainDialogOpen}
                onOpenChange={setIsMainDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="absolute -top-10 right-0 flex flex-row justify-center items-center gap-2 py-2 rounded-full z-20 font-medium text-[#645bff]">
                    <PenLine className="w-4 h-4 cursor-pointer" />
                    <div>Bố cục</div>
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
                            Chọn layout cho {localFiles.length} ảnh
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pt-3 px-0">
                          {layoutOptions[
                            localFiles.length as keyof typeof layoutOptions
                          ]?.map((option) => (
                            <div
                              key={option.id}
                              className={`p-2 mb-2 rounded-lg cursor-pointer ${
                                selectedLayout === option.id
                                  ? "bg-[#f3f2f8] border-2 border-[#645bff]"
                                  : "hover:bg-gray-100 border border-gray-100"
                              }`}
                              onClick={() => handleLayoutChange(option.id)}
                            >
                              {renderLayoutPreview(option)}
                              {/* <div className="mt-1 text-center text-sm font-medium">
                                {option.name}
                              </div> */}
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
                            Kéo thả hình ảnh để thay đổi vị trí.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pt-3 px-2">
                          {renderImageGridManage()}
                        </div>
                        <DialogFooter className="px-2">
                          {isReordered && (
                            <Button
                              variant="secondary"
                              className="!px-10 !text-[16px] mt-3 border-2 border-[#645bff] text-[#645bff] bg-white hover:bg-[#f3f2f8] hover:text-white"
                              onClick={handleSaveReorderedImages}
                              disabled={!isReordered}
                            >
                              Lưu vị trí hình ảnh
                            </Button>
                          )}
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
                  <DialogContent className="max-w-[90vw] max-h-[95vh] rounded-lg">
                    <DialogHeader>
                      <DialogTitle>Cắt ảnh</DialogTitle>
                      <DialogDescription>
                        Điều chỉnh vùng cắt cho ảnh
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full h-[60vh]">
                      <Cropper
                        image={URL.createObjectURL(localFiles[cropImageIndex])}
                        crop={crop}
                        zoom={zoom}
                        aspect={getAspectRatio(selectedLayout, cropImageIndex)}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>
                    <DialogFooter className="flex flex-col gap-3">
                      <Button
                        className="bg-indigo-600"
                        onClick={handleCropSave}
                      >
                        Lưu
                      </Button>
                      <DialogClose asChild>
                        <Button
                          variant="secondary"
                          onClick={() => setCropImageIndex(null)}
                        >
                          Hủy
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              <div className={cn("relative w-full overflow-hidden bg-white")}>
                {renderImageGrid()}
              </div>
            </>
          )}
          {localFiles.length === 0 && (
            <div
              onClick={handleClick}
              className={`flex ${
                albumSize === "25x25"
                  ? "h-[300px]"
                  : albumSize === "30x20"
                  ? "h-[200px]"
                  : "h-[250px]"
              } w-full items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-white px-5 py-3 mt-0 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer`}
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
    </div>
  );
};

export default ImageUploadMobileAlbum;
