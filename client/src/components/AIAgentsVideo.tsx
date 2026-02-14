import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, BookOpen } from "lucide-react";

export default function AIAgentsVideo() {
  const [isPlaying, setIsPlaying] = React.useState(false);

  const videoAssets = [
    {
      title: "Title Card",
      image: "/video-assets/01-title-card.png",
      description: "Introduction to CEPHO's 50 AI Agents"
    },
    {
      title: "Agent Categories",
      image: "/video-assets/02-agent-categories.png",
      description: "7 specialized categories with 50 total agents"
    },
    {
      title: "Self-Improvement Cycle",
      image: "/video-assets/03-self-improvement-cycle.png",
      description: "How agents learn and improve daily"
    },
    {
      title: "Performance Growth",
      image: "/video-assets/04-performance-improvement.png",
      description: "90-day performance improvement tracking"
    },
    {
      title: "Chief of Staff Orchestration",
      image: "/video-assets/05-chief-of-staff-orchestration.png",
      description: "How the Chief of Staff coordinates all agents"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">
              Understanding AI Agents
            </h3>
            <p className="text-gray-300 mb-4">
              Learn how CEPHO's 50 specialized AI agents work together to automate your business,
              improve daily, and deliver world-class results. This educational video explains
              the technology, benefits, and real-world applications.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {isPlaying ? 'Pause Video' : 'Watch Video (7 min)'}
              </Button>
              <Button variant="outline" className="border-gray-600">
                <Download className="w-4 h-4 mr-2" />
                Download Script
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Video Sections Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoAssets.map((asset, index) => (
          <Card key={index} className="overflow-hidden bg-gray-800/50 border-gray-700">
            <div className="aspect-video bg-gray-900 relative group">
              <img 
                src={asset.image} 
                alt={asset.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-white mb-1">{asset.title}</h4>
              <p className="text-sm text-gray-400">{asset.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Key Takeaways */}
      <Card className="p-6 bg-gray-800/30 border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">50 Specialized Agents</p>
              <p className="text-sm text-gray-400">Across 7 categories, each world-class in their domain</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Daily Self-Improvement</p>
              <p className="text-sm text-gray-400">Agents research, learn, and propose enhancements</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Chief of Staff Orchestration</p>
              <p className="text-sm text-gray-400">Coordinates all agents and approves improvements</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <p className="text-white font-medium">Continuous Learning</p>
              <p className="text-sm text-gray-400">Performance improves 15-20% every 30 days</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
