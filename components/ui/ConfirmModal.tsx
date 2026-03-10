'use client';

import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const variantClasses = {
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    info: 'bg-primary text-primary-foreground hover:opacity-90',
};

const variantIconColors = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-primary',
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = '確認',
    cancelLabel = 'キャンセル',
    variant = 'info',
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${variantIconColors[variant]}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-sm text-muted-foreground">{message}</p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg font-medium border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]}`}
                    >
                        {isLoading ? '処理中...' : confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
