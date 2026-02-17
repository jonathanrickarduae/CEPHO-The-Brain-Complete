import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText,
  Copy,
  Check,
  Info,
  Calendar,
  Tag,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Document Naming Convention: [Date]-[Type]-[Description]-[Version]
 * Example: 2026-01-18-MEMO-Investment-Strategy-v2
 */

interface DocumentNamingProps {
  onGenerate?: (filename: string) => void;
}

const documentTypes = [
  { value: 'MEMO', label: 'Memo', description: 'Internal memorandum' },
  { value: 'REPORT', label: 'Report', description: 'Analysis or findings report' },
  { value: 'DECK', label: 'Deck', description: 'Presentation slides' },
  { value: 'PROPOSAL', label: 'Proposal', description: 'Business proposal' },
  { value: 'CONTRACT', label: 'Contract', description: 'Legal agreement' },
  { value: 'BRIEF', label: 'Brief', description: 'Project or creative brief' },
  { value: 'PLAN', label: 'Plan', description: 'Strategic or project plan' },
  { value: 'ANALYSIS', label: 'Analysis', description: 'Data or market analysis' },
  { value: 'REVIEW', label: 'Review', description: 'Review document' },
  { value: 'NOTES', label: 'Notes', description: 'Meeting or research notes' },
  { value: 'TEMPLATE', label: 'Template', description: 'Reusable template' },
  { value: 'CHECKLIST', label: 'Checklist', description: 'Task or process checklist' }
];

export function DocumentNaming({ onGenerate }: DocumentNamingProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('MEMO');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1');
  const [copied, setCopied] = useState(false);

  const generatedName = useMemo(() => {
    const formattedDate = date.replace(/-/g, '-');
    const formattedDesc = description
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    
    if (!formattedDesc) {
      return `${formattedDate}-${type}-Untitled-v${version}`;
    }
    
    return `${formattedDate}-${type}-${formattedDesc}-v${version}`;
  }, [date, type, description, version]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Filename copied');
    onGenerate?.(generatedName);
  };

  const examples = [
    '2026-01-18-MEMO-Investment-Strategy-v2',
    '2026-01-15-DECK-Series-A-Pitch-v3',
    '2026-01-10-REPORT-Market-Analysis-Q1-v1',
    '2026-01-08-PROPOSAL-Partnership-Agreement-v1',
    '2026-01-05-PLAN-Go-To-Market-2026-v2'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#E91E8C]" />
            Document Naming Convention
          </CardTitle>
          <CardDescription>
            Standard format: [Date]-[Type]-[Description]-[Version]
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Format Explanation */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Calendar className="w-3 h-3 mr-1" />
              YYYY-MM-DD
            </Badge>
            <span className="text-muted-foreground">-</span>
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <Tag className="w-3 h-3 mr-1" />
              TYPE
            </Badge>
            <span className="text-muted-foreground">-</span>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              <FileText className="w-3 h-3 mr-1" />
              Description
            </Badge>
            <span className="text-muted-foreground">-</span>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Hash className="w-3 h-3 mr-1" />
              vX
            </Badge>
          </div>

          {/* Generator Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>
                      {dt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Description</Label>
              <Input
                placeholder="e.g., Investment Strategy"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Version</Label>
              <Input
                type="number"
                min="1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Name */}
      <Card className="bg-gradient-to-r from-[#E91E8C]/10 to-purple-500/10 border-[#E91E8C]/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Generated Filename:</p>
              <p className="text-lg font-mono text-white break-all">{generatedName}</p>
            </div>
            <Button onClick={copyToClipboard} className="bg-[#E91E8C] hover:bg-[#E91E8C]/80">
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Types Reference */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Document Types Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {documentTypes.map(dt => (
              <div 
                key={dt.value}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all',
                  type === dt.value 
                    ? 'bg-[#E91E8C]/20 border-[#E91E8C]/50' 
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                )}
                onClick={() => setType(dt.value)}
              >
                <p className="font-mono text-sm text-white">{dt.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{dt.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg"
              >
                <code className="text-sm text-white font-mono">{example}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(example);
                    toast.success('Example copied');
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Naming Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-green-400 font-medium">✓ Do:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Use hyphens to separate words</li>
                <li>• Keep descriptions concise (2-4 words)</li>
                <li>• Increment version for each revision</li>
                <li>• Use consistent capitalization</li>
                <li>• Include project name if relevant</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-red-400 font-medium">✗ Don't:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Use spaces or special characters</li>
                <li>• Use "final" or "latest" (use versions)</li>
                <li>• Make descriptions too long</li>
                <li>• Use inconsistent date formats</li>
                <li>• Skip version numbers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DocumentNaming;
