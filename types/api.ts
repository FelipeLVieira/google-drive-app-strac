// types/api.ts
/**
 * Represents a file or folder in Google Drive
 */
export interface File {
    id: string;                    // Unique identifier
    name: string;                  // File/folder name
    mimeType: string;             // MIME type (e.g., 'application/vnd.google-apps.folder' for folders)
    modifiedTime: string;         // ISO timestamp of last modification
    size?: string | number;       // File size in bytes (undefined for folders)
}

/**
 * Response structure for Drive API list operations
 */
export interface DriveApiResponse {
    files: File[];
    nextPageToken?: string;      // Token for pagination
}

/**
 * Standard API error response
 */
export interface ApiError {
    error: string;               // Error message
    status: number;             // HTTP status code
}