// app/components/FilePreview.tsx
import React, {useState} from 'react';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {AlertCircle, FileIcon, Loader2} from 'lucide-react';
import Image from 'next/image';
const FilePreviewError = ({message}: { message: string }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4"/>
        <p className="text-gray-300 mb-2">{message}</p>
        <p className="text-sm text-gray-500">Please try downloading the file instead.</p>
    </div>
);
const UnsupportedPreview = ({fileName}: { fileName: string }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileIcon className="h-12 w-12 text-gray-500 mb-4"/>
        <p className="text-gray-300 mb-2">Preview not available for {fileName}</p>
        <p className="text-sm text-gray-500">Please download the file to view its contents.</p>
    </div>
);
const ImagePreview = ({src, alt}: { src: string; alt: string }) => {
    const [error, setError] = React.useState(false);
    return (
        <div className="relative w-full h-[70vh] bg-black/50 rounded-lg overflow-hidden">
            {!error ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain"
                    unoptimized
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-red-400">Failed to load image preview</p>
                </div>
            )}
        </div>
    );
};
const PDFPreview = ({fileId}: { fileId: string }) => {
    const previewUrl = `/api/drive/${fileId}`;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    return (
        <div className="w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            )}
            {error ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-red-400">{error}</p>
                </div>
            ) : (
                <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError('Failed to load PDF preview');
                    }}
                />
            )}
        </div>
    );
}
const GoogleDocsPreview = ({fileId, type}: { fileId: string; type: string }) => {
    let previewUrl;
    if (type.includes('spreadsheet')) {
        previewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview?usp=drivesdk`;
    } else if (type.includes('presentation')) {
        previewUrl = `https://docs.google.com/presentation/d/${fileId}/preview?usp=drivesdk`;
    } else if (type.includes('document')) {
        previewUrl = `https://docs.google.com/document/d/${fileId}/preview?usp=drivesdk`;
    }
    return (
        <iframe
            src={previewUrl}
            className="w-full h-[70vh] rounded-lg bg-white"
            title="Google Docs Preview"
        />
    );
};
interface FilePreviewProps {
    file: { id: string; name: string; mimeType: string } | null;
    onClose: () => void;
    isOpen: boolean;
}
const FilePreview: React.FC<FilePreviewProps> = ({file, onClose, isOpen}) => {
    const [error, setError] = React.useState<string | null>(null);
    if (!file) return null;
    const renderPreview = () => {
        try {
            if (error) {
                return <FilePreviewError message={error}/>;
            }
            if (file.mimeType.startsWith('image/')) {
                return <ImagePreview src={`/api/drive/${file.id}`} alt={file.name}/>;
            }
            if (file.mimeType.includes('application/vnd.google-apps')) {
                return <GoogleDocsPreview fileId={file.id} type={file.mimeType}/>;
            }
            if (file.mimeType === 'application/pdf') {
                return <PDFPreview fileId={file.id}/>;
            }
            return <UnsupportedPreview fileName={file.name}/>;
        } catch (err) {
            console.error('Preview error:', err);
            return <FilePreviewError message="An error occurred while loading the preview"/>;
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-full p-0 bg-gray-900 border border-gray-800">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">{file.name}</h2>
                    {renderPreview()}
                </div>
            </DialogContent>
        </Dialog>
    );
};
export default FilePreview;