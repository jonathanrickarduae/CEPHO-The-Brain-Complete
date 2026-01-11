import { useState } from 'react';
import {
  Presentation, ChevronLeft, ChevronRight, Plus, Trash2,
  Edit2, Check, X, Sparkles, RefreshCw, Download, Play,
  Type, Image, BarChart3, List, Quote, Layout, Palette
} from 'lucide-react';
import { BrandSelector } from './BrandKit';

interface Slide {
  id: string;
  type: 'title' | 'content' | 'bullets' | 'image' | 'chart' | 'quote' | 'split';
  title: string;
  content?: string;
  bullets?: string[];
  imageUrl?: string;
  approved: boolean;
  feedback?: string;
}

interface PresentationProject {
  id: string;
  name: string;
  brandId: string;
  slides: Slide[];
  createdAt: Date;
  status: 'draft' | 'in-progress' | 'complete';
}

export function PresentationBuilder() {
  const [project, setProject] = useState<PresentationProject>({
    id: 'pres-1',
    name: 'Q1 Strategy Presentation',
    brandId: 'celadon',
    slides: [],
    createdAt: new Date(),
    status: 'draft'
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefDescription, setBriefDescription] = useState('');
  const [showSlideOptions, setShowSlideOptions] = useState(false);

  const slideTypes = [
    { type: 'title', label: 'Title Slide', icon: Type, desc: 'Opening slide with main title' },
    { type: 'content', label: 'Content', icon: Layout, desc: 'Text-focused slide' },
    { type: 'bullets', label: 'Bullet Points', icon: List, desc: 'Key points list' },
    { type: 'image', label: 'Image', icon: Image, desc: 'Visual-focused slide' },
    { type: 'chart', label: 'Chart/Data', icon: BarChart3, desc: 'Data visualisation' },
    { type: 'quote', label: 'Quote', icon: Quote, desc: 'Highlighted quote' },
  ];

  const generateNextSlide = () => {
    if (!briefDescription.trim() && project.slides.length === 0) return;

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const slideNumber = project.slides.length + 1;
      let newSlide: Slide;

      if (slideNumber === 1) {
        newSlide = {
          id: `slide-${slideNumber}`,
          type: 'title',
          title: briefDescription || 'Q1 Strategy Overview',
          content: 'Quarterly Business Review',
          approved: false
        };
      } else if (slideNumber === 2) {
        newSlide = {
          id: `slide-${slideNumber}`,
          type: 'bullets',
          title: 'Key Objectives',
          bullets: [
            'Revenue growth target: 25%',
            'Market expansion into 3 new regions',
            'Product launch: Phase 2 features',
            'Team scaling: 15 new hires'
          ],
          approved: false
        };
      } else if (slideNumber === 3) {
        newSlide = {
          id: `slide-${slideNumber}`,
          type: 'chart',
          title: 'Performance Metrics',
          content: 'Q4 vs Q1 comparison showing 18% improvement',
          approved: false
        };
      } else {
        newSlide = {
          id: `slide-${slideNumber}`,
          type: 'content',
          title: `Section ${slideNumber - 2}`,
          content: 'Generated content based on your presentation brief and previous slides.',
          approved: false
        };
      }

      setProject(prev => ({
        ...prev,
        slides: [...prev.slides, newSlide],
        status: 'in-progress'
      }));
      setCurrentSlideIndex(project.slides.length);
      setIsGenerating(false);
    }, 1500);
  };

  const approveSlide = (slideId: string) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map(s => 
        s.id === slideId ? { ...s, approved: true } : s
      )
    }));
  };

  const rejectSlide = (slideId: string, feedback: string) => {
    setProject(prev => ({
      ...prev,
      slides: prev.slides.map(s => 
        s.id === slideId ? { ...s, feedback } : s
      )
    }));
  };

  const regenerateSlide = (slideId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setProject(prev => ({
        ...prev,
        slides: prev.slides.map(s => 
          s.id === slideId ? { ...s, approved: false, feedback: undefined } : s
        )
      }));
      setIsGenerating(false);
    }, 1500);
  };

  const currentSlide = project.slides[currentSlideIndex];
  const approvedCount = project.slides.filter(s => s.approved).length;

  // Brand colours (would come from BrandKit in production)
  const brandColors = {
    celadon: { primary: '#10B981', bg: '#0F172A', text: '#F8FAFC' },
    boundless: { primary: '#8B5CF6', bg: '#1E1B4B', text: '#F8FAFC' },
    personal: { primary: '#3B82F6', bg: '#0F172A', text: '#F8FAFC' },
  };
  const colors = brandColors[project.brandId as keyof typeof brandColors] || brandColors.celadon;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Presentation className="w-5 h-5 text-white" />
          </div>
          <div>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-bold text-foreground bg-transparent border-none focus:outline-none"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{project.slides.length} slides</span>
              <span>•</span>
              <span>{approvedCount} approved</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BrandSelector 
            selectedBrandId={project.brandId}
            onSelect={(id) => setProject(prev => ({ ...prev, brandId: id }))}
          />
          <button className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
            <Play className="w-4 h-4" />
            Preview
          </button>
          <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Slide Thumbnails */}
        <div className="w-48 border-r border-border p-4 overflow-auto">
          <div className="space-y-2">
            {project.slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(index)}
                className={`w-full aspect-video rounded-lg border-2 transition-all relative overflow-hidden ${
                  index === currentSlideIndex
                    ? 'border-primary'
                    : slide.approved
                    ? 'border-green-500/50'
                    : 'border-border hover:border-gray-600'
                }`}
                style={{ backgroundColor: colors.bg }}
              >
                <div className="absolute inset-0 p-2">
                  <p className="text-[8px] font-bold truncate" style={{ color: colors.primary }}>
                    {slide.title}
                  </p>
                </div>
                <span className="absolute bottom-1 left-1 text-[10px] text-muted-foreground">
                  {index + 1}
                </span>
                {slide.approved && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            ))}

            {/* Add Slide Button */}
            <button
              onClick={() => setShowSlideOptions(true)}
              className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-600 transition-colors flex items-center justify-center"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {project.slides.length === 0 ? (
            /* Initial State - Brief Input */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-lg w-full">
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-foreground mb-2">Start Your Presentation</h2>
                  <p className="text-muted-foreground">
                    Describe what you want to present. Slides will be generated one at a time for your review.
                  </p>
                </div>
                <textarea
                  value={briefDescription}
                  onChange={(e) => setBriefDescription(e.target.value)}
                  placeholder="E.g., Q1 strategy presentation for the board. Cover revenue targets, market expansion plans, and team growth. Professional tone, data-driven."
                  className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary"
                />
                <button
                  onClick={generateNextSlide}
                  disabled={!briefDescription.trim() || isGenerating}
                  className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Slide 1...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate First Slide
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Slide Editor */
            <>
              {/* Slide Preview */}
              <div className="flex-1 p-8 flex items-center justify-center">
                <div 
                  className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl overflow-hidden"
                  style={{ backgroundColor: colors.bg }}
                >
                  {currentSlide && (
                    <div className="h-full p-12 flex flex-col">
                      {currentSlide.type === 'title' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                          <h1 
                            className="text-4xl font-bold mb-4"
                            style={{ color: colors.primary }}
                          >
                            {currentSlide.title}
                          </h1>
                          {currentSlide.content && (
                            <p className="text-xl" style={{ color: colors.text }}>
                              {currentSlide.content}
                            </p>
                          )}
                        </div>
                      )}

                      {currentSlide.type === 'bullets' && (
                        <>
                          <h2 
                            className="text-2xl font-bold mb-8"
                            style={{ color: colors.primary }}
                          >
                            {currentSlide.title}
                          </h2>
                          <ul className="space-y-4">
                            {currentSlide.bullets?.map((bullet, i) => (
                              <li 
                                key={i}
                                className="flex items-start gap-3 text-lg"
                                style={{ color: colors.text }}
                              >
                                <span 
                                  className="w-2 h-2 rounded-full mt-2.5 flex-shrink-0"
                                  style={{ backgroundColor: colors.primary }}
                                />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {currentSlide.type === 'content' && (
                        <>
                          <h2 
                            className="text-2xl font-bold mb-6"
                            style={{ color: colors.primary }}
                          >
                            {currentSlide.title}
                          </h2>
                          <p className="text-lg leading-relaxed" style={{ color: colors.text }}>
                            {currentSlide.content}
                          </p>
                        </>
                      )}

                      {currentSlide.type === 'chart' && (
                        <>
                          <h2 
                            className="text-2xl font-bold mb-6"
                            style={{ color: colors.primary }}
                          >
                            {currentSlide.title}
                          </h2>
                          <div className="flex-1 flex items-center justify-center">
                            <div className="w-full h-48 bg-gray-800/50 rounded-xl flex items-center justify-center">
                              <BarChart3 className="w-16 h-16 text-muted-foreground" />
                            </div>
                          </div>
                          {currentSlide.content && (
                            <p className="text-sm mt-4 text-center" style={{ color: colors.text }}>
                              {currentSlide.content}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Controls */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  {/* Navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Slide {currentSlideIndex + 1} of {project.slides.length}
                    </span>
                    <button
                      onClick={() => setCurrentSlideIndex(Math.min(project.slides.length - 1, currentSlideIndex + 1))}
                      disabled={currentSlideIndex === project.slides.length - 1}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Actions */}
                  {currentSlide && !currentSlide.approved && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => regenerateSlide(currentSlide.id)}
                        disabled={isGenerating}
                        className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                      </button>
                      <button
                        onClick={() => rejectSlide(currentSlide.id, 'Needs revision')}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Revise
                      </button>
                      <button
                        onClick={() => approveSlide(currentSlide.id)}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  )}

                  {currentSlide?.approved && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Approved
                      </span>
                      <button
                        onClick={generateNextSlide}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Next Slide
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Slide Type Selection Modal */}
      {showSlideOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add Slide</h2>
            <div className="grid grid-cols-2 gap-3">
              {slideTypes.map(st => (
                <button
                  key={st.type}
                  onClick={() => {
                    setShowSlideOptions(false);
                    generateNextSlide();
                  }}
                  className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors text-left"
                >
                  <st.icon className="w-6 h-6 text-primary mb-2" />
                  <p className="font-medium text-foreground text-sm">{st.label}</p>
                  <p className="text-xs text-muted-foreground">{st.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSlideOptions(false)}
              className="w-full mt-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
