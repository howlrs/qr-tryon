import { ProductWithDetails } from '../types';

export const mockProducts: ProductWithDetails[] = [
    {
        id: 1,
        name: "Premium Cotton T-Shirt",
        description: "A high-quality cotton t-shirt that feels great on the skin. Perfect for casual wear.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variants: [
            {
                id: 101,
                product_id: 1,
                name: "Size M / White",
                size: "M",
                color: "White",
                price: 3500,
                stock: 10,
                sku: "TS-WHT-M",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 102,
                product_id: 1,
                name: "Size L / White",
                size: "L",
                color: "White",
                price: 3500,
                stock: 5,
                sku: "TS-WHT-L",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 103,
                product_id: 1,
                name: "Size M / Black",
                size: "M",
                color: "Black",
                price: 3500,
                stock: 8,
                sku: "TS-BLK-M",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        ],
        images: [
            {
                id: 201,
                product_id: 1,
                image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
                alt_text: "White T-Shirt Front",
                display_order: 1,
                created_at: new Date().toISOString(),
            },
            {
                id: 202,
                product_id: 1,
                image_url: "https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?auto=format&fit=crop&w=800&q=80",
                alt_text: "Black T-Shirt Front",
                display_order: 2,
                created_at: new Date().toISOString(),
            }
        ]
    },
    {
        id: 2,
        name: "Slim Fit Jeans",
        description: "Modern slim fit jeans with a comfortable stretch.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variants: [
            {
                id: 104,
                product_id: 2,
                name: "Size 30 / Blue",
                size: "30",
                color: "Blue",
                price: 8900,
                stock: 15,
                sku: "JN-BLU-30",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        ],
        images: [
            {
                id: 203,
                product_id: 2,
                image_url: "https://images.unsplash.com/photo-1542272617-08f086302542?auto=format&fit=crop&w=800&q=80",
                alt_text: "Blue Jeans",
                display_order: 1,
                created_at: new Date().toISOString(),
            }
        ]
    }
];
