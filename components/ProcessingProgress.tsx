'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, FileText, CheckCircle, XCircle, StopCircle } from 'lucide-react';

interface ProcessingProgressProps {
  folder: string;
  onComplete: (totalEmails: number, totalPDFs: number, totalDOCX: number, zipBlob: Blob) => void;
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
                setIsProcessing(false);
                // Download the ZIP file
                const zipResponse = await fetch('/api/download-zip', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId: data.sessionId }),
                });
                
                if (zipResponse.ok) {
                  const blob = await zipResponse.blob();
                  onComplete(data.totalEmails, data.totalPDFs, data.totalDOCX || 0, blob);
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Downloading PDFs</h2>
          <p className="text-gray-600">Folder: {folder}</p>
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
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
        <div className="bg-gray-900 rounded-lg p-4 mb-4 h-96 overflow-y-auto font-mono text-sm">
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


