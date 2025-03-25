// "use client";

// import React, { useEffect, useState } from "react";
// import { ChooseOption } from "../../modules/app-album/dialog/choose-option";
// import ImageUploadMobileAlbum from "../../modules/app-album/components/image-upload-mobile-album";
// import { UploadService } from "@/services/upload";
// import ImageProcessing from "../../modules/app-frame/components/image-processing";
// import Image from "next/image";
// import { IMAGES } from "@/utils/image";
// import Link from "next/link";
// import { ChevronLeft, RefreshCcw } from "lucide-react";

// export default function AppAlbumClient() {
//   const [isOpen, setIsOpen] = useState(true);
//   const [albumConfig, setAlbumConfig] = useState({
//     size: "",
//     pages: 0,
//   });

//   const [pageImages, setPageImages] = useState<{ [key: number]: string[] }>({});
//   const [previewImages, setPreviewImages] = useState<{
//     [key: number]: string[];
//   }>({});
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const MAX_FILE_SIZE = 5 * 1024 * 1024;
//   const MIN_IMAGES = 2;
//   const MAX_IMAGES = 4;

//   const handleSaveConfig = (size: string, pages: number) => {
//     setAlbumConfig({ size, pages });
//   };

//   const validateFiles = (files: File[], currentImages: string[]): boolean => {
//     const totalImages = currentImages.length + files.length;
//     if (totalImages > MAX_IMAGES) {
//       setError(
//         `Total images cannot exceed ${MAX_IMAGES}. Currently ${currentImages.length} images, trying to add ${files.length}.`
//       );
//       return false;
//     }
//     if (currentImages.length === 0 && files.length < MIN_IMAGES) {
//       setError(
//         `Please upload at least ${MIN_IMAGES} images when the album is empty.`
//       );
//       return false;
//     }
//     const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
//     if (oversizedFiles.length > 0) {
//       setError("All images must be less than 5MB.");
//       return false;
//     }
//     const nonImageFiles = files.filter(
//       (file) => !file.type.startsWith("image/")
//     );
//     if (nonImageFiles.length > 0) {
//       setError("Please upload only image files.");
//       return false;
//     }
//     return true;
//   };

//   // const handleImageUpload = async (
//   //   pageIndex: number,
//   //   files: FileList | null,
//   //   removedIndex?: number,
//   //   croppedIndex?: number,
//   //   croppedFile?: File
//   // ) => {
//   //   if (files && removedIndex === undefined && croppedIndex === undefined) {
//   //     // Existing code for adding new images...
//   //     const fileArray = Array.from(files);
//   //     const currentImages = pageImages[pageIndex] || [];

//   //     if (!validateFiles(fileArray, currentImages)) return;

//   //     const newPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));
//   //     setPreviewImages((prev) => ({
//   //       ...prev,
//   //       [pageIndex]: [...(prev[pageIndex] || []), ...newPreviewUrls],
//   //     }));

//   //     try {
//   //       setLoading(true);
//   //       const uploadResults = await UploadService.uploadToCloudinary(fileArray);
//   //       if (uploadResults === false) {
//   //         throw new Error("Upload failed");
//   //       }

//   //       const secureUrls = uploadResults.map(
//   //         (result: any) => result.secure_url
//   //       );

//   //       setPageImages((prev) => ({
//   //         ...prev,
//   //         [pageIndex]: [...(prev[pageIndex] || []), ...secureUrls],
//   //       }));

//   //       setPreviewImages((prev) => {
//   //         const existingPreviews = (prev[pageIndex] || []).filter(
//   //           (url) => !newPreviewUrls.includes(url)
//   //         );
//   //         existingPreviews.forEach((url) => URL.revokeObjectURL(url));
//   //         return {
//   //           ...prev,
//   //           [pageIndex]: [...(pageImages[pageIndex] || []), ...secureUrls],
//   //         };
//   //       });

