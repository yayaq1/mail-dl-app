'use client';

import { useState } from 'react';
import EmailLoginForm from '@/components/EmailLoginForm';
import FolderSelector from '@/components/FolderSelector';
import ProcessingProgress from '@/components/ProcessingProgress';
import DownloadResult from '@/components/DownloadResult';
import Header from '@/components/Header';
import PrivacyModal from '@/components/PrivacyModal';
import { AlertCircle } from 'lucide-react';

type Step = 'login' | 'select-folder' | 'processing' | 'complete';

export default function Home() {
  const [step, setStep] = useState<Step>('login');
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({ totalEmails: 0, totalPDFs: 0, totalDOCX: 0 });

  const handleLoginSuccess = (fetchedFolders: string[]) => {
    setFolders(fetchedFolders);
    setStep('select-folder');
    setError('');
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleProcessFolder = (folder: string) => {
    setSelectedFolder(folder);
    setStep('processing');
    setError('');
  };

  const handleProcessingComplete = (totalEmails: number, totalPDFs: number, totalDOCX: number, zipBlob: Blob) => {
    // Download the ZIP file
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-documents-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Update result and move to complete step
    setResult({ totalEmails, totalPDFs, totalDOCX });
    setStep('complete');

    // Logout to clear session
    fetch('/api/logout', { method: 'POST' });
  };

  const handleProcessingError = (errorMessage: string) => {
    setError(errorMessage);
    setStep('select-folder');
  };

  const handleProcessingCancel = () => {
    setStep('select-folder');
  };

  const handleBack = () => {
    setStep('login');
    setFolders([]);
    setError('');
  };

  const handleReset = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setStep('login');
    setFolders([]);
    setError('');
    setResult({ totalEmails: 0, totalPDFs: 0, totalDOCX: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col relative">
      <Header />
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
        {error && (
          <div className="w-full mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Error
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-600 hover:text-red-800 ml-3"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {step === 'login' && (
          <EmailLoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
        )}

        {step === 'select-folder' && (
          <FolderSelector
            folders={folders}
            onProcess={handleProcessFolder}
            onBack={handleBack}
            loading={false}
          />
        )}

        {step === 'processing' && (
          <ProcessingProgress
            folder={selectedFolder}
            onComplete={handleProcessingComplete}
            onError={handleProcessingError}
            onCancel={handleProcessingCancel}
          />
        )}

        {step === 'complete' && (
          <DownloadResult
            totalEmails={result.totalEmails}
            totalPDFs={result.totalPDFs}
            totalDOCX={result.totalDOCX}
            onReset={handleReset}
          />
        )}
        </div>
      </div>

      <footer className="mt-auto py-4 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Made with ❤️ for fun and to express gratitude by{' '}
              <a 
                href="https://github.com/yayaq1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                yayaq1
              </a>
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Open source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

