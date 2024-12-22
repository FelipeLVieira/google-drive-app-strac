// app/api/drive/[fileId]/route.ts
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {getDriveClient} from "@/lib/drive-client";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";


export async function GET(
    request: NextRequest
) {
    const fileId = request.nextUrl.pathname.split('/').pop();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        if (!fileId) {
            return NextResponse.json({error: "File ID is required"}, {status: 400});
        }

        const drive = await getDriveClient();

        // Get file metadata first
        const file = await drive.files.get({
            fileId: fileId,
            fields: 'id, name, mimeType',
            supportsAllDrives: true
        });

        // Get the actual file
        const response = await drive.files.get(
            {
                fileId: fileId,
                alt: 'media',
                supportsAllDrives: true,
                acknowledgeAbuse: true
            },
            {responseType: 'stream'}
        );

        const stream = response.data as unknown as ReadableStream;
        return new NextResponse(stream, {
            headers: {
                'Content-Type': file.data.mimeType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${file.data.name}"`,
            },
        });
    } catch (error: any) {
        console.error('Download Error:', error);
        return NextResponse.json(
            {error: error.message || "Download failed"},
            {status: error.code || 500}
        );
    }
}

export async function DELETE(
    request: NextRequest
) {
    const fileId = request.nextUrl.pathname.split('/').pop();

    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        if (!fileId) {
            return NextResponse.json({error: "File ID is required"}, {status: 400});
        }

        const drive = await getDriveClient();
        await drive.files.delete({
            fileId: fileId,
            supportsAllDrives: true
        });

        return NextResponse.json({success: true});
    } catch (error: any) {
        console.error('Delete Error:', error);
        return NextResponse.json(
            {error: error.message || "Delete failed"},
            {status: error.code || 500}
        );
    }
}