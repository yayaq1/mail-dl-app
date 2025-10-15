'use client';

import { CheckCircle2, FileText, Mail, Download } from 'lucide-react';

interface DownloadResultProps {
  totalEmails: number;
  totalPDFs: number;
  totalDOCX: number;
  onReset: () => void;
}

export default function DownloadResult({
  totalEmails,
  totalPDFs,
  totalDOCX,
  onReset,
}: DownloadResultProps) {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-lg shadow-lg p-8 transition-all-smooth hover:shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Complete!
          </h2>
          <p className="text-gray-600">
            Your files have been downloaded successfully
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">
                  Emails Processed
                </span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {totalEmails}
              </span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">
                  PDFs Downloaded
                </span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {totalPDFs}
              </span>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">
                  DOCX Downloaded
                </span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {totalDOCX}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Download className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Download Contents:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>All PDF & DOCX attachments</li>
                <li>Excel summary with email metadata</li>
                <li>Organized in a ZIP archive</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all-smooth transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Process Another Folder
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your session and credentials have been cleared for security
        </p>
      </div>
    </div>
  );
}

