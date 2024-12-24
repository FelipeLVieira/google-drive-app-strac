// __tests__/components/FilePreview.test.tsx
import {render, screen} from '@testing-library/react';
import FilePreview from '@/components/FilePreview';
describe('FilePreview Component', () => {
    const mockFile = {
        id: '1',
        name: 'test.pdf',
        mimeType: 'application/pdf',
    };
    it('renders PDF preview', () => {
        render(
            <FilePreview
                file={mockFile}
                onClose={jest.fn()}
                isOpen={true}
            />
        );
        expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
    it('handles unsupported file types', () => {
        render(
            <FilePreview
                file={{
                    ...mockFile,
                    mimeType: 'unsupported/type'
                }}
                onClose={jest.fn()}
                isOpen={true}
            />
        );
        expect(screen.getByText(/Preview not available/)).toBeInTheDocument();
    });
    it('handles null file prop', () => {
        render(
            <FilePreview
                file={null}
                onClose={jest.fn()}
                isOpen={true}
            />
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});