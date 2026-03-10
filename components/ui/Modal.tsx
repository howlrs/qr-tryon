'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
};

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'sm' }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidthClasses[maxWidth]} overflow-hidden animate-in fade-in zoom-in duration-200`}>
                {title && (
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>,
        document.body
    );
}
