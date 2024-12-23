// app/components/FileList.tsx
import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {ArrowDown, ArrowUp, ArrowUpDown, Loader2} from 'lucide-react';
import type {File as DriveFile} from '@/types/api';
import FileListItem from './FileListItem';
interface FileListProps {
    files: DriveFile[];
    onDownload: (file: DriveFile) => Promise<void>;
    onDelete: (file: DriveFile) => Promise<void>;
    onNavigate: (folderId: string) => void;
    onPreview: (file: DriveFile) => void;
    loading?: boolean;
    error?: string | null;
    sortBy: 'name' | 'type' | 'modifiedTime' | 'size';
    sortOrder: 'asc' | 'desc';
    onSort: (key: 'name' | 'type' | 'modifiedTime' | 'size', order: 'asc' | 'desc') => void;
}
const FileList: React.FC<FileListProps> = ({
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
                                           }) => {
    const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
    const handleFileAction = async (file: DriveFile, action: 'download' | 'delete') => {
        if (processingFiles.has(file.id)) return;
        setProcessingFiles((prev) => new Set([...Array.from(prev), file.id]));
        try {
            if (action === 'download') {
                await onDownload(file);
            } else {
                await onDelete(file);
            }
        } finally {
            setProcessingFiles(prev => {
                const next = new Set(prev);
                next.delete(file.id);
                return next;
            });
        }
    };
    const renderSortIcon = (key: string) => {
        if (sortBy !== key) return <ArrowUpDown className="h-4 w-4 ml-1"/>;
        return sortOrder === 'asc' ?
            <ArrowUp className="h-4 w-4 ml-1"/> :
            <ArrowDown className="h-4 w-4 ml-1"/>;
    };
    const renderSortButton = (key: 'name' | 'type' | 'modifiedTime' | 'size', label: string) => (
        <button
            onClick={() => onSort(key, sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
            {label}
            {renderSortIcon(key)}
        </button>
    );
    const renderHeader = () => (
        <div
            className="sticky top-0 grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800/80 backdrop-blur-sm rounded-t-lg border-b border-gray-700">
            <div className="col-span-5">{renderSortButton('name', 'Name')}</div>
            <div className="col-span-2">{renderSortButton('type', 'Type')}</div>
            <div className="col-span-2">{renderSortButton('modifiedTime', 'Modified')}</div>
            <div className="col-span-1">{renderSortButton('size', 'Size')}</div>
            <div className="col-span-2 text-sm text-gray-400 text-right">Actions</div>
        </div>
    );
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mb-4"/>
                <p className="text-gray-400">Loading your files...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="text-center p-8 bg-red-950/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-red-500/50 text-red-400 hover:bg-red-950/50"
                >
                    Retry
                </Button>
            </div>
        );
    }
    return (
        <div className="rounded-lg border border-gray-800 overflow-hidden bg-gray-900/50">
            {renderHeader()}
            <div className="divide-y divide-gray-800">
                {files.map((file) => (
                    <FileListItem
                        key={file.id}
                        file={file}
                        onAction={(file) => {
                            if (file.mimeType === 'application/vnd.google-apps.folder') {
                                onNavigate(file.id);
                            } else {
                                onPreview(file);
                            }
                        }}
                        onDownload={(file) => handleFileAction(file, 'download')}
                        onDelete={(file) => handleFileAction(file, 'delete')}
                        isProcessing={processingFiles.has(file.id)}
                    />
                ))}
            </div>
            {!loading && files.length === 0 && (
                <div className="text-center py-12 px-4">
                    <p className="text-gray-400 mb-2">No files found in this folder</p>
                    <p className="text-sm text-gray-500">
                        Drag and drop files here to upload
                    </p>
                </div>
            )}
        </div>
    );
};
export default FileList;