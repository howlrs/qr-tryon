import { mockProducts } from '@/lib/mockData';
import ProductCard from '@/app/components/ProductCard';
import { useTranslations } from 'next-intl';

export default function ProductsPage() {
    const t = useTranslations('Products');

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {mockProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
