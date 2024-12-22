// app/page.tsx
'use client';

import {signIn, signOut, useSession} from "next-auth/react";
import {useCallback, useEffect, useState} from "react";
import {FileList} from "@/components/FileList";
import {BreadcrumbNav} from "@/components/BreadcrumbNav";
import {UploadForm} from "@/components/UploadForm";
import {FilePreview} from "@/components/FilePreview";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import type {File as DriveFile} from "@/types/api";

export default function Home() {
    const {data: session, status} = useSession();
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [path, setPath] = useState<Array<{ id: string; name: string }>>([]);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchFiles = useCallback(async (folderId: string | null = null) => {
        if (isUploading) return; // Skip fetching if upload is in progress

        try {
            setError(null);
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...(folderId && {folderId}),
                sortBy,
                sortOrder,
            });

            const response = await fetch(`/api/drive?${queryParams}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to fetch files");
            }
            const data = await response.json();
            setFiles(data.files);

            if (data.folder) {
                const newPath = [...path];
                if (!path.find(p => p.id === data.folder.id)) {
                    newPath.push({id: data.folder.id, name: data.folder.name});
                }
                setPath(newPath);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            setError(error instanceof Error ? error.message : 'Failed to fetch files');
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder, path, isUploading]);

    useEffect(() => {
        if (session?.accessToken) {
            fetchFiles(currentFolder);
        }
    }, [session, currentFolder, fetchFiles]);

    const handleNavigate = (folderId: string | null) => {
        setCurrentFolder(folderId);
        if (!folderId) {
            setPath([]);
        }
    };

    const handleSort = (field: string) => {
        setSortOrder(current =>
            sortBy === field
                ? current === 'asc' ? 'desc' : 'asc'
                : 'asc'
        );
        setSortBy(field);
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolder) {
            formData.append("folderId", currentFolder);
        }

        try {
            setError(null);
            const response = await fetch("/api/drive", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }

            await fetchFiles(currentFolder);
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (fileId: string) => {
        try {
            setError(null);
            const response = await fetch(`/api/drive/${fileId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Delete failed");
            }

            setFiles((prev) => prev.filter((file) => file.id !== fileId));
        } catch (error) {
            console.error("Delete error:", error);
            setError(error instanceof Error ? error.message : 'Delete failed');
            throw error;
        }
    };

    const handleDownload = async (fileId: string, fileName: string) => {
        try {
            setError(null);
            const response = await fetch(`/api/drive/${fileId}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Download failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            setError(error instanceof Error ? error.message : 'Download failed');
            throw error;
        }
    };

    const handlePreview = (file: DriveFile) => {
        setSelectedFile(file);
    };

    if (status === "loading") {
        return (
            <div
                className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1a1b23] to-[#2d1e3f]">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500"/>
            </div>
        );
    }

    if (!session) {
        return (
            <div
                className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1a1b23] to-[#2d1e3f] text-white">
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        Google Drive Manager
                    </h1>
                    <p className="text-lg text-gray-300">
                        Securely manage your Google Drive files
                    </p>
                </div>

                <Button
                    onClick={() => signIn("google", {callbackUrl: "/"})}
                    className="flex items-center gap-3 bg-white text-gray-800 hover:bg-gray-100 px-6 py-3 rounded-lg shadow-lg transition-all hover:shadow-xl"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Google
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a1b23] to-[#2d1e3f]">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            Google Drive Files
                        </h1>
                        {session.user?.email && (
                            <p className="text-sm text-gray-300">
                                Signed in as {session.user.email}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => signOut()}
                        className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
                    >
                        Sign Out
                    </Button>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
                    <BreadcrumbNav path={path} onNavigate={handleNavigate}/>

                    <div className="mb-8">
                        <UploadForm onUpload={handleUpload}/>
                    </div>

                    <FileList
                        files={files}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onNavigate={handleNavigate}
                        onPreview={handlePreview}
                        loading={loading}
                        error={error}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />

                    <FilePreview
                        file={selectedFile}
                        onClose={() => setSelectedFile(null)}
                    />
                </div>
            </div>
        </div>
    );
}