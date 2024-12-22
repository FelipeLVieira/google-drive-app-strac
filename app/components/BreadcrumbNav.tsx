// app/components/BreadcrumbNav.tsx
import {ChevronRight, Home} from 'lucide-react';
import {Button} from '@/components/ui/button';

interface BreadcrumbNavProps {
    path: { id: string; name: string }[];
    onNavigate: (folderId: string | null) => void;
}

/**
 * Navigation component showing current folder path
 * Allows traversing back through folder hierarchy
 *
 * @param path - Array of folder objects representing current path
 * @param onNavigate - Callback function when navigating to a folder
 */
export function BreadcrumbNav({path, onNavigate}: BreadcrumbNavProps) {
    return (
        <div className="flex items-center gap-1 mb-4 overflow-x-auto p-2 bg-secondary/30 rounded-md">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(null)}
                className="flex items-center gap-1"
            >
                <Home className="h-4 w-4"/>
                My Drive
            </Button>

            {path.map((folder) => (
                <div key={folder.id} className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-1"/>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate(folder.id)}
                    >
                        {folder.name}
                    </Button>
                </div>
            ))}
        </div>
    );
}