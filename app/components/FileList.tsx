// app/components/FileList.tsx
import {useState} from 'react';
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {ArrowDown, ArrowUp, Code, Download, File, FileText, Folder, Image, Loader2, Trash2} from 'lucide-react';
import type {File as DriveFile} from '@/types/api';

interface FileListProps {
    files: DriveFile[];
    onDownload: (fileId: string, fileName: string) => Promise<void>;
    onDelete: (fileId: string) => Promise<void>;
    onNavigate: (folderId: string) => void;
    onPreview: (file: DriveFile) => void;
    loading?: boolean;
    error?: string | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (field: string) => void;
}

function getFileTypeIcon(mimeType: string) {
    switch (mimeType) {
        case 'application/vnd.google-apps.folder':
            return <Folder className="h-4 w-4 text-blue-500" aria-label="Folder icon"/>;
        case 'application/pdf':
            return <FileText className="h-4 w-4 text-red-500" aria-label="PDF file icon"/>;
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
            return <Image className="h-4 w-4 text-green-500" aria-label="Image file icon"/>;
        case 'application/json':
        case 'text/plain':
        case 'text/html':
        case 'text/css':
        case 'text/javascript':
            return <Code className="h-4 w-4 text-yellow-500" aria-label="Code file icon"/>;
        default:
            return <File className="h-4 w-4 text-gray-500" aria-label="Generic file icon"/>;
    }
}

function getFileTypeLabel(mimeType: string) {
    const parts = mimeType.split('/');
    if (parts.length === 2) {
        if (parts[0] === 'application' && parts[1].startsWith('vnd.google-apps.')) {
            return parts[1].replace('vnd.google-apps.', '').toUpperCase();
        }
        return parts[1].toUpperCase();
    }
    return 'Unknown';
}

function formatFileSize(bytes: string | number | undefined): string {
    if (bytes === undefined || bytes === null) return '-';

    const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (isNaN(numBytes)) return '-';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = numBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${Number(size).toFixed(1)} ${units[unitIndex]}`;
}

export function FileList({
                             files,
                             onDownload,
                             onDelete,
                             onNavigate,
                             onPreview,
                             loading = false,
                             error = null,
                             sortBy,
                             sortOrder,
                             onSort,
                         }: FileListProps) {
    const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());

    const handleSort = (field: string) => {
        onSort(field);
    };

    const SortIcon = ({field}: { field: string }) => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc' ?
            <ArrowUp className="h-4 w-4"/> :
            <ArrowDown className="h-4 w-4"/>;
    };

    const handleAction = async (fileId: string, action: 'download' | 'delete', fileName?: string) => {
        setProcessingFiles(prev => new Set(prev).add(fileId));
        try {
            if (action === 'download' && fileName) {
                await onDownload(fileId, fileName);
            } else if (action === 'delete') {
                await onDelete(fileId);
            }
        } finally {
            setProcessingFiles(prev => {
                const next = new Set(prev);
                next.delete(fileId);
                return next;
            });
        }
    };

    if (error) {
        return (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header/Sort Controls */}
            <div className="grid grid-cols-12 gap-4 p-2 bg-secondary/30 rounded-md text-sm font-medium">
                <div className="col-span-5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2"
                    >
                        Name
                        <SortIcon field="name"/>
                    </Button>
                </div>
                <div className="col-span-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('type')}
                        className="flex items-center gap-2"
                    >
                        Type
                        <SortIcon field="type"/>
                    </Button>
                </div>
                <div className="col-span-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('modifiedTime')}
                        className="flex items-center gap-2"
                    >
                        Modified
                        <SortIcon field="modifiedTime"/>
                    </Button>
                </div>
                <div className="col-span-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('size')}
                        className="flex items-center gap-2"
                    >
                        Size
                        <SortIcon field="size"/>
                    </Button>
                </div>
                <div className="col-span-2">
                    Actions
                </div>
            </div>

            {/* File/Folder List */}
            <div className="space-y-2">
                {files.map((file) => {
                    const isProcessing = processingFiles.has(file.id);
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                    return (
                        <Card key={file.id} className="hover:bg-secondary/20">
                            <CardContent className="grid grid-cols-12 gap-4 p-4 items-center">
                                <div className="col-span-5 flex items-center gap-2">
                                    {isFolder ? (
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 w-full justify-start"
                                            onClick={() => onNavigate(file.id)}
                                        >
                                            {getFileTypeIcon(file.mimeType)}
                                            {file.name}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 w-full justify-start"
                                            onClick={() => onPreview(file)}
                                        >
                                            {getFileTypeIcon(file.mimeType)}
                                            {file.name}
                                        </Button>
                                    )}
                                </div>
                                <div className="col-span-2 text-sm text-muted-foreground">
                                    {getFileTypeLabel(file.mimeType)}
                                </div>
                                <div className="col-span-2 text-sm text-muted-foreground">
                                    {new Date(file.modifiedTime).toLocaleDateString()}
                                </div>
                                <div className="col-span-1 text-sm text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </div>
                                <div className="col-span-2 flex gap-2">
                                    {!isFolder && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isProcessing}
                                            onClick={() => handleAction(file.id, 'download', file.name)}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                            ) : (
                                                <Download className="h-4 w-4"/>
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={isProcessing}
                                        onClick={() => handleAction(file.id, 'delete')}
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                        ) : (
                                            <Trash2 className="h-4 w-4"/>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {loading && (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin"/>
                </div>
            )}
        </div>
    );
}