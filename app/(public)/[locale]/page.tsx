import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Settings } from "lucide-react";

export default function Home() {
    const t = useTranslations('Home');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
            <h1 className="text-5xl font-bold mb-6 tracking-tight">
                {t('title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
                {t('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                    {t('viewProducts')} <ArrowRight size={20} />
                </Link>
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary/5 transition-colors"
                >
                    <Settings size={20} /> {t('adminPanel')}
                </Link>
            </div>
        </div>
    );
}
