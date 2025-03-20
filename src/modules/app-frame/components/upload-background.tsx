import React from "react";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface UploadBackgroundProps {
  onBackgroundAdd: (url: string) => void;
  // result: boolean;
}

const UploadBackground = ({
  onBackgroundAdd,
}: // result,
UploadBackgroundProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: "",
        description: "File ảnh quá lớn, vui lòng chọn file dưới 1MB",
        variant: "destructive",
      });
      return;
    }

    // if (!result) {
    //   console.log("result", result);

    //   toast({
    //     title: "",
    //     description: "Vui lòng xóa phông nền trước khi chọn nền mới!",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    onBackgroundAdd(imageUrl);
  };

  const handleClick = () => {
    // if (!result) {
    //   toast({
    //     title: "",
    //     description: "Vui lòng xóa phông nền trước khi chọn nền mới!",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div
        onClick={handleClick}
        className="bg-indigo-50 flex justify-center items-center w-16 h-full object-cover rounded-lg cursor-pointer hover:border-[#645bff] transition-colors"
      >
        <Upload className="w-6 h-6 text-indigo-600" />
      </div>
    </>
  );
};

export default UploadBackground;