//   //       setLoading(false);
//   //       setError(null);
//   //     } catch (error) {
//   //       setError("Failed to upload images to Cloudinary");
//   //       console.error(error);
//   //       setLoading(false);
//   //       setPreviewImages((prev) => ({
//   //         ...prev,
//   //         [pageIndex]: pageImages[pageIndex] || [],
//   //       }));
//   //     }
//   //   } else if (removedIndex !== undefined) {
//   //     // Existing code for removing images...
//   //     setPageImages((prev) => {
//   //       const currentImages = prev[pageIndex] || [];
//   //       const updatedImages = currentImages.filter(
//   //         (_, idx) => idx !== removedIndex
//   //       );
//   //       return { ...prev, [pageIndex]: updatedImages };
//   //     });
//   //     setPreviewImages((prev) => {
//   //       const currentPreviews = prev[pageIndex] || [];
//   //       const updatedPreviews = currentPreviews.filter(
//   //         (_, idx) => idx !== removedIndex
//   //       );
//   //       updatedPreviews.forEach((url) => {
//   //         if (url.startsWith("blob:")) URL.revokeObjectURL(url);
//   //       });
//   //       return { ...prev, [pageIndex]: updatedPreviews };
//   //     });
//   //   } else if (croppedIndex !== undefined && croppedFile) {
//   //     try {
//   //       setLoading(true);
//   //       const uploadResult = await UploadService.uploadToCloudinary([
//   //         croppedFile,
//   //       ]);
//   //       if (uploadResult === false) {
//   //         throw new Error("Upload failed");
//   //       }

//   //       const secureUrl = uploadResult[0].secure_url;

//   //       setPageImages((prev) => {
//   //         const currentImages = prev[pageIndex] || [];
//   //         const updatedImages = [...currentImages];
//   //         updatedImages[croppedIndex] = secureUrl;
//   //         return { ...prev, [pageIndex]: updatedImages };
//   //       });

//   //       setPreviewImages((prev) => {
//   //         const currentPreviews = prev[pageIndex] || [];
//   //         const updatedPreviews = [...currentPreviews];
//   //         // Revoke old blob URL if it exists
//   //         if (
//   //           updatedPreviews[croppedIndex] &&
//   //           updatedPreviews[croppedIndex].startsWith("blob:")
//   //         ) {
//   //           URL.revokeObjectURL(updatedPreviews[croppedIndex]);
//   //         }
//   //         updatedPreviews[croppedIndex] = secureUrl;
//   //         return { ...prev, [pageIndex]: updatedPreviews };
//   //       });

//   //       setLoading(false);
//   //       setError(null);
//   //     } catch (error) {
//   //       setError("Failed to upload cropped image to Cloudinary");
//   //       console.error(error);
//   //       setLoading(false);
//   //     }
//   //   }
//   // };

//   const handleImageUpload = async (
//     pageIndex: number,
//     files: FileList | null,
//     removedIndex?: number,
//     croppedIndex?: number,
//     croppedFile?: File,
//     originalFile?: File,
//     reorderedImages?: string[] // Added to handle reordering
//   ) => {
//     if (reorderedImages) {
//       // Handle reordering
//       setPageImages((prev) => ({
//         ...prev,
//         [pageIndex]: reorderedImages,
//       }));
//       setPreviewImages((prev) => ({
//         ...prev,
//         [pageIndex]: reorderedImages,
//       }));
//     } else if (
//       files &&
//       removedIndex === undefined &&
//       croppedIndex === undefined
//     ) {
//       // Existing code for adding new images...
//       const fileArray = Array.from(files);
//       const currentImages = pageImages[pageIndex] || [];

//       if (!validateFiles(fileArray, currentImages)) return;

//       const newPreviewUrls = fileArray.map((file) => URL.createObjectURL(file));
//       setPreviewImages((prev) => ({
//         ...prev,
//         [pageIndex]: [...(prev[pageIndex] || []), ...newPreviewUrls],
//       }));

//       try {
//         setLoading(true);
//         const uploadResults = await UploadService.uploadToCloudinary(fileArray);
//         if (uploadResults === false) {
//           throw new Error("Upload failed");
//         }

//         const secureUrls = uploadResults.map(
//           (result: any) => result.secure_url
//         );

//         setPageImages((prev) => ({
//           ...prev,
//           [pageIndex]: [...(prev[pageIndex] || []), ...secureUrls],
//         }));

//         setPreviewImages((prev) => {
//           const existingPreviews = (prev[pageIndex] || []).filter(
//             (url) => !newPreviewUrls.includes(url)
//           );
//           existingPreviews.forEach((url) => URL.revokeObjectURL(url));
//           return {
//             ...prev,
//             [pageIndex]: [...(pageImages[pageIndex] || []), ...secureUrls],
//           };
//         });

