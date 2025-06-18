import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  title?: string;
  newImage?: string;
  className?: string;
}

const ImageUploadMobile = ({
  onImageChange,
  title,
  newImage,
  className,
}: ImageUploadProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [deviceHeight, setDeviceHeight] = React.useState("410px");

  React.useEffect(() => {
    const updateHeight = () => {
      const height = window.innerHeight;
      setDeviceHeight(height < 720 ? "325px" : "410px");
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onImageChange(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh (jpg, png, v.v.)!",
        variant: "destructive",
      });
      return;
    }
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast({
        title: "Lỗi",
        description: "Hình ảnh quá lớn. Vui lòng chọn file dưới 10MB!",
        variant: "destructive",
      });
      return;
    }
    onImageChange(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "w-full flex justify-center lg:!justify-start lg:items-start h-full",
        className
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      {!newImage ? (
        <div className="flex justify-center !w-full !h-full">
          <div
            onClick={handleClick}
            className="cursor-pointer border-2 border-dashed border-gray-600 p-4 flex flex-col items-center justify-center !w-full lg:!w-80 mb-0 rounded-lg"
          >
            <div className="text-gray-700 flex flex-col items-center">
              <div className="flex flex-row justify-center items-center gap-2">
                <Upload size={20} />
                <span>Tải hình ảnh lên</span>
              </div>
              <span className="text-xs mt-1">{title}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group w-full !h-full">
          <div
            className={cn("relative w-full !h-full overflow-hidden rounded-xl")}
            style={{ height: deviceHeight }}
          >
            <Image
              style={{ height: deviceHeight }}
              src={newImage}
              alt="Preview"
              width={1000}
              height={1000}
              priority
              className="w-full object-cover object-top rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadMobile;
