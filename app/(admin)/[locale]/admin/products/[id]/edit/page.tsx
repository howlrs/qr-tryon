'use client';

import { useState, useEffect, use } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm';
import { mockProducts } from '@/lib/mockData';
import { useTranslations } from 'next-intl';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const t = useTranslations('Admin');
    const tCommon = useTranslations('Common');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState<ProductFormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Unwrap params using use() hook or useEffect
    const [productId, setProductId] = useState<string | null>(null);

    useEffect(() => {
        params.then(resolvedParams => {
            setProductId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!productId) return;

        // Simulate fetching data
        const product = mockProducts.find(p => p.id === Number(productId));

        if (product) {
            setInitialData({
                name: product.name,
                description: product.description,
                variants: product.variants.map(v => ({
                    name: v.name,
                    size: v.size || '',
                    color: v.color || '',
                    price: String(v.price),
                    stock: String(v.stock),
                    sku: v.sku
                })),
                images: product.images.map(img => ({
                    image_url: img.image_url,
                    alt_text: img.alt_text || '',
                    display_order: String(img.display_order)
                }))
            });
        }
        setIsLoading(false);
    }, [productId]);

    const handleSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true);

        // Simulate API call
        const productData = {
            id: Number(productId),
            ...data,
            variants: data.variants.map(v => ({
                ...v,
                price: Number(v.price),
                stock: Number(v.stock)
            })),
            images: data.images.map(img => ({
                ...img,
                display_order: Number(img.display_order)
            }))
        };

        console.log('Updating Product:', productData);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        alert('Product updated successfully! (Check console for data)');
        setIsSubmitting(false);
        router.push('/admin');
    };

    if (isLoading) {
        return <div className="p-8 text-center">{tCommon('loading')}</div>;
    }

    if (!initialData) {
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold">{t('noProducts')}</h1>
                <Link href="/admin" className="text-primary hover:underline">
                    {t('products')}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('editProduct')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
            </div>

            <ProductForm
                initialData={initialData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={t('update')}
            />
        </div>
    );
}
