// app/components/UploadForm.tsx
import React, {useCallback, useRef, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Loader2, UploadCloud, X} from "lucide-react";
import {useDropzone} from 'react-dropzone';
import {config} from '@/config';
interface UploadQueueItem {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}
interface UploadFormProps {
    onUpload: (file: File) => Promise<void>;
}
export function UploadForm({onUpload}: UploadFormProps) {
    const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [currentError, setCurrentError] = useState<string | null>(null);
    const activeUploads = useRef(new Set<string>());
    const updateItemProgress = useCallback((id: string, progress: number) => {
        setUploadQueue(queue =>
            queue.map(item =>
                item.id === id ? {...item, progress} : item
            )
        );
    }, []);
    const handleUploadError = useCallback((id: string, error: string) => {
        setUploadQueue(queue =>
            queue.map(item =>
                item.id === id
                    ? {...item, status: 'error', error, progress: 0}
                    : item
            )
        );
        setCurrentError(error);
        setShowErrorDialog(true);
        activeUploads.current.delete(id);
    }, []);
    const processNextUpload = useCallback(async (item: UploadQueueItem) => {
        if (activeUploads.current.has(item.id)) return;
        if (item.file.size > config.maxFileSize) {
            handleUploadError(item.id, `File size exceeds the ${config.maxFileSize / (1024 * 1024)}MB limit`);
            return;
        }
        activeUploads.current.add(item.id);
        let progressInterval: NodeJS.Timeout | undefined;
        try {
            setUploadQueue(queue =>
                queue.map(qItem =>
                    qItem.id === item.id ? {...qItem, status: 'uploading'} : qItem
                )
            );
            progressInterval = setInterval(() => {
                updateItemProgress(item.id, item.progress + 10);
            }, 500);
            await onUpload(item.file);
            clearInterval(progressInterval);
            setUploadQueue(queue =>
                queue.map(qItem =>
                    qItem.id === item.id
                        ? {...qItem, progress: 100, status: 'completed'}
                        : qItem
                )
            );
            setTimeout(() => {
                setUploadQueue(queue => queue.filter(qItem => qItem.id !== item.id));
                activeUploads.current.delete(item.id);
            }, 2000);
        } catch (error) {
            clearInterval(progressInterval);
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            handleUploadError(item.id, errorMessage);
        }
    }, [onUpload, updateItemProgress, handleUploadError]);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newItems = acceptedFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: 'pending' as const
        }));
        setUploadQueue(queue => [...queue, ...newItems]);
        newItems.forEach(item => {
            processNextUpload(item);
        });
    }, [processNextUpload]);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        multiple: true,
        accept: config.supportedFileTypes.reduce((acc, type) => {
            const mimeType = type.endsWith('/*') ? type : type;
            acc[mimeType] = [];
            return acc;
        }, {} as Record<string, string[]>)
    });
    const removeFromQueue = useCallback((id: string) => {
        setUploadQueue(queue => queue.filter(item => item.id !== id));
        activeUploads.current.delete(id);
    }, []);
    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-gray-600/25 hover:border-gray-600/50'}`}
            >
                <input {...getInputProps()} />
                <UploadCloud
                    className={`mx-auto h-12 w-12 ${isDragActive ? 'text-blue-500/50' : 'text-gray-500/50'}`}
                    aria-hidden="true"
                />
                <p className="mt-2 text-sm text-gray-400">
                    {isDragActive
                        ? "Drop the files here..."
                        : "Drag and drop files here, or click to select files"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    Maximum file size: {config.maxFileSize / (1024 * 1024)}MB
                </p>
            </div>
            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
                <div className="space-y-2">
                    {uploadQueue.map(item => (
                        <div
                            key={item.id}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-300 truncate" title={item.file.name}>
                                        {item.file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromQueue(item.id)}
                                    disabled={item.status === 'uploading'}
                                    className="text-gray-400 hover:text-gray-300"
                                >
                                    <X className="h-4 w-4"/>
                                    <span className="sr-only">Remove {item.file.name} from queue</span>
                                </Button>
                            </div>
                            <Progress
                                value={item.progress}
                                className="h-1"
                            />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-gray-400">
                                    {item.status === 'error' ? 'Error' :
                                        item.status === 'completed' ? 'Completed' :
                                            `${Math.round(item.progress)}%`}
                                </span>
                                {item.status === 'uploading' && (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500"/>
                                )}
                            </div>
                            {item.error && (
                                <p className="text-xs text-red-400 mt-1">{item.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Error</DialogTitle>
                        <DialogDescription>{currentError}</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}