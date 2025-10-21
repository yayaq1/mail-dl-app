'use client';

import { useState } from 'react';
import EmailLoginForm from '@/components/EmailLoginForm';
import FolderSelector from '@/components/FolderSelector';
import ProcessingProgress from '@/components/ProcessingProgress';
import DownloadResult from '@/components/DownloadResult';
import Header from '@/components/Header';
import PrivacyModal from '@/components/PrivacyModal';
import LandingThemeToggle from '@/components/LandingThemeToggle';
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

  const handleProcessingComplete = (totalEmails: number, totalPDFs: number, totalDOCX: number, zipBlob: Blob, folderName: string) => {
    try {
      console.log('[App] handleProcessingComplete called', {
        totalEmails,
        totalPDFs,
        totalDOCX,
        blobSize: zipBlob.size,
        folderName
      });

      // Verify blob is valid
      if (!zipBlob || zipBlob.size === 0) {
        console.error('[App] Invalid blob received');
        setError('Downloaded file is empty or invalid');
        return;
      }

      // Download the ZIP file
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      console.log('[App] Triggering download:', a.download);
      
      // Trigger download with a small delay for better browser compatibility
      setTimeout(() => {
        a.click();
        console.log('[App] Download triggered');
        
        // Cleanup after a delay to ensure download starts
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          console.log('[App] Download cleanup complete');
        }, 1000);
      }, 100);

      // Update result and move to complete step
      setResult({ totalEmails, totalPDFs, totalDOCX });
      setStep('complete');

      // Logout to clear session
      fetch('/api/logout', { method: 'POST' });
    } catch (error: any) {
      console.error('[App] Error in handleProcessingComplete:', error);
      setError(error.message || 'Failed to download file');
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex flex-col relative">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="w-full max-w-md mx-auto py-4">
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
      <LandingThemeToggle />
    </div>
  );
}

