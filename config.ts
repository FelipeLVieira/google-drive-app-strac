// config.ts
export const config = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    filesPerPage: 30,
    supportedFileTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'image/*',
        'video/*',
        'audio/*'
    ],
    api: {
        drive: '/api/drive',
    }
} as const;