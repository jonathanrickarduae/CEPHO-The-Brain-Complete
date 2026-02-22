import { useState } from 'react';
import {
  Palette, Type, Image, Plus, Edit2, Trash2, Check,
  Copy, Download, Upload, Eye, ChevronDown, Folder,
  FileText, Video, Presentation, Globe
} from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  templates: {
    presentation: boolean;
    document: boolean;
    video: boolean;
    email: boolean;
  };
  createdAt: Date;
  isDefault?: boolean;
}

export function BrandKitManager() {
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: 'celadon',
      name: 'Project A',
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        accent: '#34D399',
        background: '#0F172A',
        text: '#F8FAFC'
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      templates: { presentation: true, document: true, video: true, email: true },
      createdAt: new Date(),
      isDefault: true
    },
    {
      id: 'boundless',
      name: 'Project B',
      colors: {
        primary: '#8B5CF6',
        secondary: '#7C3AED',
        accent: '#A78BFA',
        background: '#1E1B4B',
        text: '#F8FAFC'
      },
      fonts: { heading: 'Poppins', body: 'Inter' },
      templates: { presentation: true, document: true, video: false, email: true },
      createdAt: new Date()
    },
    {
      id: 'personal',
      name: 'Personal',
      colors: {
        primary: '#3B82F6',
        secondary: '#2563EB',
        accent: '#60A5FA',
        background: '#0F172A',
        text: '#F8FAFC'
      },
      fonts: { heading: 'Inter', body: 'Inter' },
      templates: { presentation: true, document: true, video: true, email: true },
      createdAt: new Date()
    }
  ]);

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(brands[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const ColorSwatch = ({ color, label, editable = false }: { color: string; label: string; editable?: boolean }) => (
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-lg border border-gray-600 cursor-pointer hover:scale-105 transition-transform"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground font-mono">{color}</p>
      </div>
      {editable && (
        <button className="ml-auto p-1.5 hover:bg-gray-700 rounded transition-colors">
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full flex">
      {/* Sidebar - Brand List */}
      <div className="w-64 border-r border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Brands</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-2">
          {brands.map(brand => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(brand)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors ${
                selectedBrand?.id === brand.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: brand.colors.primary }}
              >
                {brand.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{brand.name}</p>
                {brand.isDefault && (
                  <span className="text-xs text-primary">Default</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {selectedBrand && (
        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: selectedBrand.colors.primary }}
              >
                {selectedBrand.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{selectedBrand.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Created {selectedBrand.createdAt.toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Colors */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Colours</h3>
              </div>
              <div className="space-y-4">
                <ColorSwatch color={selectedBrand.colors.primary} label="Primary" editable={isEditing} />
                <ColorSwatch color={selectedBrand.colors.secondary} label="Secondary" editable={isEditing} />
                <ColorSwatch color={selectedBrand.colors.accent} label="Accent" editable={isEditing} />
                <ColorSwatch color={selectedBrand.colors.background} label="Background" editable={isEditing} />
                <ColorSwatch color={selectedBrand.colors.text} label="Text" editable={isEditing} />
              </div>
            </div>

            {/* Typography */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Typography</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Heading Font</p>
                  <p className="text-xl font-bold text-foreground" style={{ fontFamily: selectedBrand.fonts.heading }}>
                    {selectedBrand.fonts.heading}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: selectedBrand.fonts.heading }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Body Font</p>
                  <p className="text-xl text-foreground" style={{ fontFamily: selectedBrand.fonts.body }}>
                    {selectedBrand.fonts.body}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2" style={{ fontFamily: selectedBrand.fonts.body }}>
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Logo</h3>
              </div>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                {selectedBrand.logo ? (
                  <img src={selectedBrand.logo} alt={selectedBrand.name} className="max-h-24 mx-auto" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload logo</p>
                    <p className="text-xs text-muted-foreground/70">PNG, SVG recommended</p>
                  </>
                )}
              </div>
            </div>

            {/* Templates */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Templates</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'presentation', label: 'Presentations', icon: Presentation },
                  { key: 'document', label: 'Documents', icon: FileText },
                  { key: 'video', label: 'Videos', icon: Video },
                  { key: 'email', label: 'Emails', icon: Globe },
                ].map(item => (
                  <div
                    key={item.key}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedBrand.templates[item.key as keyof typeof selectedBrand.templates]
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-gray-800/50 border-gray-700'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mb-2 ${
                      selectedBrand.templates[item.key as keyof typeof selectedBrand.templates]
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`} />
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedBrand.templates[item.key as keyof typeof selectedBrand.templates]
                        ? 'Configured'
                        : 'Not set up'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Preview</h3>
            </div>
            <div 
              className="rounded-xl p-8"
              style={{ backgroundColor: selectedBrand.colors.background }}
            >
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: selectedBrand.colors.primary, fontFamily: selectedBrand.fonts.heading }}
              >
                {selectedBrand.name} Presentation
              </h2>
              <p 
                className="mb-4"
                style={{ color: selectedBrand.colors.text, fontFamily: selectedBrand.fonts.body }}
              >
                This is how your content will appear using the {selectedBrand.name} brand guidelines.
              </p>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: selectedBrand.colors.primary, color: selectedBrand.colors.background }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium border"
                  style={{ borderColor: selectedBrand.colors.accent, color: selectedBrand.colors.accent }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Add New Brand</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g., Company Name"
                  className="w-full mt-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Primary Colour</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    defaultValue="#3B82F6"
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue="#3B82F6"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-foreground font-mono text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Create Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Brand selector dropdown for use in other components
export function BrandSelector({ 
  selectedBrandId, 
  onSelect 
}: { 
  selectedBrandId?: string; 
  onSelect: (brandId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const brands = [
    { id: 'celadon', name: 'Project A', color: '#10B981' },
    { id: 'boundless', name: 'Project B', color: '#8B5CF6' },
    { id: 'personal', name: 'Personal', color: '#3B82F6' },
  ];

  const selected = brands.find(b => b.id === selectedBrandId) || brands[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
      >
        <div 
          className="w-4 h-4 rounded"
          style={{ backgroundColor: selected.color }}
        />
        <span className="text-sm text-foreground">{selected.name}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => { onSelect(brand.id); setIsOpen(false); }}
                className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                  brand.id === selectedBrandId ? 'bg-gray-800' : ''
                }`}
              >
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: brand.color }}
                />
                <span className="text-sm text-foreground">{brand.name}</span>
                {brand.id === selectedBrandId && (
                  <Check className="w-4 h-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
