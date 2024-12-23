// app/api/drive/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/drive-client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
export async function GET(
    req: NextRequest,
    context: { params: { fileId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const { fileId } = context.params;
        if (!fileId) {
            return NextResponse.json({error: 'File ID is required'}, {status: 400});
        }
        const drive = await getDriveClient();
        const isDownload = req.nextUrl.searchParams.get('download') === 'true';
        try {
            const fileMetadata = await drive.files.get({
                fileId,
                fields: 'mimeType,name',
                supportsAllDrives: true,
            });
            const response = await drive.files.get({
                fileId,
                alt: 'media',
                acknowledgeAbuse: true,
            }, {
                responseType: 'stream',
            });
            const headers = new Headers();
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
            headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            headers.set('Content-Type', fileMetadata.data.mimeType || 'application/octet-stream');
            if (isDownload) {
                headers.set('Content-Disposition', `attachment; filename="${fileMetadata.data.name}"`);
            }
            const chunks = [];
            for await (const chunk of response.data) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            return new Response(buffer, { headers });
        } catch (error: any) {
            console.error('Drive API error:', error);
            return NextResponse.json({
                error: 'Failed to fetch file from Google Drive',
                details: error.message
            }, {status: 500});
        }
    } catch (error: any) {
        console.error('File operation error:', error);
        return NextResponse.json(
            {error: error.message || 'Failed to process file'},
            {status: error.code || 500}
        );
    }
}
export async function DELETE(
    req: NextRequest,
    context: { params: { fileId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const { fileId } = context.params;
        if (!fileId) {
            return NextResponse.json({error: 'File ID is required'}, {status: 400});
        }
        const drive = await getDriveClient();
        await drive.files.delete({
            fileId,
        });
        return NextResponse.json({success: true});
    } catch (error: any) {
        console.error('Delete file error:', error);
        return NextResponse.json(
            {error: error.message || 'Failed to delete file'},
            {status: error.code || 500}
        );
    }
}