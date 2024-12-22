// lib/drive-client.ts
import {google} from "googleapis";
import {getServerSession} from "next-auth/next";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";

export const getDriveClient = async () => {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        throw new Error("Not authenticated");
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
        access_token: session.accessToken,
        // Update scope to include full drive access
        scope: 'https://www.googleapis.com/auth/drive'
    });

    return google.drive({
        version: "v3",
        auth: oauth2Client,
    });
};