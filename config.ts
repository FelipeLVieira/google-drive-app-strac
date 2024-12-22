// config.ts
/** Configuration constants for the application */
export const config = {
    /** Maximum allowed file size for uploads (10MB) */
    maxFileSize: 10 * 1024 * 1024, // 10MB

    /** Number of files to fetch per page */
    filesPerPage: 30,

    /**
     * Allowed file types for upload
     * Currently set to allow all file types
     * Can be restricted to specific MIME types if needed
     */
    supportedFileTypes: ['*/*'],

    /** API endpoint configurations */
    api: {
        /** Base endpoint for Drive API operations */
        drive: '/api/drive',
    }
} as const;