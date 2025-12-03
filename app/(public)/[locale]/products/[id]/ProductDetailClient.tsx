'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductWithDetails, ProductVariant } from '@/types';
import { ShoppingBag, Shirt } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProductDetailClientProps {
    product: ProductWithDetails;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const t = useTranslations('ProductDetail');
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants[0] || null
    );
    const [selectedImage, setSelectedImage] = useState(
        product.images.find(img => img.display_order === 1) || product.images[0]
    );
    const [deviceId, setDeviceId] = useState<string>('');

    useEffect(() => {
        let id = localStorage.getItem('store_device_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('store_device_id', id);
        }
        setDeviceId(id);
    }, []);

    const handleTryOn = async () => {
        if (!selectedVariant) return;
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    variantId: selectedVariant.id,
                    variantName: selectedVariant.name,
                    type: 'try-on',
                    deviceId
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 429) {
                    alert(data.message || t('pleaseWait'));
                    return;
                }
                throw new Error('Request failed');
            }

            alert(t('tryOnSent', { product: product.name, variant: selectedVariant.name }));
        } catch (error) {
            console.error('Failed to send try on request:', error);
            alert(t('failedToSend'));
        }
    };

    const handlePurchase = async () => {
        if (!selectedVariant) return;
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    variantId: selectedVariant.id,
                    variantName: selectedVariant.name,
                    type: 'purchase',
                    deviceId
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 429) {
                    alert(data.message || t('pleaseWait'));
                    return;
                }
                throw new Error('Request failed');
            }

            alert(t('purchaseSent', { product: product.name, variant: selectedVariant.name }));
        } catch (error) {
            console.error('Failed to send purchase request:', error);
            alert(t('failedToSend'));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
                <div className="aspect-square relative overflow-hidden rounded-2xl border border-border bg-muted">
                    {selectedImage ? (
                        <Image
                            src={selectedImage.image_url}
                            alt={selectedImage.alt_text || product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {t('noImage')}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {product.images.map((img) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImage(img)}
                            className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${selectedImage?.id === img.id ? 'border-primary' : 'border-transparent hover:border-border'
                                }`}
                        >
                            <Image
                                src={img.image_url}
                                alt={img.alt_text || product.name}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">{product.name}</h1>
                    <p className="text-2xl font-semibold text-primary">
                        ¥{selectedVariant?.price.toLocaleString() ?? '---'}
                    </p>
                </div>

                <div className="prose prose-slate text-muted-foreground">
                    <p>{product.description}</p>
                </div>

                {/* Variant Selector */}
                <div className="space-y-4">
                    <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">
                        {t('selectVariant')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {product.variants.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={`p-4 rounded-xl border text-left transition-all ${selectedVariant?.id === variant.id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                <div className="font-medium">{variant.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {variant.stock > 0 ? t('stock', { stock: variant.stock }) : t('outOfStock')}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={handleTryOn}
                        disabled={!selectedVariant || selectedVariant.stock === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Shirt size={24} />
                        {t('tryOn')}
                    </button>
                    <button
                        onClick={handlePurchase}
                        disabled={!selectedVariant || selectedVariant.stock === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg shadow-primary/20"
                    >
                        <ShoppingBag size={24} />
                        {t('purchase')}
                    </button>
                </div>

                {/* QR Code Placeholder */}
                <div className="pt-8 border-t border-border">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-border">
                            {/* Mock QR */}
                            <div className="w-12 h-12 bg-black/10 grid grid-cols-2 gap-1 p-1">
                                <div className="bg-black"></div><div className="bg-black rounded-full"></div>
                                <div className="bg-black rounded-full"></div><div className="bg-black"></div>
                            </div>
                        </div>
                        <div>
                            <p className="font-medium text-sm">{t('scanToView')}</p>
                            <p className="text-xs text-muted-foreground">{t('scanDescription')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
