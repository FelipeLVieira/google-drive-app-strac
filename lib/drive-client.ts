// lib/drive-client.ts
import {google} from "googleapis";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";

const GOOGLE_DRIVE_SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
].join(' ');
export const getDriveClient = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        throw new Error("Not authenticated");
    }
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
        access_token: session.accessToken,
        scope: GOOGLE_DRIVE_SCOPES
    });
    return google.drive({
        version: "v3",
        auth: oauth2Client,
    });
};