import { useState } from 'react';
import type { LibraryDocument } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import { 
  FolderOpen, FileText, Image, BarChart3, Presentation, Search,
  Plus, Upload, Download, Clock, LayoutGrid, List,
  ChevronRight, ChevronLeft, File, ArrowUpRight, BookOpen,
  MessageSquare, User, Trash2, Calendar, Loader2, Eye, FolderPlus
} from 'lucide-react';

// No projects until real ones are added
const projects: any[] = [];

export default function Library() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="h-full flex flex-col bg-background">
      <PageHeader
        title="Library"
        description="Knowledge Base"
        icon={BookOpen}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2"
              disabled
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Upload</span>
            </Button>
            <Button 
              size="sm" 
              className="gap-2 bg-primary hover:bg-primary/90"
              disabled
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New Document</span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your library is empty. Start by creating a project in Project Genesis to organize your documents and knowledge base.
            </p>
            <Button 
              onClick={() => window.location.href = '/project-genesis'}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Start Project Genesis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
