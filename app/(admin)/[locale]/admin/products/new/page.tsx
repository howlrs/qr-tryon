'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm';
import { useTranslations } from 'next-intl';

export default function AddProductPage() {
    const router = useRouter();
    const t = useTranslations('Admin');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true);

        // Simulate API call
        const productData = {
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

        console.log('Creating Product:', productData);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        alert('Product created successfully! (Check console for data)');
        setIsSubmitting(false);
        router.push('/admin');
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">{t('newProduct')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
            </div>

            <ProductForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={t('create')}
            />
        </div>
    );
}
