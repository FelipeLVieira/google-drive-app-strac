// app/components/BreadcrumbNav.tsx
import {ChevronRight, Home} from 'lucide-react';
import {Button} from '@/components/ui/button';
interface BreadcrumbNavProps {
    path: { id: string; name: string }[];
    onNavigate: (folderId: string | null) => void;
}
export function BreadcrumbNav({path, onNavigate}: BreadcrumbNavProps) {
    return (
        <nav
            className="flex items-center gap-1 mb-4 p-3 bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-lg">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(null)}
                className="flex items-center gap-2 text-gray-200 hover:text-white hover:bg-gray-700/50 transition-colors"
            >
                <Home className="h-4 w-4"/>
                <span className="font-medium">My Drive</span>
            </Button>
            {path.map((folder) => (
                <div key={folder.id} className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-500 mx-2"/>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate(folder.id)}
                        className="text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors font-medium"
                    >
                        {folder.name}
                    </Button>
                </div>
            ))}
        </nav>
    );
}