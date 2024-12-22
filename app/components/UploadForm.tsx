// app/components/UploadForm.tsx
import React, {useCallback, useRef, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Loader2, UploadCloud, X} from "lucide-react";
import {useDropzone} from 'react-dropzone';

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

    const processNextUpload = useCallback(async (item: UploadQueueItem) => {
        if (activeUploads.current.has(item.id)) return;
        activeUploads.current.add(item.id);

        let progressInterval: NodeJS.Timeout | undefined;
        try {
            setUploadQueue(queue =>
                queue.map(qItem =>
                    qItem.id === item.id ? {...qItem, status: 'uploading'} : qItem
                )
            );

            progressInterval = setInterval(function () {
                updateItemProgress(item.id, Math.min(90, item.progress + 10));
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
            setUploadQueue(queue =>
                queue.map(qItem =>
                    qItem.id === item.id
                        ? {...qItem, status: 'error', error: errorMessage}
                        : qItem
                )
            );
            setCurrentError(errorMessage);
            setShowErrorDialog(true);
            activeUploads.current.delete(item.id);
        }
    }, [onUpload, updateItemProgress]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newItems = acceptedFiles.map(file => ({
            id: Math.random().toString(36).slice(2),
            file,
            progress: 0,
            status: 'pending' as const
        }));

        setUploadQueue(queue => [...queue, ...newItems]);

        // Process each file
        newItems.forEach(item => {
            processNextUpload(item);
        });
    }, [processNextUpload]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        multiple: true
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
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
            >
                <input {...getInputProps()} aria-label="File upload dropzone"/>
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true"/>
                <p className="mt-2 text-sm text-gray-600">
                    {isDragActive
                        ? "Drop the files here..."
                        : "Drag 'n' drop files here, or click to select files"}
                </p>
            </div>

            {/* Upload Queue */}
            <div className="space-y-2" role="list" aria-label="Upload queue">
                {uploadQueue.map(item => (
                    <div key={item.id} className="bg-secondary/20 rounded-lg p-4" role="listitem">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm truncate flex-1">{item.file.name}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromQueue(item.id)}
                                disabled={item.status === 'uploading'}
                                aria-label={`Remove ${item.file.name} from queue`}
                            >
                                <X className="h-4 w-4" aria-hidden="true"/>
                            </Button>
                        </div>
                        <Progress
                            value={item.progress}
                            className="h-2"
                            aria-label={`Upload progress for ${item.file.name}`}
                        />
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                                {item.status === 'error' ? 'Error' : `${item.progress}%`}
                            </span>
                            {item.status === 'uploading' && (
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true"/>
                            )}
                        </div>
                    </div>
                ))}
            </div>

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