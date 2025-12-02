import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/mockData';
import ProductDetailClient from './ProductDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;
    const productId = parseInt(id);
    const product = mockProducts.find((p) => p.id === productId);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                <ProductDetailClient product={product} />
            </div>
        </div>
    );
}
