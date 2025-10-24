'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, CheckCircle, XCircle, StopCircle } from 'lucide-react';

interface ProcessingProgressProps {
  folder: string;
  onComplete: (totalEmails: number, totalPDFs: number, totalDOCX: number, zipBlob: Blob, folderName: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface ProgressMessage {
  type: 'email' | 'pdf' | 'docx' | 'excel' | 'zip' | 'complete' | 'error';
  message: string;
  current?: number;
  total?: number;
  filename?: string;
}

export default function ProcessingProgress({
  folder,
  onComplete,
  onError,
  onCancel,
}: ProcessingProgressProps) {
  const [logs, setLogs] = useState<ProgressMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasStartedRef = useRef(false); // Prevent double execution in React Strict Mode

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Prevent double execution in development (React Strict Mode)
    if (hasStartedRef.current) {
      console.log('Processing already started, skipping duplicate execution');
      return;
    }
    hasStartedRef.current = true;
    
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      startProcessing();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startProcessing = async () => {
    try {
      abortControllerRef.current = new AbortController();
      setLogs([{ type: 'email', message: 'Connecting to email server...' }]);

      const response = await fetch('/api/process-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to process emails';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          // Response wasn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'complete') {
                console.log('[ProcessingProgress] Processing complete, preparing download...', {
                  sessionId: data.sessionId,
                  folderName: data.folderName,
                  totalEmails: data.totalEmails,
                  totalPDFs: data.totalPDFs,
                  hasZipData: !!data.zipData
                });
                
                // Add "Preparing download..." message
                setLogs(prev => [...prev, { 
                  type: 'zip', 
                  message: 'Preparing ZIP download... This may take 10-20 seconds for large files.' 
                }]);
                
                setIsProcessing(false);
                
                try {
                  let blob: Blob;
                  
                  // If ZIP data is included in the SSE message (Vercel-compatible approach)
                  if (data.zipData) {
                    console.log('[ProcessingProgress] Decoding ZIP data from SSE...');
                    setLogs(prev => [...prev, { 
                      type: 'zip', 
                      message: 'Receiving ZIP file...' 
                    }]);
                    // Decode base64 to binary
                    const binaryString = atob(data.zipData);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
                    blob = new Blob([bytes], { type: 'application/zip' });
                    console.log('[ProcessingProgress] ZIP blob created from SSE data:', {
                      size: blob.size,
                      type: blob.type
                    });
                  } else {
                    // Fallback: Download from separate endpoint (localhost compatibility)
                    console.log('[ProcessingProgress] No ZIP data in SSE, falling back to download endpoint...');
                    setLogs(prev => [...prev, { 
                      type: 'zip', 
                      message: 'Downloading ZIP file from server...' 
                    }]);
                    const zipResponse = await fetch('/api/download-zip', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        sessionId: data.sessionId,
                        folderName: data.folderName || folder
                      }),
                    });
                    
                    if (!zipResponse.ok) {
                      const errorText = await zipResponse.text();
                      console.error('[ProcessingProgress] Failed to download ZIP:', errorText);
                      throw new Error(`Failed to download ZIP: ${zipResponse.status} ${zipResponse.statusText}`);
                    }
                    
                    blob = await zipResponse.blob();
                    console.log('[ProcessingProgress] ZIP blob received from endpoint:', {
                      size: blob.size,
                      type: blob.type
                    });
                  }
                  
                  if (blob.size === 0) {
                    throw new Error('Downloaded ZIP file is empty');
                  }
                  
                  setLogs(prev => [...prev, { 
                    type: 'zip', 
                    message: '✓ ZIP file ready! Starting download to your browser...' 
                  }]);
                  
                  // Small delay to ensure blob is fully ready
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  onComplete(data.totalEmails, data.totalPDFs, data.totalDOCX || 0, blob, data.folderName || folder);
                  console.log('[ProcessingProgress] Download complete, calling onComplete callback');
                } catch (downloadError: any) {
                  console.error('[ProcessingProgress] Error during ZIP processing:', downloadError);
                  onError(downloadError.message || 'Failed to process ZIP file');
                }
                return;
              }
              
              if (data.type === 'error') {
                setIsProcessing(false);
                onError(data.message);
                return;
              }

              setLogs(prev => [...prev, data]);
              
              if (data.current !== undefined && data.total !== undefined) {
                setProgress({ current: data.current, total: data.total });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setLogs(prev => [...prev, { type: 'error', message: 'Processing cancelled by user' }]);
        setIsProcessing(false);
      } else {
        setLogs(prev => [...prev, { type: 'error', message: error.message }]);
        onError(error.message || 'Failed to process emails');
        setIsProcessing(false);
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    onCancel();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'excel':
      case 'zip':
        return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100 mb-2">Downloading PDFs</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Folder: {folder}</p>
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>Progress: {progress.current} / {progress.total} emails</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 h-3 rounded-full transition-all-smooth"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Live Logs */}
        <div className="bg-gray-900 dark:bg-gray-900 rounded-lg p-4 mb-4 h-64 sm:h-96 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 mb-2 text-gray-100 animate-slide-in"
            >
              <span className="flex-shrink-0 mt-0.5">{getIcon(log.type)}</span>
              <span className="flex-1">
                {log.type === 'pdf' && log.filename && (
                  <span className="text-green-400">✓ Downloaded PDF: {log.filename}</span>
                )}
                {log.type === 'docx' && log.filename && (
                  <span className="text-blue-400">✓ Downloaded DOCX: {log.filename}</span>
                )}
                {log.type === 'email' && (
                  <span className="text-cyan-400">{log.message}</span>
                )}
                {log.type === 'excel' && (
                  <span className="text-yellow-400">{log.message}</span>
                )}
                {log.type === 'zip' && (
                  <span className="text-purple-400">{log.message}</span>
                )}
                {log.type === 'error' && (
                  <span className="text-red-400">✗ {log.message}</span>
                )}
                {!['pdf', 'docx', 'email', 'excel', 'zip', 'error'].includes(log.type) && (
                  <span>{log.message}</span>
                )}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Stop Button */}
        {isProcessing && (
          <button
            onClick={handleStop}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center transition-all-smooth transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <StopCircle className="w-5 h-5 mr-2" />
            Stop Processing
          </button>
        )}
      </div>
    </div>
  );
}


