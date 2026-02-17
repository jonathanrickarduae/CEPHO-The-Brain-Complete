import { useState } from 'react';
import { 
  Tags, Plus, X, Search, Filter, FileText, 
  Image, Video, Database, Link2, Folder,
  Calendar, User, Building2, Hash, Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'project' | 'type' | 'status' | 'priority' | 'custom';
  count: number;
}

interface Asset {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'data' | 'link' | 'folder';
  project?: string;
  tags: string[];
  createdAt: string;
  modifiedAt: string;
  owner: string;
  size?: string;
}

// Mock data
const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Celadon Capital', color: 'bg-blue-500', category: 'project', count: 24 },
  { id: 't2', name: 'Boundless AI', color: 'bg-green-500', category: 'project', count: 18 },
  { id: 't3', name: 'Perfect DXB', color: 'bg-purple-500', category: 'project', count: 12 },
  { id: 't4', name: 'Financial', color: 'bg-yellow-500', category: 'type', count: 45 },
  { id: 't5', name: 'Legal', color: 'bg-red-500', category: 'type', count: 32 },
  { id: 't6', name: 'Due Diligence', color: 'bg-orange-500', category: 'type', count: 28 },
  { id: 't7', name: 'Confidential', color: 'bg-pink-500', category: 'status', count: 15 },
  { id: 't8', name: 'Draft', color: 'bg-gray-500', category: 'status', count: 8 },
  { id: 't9', name: 'Final', color: 'bg-emerald-500', category: 'status', count: 42 },
  { id: 't10', name: 'High Priority', color: 'bg-red-600', category: 'priority', count: 7 },
  { id: 't11', name: 'Review Needed', color: 'bg-amber-500', category: 'custom', count: 11 },
  { id: 't12', name: 'Q1 2024', color: 'bg-cyan-500', category: 'custom', count: 35 },
];

const MOCK_ASSETS: Asset[] = [
  {
    id: 'a1',
    name: 'Investment_Memo_v3.pdf',
    type: 'document',
    project: 'Celadon Capital',
    tags: ['Celadon Capital', 'Financial', 'Final'],
    createdAt: '2024-01-15',
    modifiedAt: '2024-02-01',
    owner: 'Jonathan',
    size: '2.4 MB'
  },
  {
    id: 'a2',
    name: 'Due_Diligence_Checklist.xlsx',
    type: 'data',
    project: 'Celadon Capital',
    tags: ['Celadon Capital', 'Due Diligence', 'High Priority'],
    createdAt: '2024-01-20',
    modifiedAt: '2024-02-05',
    owner: 'Sarah L.',
    size: '156 KB'
  },
  {
    id: 'a3',
    name: 'NDA_Signed.pdf',
    type: 'document',
    project: 'Boundless AI',
    tags: ['Boundless AI', 'Legal', 'Confidential', 'Final'],
    createdAt: '2024-01-10',
    modifiedAt: '2024-01-10',
    owner: 'Jonathan',
    size: '890 KB'
  },
  {
    id: 'a4',
    name: 'Market_Analysis_Presentation.pptx',
    type: 'document',
    project: 'Perfect DXB',
    tags: ['Perfect DXB', 'Draft', 'Review Needed'],
    createdAt: '2024-02-01',
    modifiedAt: '2024-02-03',
    owner: 'Marcus T.',
    size: '5.2 MB'
  }
];

interface MetadataTaggingProps {
  assetId?: string;
}

export function MetadataTagging({ assetId }: MetadataTaggingProps) {
  const [tags] = useState<Tag[]>(MOCK_TAGS);
  const [assets] = useState<Asset[]>(MOCK_ASSETS);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [activeTab, setActiveTab] = useState<'tags' | 'assets'>('tags');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'data': return Database;
      case 'link': return Link2;
      case 'folder': return Folder;
      default: return FileText;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'project': return 'Projects';
      case 'type': return 'Document Types';
      case 'status': return 'Status';
      case 'priority': return 'Priority';
      case 'custom': return 'Custom Tags';
      default: return 'Other';
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    toast.success(`Tag "${newTagName}" created`);
    setNewTagName('');
    setShowAddTag(false);
  };

  const filteredAssets = assets.filter(asset => {
    if (selectedTags.length > 0 && !selectedTags.some(t => asset.tags.includes(t))) {
      return false;
    }
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Asset Metadata & Tags</h2>
              <p className="text-sm text-muted-foreground">Organize and find assets across all projects</p>
            </div>
            <Button onClick={() => setShowAddTag(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Tag
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Tag Modal */}
      {showAddTag && (
        <Card className="bg-card/60 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddTag}>Create</Button>
              <Button variant="ghost" onClick={() => setShowAddTag(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'tags' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('tags')}
        >
          <Tags className="w-4 h-4 mr-2" />
          Tags ({tags.length})
        </Button>
        <Button
          variant={activeTab === 'assets' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('assets')}
        >
          <FileText className="w-4 h-4 mr-2" />
          Assets ({filteredAssets.length})
        </Button>
      </div>

      {/* Selected Tags Filter */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filtering by:</span>
          {selectedTags.map((tagName) => {
            const tag = tags.find(t => t.name === tagName);
            return (
              <Badge 
                key={tagName}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleTag(tagName)}
              >
                <span className={`w-2 h-2 rounded-full ${tag?.color || 'bg-gray-500'} mr-1`} />
                {tagName}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            );
          })}
          <Button variant="ghost" size="sm" onClick={() => setSelectedTags([])}>
            Clear all
          </Button>
        </div>
      )}

      {/* Tags View */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <Card key={category} className="bg-card/60 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {getCategoryLabel(category)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleTag(tag.name)}
                    >
                      <span className={`w-2 h-2 rounded-full ${tag.color} mr-1`} />
                      {tag.name}
                      <span className="ml-1 text-xs opacity-60">({tag.count})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assets View */}
      {activeTab === 'assets' && (
        <div className="space-y-2">
          {filteredAssets.map((asset) => {
            const TypeIcon = getTypeIcon(asset.type);
            return (
              <Card key={asset.id} className="bg-card/60 border-border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{asset.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{asset.project}</span>
                        <span>•</span>
                        <span>{asset.owner}</span>
                        <span>•</span>
                        <span>{asset.size}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {asset.tags.slice(0, 3).map((tagName) => {
                        const tag = tags.find(t => t.name === tagName);
                        return (
                          <Badge key={tagName} variant="secondary" className="text-xs">
                            <span className={`w-1.5 h-1.5 rounded-full ${tag?.color || 'bg-gray-500'} mr-1`} />
                            {tagName}
                          </Badge>
                        );
                      })}
                      {asset.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{asset.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MetadataTagging;