//         setLoading(false);
//         setError(null);
//       } catch (error) {
//         setError("Failed to upload images to Cloudinary");
//         console.error(error);
//         setLoading(false);
//         setPreviewImages((prev) => ({
//           ...prev,
//           [pageIndex]: pageImages[pageIndex] || [],
//         }));
//       }
//     } else if (removedIndex !== undefined) {
//       // Existing code for removing images...
//       setPageImages((prev) => {
//         const currentImages = prev[pageIndex] || [];
//         const updatedImages = currentImages.filter(
//           (_, idx) => idx !== removedIndex
//         );
//         return { ...prev, [pageIndex]: updatedImages };
//       });
//       setPreviewImages((prev) => {
//         const currentPreviews = prev[pageIndex] || [];
//         const updatedPreviews = currentPreviews.filter(
//           (_, idx) => idx !== removedIndex
//         );
//         updatedPreviews.forEach((url) => {
//           if (url.startsWith("blob:")) URL.revokeObjectURL(url);
//         });
//         return { ...prev, [pageIndex]: updatedPreviews };
//       });
//     } else if (croppedIndex !== undefined && croppedFile) {
//       // Existing code for cropping images...
//       try {
//         setLoading(true);
//         const uploadResult = await UploadService.uploadToCloudinary([
//           croppedFile,
//         ]);
//         if (uploadResult === false) {
//           throw new Error("Upload failed");
//         }

//         const secureUrl = uploadResult[0].secure_url;

//         setPageImages((prev) => {
//           const currentImages = prev[pageIndex] || [];
//           const updatedImages = [...currentImages];
//           updatedImages[croppedIndex] = secureUrl;
//           return { ...prev, [pageIndex]: updatedImages };
//         });

//         setPreviewImages((prev) => {
//           const currentPreviews = prev[pageIndex] || [];
//           const updatedPreviews = [...currentPreviews];
//           if (
//             updatedPreviews[croppedIndex] &&
//             updatedPreviews[croppedIndex].startsWith("blob:")
//           ) {
//             URL.revokeObjectURL(updatedPreviews[croppedIndex]);
//           }
//           updatedPreviews[croppedIndex] = secureUrl;
//           return { ...prev, [pageIndex]: updatedPreviews };
//         });

//         setLoading(false);
//         setError(null);
//       } catch (error) {
//         setError("Failed to upload cropped image to Cloudinary");
//         console.error(error);
//         setLoading(false);
//       }
//     }
//   };

//   const handleRefresh = () => {
//     window.location.reload();
//   };

//   useEffect(() => {
//     return () => {
//       Object.values(previewImages).forEach((page) =>
//         page.forEach((url) => URL.revokeObjectURL(url))
//       );
//     };
//   }, [previewImages]);

//   return (
//     <div className="relative w-full flex flex-col justify-center items-center">
//       {!isOpen ? (
//         <Image
//           src={IMAGES.BACKGROUND_MOBILE}
//           alt=""
//           fill
//           priority
//           objectFit="cover"
//           className="opacity-50 z-0 h-[100vh]"
//         />
//       ) : (
//         <Image
//           src={IMAGES.BACKGROUND_MOBILE}
//           alt=""
//           width={1000}
//           height={1000}
//           objectFit="cover"
//           className="opacity-50 z-0 h-[100vh]"
//         />
//       )}
//       <ChooseOption
//         isOpen={isOpen}
//         setIsOpen={setIsOpen}
//         onSave={handleSaveConfig}
//       />
//       {loading && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white px-7 py-8 rounded-lg flex flex-col items-center gap-6">
//             <ImageProcessing />
//             <div className="text-black font-medium">
//               Hình ảnh đang được xử lí...
//             </div>
//           </div>
//         </div>
//       )}
//       <div className="w-full h-full flex flex-col z-10">
//         <header className="w-full text-white pt-3 p-2 text-center shrink-0">
//           <div className="flex flex-row justify-between items-center">
//             <Link href="/app-home">
//               <ChevronLeft color="black" />
//             </Link>
//             <div className="flex flex-row justify-center items-center gap-3 ml-12">
//               <RefreshCcw color="black" onClick={handleRefresh} />
//             </div>
//             <div className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl text-white font-medium text-sm px-3 py-2 rounded-lg">
//               Tiếp tục
//             </div>
//           </div>
//         </header>
//         <main className="w-full flex-grow p-4 overflow-auto flex flex-col gap-4">
//           {albumConfig.pages > 0 &&
//             Array.from({ length: albumConfig.pages }).map((_, index) => (
//               <div key={index}>
//                 <div className="mb-2">Trang {index + 1}</div>
//                 <div className="w-full items-center">
//                   <ImageUploadMobileAlbum
//                     onImageChange={(
//                       files,
//                       removedIndex,
//                       croppedIndex,
//                       croppedFile
//                     ) =>
//                       handleImageUpload(
//                         index,
//                         files,
//                         removedIndex,
//                         croppedIndex,
//                         croppedFile
//                       )
//                     }
//                     albumSize={albumConfig.size}
//                     newImages={previewImages[index] || pageImages[index] || []}
//                     pageIndex={index}
//                   />
//                 </div>
//               </div>
//             ))}
//         </main>
//       </div>
//     </div>
//   );
// }
