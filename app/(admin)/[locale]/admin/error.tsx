'use client';

import { AlertTriangle } from 'lucide-react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white border border-border rounded-xl shadow-sm p-8 max-w-md w-full text-center space-y-4">
                <div className="flex justify-center">
                    <AlertTriangle size={48} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">エラーが発生しました</h2>
                <p className="text-muted-foreground text-sm">
                    {error.message || '予期しないエラーが発生しました。もう一度お試しください。'}
                </p>
                <button
                    onClick={reset}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    もう一度試す
                </button>
            </div>
        </div>
    );
}
