// app/components/FilePreview.tsx
import React from 'react';
import Image from 'next/image';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {File as DriveFile} from '@/types/api';

interface FilePreviewProps {
    file: DriveFile | null;
    onClose: () => void;
}

export function FilePreview({file, onClose}: FilePreviewProps) {
    if (!file) return null;

    const previewableTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'application/pdf',
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/json'
    ];

    const isPreviewable = previewableTypes.includes(file.mimeType);
    const isImage = file.mimeType.startsWith('image/');
    const isText = file.mimeType.startsWith('text/') || file.mimeType === 'application/json';

    const getPreviewContent = () => {
        if (!isPreviewable) {
            return (
                <div className="flex items-center justify-center h-64">
                    <p>Preview not available for this file type</p>
                </div>
            );
        }

        if (isImage) {
            return (
                <div className="relative w-full h-[70vh]">
                    <Image
                        src={`https://drive.google.com/uc?export=view&id=${file.id}`}
                        alt={`Preview of ${file.name}`}
                        fill
                        className="object-contain"
                        unoptimized // Since we're loading from Google Drive
                    />
                </div>
            );
        }

        if (isText) {
            return (
                <iframe
                    src={`https://drive.google.com/file/d/${file.id}/preview`}
                    className="w-full h-[70vh]"
                    title={`Preview of ${file.name}`}
                />
            );
        }

        return (
            <iframe
                src={`https://drive.google.com/file/d/${file.id}/preview`}
                className="w-full h-[70vh]"
                title={`Preview of ${file.name}`}
            />
        );
    };

    return (
        <Dialog open={!!file} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-4xl w-full">
                <DialogHeader>
                    <DialogTitle>{file.name}</DialogTitle>
                    <DialogDescription>Preview of {file.name}</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    {getPreviewContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}