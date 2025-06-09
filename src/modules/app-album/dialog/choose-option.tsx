import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ChooseOptionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (size: string, pages: number) => void;
}

export function ChooseOption({ isOpen, setIsOpen, onSave }: ChooseOptionProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedPages, setSelectedPages] = useState<number>();

  const sizes = ["25x25", "30x20", "35x25"];
  // const pageOptions = [10, 15, 20];
  const pageOptions = [1, 2, 3];

  const validateForm = () => {
    if (!selectedPages) {
      toast({
        title: "",
        description: "Vui lòng chọn kích thước cho Album!",
        variant: "destructive",
      });
      return false;
    }
    if (!selectedSize) {
      toast({
        title: "",
        description: "Vui lòng chọn số trang cho Album!",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave(selectedSize, selectedPages!);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="max-w-[350px] rounded-lg"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Tùy chọn Album</DialogTitle>
          <DialogDescription>
            Tuỳ chọn kích thước và số trang cho Album của bạn
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="relative">
            <div className="font-medium mb-2 relative">
              Kích thước:
              {/* <div className="absolute w-[28%] h-[1px] bg-black"></div> */}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedSize(size)}
                className={`relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium rounded-lg group focus:outline-none`}
              >
                <span
                  className={`w-full relative px-5 py-2.5 rounded-md ${
                    selectedSize === size
                      ? "border-2 border-[#645bff] text-[#645bff]"
                      : "bg-white text-gray-400 border-2 border-gray-300 "
                  }`}
                >
                  {size}
                </span>
              </button>
            ))}
          </div>
          {/* <div className="font-medium mb-2 mt-2.5 relative">
            Tổng số trang:
            <div className="absolute w-[36%] h-[1px] bg-black"></div>
          </div> */}
          <div className="relative">
            <div className="font-medium mb-2 relative">
              Tổng số trang:
              {/* <div className="absolute w-[28%] h-[1px] bg-black"></div> */}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pageOptions.map((pages: number, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedPages(pages)}
                className={`relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium rounded-lg group`}
              >
                <span
                  className={`w-full relative px-2 py-2.5 rounded-md ${
                    selectedPages === pages
                      ? "border-2 border-[#645bff] text-[#645bff]"
                      : "bg-white text-gray-400 border-2 border-gray-300 "
                  }`}
                >
                  {pages} trang
                </span>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="bg-gray-200 text-black hover:bg-gray-300 hover:opacity-80 mt-2"
            onClick={() => router.push("/")}
          >
            Trở về
          </Button>
          <Button
            type="submit"
            className="bg-[#645bff] text-white hover:bg-[#4b47ff]"
            onClick={() => handleSave()}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
