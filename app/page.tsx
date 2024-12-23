// app/page.tsx
'use client';
import {signIn, signOut, useSession} from 'next-auth/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import FileList from '@/components/FileList';
import {BreadcrumbNav} from '@/components/BreadcrumbNav';
import {UploadForm} from '@/components/UploadForm';
import FilePreview from '@/components/FilePreview';
import {Button} from '@/components/ui/button';
import {Loader2, LogOut} from 'lucide-react';
import type {File as DriveFile} from '@/types/api';
import {config} from '@/config';
type SortField = 'name' | 'type' | 'modifiedTime' | 'size';
interface FetchState {
    loading: boolean;
    error: string | null;
    files: DriveFile[];
    path: Array<{ id: string; name: string }>;
}
export default function Home() {
    const {data: session, status} = useSession();
    const [fetchState, setFetchState] = useState<FetchState>({
        loading: true,
        error: null,
        files: [],
        path: [],
    });
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const mountedRef = useRef(true);
    const fetchingRef = useRef(false);
    const fetchFiles = useCallback(async () => {
        if (!mountedRef.current || fetchingRef.current || !session?.accessToken) return;
        fetchingRef.current = true;
        try {
            setFetchState(prev => ({...prev, loading: true, error: null}));
            const queryParams = new URLSearchParams({
                ...(currentFolder ? {folderId: currentFolder} : {}),
                sortBy,
                sortOrder,
            });
            const response = await fetch(`${config.api.drive}?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            if (!mountedRef.current) return;
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch files');
            }
            const data = await response.json();
            if (!mountedRef.current) return;
            setFetchState(prev => {
                let newPath = prev.path;
                if (currentFolder === null) {
                    newPath = [];
                } else if (data.folder && !prev.path.find(p => p.id === data.folder.id)) {
                    const folderIndex = prev.path.findIndex(p => p.id === data.folder.id);
                    if (folderIndex === -1) {
                        newPath = [...prev.path, {id: data.folder.id, name: data.folder.name}];
                    }
                }
                return {
                    loading: false,
                    error: null,
                    files: data.files || [],
                    path: newPath,
                };
            });
        } catch (err) {
            if (!mountedRef.current) return;
            console.error('Error fetching files:', err);
            setFetchState(prev => ({
                ...prev,
                loading: false,
                error: err instanceof Error ? err.message : 'Failed to fetch files',
                files: [],
            }));
        } finally {
            fetchingRef.current = false;
            setInitialLoadComplete(true);
        }
    }, [session?.accessToken, currentFolder, sortBy, sortOrder]);
    useEffect(() => {
        mountedRef.current = true;
        if (status === 'authenticated' && session?.accessToken) {
            fetchFiles();
        } else if (status !== 'loading') {
            setInitialLoadComplete(true);
        }
        return () => {
            mountedRef.current = false;
        };
    }, [status, session?.accessToken, fetchFiles]);
    const handleNavigate = useCallback((folderId: string | null) => {
        setCurrentFolder(folderId);
        if (!folderId) {
            setFetchState(prev => ({...prev, path: []}));
        }
    }, []);
    const handleSort = useCallback((field: SortField) => {
        setSortBy(field);
        setSortOrder(prev => (sortBy === field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
    }, [sortBy]);
    const handleUpload = async (file: File) => {
        if (!mountedRef.current || !session?.accessToken) return;
        if (file.size > config.maxFileSize) {
            setFetchState(prev => ({
                ...prev,
                error: `File size exceeds the ${config.maxFileSize / (1024 * 1024)}MB limit`
            }));
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) {
            formData.append('folderId', currentFolder);
        }
        try {
            setFetchState(prev => ({...prev, error: null}));
            const response = await fetch('/api/drive', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            if (!mountedRef.current) return;
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }
            await fetchFiles();
        } catch (err) {
            if (!mountedRef.current) return;
            console.error('Upload error:', err);
            setFetchState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Upload failed'
            }));
        }
    };
    const handleDelete = async (file: DriveFile) => {
        if (!mountedRef.current || !session?.accessToken) return;
        try {
            setFetchState(prev => ({...prev, error: null}));
            const response = await fetch(`/api/drive/${file.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            if (!mountedRef.current) return;
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Delete failed');
            }
            setFetchState(prev => ({
                ...prev,
                files: prev.files.filter(f => f.id !== file.id)
            }));
        } catch (err) {
            if (!mountedRef.current) return;
            console.error('Delete error:', err);
            setFetchState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Delete failed'
            }));
        }
    };
    const handleDownload = async (file: DriveFile) => {
        if (!mountedRef.current || !session?.accessToken) return;
        try {
            setFetchState(prev => ({...prev, error: null}));
            const response = await fetch(`/api/drive/${file.id}?download=true`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            if (!mountedRef.current) return;
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Download failed');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            if (!mountedRef.current) return;
            console.error('Download error:', err);
            setFetchState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Download failed'
            }));
        }
    };
    const handlePreview = useCallback((file: DriveFile) => {
        setSelectedFile(file);
        setIsPreviewOpen(true);
    }, []);
    if (status === 'loading' || !initialLoadComplete) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500"/>
            </div>
        );
    }
    if (!session) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent leading-tight">
                        Google Drive Manager
                    </h1>
                    <p className="text-lg text-gray-400">
                        Securely manage your Google Drive files
                    </p>
                </div>
                <Button
                    onClick={() => signIn('google', {callbackUrl: '/'})}
                    className="bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 flex items-center gap-3 h-12"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    Sign in with Google
                </Button>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-8 p-4 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Google Drive Files
                    </h1>
                    {session?.user && (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300">Signed in as {session.user.email}</span>
                            <Button
                                onClick={() => signOut()}
                                variant="outline"
                                className="text-red-400 border-red-500/30 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2"/>
                                Sign Out
                            </Button>
                        </div>
                    )}
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6">
                    <BreadcrumbNav path={fetchState.path} onNavigate={handleNavigate}/>
                    <UploadForm onUpload={handleUpload}/>
                    {fetchState.error && (
                        <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-4 mb-4">
                            <p className="text-red-400">{fetchState.error}</p>
                        </div>
                    )}
                    <FileList
                        files={fetchState.files}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                        onPreview={handlePreview}
                        loading={fetchState.loading}
                        error={fetchState.error}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />
                    <FilePreview
                        file={selectedFile as { id: string; name: string; mimeType: string; }}
                        onClose={() => {
                            setSelectedFile(null);
                            setIsPreviewOpen(false);
                        }}
                        isOpen={isPreviewOpen}
                    />
                </div>
            </div>
        </div>
    );
}