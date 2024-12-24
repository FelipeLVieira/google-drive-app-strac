// __tests__/api/drive.test.ts
import {getDriveClient} from '@/lib/drive-client';
import {getServerSession} from 'next-auth/next';
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn()
}));
jest.mock('googleapis', () => ({
    google: {
        auth: {
            OAuth2: jest.fn().mockImplementation(() => ({
                setCredentials: jest.fn()
            }))
        },
        drive: jest.fn().mockImplementation(() => ({
            files: {
                list: jest.fn(),
                get: jest.fn(),
                delete: jest.fn()
            }
        }))
    }
}));
describe('Drive API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('handles basic request', () => {
        const req = new Request('http://localhost:3000/api/drive/123');
        expect(req.url).toBe('http://localhost:3000/api/drive/123');
    });
    it('throws error when not authenticated', async () => {
        (getServerSession as jest.Mock).mockResolvedValueOnce(null);
        await expect(getDriveClient()).rejects.toThrow('Not authenticated');
    });
    it('creates drive client with valid session', async () => {
        const mockSession = {
            accessToken: 'mock-token',
            user: {email: 'test@example.com'}
        };
        (getServerSession as jest.Mock).mockResolvedValueOnce(mockSession);
        const client = await getDriveClient();
        expect(client).toBeDefined();
    });
});