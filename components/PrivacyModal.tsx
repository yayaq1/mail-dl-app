'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, Trash2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function PrivacyModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200 hover:underline">
          Privacy & Security
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Privacy & Security
          </DialogTitle>
          <DialogDescription>
            How we protect your data and privacy
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Encrypted Storage</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">Your credentials are encrypted using iron-session and stored only temporarily in secure cookies.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">No Data Collection</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">We don't collect, store, or track any personal information beyond what's necessary for the service.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Auto-Expiration</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">Your session automatically expires after 30 minutes for security.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">No Permanent Storage</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">All temporary files and data are automatically deleted after processing.</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This is an open-source project. View the code on{' '}
            <a 
              href="https://github.com/yayaq1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
