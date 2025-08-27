
import React from 'react';

interface ProcessingModalProps {
  progress: number;
  logs: string[];
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ progress, logs }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-indigo-400">Processing Video...</h2>
        <p className="text-gray-300 mb-2">Please wait, this may take a few moments. Do not close this window.</p>
        
        <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-right text-lg font-mono text-indigo-300 mb-4">{progress.toFixed(0)}%</p>

        <div className="flex-grow bg-black rounded-md p-4 overflow-y-auto border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">FFmpeg Logs:</h3>
          <div className="font-mono text-xs text-green-400 whitespace-pre-wrap">
            {logs.map((log, index) => (
              <p key={index} className="break-words">{`> ${log}`}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
