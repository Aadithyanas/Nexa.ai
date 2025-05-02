import React, { useState } from 'react';
import { UploadCloud, Youtube, Menu } from 'lucide-react';

export default function FileIcon({ toogleFileSummary, toggleYouTubeSummarizer }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleYouTubeClick = () => {
    setIsExpanded(false);
    toggleYouTubeSummarizer();
  };

  const handleFileClick = () => {
    setIsExpanded(false);
    toogleFileSummary();
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
      <div 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer group hover:bg-white/10 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Open Tools"
      >
        <Menu className={`w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 
          ${isExpanded ? 'rotate-90 scale-110' : 'group-hover:rotate-90 group-hover:scale-110'}`} />
      </div>

      <div className={`flex flex-col items-end gap-2 transition-all duration-300 ease-in-out
        ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500 flex items-center justify-center cursor-pointer 
            shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-red-600 group
            transform hover:scale-110 hover:-translate-y-1"
          onClick={handleYouTubeClick}
          title="YouTube Summarizer"
        >
          <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:rotate-12" />
        </div>
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer 
            shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-600 group
            transform hover:scale-110 hover:-translate-y-1"
          onClick={handleFileClick}
          title="File Summarizer"
        >
          <UploadCloud className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all duration-300 group-hover:rotate-12" />
        </div>
      </div>
    </div>
  );
}