import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ProductWithDetails } from '@/types';

interface ProductCardProps {
    product: ProductWithDetails;
}

export default function ProductCard({ product }: ProductCardProps) {
    const mainImage = product.images.find(img => img.display_order === 1) || product.images[0];
    const minPrice = Math.min(...product.variants.map(v => v.price));
    const maxPrice = Math.max(...product.variants.map(v => v.price));

    const priceDisplay = minPrice === maxPrice
        ? `¥${minPrice.toLocaleString()}`
        : `¥${minPrice.toLocaleString()} - ¥${maxPrice.toLocaleString()}`;

    return (
        <Link href={`/products/${product.id}`} className="group block">
            <div className="bg-white rounded-xl overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="aspect-square relative overflow-hidden bg-muted">
                    {mainImage ? (
                        <Image
                            src={mainImage.image_url}
                            alt={mainImage.alt_text || product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary/80 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">{priceDisplay}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {product.variants.length} Variants
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
