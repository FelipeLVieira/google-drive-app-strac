// __tests__/lib/drive-client.test.ts
import {getDriveClient} from '@/lib/drive-client';
import {getServerSession} from 'next-auth/next';
import {google} from 'googleapis';
jest.mock('next-auth/next');
jest.mock('googleapis');
describe('Drive Client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('creates drive client with valid credentials', async () => {
        const mockSession = {
            accessToken: 'mock-token',
            user: {email: 'test@example.com'}
        };
        (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
        const client = await getDriveClient();
        expect(client).toBeDefined();
        expect(google.auth.OAuth2).toHaveBeenCalled();
    });
    it('throws error without session', async () => {
        (getServerSession as jest.Mock).mockResolvedValueOnce(null);
        await expect(getDriveClient()).rejects.toThrow('Not authenticated');
    });
    it('throws error without access token', async () => {
        const mockSession = {
            user: {email: 'test@example.com'}
        };
        (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
        await expect(getDriveClient()).rejects.toThrow('Not authenticated');
    });
});