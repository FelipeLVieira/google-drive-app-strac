// app/api/drive/route.ts
import {NextRequest, NextResponse} from "next/server";
import {getDriveClient} from "@/lib/drive-client";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import {config} from "@/config";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        const searchParams = request.nextUrl.searchParams;
        const folderId = searchParams.get('folderId');
        const sortBy = searchParams.get('sortBy') || 'name';
        const sortOrder = searchParams.get('sortOrder') || 'asc';

        const drive = await getDriveClient();

        let query = `trashed = false`;
        if (folderId) {
            query += ` and '${folderId}' in parents`;
        } else {
            query += ` and 'root' in parents`;
        }

        let orderBy = '';
        switch (sortBy) {
            case 'name':
                orderBy = `name ${sortOrder}`;
                break;
            case 'modifiedTime':
                orderBy = `modifiedTime ${sortOrder}`;
                break;
            case 'size':
                orderBy = `size ${sortOrder}`;
                break;
            default:
                orderBy = `name ${sortOrder}`;
        }

        const response = await drive.files.list({
            q: query,
            pageSize: config.filesPerPage,
            orderBy,
            fields: 'files(id, name, mimeType, modifiedTime, size)',
            supportsAllDrives: true,
        });

        let folderDetails = null;
        if (folderId) {
            const folder = await drive.files.get({
                fileId: folderId,
                fields: 'id, name',
                supportsAllDrives: true,
            });
            folderDetails = folder.data;
        }

        return NextResponse.json({
            files: response.data.files,
            folder: folderDetails,
        });
    } catch (error: any) {
        console.error('List Error:', error);
        return NextResponse.json(
            {error: error.message || "Failed to fetch files"},
            {status: error.code || 500}
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string;

        if (!file) {
            return NextResponse.json({error: "No file provided"}, {status: 400});
        }

        if (file.size > config.maxFileSize) {
            return NextResponse.json(
                {error: "File size exceeds maximum allowed size"},
                {status: 400}
            );
        }

        const drive = await getDriveClient();
        const fileMetadata = {
            name: file.name,
            ...(folderId && {parents: [folderId]}),
        };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: {
                mimeType: file.type,
                body: buffer,
            },
            fields: 'id, name, mimeType, modifiedTime, size',
            supportsAllDrives: true,
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            {error: error.message || "Upload failed"},
            {status: error.code || 500}
        );
    }
}