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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh (jpg, png, v.v.)!",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
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
        "flex justify-center lg:!justify-start lg:items-start h-full",
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
        <div className="flex justify-center !w-full">
          <div
            onClick={handleClick}
            className="cursor-pointer border-2 border-dashed border-gray-600 p-4 flex flex-col items-center justify-center !w-full lg:!w-80 mb-0 rounded-lg"
            // style={{ height: deviceHeight }}
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
        <div className="relative group w-full">
          <div
            className={cn("relative w-full overflow-hidden rounded-xl")}
            style={{ height: deviceHeight }}
          >
            {/* <div className={`relative !w-full`} /> */}
            <Image
              style={{ height: deviceHeight }}
              src={newImage}
              alt="Preview"
              width={1000}
              height={1000}
              priority
              className="w-full object-cover object-top border-2 border-[#645bff] rounded-xl"
            />
          </div>
          {/* <div
            onClick={handleClick}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-3 mt-5 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500">Thay đổi hình ảnh</span>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default ImageUploadMobile;
