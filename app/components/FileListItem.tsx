// app/components/FileListItem.tsx
import {Download, File as FileIconBase, FileIcon, FileText, Film, Folder, ImageIcon, Music, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {File as DriveFile} from '@/types/api';
interface FileListItemProps {
    file: DriveFile;
    onAction: (file: DriveFile) => void;
    onDownload: (file: DriveFile) => void;
    onDelete: (file: DriveFile) => void;
    isProcessing: boolean;
}
const FileListItem: React.FC<FileListItemProps> = ({
                                                       file,
                                                       onAction,
                                                       onDownload,
                                                       onDelete,
                                                       isProcessing,
                                                   }) => {
    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
    const getFileIcon = (mimeType: string) => {
        if (isFolder) return <Folder className="h-4 w-4 text-blue-400" aria-hidden="true"/>;
        const mainType = mimeType.split('/')[0];
        switch (mainType) {
            case 'image':
                return <ImageIcon className="h-4 w-4 text-green-400" aria-hidden="true"/>;
            case 'video':
                return <Film className="h-4 w-4 text-purple-400" aria-hidden="true"/>;
            case 'audio':
                return <Music className="h-4 w-4 text-yellow-400" aria-hidden="true"/>;
            case 'text':
                return <FileText className="h-4 w-4 text-gray-400" aria-hidden="true"/>;
            case 'application':
                if (mimeType.includes('pdf'))
                    return <FileIcon className="h-4 w-4 text-red-400" aria-hidden="true"/>;
                if (mimeType.includes('document'))
                    return <FileText className="h-4 w-4 text-blue-400" aria-hidden="true"/>;
                if (mimeType.includes('spreadsheet'))
                    return <FileText className="h-4 w-4 text-green-400" aria-hidden="true"/>;
                if (mimeType.includes('presentation'))
                    return <FileText className="h-4 w-4 text-yellow-400" aria-hidden="true"/>;
                return <FileIconBase className="h-4 w-4 text-gray-400" aria-hidden="true"/>;
            default:
                return <FileIconBase className="h-4 w-4 text-gray-400" aria-hidden="true"/>;
        }
    };
    const formatFileSize = (size: string | number | undefined) => {
        if (!size) return 'N/A';
        const numSize = Number(size);
        if (numSize < 1024) return `${numSize} B`;
        if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(2)} KB`;
        return `${(numSize / (1024 * 1024)).toFixed(2)} MB`;
    };
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) return 'Just now';
            return `${hours}h ago`;
        }
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };
    const getFileTypeDisplay = (mimeType: string) => {
        if (isFolder) return 'Folder';
        const mainType = mimeType ? mimeType.split('/')[0] : undefined;
        const typeMap: Record<string, string> = {
            'image': 'Image',
            'video': 'Video',
            'audio': 'Audio',
            'text': 'Text'
        };
        if (mainType && mainType in typeMap) return typeMap[mainType];
        if (mainType === 'application') {
            if (mimeType.includes('pdf')) return 'PDF';
            if (mimeType.includes('vnd.google-apps.document')) return 'Google Doc';
            if (mimeType.includes('vnd.google-apps.spreadsheet')) return 'Google Sheet';
            if (mimeType.includes('vnd.google-apps.presentation')) return 'Google Slides';
            if (mimeType.includes('vnd.openxmlformats-officedocument.wordprocessingml')) return 'Word';
            if (mimeType.includes('vnd.openxmlformats-officedocument.spreadsheetml')) return 'Excel';
            if (mimeType.includes('vnd.openxmlformats-officedocument.presentationml')) return 'PowerPoint';
        }
        return 'File';
    };
    return (
        <div
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-800/50 transition-colors"
            draggable="true"
            onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    id: file.id,
                    name: file.name,
                    type: file.mimeType
                }));
            }}
        >
            <div className="col-span-5 flex items-center space-x-2">
                {getFileIcon(file.mimeType)}
                <button
                    className="text-blue-400 hover:underline truncate text-left"
                    onClick={() => onAction(file)}
                    title={file.name}
                >
                    {file.name}
                </button>
            </div>
            <div className="col-span-2 text-gray-400 truncate" title={getFileTypeDisplay(file.mimeType)}>
                {getFileTypeDisplay(file.mimeType)}
            </div>
            <div className="col-span-2 text-gray-400">
                {formatDate(file.modifiedTime)}
            </div>
            <div className="col-span-1 text-gray-400">
                {formatFileSize(file.size)}
            </div>
            <div className="col-span-2 flex items-center justify-end space-x-2">
                {!isFolder && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(file)}
                        disabled={isProcessing}
                        className="text-green-400 border-green-500/50 hover:bg-green-500/10"
                        title="Download file"
                    >
                        <Download className="h-4 w-4" aria-hidden="true"/>
                        <span className="sr-only">Download {file.name}</span>
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(file)}
                    disabled={isProcessing}
                    className="text-red-400 border-red-500/50 hover:bg-red-500/10"
                    title="Delete file"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true"/>
                    <span className="sr-only">Delete {file.name}</span>
                </Button>
            </div>
        </div>
    );
};
export default FileListItem;