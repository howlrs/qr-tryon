'use client';

import { QRCodeSVG } from 'qrcode.react';
import { X, Download } from 'lucide-react';
import { ProductWithDetails } from '@/types';

interface QRCodeModalProps {
    product: ProductWithDetails;
    onClose: () => void;
}

export default function QRCodeModal({ product, onClose }: QRCodeModalProps) {
    // In a real app, this would be the actual domain
    const productUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/products/${product.id}`
        : `https://example.com/products/${product.id}`;

    const handleDownload = () => {
        const svg = document.getElementById('product-qr-code');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `qr-${product.id}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-lg">Product QR Code</h3>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-border">
                        <QRCodeSVG
                            id="product-qr-code"
                            value={productUrl}
                            size={200}
                            level="H"
                            includeMargin
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="font-medium text-lg">{product.name}</p>
                        <p className="text-sm text-muted-foreground break-all">{productUrl}</p>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <Download size={18} />
                        Download QR Code
                    </button>
                </div>
            </div>
        </div>
    );
}
