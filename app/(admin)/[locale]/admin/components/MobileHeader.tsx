'use client';

import { Menu } from 'lucide-react';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white border-b border-border">
            <div className="flex items-center h-16 px-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <h1 className="flex-1 text-center text-lg font-bold tracking-tight">
                    管理画面
                </h1>
                <div className="w-10" />
            </div>
        </header>
    );
}
