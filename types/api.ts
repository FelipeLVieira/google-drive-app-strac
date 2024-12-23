// types/api.ts
/**
 * Represents a file or folder in Google Drive
 */
export interface File {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    size?: string | number;
    webViewLink?: string;
    previewUrl?: string;
}
/**
 * Response structure for Drive API list operations
 */
export interface DriveApiResponse {
    files: File[];
    folder?: {
        id: string;
        name: string;
    } | null;
    nextPageToken?: string;
}
/**
 * Standard API error response
 */
export interface ApiError {
    error: string;
    status: number;
}
/**
 * Upload response structure
 */
export interface UploadResponse {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    size: string;
    webViewLink: string;
}