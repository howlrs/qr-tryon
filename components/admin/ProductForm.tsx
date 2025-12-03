'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface VariantFormData {
    name: string;
    size: string;
    color: string;
    price: string;
    stock: string;
    sku: string;
}

export interface ImageFormData {
    image_url: string;
    alt_text: string;
    display_order: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    variants: VariantFormData[];
    images: ImageFormData[];
}

interface ProductFormProps {
    initialData?: ProductFormData;
    onSubmit: (data: ProductFormData) => Promise<void>;
    isSubmitting: boolean;
    submitLabel?: string;
}

export default function ProductForm({
    initialData,
    onSubmit,
    isSubmitting,
    submitLabel
}: ProductFormProps) {
    const t = useTranslations('Admin');
    const tCommon = useTranslations('Common');

    // Form State
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [variants, setVariants] = useState<VariantFormData[]>(initialData?.variants || [
        { name: '', size: '', color: '', price: '', stock: '', sku: '' }
    ]);
    const [images, setImages] = useState<ImageFormData[]>(initialData?.images || [
        { image_url: '', alt_text: '', display_order: '1' }
    ]);

    // Handlers
    const handleAddVariant = () => {
        setVariants([...variants, { name: '', size: '', color: '', price: '', stock: '', sku: '' }]);
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, field: keyof VariantFormData, value: string) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const handleAddImage = () => {
        setImages([...images, { image_url: '', alt_text: '', display_order: String(images.length + 1) }]);
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleImageChange = (index: number, field: keyof ImageFormData, value: string) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], [field]: value };
        setImages(newImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            name,
            description,
            variants,
            images
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Details */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-semibold">Basic Details</h2>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">{t('productName')}</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. Premium Cotton T-Shirt"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">{t('description')}</label>
                        <textarea
                            id="description"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                            placeholder="Product description..."
                        />
                    </div>
                </div>
            </div>

            {/* Variants */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{t('variants')}</h2>
                    <button
                        type="button"
                        onClick={handleAddVariant}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                    >
                        <Plus size={16} />
                        {t('addVariant')}
                    </button>
                </div>

                <div className="space-y-4">
                    {variants.map((variant, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="col-span-3 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">{t('variantName')}</label>
                                <input
                                    type="text"
                                    required
                                    value={variant.name}
                                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                    placeholder="Size M / White"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">SKU</label>
                                <input
                                    type="text"
                                    required
                                    value={variant.sku}
                                    onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                    placeholder="TS-WHT-M"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">{t('variantPrice')}</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">{t('variantStock')}</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={variant.stock}
                                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Size/Color</label>
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        value={variant.size}
                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                        placeholder="Size"
                                    />
                                    <input
                                        type="text"
                                        value={variant.color}
                                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                        placeholder="Color"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 pt-6 flex justify-end">
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(index)}
                                        className="text-muted-foreground hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Images */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{t('image')}</h2>
                    <button
                        type="button"
                        onClick={handleAddImage}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                    >
                        <Plus size={16} />
                        {t('addImage')}
                    </button>
                </div>

                <div className="space-y-4">
                    {images.map((image, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 bg-muted/30 rounded-lg border border-border/50">
                            <div className="col-span-6 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Image URL</label>
                                <input
                                    type="url"
                                    required
                                    value={image.image_url}
                                    onChange={(e) => handleImageChange(index, 'image_url', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="col-span-4 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">{t('altText')}</label>
                                <input
                                    type="text"
                                    value={image.alt_text}
                                    onChange={(e) => handleImageChange(index, 'alt_text', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                    placeholder="Image description"
                                />
                            </div>
                            <div className="col-span-1 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">{t('displayOrder')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={image.display_order}
                                    onChange={(e) => handleImageChange(index, 'display_order', e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm border border-border rounded-md"
                                />
                            </div>
                            <div className="col-span-1 pt-6 flex justify-end">
                                {images.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="text-muted-foreground hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    {isSubmitting ? tCommon('loading') : (submitLabel || t('save'))}
                </button>
            </div>
        </form>
    );
}
