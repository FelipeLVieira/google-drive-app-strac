// __tests__/components/FileList.test.tsx
import {fireEvent, render, screen} from '@testing-library/react';
import FileList from '@/components/FileList';
import type {File as DriveFile} from '@/types/api';
describe('FileList Component', () => {
    const mockFiles: DriveFile[] = [
        {
            id: '1',
            name: 'test.pdf',
            mimeType: 'application/pdf',
            modifiedTime: '2024-01-01T00:00:00.000Z',
            size: '1024',
        },
        {
            id: '2',
            name: 'folder',
            mimeType: 'application/vnd.google-apps.folder',
            modifiedTime: '2024-01-01T00:00:00.000Z',
        }
    ];
    const defaultProps = {
        files: mockFiles,
        loading: false,
        error: null,
        sortBy: 'name' as const,
        sortOrder: 'asc' as const,
        onDownload: jest.fn(),
        onDelete: jest.fn(),
        onNavigate: jest.fn(),
        onPreview: jest.fn(),
        onSort: jest.fn(),
    };
    it('renders loading state', () => {
        render(<FileList {...defaultProps} loading={true}/>);
        expect(screen.getByText('Loading your files...')).toBeInTheDocument();
    });
    it('renders error state', () => {
        const errorMessage = 'Failed to load files';
        render(<FileList {...defaultProps} error={errorMessage}/>);
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    it('renders file list correctly', () => {
        render(<FileList {...defaultProps} />);
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
        expect(screen.getByText('folder')).toBeInTheDocument();
    });
    it('handles file actions correctly', () => {
        render(<FileList {...defaultProps} />);
        fireEvent.click(screen.getByText('folder'));
        expect(defaultProps.onNavigate).toHaveBeenCalledWith('2');
        fireEvent.click(screen.getByText('test.pdf'));
        expect(defaultProps.onPreview).toHaveBeenCalledWith(mockFiles[0]);
    });
    it('handles sorting', () => {
        render(<FileList {...defaultProps} />);
        const nameHeader = screen.getByText('Name');
        fireEvent.click(nameHeader);
        expect(defaultProps.onSort).toHaveBeenCalledWith('name', 'desc');
    });
});