// app/api/drive/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {getDriveClient} from '@/lib/drive-client';
import {getServerSession} from 'next-auth/next';
import {authOptions} from '@/app/api/auth/[...nextauth]/options';
import {config} from '@/config';
import {drive_v3} from "googleapis";
import Schema$File = drive_v3.Schema$File;
import {GaxiosPromise} from "gaxios";
import {Readable} from "node:stream";
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const url = new URL(req.url);
        const folderId = url.searchParams.get('folderId');
        const sortBy = url.searchParams.get('sortBy') || 'name';
        const sortOrder = url.searchParams.get('sortOrder') || 'asc';
        const sortFieldMap: Record<string, string> = {
            'name': 'name',
            'modifiedTime': 'modifiedTime',
        };
        const drive = await getDriveClient();
        const listParams: any = {
            q: folderId ? `'${folderId}' in parents and trashed = false` : "'root' in parents and trashed = false",
            fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink), nextPageToken',
            pageSize: 100,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
        };
        if (sortFieldMap[sortBy]) {
            listParams.orderBy = `${sortFieldMap[sortBy]} ${sortOrder}`;
        }
        const response = await drive.files.list(listParams);
        let files = response.data.files || [];
        if (!sortFieldMap[sortBy]) {
            files = files.sort((a: any, b: any) => {
                if (sortBy === 'type') {
                    const typeA = a.mimeType || '';
                    const typeB = b.mimeType || '';
                    return sortOrder === 'asc' ?
                        typeA.localeCompare(typeB) :
                        typeB.localeCompare(typeA);
                } else if (sortBy === 'size') {
                    const sizeA = Number(a.size) || 0;
                    const sizeB = Number(b.size) || 0;
                    return sortOrder === 'asc' ?
                        sizeA - sizeB :
                        sizeB - sizeA;
                }
                return 0;
            });
        }
        let folder = null;
        if (folderId) {
            try {
                const folderResponse = await drive.files.get({
                    fileId: folderId,
                    fields: 'id, name',
                });
                folder = {
                    id: folderResponse.data.id,
                    name: folderResponse.data.name,
                };
            } catch (error) {
                console.error('Error fetching folder details:', error);
            }
        }
        return NextResponse.json({
            files,
            folder,
            nextPageToken: response.data.nextPageToken,
        });
    } catch (error: any) {
        console.error('Files fetch error:', error);
        return NextResponse.json(
            {error: error.message || 'Failed to fetch files'},
            {status: error.code || 500}
        );
    }
}
export async function POST(req: NextRequest) {
    try {
        const drive = await getDriveClient();
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        const fileBuffer = await file.arrayBuffer();
        const fileStream = new Readable();
        fileStream.push(Buffer.from(fileBuffer));
        fileStream.push(null);
        const fileMetadata = {
            name: file.name,
            parents: folderId ? [folderId] : undefined
        };
        const media = {
            mimeType: file.type,
            body: fileStream
        };
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, mimeType, modifiedTime, size, webViewLink',
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload file' },
            { status: error.code || 500 }
        );
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401});
        }
        const {fileId} = await req.json();
        if (!fileId) {
            return NextResponse.json({error: 'File ID is required'}, {status: 400});
        }
        const drive = await getDriveClient();
        await drive.files.delete({
            fileId,
            supportsAllDrives: true
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
