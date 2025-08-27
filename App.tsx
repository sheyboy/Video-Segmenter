
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { OutputFile } from './types';
import { formatTime } from './utils/time';
import { FileUploader } from './components/FileUploader';
import { ProcessingModal } from './components/ProcessingModal';
import { ResultsDisplay } from './components/ResultsDisplay';

declare const FFmpeg: any;

const App: React.FC = () => {
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [segmentMinutes, setSegmentMinutes] = useState('1');
  const [segmentSeconds, setSegmentSeconds] = useState('0');
  const [audioOnly, setAudioOnly] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);

  const ffmpegRef = useRef<any>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return;
    const { createFFmpeg } = FFmpeg;
    const ffmpegInstance = createFFmpeg({
        log: true,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    });
    ffmpegInstance.setLogger(({ message }: { type: string, message: string }) => {
        setLogs(prev => [...prev, message]);
    });
    ffmpegInstance.setProgress(({ ratio }: { ratio: number }) => {
        setProgress(Math.max(0, ratio * 100));
    });
    await ffmpegInstance.load();
    ffmpegRef.current = ffmpegInstance;
    setIsFFmpegLoaded(true);
  }, []);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);
  
  const handleProcessVideo = async () => {
    if (!videoFile || !ffmpegRef.current) return;

    const segmentDuration = parseInt(segmentMinutes || '0') * 60 + parseInt(segmentSeconds || '0');
    if (segmentDuration <= 0) {
      alert("Segment duration must be greater than 0 seconds.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setOutputFiles([]);
    
    const outputFilenames: string[] = [];
    const logCallback = ({ message }: { type: string, message: string }) => {
        const match = message.match(/Opening '(.+)' for writing/);
        if (match && match[1]) {
            if (!outputFilenames.includes(match[1])) {
                outputFilenames.push(match[1]);
            }
        }
    };
    ffmpegRef.current.setLogger(logCallback);


    try {
      const { name } = videoFile;
      const extension = name.split('.').pop() || 'mp4';
      const outputExtension = audioOnly ? 'mp3' : extension;

      ffmpegRef.current.FS('writeFile', name, new Uint8Array(await videoFile.arrayBuffer()));
      
      const args = [
        '-i', name,
        '-segment_time', String(segmentDuration),
        '-f', 'segment',
        '-reset_timestamps', '1'
      ];

      if (audioOnly) {
          args.push('-vn', '-c:a', 'libmp3lame', '-q:a', '2');
      } else {
          args.push('-c', 'copy', '-map', '0');
      }
      
      args.push(`output%03d.${outputExtension}`);

      await ffmpegRef.current.run(...args);

      const generatedFiles: OutputFile[] = [];
      for (let i = 0; i < outputFilenames.length; i++) {
        const filename = outputFilenames[i];
        const data = ffmpegRef.current.FS('readFile', filename);
        const url = URL.createObjectURL(new Blob([data.buffer], { type: audioOnly ? 'audio/mpeg' : videoFile.type }));
        const friendlyName = `segment_${i + 1}.${outputExtension}`;
        generatedFiles.push({ name: friendlyName, url, type: audioOnly ? 'audio' : 'video' });
      }

      setOutputFiles(generatedFiles);
    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, `An error occurred: ${error}`]);
    } finally {
      setIsProcessing(false);
      // Restore default logger
      ffmpegRef.current.setLogger(({ message }: { type: string, message: string }) => {
        setLogs(prev => [...prev, message]);
      });
    }
  };

  const handleSetVideoFile = (file: File | null) => {
    setVideoFile(file);
    setOutputFiles([]);
  };

  const isProcessButtonDisabled = !videoFile || isProcessing || !isFFmpegLoaded || (parseInt(segmentMinutes || '0') === 0 && parseInt(segmentSeconds || '0') === 0);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {isProcessing && <ProcessingModal progress={progress} logs={logs} />}
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            On-Device Video Segmenter
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Cut videos or extract audio directly in your browser.
          </p>
        </header>

        <main className="space-y-6">
          <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-gray-200">1. Upload Video</h2>
            <FileUploader videoFile={videoFile} setVideoFile={handleSetVideoFile} setVideoDuration={setVideoDuration} />
          </div>
          
          {videoFile && (
            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
              <h2 className="text-xl font-semibold text-gray-200">2. Set Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Segment Length</label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      min="0"
                      value={segmentMinutes}
                      onChange={(e) => setSegmentMinutes(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-gray-400">min</span>
                    <input 
                      type="number" 
                      min="0"
                      max="59"
                      value={segmentSeconds}
                      onChange={(e) => setSegmentSeconds(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-gray-400">sec</span>
                  </div>
                </div>
                <div className="flex items-center justify-start md:mt-8">
                   <div className="flex items-center">
                    <input 
                        id="audioOnly"
                        type="checkbox" 
                        checked={audioOnly}
                        onChange={(e) => setAudioOnly(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-gray-700"
                    />
                    <label htmlFor="audioOnly" className="ml-3 block text-sm font-medium text-gray-300">
                      Export Audio Only (.mp3)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center">
             <button
              onClick={handleProcessVideo}
              disabled={isProcessButtonDisabled}
              className="px-8 py-3 w-full md:w-auto text-lg font-bold text-white bg-indigo-600 rounded-md shadow-lg transition-all duration-300 ease-in-out hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
              {isProcessing ? 'Processing...' : (isFFmpegLoaded ? `Process and Split Video` : 'Loading Engine...')}
            </button>
            {videoFile && <p className="mt-3 text-sm text-gray-500">Total video length: {formatTime(videoDuration)}</p>}
          </div>

          <ResultsDisplay files={outputFiles} onClear={() => setOutputFiles([])} />
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by ffmpeg.wasm. All processing is done on your device.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
