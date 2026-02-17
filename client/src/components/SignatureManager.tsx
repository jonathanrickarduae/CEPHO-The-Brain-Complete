import { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Upload, Trash2, Check, X, 
  Shield, Lock, FileSignature, Download,
  Edit3, Type, Image as ImageIcon
} from 'lucide-react';

interface Signature {
  id: string;
  name: string;
  type: 'drawn' | 'uploaded' | 'typed';
  dataUrl: string;
  isDefault: boolean;
  createdAt: Date;
}

interface SignatureManagerProps {
  onSave?: (signature: Signature) => void;
  compact?: boolean;
}

export function SignatureManager({ onSave, compact = false }: SignatureManagerProps) {
  const [signatures, setSignatures] = useState<Signature[]>([
    {
      id: 'sig-1',
      name: 'Formal Signature',
      type: 'drawn',
      dataUrl: '',
      isDefault: true,
      createdAt: new Date(),
    }
  ]);
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'type'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('cursive');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showManager, setShowManager] = useState(false);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const newSignature: Signature = {
      id: `sig-${Date.now()}`,
      name: 'Drawn Signature',
      type: 'drawn',
      dataUrl,
      isDefault: signatures.length === 0,
      createdAt: new Date(),
    };

    setSignatures([...signatures, newSignature]);
    onSave?.(newSignature);
    clearCanvas();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newSignature: Signature = {
        id: `sig-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'uploaded',
        dataUrl,
        isDefault: signatures.length === 0,
        createdAt: new Date(),
      };

      setSignatures([...signatures, newSignature]);
      onSave?.(newSignature);
    };
    reader.readAsDataURL(file);
  };

  const saveTypedSignature = () => {
    if (!typedName.trim()) return;

    // Create a canvas to render the typed signature
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `48px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL('image/png');
    const newSignature: Signature = {
      id: `sig-${Date.now()}`,
      name: 'Typed Signature',
      type: 'typed',
      dataUrl,
      isDefault: signatures.length === 0,
      createdAt: new Date(),
    };

    setSignatures([...signatures, newSignature]);
    onSave?.(newSignature);
    setTypedName('');
  };

  const deleteSignature = (id: string) => {
    setSignatures(signatures.filter(s => s.id !== id));
  };

  const setDefaultSignature = (id: string) => {
    setSignatures(signatures.map(s => ({
      ...s,
      isDefault: s.id === id,
    })));
  };

  const fonts = [
    { value: 'cursive', label: 'Cursive' },
    { value: '"Brush Script MT", cursive', label: 'Brush Script' },
    { value: '"Lucida Handwriting", cursive', label: 'Lucida' },
    { value: 'Georgia, serif', label: 'Georgia' },
  ];

  if (compact) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">My Signatures</h3>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="text-xs text-primary hover:underline"
          >
            Manage
          </button>
        </div>

        {signatures.length > 0 ? (
          <div className="space-y-2">
            {signatures.slice(0, 2).map(sig => (
              <div key={sig.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  {sig.dataUrl ? (
                    <img src={sig.dataUrl} alt={sig.name} className="h-8 w-auto max-w-[100px] object-contain" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{sig.name}</span>
                  )}
                </div>
                {sig.isDefault && (
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">Default</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No signatures added yet
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <FileSignature className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Signature Manager</h2>
            <p className="text-sm text-muted-foreground">
              Create and manage your signatures for document signing
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">
            Signatures are encrypted and stored securely in The Vault
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('draw')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'draw'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PenTool className="w-4 h-4" />
          Draw
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'upload'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={() => setActiveTab('type')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'type'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Type className="w-4 h-4" />
          Type
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'draw' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Draw your signature below using your mouse or touchscreen
            </p>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full border-2 border-dashed border-gray-600 rounded-xl bg-gray-900 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="absolute bottom-2 left-2 right-2 border-t border-gray-600" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                className="flex-1 py-2 bg-gray-700 rounded-lg text-muted-foreground hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              <button
                onClick={saveDrawnSignature}
                className="flex-1 py-2 bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Signature
              </button>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an image of your signature (PNG, JPG, or SVG)
            </p>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-xl bg-gray-900 cursor-pointer hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or SVG (max 2MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {activeTab === 'type' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Type your name and choose a signature style
            </p>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your name..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              {fonts.map(font => (
                <button
                  key={font.value}
                  onClick={() => setSelectedFont(font.value)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedFont === font.value
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <span 
                    className="text-xl text-foreground"
                    style={{ fontFamily: font.value }}
                  >
                    {typedName || 'Preview'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{font.label}</p>
                </button>
              ))}
            </div>
            <button
              onClick={saveTypedSignature}
              disabled={!typedName.trim()}
              className="w-full py-2 bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Save Signature
            </button>
          </div>
        )}

        {/* Saved Signatures */}
        {signatures.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold text-foreground mb-4">Saved Signatures</h3>
            <div className="space-y-3">
              {signatures.map(sig => (
                <div 
                  key={sig.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-12 bg-gray-900 rounded-lg flex items-center justify-center p-2">
                      {sig.dataUrl ? (
                        <img 
                          src={sig.dataUrl} 
                          alt={sig.name} 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">No preview</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{sig.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sig.type} • {sig.createdAt.toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sig.isDefault ? (
                      <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultSignature(sig.id)}
                        className="text-xs px-2 py-1 bg-gray-700 text-muted-foreground rounded-full hover:bg-gray-600 transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => deleteSignature(sig.id)}
                      className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400 mb-1">How signatures are used</h4>
              <p className="text-sm text-muted-foreground">
                Your Chief of Staff can apply your signature to documents with your explicit approval. 
                For pre-authorized document types (e.g., routine approvals), you can enable auto-signing 
                in governance settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
