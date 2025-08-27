
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon, XCircleIcon } from './Icons';
import { formatTime } from '../utils/time';

interface FileUploaderProps {
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  setVideoDuration: (duration: number) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ videoFile, setVideoFile, setVideoDuration }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localDuration, setLocalDuration] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setLocalDuration(null);
      } else {
        alert('Please upload a valid video file.');
      }
    }
  }, [setVideoFile]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setLocalDuration(videoRef.current.duration);
    }
  };

  const removeFile = () => {
    setVideoFile(null);
    setVideoDuration(0);
    setLocalDuration(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {!videoFile ? (
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200
          ${isDragging ? 'border-indigo-500 bg-gray-800' : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-4 text-gray-400" />
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">MP4, MOV, WebM or other video formats</p>
          </div>
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
        </div>
      ) : (
        <div className="relative group bg-black rounded-lg overflow-hidden shadow-lg">
          <video
            ref={videoRef}
            src={URL.createObjectURL(videoFile)}
            onLoadedMetadata={handleMetadataLoaded}
            controls
            className="w-full h-auto max-h-96"
          />
          <div className="absolute top-0 right-0 m-2 flex items-center bg-black/50 p-2 rounded-lg backdrop-blur-sm">
             <p className="text-sm font-mono mr-4 text-white">
                {videoFile.name} ({formatTime(localDuration ?? 0)})
             </p>
            <button
              onClick={removeFile}
              className="text-white hover:text-red-500 transition-colors duration-200"
              title="Remove video"
            >
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
