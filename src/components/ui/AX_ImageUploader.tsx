"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";

interface AX_ImageUploaderProps {
    onUploadSuccess: (url: string) => void;
    onUploadError?: (error: string) => void;
    folder?: string;
    defaultImage?: string | null;
    label?: string;
    className?: string;
}

const compressImage = async (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.8): Promise<File> => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return file;
    }

    // Only compress if > 500KB
    if (file.size < 500 * 1024) return file;

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const newFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/webp', quality);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

export function AX_ImageUploader({
    onUploadSuccess,
    onUploadError,
    folder = "/uploads",
    defaultImage,
    label = "ارفع صورة",
    className = "",
}: AX_ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(defaultImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(defaultImage || null);
    }, [defaultImage]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const originalFile = e.target.files?.[0];
        if (!originalFile) return;

        setIsUploading(true);

        try {
            // 1. Compress the image before uploading
            const file = await compressImage(originalFile);

            // Local Preview
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // 2. Get Auth Parameters from our backend
            const authRes = await fetch("/api/imagekit/auth");
            if (!authRes.ok) throw new Error("فشل في المصادقة مع السيرفر");
            const { signature, expire, token } = await authRes.json();

            // 2. Prepare Form Data for ImageKit
            const formData = new FormData();
            formData.append("file", file);
            formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
            formData.append("signature", signature);
            formData.append("expire", expire.toString());
            formData.append("token", token);
            formData.append("fileName", file.name);
            formData.append("folder", folder);

            // 3. Upload to ImageKit
            const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                const errObj = await uploadRes.json();
                throw new Error(errObj.message || "فشل رفع الصورة");
            }

            const data = await uploadRes.json();

            // 4. Success -> give the URL back to the parent
            setPreview(data.url);
            onUploadSuccess(data.url);
        } catch (err: any) {
            console.error("Upload Error:", err);
            if (onUploadError) onUploadError(err.message);
            setPreview(defaultImage || null); // revert on fail
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onUploadSuccess(""); // clear it from parent
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={`relative ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden
          ${isUploading ? "border-amber-500/50 bg-amber-500/10" : "border-gray-600 hover:border-amber-500 hover:bg-black/20"}
          ${preview ? "border-solid border-amber-500/30" : ""}
        `}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        <span className="text-sm text-amber-500/80">جاري الرفع...</span>
                    </div>
                ) : preview ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-medium flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> تغيير الصورة
                            </span>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <UploadCloud className="w-8 h-8 mb-1" />
                        <span className="text-sm font-medium">اضغط لرفع صورة</span>
                        <span className="text-xs text-gray-500">سيتم ضغط الصور الكبيرة تلقائياً</span>
                    </div>
                )}
            </div>
        </div>
    );
}
