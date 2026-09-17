import React from 'react';
import { Loader2 } from 'lucide-react';

interface PortalLoadingFallbackProps {
  message?: string;
  isModal?: boolean;
}

export const PortalLoadingFallback: React.FC<PortalLoadingFallbackProps> = ({
  message = 'Loading Portal...',
  isModal = false
}) => {
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl flex flex-col items-center space-y-4 max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF9EE] border border-[#F7C948]/30 flex items-center justify-center text-[#2454A6]">
            <Loader2 className="w-6 h-6 animate-spin text-[#2454A6]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#172B4D]">{message}</h4>
            <p className="text-xs text-gray-500">Preparing secure module...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-300">
      <div className="relative">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF9EE] border border-[#2454A6]/20 flex items-center justify-center shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#2454A6]" />
        </div>
        <div className="w-3 h-3 rounded-full bg-[#35B8A6] absolute -top-1 -right-1 animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-[#172B4D]">{message}</h3>
        <p className="text-xs text-[#172B4D]/60 max-w-xs">
          Loading learning modules, assignments, and analytics assets...
        </p>
      </div>
    </div>
  );
};
