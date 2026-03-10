'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { mockProducts } from '@/lib/mockData';
import { Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { ProductWithDetails } from '@/types';
import QRCodeModal from '@/components/admin/QRCodeModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SearchBar from '@/components/common/SearchBar';
import Pagination from '@/components/common/Pagination';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useTranslations } from 'next-intl';
import { useToast } from '@/lib/hooks/useToast';

const ITEMS_PER_PAGE = 10;

type StockFilter = 'all' | 'in_stock' | 'out_of_stock';

export default function AdminProductsPage() {
    const t = useTranslations('Admin');
    const { toast } = useToast();
    const [products, setProducts] = useState<ProductWithDetails[]>(mockProducts);
    const [selectedProductForQR, setSelectedProductForQR] = useState<ProductWithDetails | null>(null);
    const [selectedProductForDelete, setSelectedProductForDelete] = useState<ProductWithDetails | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState<StockFilter>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const debouncedSearch = useDebounce(searchQuery, 300);

    const filteredProducts = useMemo(() => {
        let result = products;

        // Search filter
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(query));
        }

        // Stock filter
        if (stockFilter === 'in_stock') {
            result = result.filter(p => p.variants.reduce((acc, v) => acc + v.stock, 0) > 0);
        } else if (stockFilter === 'out_of_stock') {
            result = result.filter(p => p.variants.reduce((acc, v) => acc + v.stock, 0) === 0);
        }

        return result;
    }, [products, debouncedSearch, stockFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedProducts = filteredProducts.slice(
        (safeCurrentPage - 1) * ITEMS_PER_PAGE,
        safeCurrentPage * ITEMS_PER_PAGE
    );

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleStockFilterChange = (value: StockFilter) => {
        setStockFilter(value);
        setCurrentPage(1);
    };

    const handleDelete = () => {
        if (!selectedProductForDelete) return;

        // Simulate API call
        console.log('Deleting product:', selectedProductForDelete.id);

        // Update local state
        setProducts(products.filter(p => p.id !== selectedProductForDelete.id));

        toast(t('deleteSuccess'), 'success');
        setSelectedProductForDelete(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('products')}</h1>
                    <p className="text-muted-foreground">Manage your store inventory</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    {t('addProduct')}
                </Link>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <SearchBar
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="商品名で検索..."
                    />
                </div>
                <select
                    value={stockFilter}
                    onChange={(e) => handleStockFilterChange(e.target.value as StockFilter)}
                    className="px-4 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                    <option value="all">全て</option>
                    <option value="in_stock">在庫あり</option>
                    <option value="out_of_stock">在庫切れ</option>
                </select>
            </div>

            <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-medium text-muted-foreground">{t('name')}</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground hidden md:table-cell">{t('variants')}</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground">{t('price')}</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground hidden md:table-cell">{t('stock')}</th>
                            <th className="px-6 py-4 font-medium text-muted-foreground text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedProducts.map((product) => {
                            const minPrice = Math.min(...product.variants.map(v => v.price));
                            const maxPrice = Math.max(...product.variants.map(v => v.price));
                            const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

                            return (
                                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-medium">{product.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{product.variants.length} {t('variants')}</td>
                                    <td className="px-6 py-4">
                                        ¥{minPrice.toLocaleString()} {minPrice !== maxPrice && `- ¥${maxPrice.toLocaleString()}`}
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {t('stock', { stock: totalStock })}
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
                                                title={t('edit')}
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => setSelectedProductForDelete(product)}
                                                className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paginatedProducts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                    {debouncedSearch || stockFilter !== 'all'
                                        ? '条件に一致する商品がありません'
                                        : t('noProducts')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {selectedProductForQR && (
                <QRCodeModal
                    product={selectedProductForQR}
                    onClose={() => setSelectedProductForQR(null)}
                />
            )}

            <ConfirmModal
                isOpen={selectedProductForDelete !== null}
                onClose={() => setSelectedProductForDelete(null)}
                onConfirm={handleDelete}
                title={t('delete')}
                message={t('confirmDelete')}
                confirmLabel={t('delete')}
                variant="danger"
            />
        </div>
    );
}
