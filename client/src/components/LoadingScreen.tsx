import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Animated Brain */}
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 relative">
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-cyan-500/30 animate-pulse" />
          
          {/* Brain icon */}
          <div className="relative z-10 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-2xl shadow-cyan-500/50">
            <Brain className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2">CEPHO.AI</h2>
        <p className="text-gray-400">{message}</p>

        {/* Loading Bar */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 50%;
            margin-left: 25%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
