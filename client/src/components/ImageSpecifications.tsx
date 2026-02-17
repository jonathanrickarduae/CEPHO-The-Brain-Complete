import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Copy,
  Check,
  Download,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageSpec {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  fileTypes: string[];
  maxSize: string;
  notes?: string;
}

interface PlatformSpecs {
  id: string;
  name: string;
  icon: typeof Linkedin;
  color: string;
  bgColor: string;
  specs: {
    profile: ImageSpec;
    cover?: ImageSpec;
    post?: ImageSpec;
    story?: ImageSpec;
  };
}

const platformSpecs: PlatformSpecs[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    specs: {
      profile: {
        name: 'Profile Photo',
        width: 400,
        height: 400,
        aspectRatio: '1:1',
        fileTypes: ['JPG', 'PNG', 'GIF'],
        maxSize: '8MB',
        notes: 'Displays as circle, minimum 200x200'
      },
      cover: {
        name: 'Background Photo',
        width: 1584,
        height: 396,
        aspectRatio: '4:1',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '8MB',
        notes: 'Personal profile banner'
      },
      post: {
        name: 'Post Image',
        width: 1200,
        height: 627,
        aspectRatio: '1.91:1',
        fileTypes: ['JPG', 'PNG', 'GIF'],
        maxSize: '5MB',
        notes: 'Optimal for feed visibility'
      }
    }
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    specs: {
      profile: {
        name: 'Profile Photo',
        width: 400,
        height: 400,
        aspectRatio: '1:1',
        fileTypes: ['JPG', 'PNG', 'GIF'],
        maxSize: '2MB',
        notes: 'Displays as circle'
      },
      cover: {
        name: 'Header Photo',
        width: 1500,
        height: 500,
        aspectRatio: '3:1',
        fileTypes: ['JPG', 'PNG', 'GIF'],
        maxSize: '5MB'
      },
      post: {
        name: 'In-Stream Photo',
        width: 1600,
        height: 900,
        aspectRatio: '16:9',
        fileTypes: ['JPG', 'PNG', 'GIF'],
        maxSize: '5MB',
        notes: 'Up to 4 images per tweet'
      }
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-500',
    bgColor: 'bg-blue-600/20',
    specs: {
      profile: {
        name: 'Profile Picture',
        width: 170,
        height: 170,
        aspectRatio: '1:1',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '4MB',
        notes: 'Displays at 170x170 on desktop'
      },
      cover: {
        name: 'Cover Photo',
        width: 820,
        height: 312,
        aspectRatio: '2.63:1',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '4MB',
        notes: 'Displays at 820x312 on desktop'
      },
      post: {
        name: 'Shared Image',
        width: 1200,
        height: 630,
        aspectRatio: '1.91:1',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '4MB'
      },
      story: {
        name: 'Story',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        fileTypes: ['JPG', 'PNG', 'MP4'],
        maxSize: '4MB'
      }
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    specs: {
      profile: {
        name: 'Profile Picture',
        width: 320,
        height: 320,
        aspectRatio: '1:1',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '4MB',
        notes: 'Displays as circle'
      },
      post: {
        name: 'Square Post',
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '4MB',
        notes: 'Also supports 4:5 and 1.91:1'
      },
      story: {
        name: 'Story/Reel',
        width: 1080,
        height: 1920,
        aspectRatio: '9:16',
        fileTypes: ['JPG', 'PNG', 'MP4'],
        maxSize: '4MB'
      }
    }
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    specs: {
      profile: {
        name: 'Channel Icon',
        width: 800,
        height: 800,
        aspectRatio: '1:1',
        fileTypes: ['JPG', 'PNG', 'GIF', 'BMP'],
        maxSize: '4MB',
        notes: 'Displays as circle'
      },
      cover: {
        name: 'Channel Banner',
        width: 2560,
        height: 1440,
        aspectRatio: '16:9',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '6MB',
        notes: 'Safe area: 1546x423 center'
      },
      post: {
        name: 'Video Thumbnail',
        width: 1280,
        height: 720,
        aspectRatio: '16:9',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '2MB'
      }
    }
  },
  {
    id: 'website',
    name: 'Website',
    icon: Globe,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    specs: {
      profile: {
        name: 'Favicon',
        width: 512,
        height: 512,
        aspectRatio: '1:1',
        fileTypes: ['PNG', 'ICO', 'SVG'],
        maxSize: '1MB',
        notes: 'Also create 16x16, 32x32, 180x180 variants'
      },
      cover: {
        name: 'OG Image',
        width: 1200,
        height: 630,
        aspectRatio: '1.91:1',
        fileTypes: ['JPG', 'PNG'],
        maxSize: '5MB',
        notes: 'Used for social sharing previews'
      },
      post: {
        name: 'Hero Image',
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        fileTypes: ['JPG', 'PNG', 'WebP'],
        maxSize: '500KB',
        notes: 'Optimize for web performance'
      }
    }
  }
];

export function ImageSpecifications() {
  const [activePlatform, setActivePlatform] = useState('linkedin');
  const [copiedSpec, setCopiedSpec] = useState<string | null>(null);

  const currentPlatform = platformSpecs.find(p => p.id === activePlatform);

  const copySpec = (spec: ImageSpec) => {
    const text = `${spec.name}: ${spec.width}x${spec.height}px (${spec.aspectRatio})`;
    navigator.clipboard.writeText(text);
    setCopiedSpec(spec.name);
    setTimeout(() => setCopiedSpec(null), 2000);
    toast.success('Specification copied');
  };

  const exportAllSpecs = () => {
    const markdown = `# Social Media Image Specifications

${platformSpecs.map(platform => `
## ${platform.name}

${Object.entries(platform.specs).map(([key, spec]) => `
### ${spec.name}
- **Dimensions:** ${spec.width} x ${spec.height} pixels
- **Aspect Ratio:** ${spec.aspectRatio}
- **File Types:** ${spec.fileTypes.join(', ')}
- **Max Size:** ${spec.maxSize}
${spec.notes ? `- **Notes:** ${spec.notes}` : ''}
`).join('')}
`).join('\n---\n')}

## Quick Reference Table

| Platform | Profile | Cover/Banner | Post |
|----------|---------|--------------|------|
${platformSpecs.map(p => `| ${p.name} | ${p.specs.profile.width}x${p.specs.profile.height} | ${p.specs.cover ? `${p.specs.cover.width}x${p.specs.cover.height}` : 'N/A'} | ${p.specs.post ? `${p.specs.post.width}x${p.specs.post.height}` : 'N/A'} |`).join('\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-specifications.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Specifications exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-[#E91E8C]" />
                Profile & Cover Image Specifications
              </CardTitle>
              <CardDescription>
                Optimal image dimensions for all major platforms
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportAllSpecs}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Platform Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {platformSpecs.map(platform => {
          const Icon = platform.icon;
          return (
            <Button
              key={platform.id}
              variant={activePlatform === platform.id ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-shrink-0',
                activePlatform === platform.id && 'bg-gradient-to-r from-[#E91E8C] to-purple-500'
              )}
              onClick={() => setActivePlatform(platform.id)}
            >
              <Icon className={cn('w-4 h-4 mr-2', activePlatform !== platform.id && platform.color)} />
              {platform.name}
            </Button>
          );
        })}
      </div>

      {/* Platform Specs */}
      {currentPlatform && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(currentPlatform.specs).map(([key, spec]) => {
            const Icon = currentPlatform.icon;
            return (
              <Card key={key} className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <div className={cn('p-1.5 rounded', currentPlatform.bgColor)}>
                        <Icon className={cn('w-4 h-4', currentPlatform.color)} />
                      </div>
                      {spec.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySpec(spec)}
                    >
                      {copiedSpec === spec.name ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Visual Preview */}
                  <div 
                    className="bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden"
                    style={{ 
                      aspectRatio: spec.aspectRatio.replace(':', '/'),
                      maxHeight: '120px'
                    }}
                  >
                    <div className="text-center">
                      <p className="text-lg font-mono text-white">{spec.width} × {spec.height}</p>
                      <p className="text-xs text-muted-foreground">{spec.aspectRatio}</p>
                    </div>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-800/50 rounded">
                      <p className="text-xs text-muted-foreground">Dimensions</p>
                      <p className="text-white font-mono">{spec.width}×{spec.height}px</p>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <p className="text-xs text-muted-foreground">Aspect Ratio</p>
                      <p className="text-white font-mono">{spec.aspectRatio}</p>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <p className="text-xs text-muted-foreground">File Types</p>
                      <p className="text-white text-xs">{spec.fileTypes.join(', ')}</p>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <p className="text-xs text-muted-foreground">Max Size</p>
                      <p className="text-white">{spec.maxSize}</p>
                    </div>
                  </div>

                  {spec.notes && (
                    <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-sm">
                      <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-amber-200 text-xs">{spec.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Reference */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 text-muted-foreground">Platform</th>
                  <th className="text-left py-2 text-muted-foreground">Profile</th>
                  <th className="text-left py-2 text-muted-foreground">Cover/Banner</th>
                  <th className="text-left py-2 text-muted-foreground">Post</th>
                </tr>
              </thead>
              <tbody>
                {platformSpecs.map(platform => {
                  const Icon = platform.icon;
                  return (
                    <tr key={platform.id} className="border-b border-gray-800/50">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('w-4 h-4', platform.color)} />
                          <span className="text-white">{platform.name}</span>
                        </div>
                      </td>
                      <td className="py-2 font-mono text-xs text-white">
                        {platform.specs.profile.width}×{platform.specs.profile.height}
                      </td>
                      <td className="py-2 font-mono text-xs text-white">
                        {platform.specs.cover 
                          ? `${platform.specs.cover.width}×${platform.specs.cover.height}`
                          : '—'
                        }
                      </td>
                      <td className="py-2 font-mono text-xs text-white">
                        {platform.specs.post 
                          ? `${platform.specs.post.width}×${platform.specs.post.height}`
                          : '—'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImageSpecifications;
