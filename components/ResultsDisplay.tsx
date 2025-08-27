
import React from 'react';
import { OutputFile } from '../types';
import { VideoIcon, AudioIcon, DownloadIcon } from './Icons';

interface ResultsDisplayProps {
  files: OutputFile[];
  onClear: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ files, onClear }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-400">Results</h2>
        <button 
          onClick={onClear} 
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear Results
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div key={file.name} className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center mb-3">
              {file.type === 'video' ? <VideoIcon className="w-6 h-6 text-indigo-400 mr-3" /> : <AudioIcon className="w-6 h-6 text-teal-400 mr-3" />}
              <p className="text-sm font-medium text-gray-200 break-all">{file.name}</p>
            </div>
            <a
              href={file.url}
              download={file.name}
              className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
