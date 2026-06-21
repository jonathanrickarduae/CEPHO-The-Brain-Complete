import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2,
  Calendar,
  Sparkles,
  User,
  Image,
  FileText,
  ArrowLeft,
  Download,
  CheckCircle2
} from 'lucide-react';
import { useLocation } from 'wouter';
import { ContentCalendar } from '@/components/ContentCalendar';
import { CaptionGenerator } from '@/components/CaptionGenerator';
import { BioTemplates } from '@/components/BioTemplates';
import { ImageSpecifications } from '@/components/ImageSpecifications';

/**
 * Social Media Blueprint Page
 * 
 * Comprehensive social media planning and content creation hub that integrates:
 * - Content Calendar for scheduling posts
 * - AI Caption Generator for platform-optimized captions
 * - Bio Templates for profile optimization
 * - Image Specifications for correct sizing
 */

export default function SocialMediaBlueprint() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('calendar');

  const tabs = [
    { id: 'calendar', label: 'Content Calendar', icon: Calendar, description: 'Plan and schedule your posts' },
    { id: 'captions', label: 'Caption Generator', icon: Sparkles, description: 'AI-powered captions' },
    { id: 'bios', label: 'Bio Templates', icon: User, description: 'Profile optimization' },
    { id: 'images', label: 'Image Specs', icon: Image, description: 'Size guidelines' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/library')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <Share2 className="w-7 h-7 text-pink-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Social Media Blueprint</h1>
                <p className="text-muted-foreground">
                  Plan, create, and optimize your social media presence
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 bg-gray-900/30">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  className={activeTab === tab.id ? 'bg-gradient-to-r from-pink-500 to-purple-500' : ''}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  Content Calendar
                </CardTitle>
                <CardDescription>
                  Plan and schedule your social media content across all platforms
                </CardDescription>
              </CardHeader>
            </Card>
            <ContentCalendar />
          </div>
        )}

        {activeTab === 'captions' && (
          <CaptionGenerator />
        )}

        {activeTab === 'bios' && (
          <BioTemplates />
        )}

        {activeTab === 'images' && (
          <ImageSpecifications />
        )}
      </div>
    </div>
  );
}
