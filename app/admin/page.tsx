'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockProducts } from '@/lib/mockData';
import { Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { ProductWithDetails } from '@/types';
import QRCodeModal from '@/components/admin/QRCodeModal';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ProductWithDetails[]>(mockProducts);
    const [selectedProductForQR, setSelectedProductForQR] = useState<ProductWithDetails | null>(null);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            // Simulate API call
            console.log('Deleting product:', id);

            // Update local state
            setProducts(products.filter(p => p.id !== id));

            alert('Product deleted successfully! (Check console for log)');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your store inventory</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    Add Product
                </Link>
            </div>

            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Name</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Variants</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Price Range</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">Stock</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {products.map((product) => {
                            const minPrice = Math.min(...product.variants.map(v => v.price));
                            const maxPrice = Math.max(...product.variants.map(v => v.price));
                            const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

                            return (
                                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-medium">{product.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{product.variants.length} variants</td>
                                    <td className="px-6 py-4">
                                        ¥{minPrice.toLocaleString()} {minPrice !== maxPrice && `- ¥${maxPrice.toLocaleString()}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {totalStock} in stock
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedProductForQR(product)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                                                title="View QR"
                                            >
                                                <QrCode size={18} />
                                            </button>
                                            <Link
                                                href={`/admin/products/${product.id}/edit`}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                    No products found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedProductForQR && (
                <QRCodeModal
                    product={selectedProductForQR}
                    onClose={() => setSelectedProductForQR(null)}
                />
            )}
        </div>
    );
}
