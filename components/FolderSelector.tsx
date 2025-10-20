'use client';

import { useState } from 'react';
import { Folder, Loader2, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FolderSelectorProps {
  folders: string[];
  onProcess: (folder: string) => void;
  onBack: () => void;
  loading: boolean;
}

export default function FolderSelector({
  folders,
  onProcess,
  onBack,
  loading,
}: FolderSelectorProps) {
  const [selectedFolder, setSelectedFolder] = useState(folders[0] || '');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFolders = folders.filter((folder) =>
    folder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFolder) {
      onProcess(selectedFolder);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 transition-all-smooth hover:shadow-xl">
        <div className="text-center mb-4">
          <div className="inline-block p-2 bg-green-100 dark:bg-green-900 rounded-full mb-3">
            <Folder className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100 mb-2">
            Select Email Folder
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choose a folder to extract PDF attachments from
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Folders
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all-smooth hover:border-green-400"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Folders ({filteredFolders.length})
            </label>
            <Select
              value={selectedFolder}
              onValueChange={setSelectedFolder}
              disabled={loading}
            >
              <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-green-400 focus:ring-green-500 focus:ring-2">
                <SelectValue placeholder="Select a folder..." />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                {filteredFolders.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No folders found
                  </div>
                ) : (
                  filteredFolders.map((folder) => (
                    <SelectItem key={folder} value={folder} className="text-gray-900 dark:text-gray-100">
                      {folder}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all-smooth transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFolder}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all-smooth transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Extract PDFs
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

