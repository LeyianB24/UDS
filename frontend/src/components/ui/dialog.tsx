"use client";

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onOpenChange(false);
    }, [onOpenChange]);

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
                aria-hidden="true"
            />
            {/* Content slot */}
            {children}
        </div>
    );
}

export function DialogContent({ children, className }: DialogContentProps) {
    return (
        <div
            className={cn(
                'relative z-10 bg-white shadow-2xl w-full max-w-md mx-4',
                'animate-[fadeInScale_0.18s_ease-out]',
                className
            )}
            style={{
                animation: 'dialogIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both'
            }}
        >
            {children}
            <style>{`
                @keyframes dialogIn {
                    from { opacity: 0; transform: scale(0.94) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('mb-4', className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <h2 className={cn('text-xl font-black text-gray-900 tracking-tight', className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
    return <p className={cn('text-sm font-bold text-gray-500', className)}>{children}</p>;
}

export function DialogClose({ onClose, className }: { onClose: () => void; className?: string }) {
    return (
        <button
            onClick={onClose}
            title="Close dialog"
            aria-label="Close dialog"
            className={cn(
                'absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors',
                className
            )}
        >
            <X size={16} />
        </button>
    );
}
