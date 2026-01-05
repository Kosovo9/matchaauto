'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    maxImages?: number;
    onImagesChange: (urls: string[]) => void;
    existingImages?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    maxImages = 10,
    onImagesChange,
    existingImages = [],
}) => {
    const [images, setImages] = useState<string[]>(existingImages);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (images.length + files.length > maxImages) {
            setError(`Máximo ${maxImages} imágenes permitidas`);
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // PROCESO NASA: Subida a Cloudflare R2 vía Backend
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Fallo en la subida');
                const data = await response.json();
                return data.url;
            });

            const newUrls = await Promise.all(uploadPromises);
            const updatedImages = [...images, ...newUrls];
            setImages(updatedImages);
            onImagesChange(updatedImages);
        } catch (err) {
            setError('Error al subir las imágenes. Inténtalo de nuevo.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Fotos del Vehículo ({images.length}/{maxImages})</label>
                {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {error}</span>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((url, index) => (
                    <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-gray-800 group">
                        <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <label className={cn(
                        "aspect-square rounded-xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center cursor-pointer hover:border-nasa-blue hover:bg-nasa-blue/5 transition-all",
                        isUploading && "pointer-events-none opacity-50"
                    )}>
                        {isUploading ? (
                            <Loader2 className="animate-spin text-nasa-blue" size={32} />
                        ) : (
                            <>
                                <Upload className="text-gray-500 mb-2" size={32} />
                                <span className="text-xs text-gray-500 font-medium">Subir Foto</span>
                            </>
                        )}
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </label>
                )}
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Tecnología de Optimización de Imágenes Sentinel X Activa</p>
        </div>
    );
};
