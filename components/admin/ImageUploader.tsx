'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface ImageItem {
    url: string;
    alt_text: string;
    display_order: number;
    isUploading?: boolean;
}

interface ImageUploaderProps {
    images: ImageItem[];
    onChange: (images: ImageItem[]) => void;
    maxFiles?: number;
}

export default function ImageUploader({ images, onChange, maxFiles = 10 }: ImageUploaderProps) {
    const t = useTranslations('Admin');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = useCallback(async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                console.error('Upload failed:', data.error);
                return null;
            }

            const data = await res.json();
            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        }
    }, []);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const remaining = maxFiles - images.length;
        const toUpload = fileArray.slice(0, remaining);

        if (toUpload.length === 0) return;

        // Add placeholder items with isUploading
        const nextOrder = images.length > 0
            ? Math.max(...images.map(img => img.display_order)) + 1
            : 1;

        const placeholders: ImageItem[] = toUpload.map((file, i) => ({
            url: URL.createObjectURL(file),
            alt_text: '',
            display_order: nextOrder + i,
            isUploading: true,
        }));

        const updatedImages = [...images, ...placeholders];
        onChange(updatedImages);

        // Upload each file
        const startIndex = images.length;
        const results = await Promise.all(toUpload.map(file => uploadFile(file)));

        const newImages = [...updatedImages];
        results.forEach((url, i) => {
            const idx = startIndex + i;
            if (url) {
                URL.revokeObjectURL(newImages[idx].url);
                newImages[idx] = {
                    ...newImages[idx],
                    url,
                    isUploading: false,
                };
            } else {
                URL.revokeObjectURL(newImages[idx].url);
                newImages[idx] = { ...newImages[idx], url: '', isUploading: false };
            }
        });
        // Filter out failed uploads
        onChange(newImages.filter(img => img.url !== ''));
    }, [images, maxFiles, onChange, uploadFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            // Reset input so the same file can be selected again
            e.target.value = '';
        }
    }, [handleFiles]);

    const handleRemove = useCallback((index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        // Reorder display_order
        const reordered = newImages.map((img, i) => ({
            ...img,
            display_order: i + 1,
        }));
        onChange(reordered);
    }, [images, onChange]);

    const handleAltTextChange = useCallback((index: number, value: string) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], alt_text: value };
        onChange(newImages);
    }, [images, onChange]);

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                }`}
            >
                <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground">
                    {t('dropImages') ?? 'Drag & drop images here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP / Max 5MB
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Image preview grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <div key={`${image.url}-${index}`} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={image.url}
                                    alt={image.alt_text || `Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {image.isUploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            {/* Remove button */}
                            {!image.isUploading && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            {/* Alt text input */}
                            <input
                                type="text"
                                value={image.alt_text}
                                onChange={(e) => handleAltTextChange(index, e.target.value)}
                                placeholder={t('altText') ?? 'Alt text'}
                                className="mt-1 w-full px-2 py-1 text-xs border border-border rounded-md"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
