'use client';

import { useState, useMemo } from 'react';
import { mockProducts } from '@/lib/mockData';
import ProductCard from '@/app/components/ProductCard';
import { useTranslations } from 'next-intl';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name';

export default function ProductsPage() {
    const t = useTranslations('Products');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const sortedProducts = useMemo(() => {
        const sorted = [...mockProducts];

        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'price_asc':
                sorted.sort((a, b) => {
                    const aMin = Math.min(...a.variants.map(v => v.price));
                    const bMin = Math.min(...b.variants.map(v => v.price));
                    return aMin - bMin;
                });
                break;
            case 'price_desc':
                sorted.sort((a, b) => {
                    const aMax = Math.max(...a.variants.map(v => v.price));
                    const bMax = Math.max(...b.variants.map(v => v.price));
                    return bMax - aMax;
                });
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return sorted;
    }, [sortBy]);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </header>

                <div className="flex justify-end mb-6">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-4 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                        <option value="newest">新着順</option>
                        <option value="price_asc">価格（安い順）</option>
                        <option value="price_desc">価格（高い順）</option>
                        <option value="name">名前順</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {sortedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
