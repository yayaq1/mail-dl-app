"use client";

import { useState } from "react";
import { Shield, Lock, Eye, Trash2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function LandingFooter() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Brand & Description */}
          <div>
            <h2 className="font-serif text-2xl font-light mb-2 text-gray-900 dark:text-[#F7F7F7]">Fetchr</h2>
            <p className="text-gray-600 dark:text-[#A0A0A0] text-sm max-w-md mb-2">
              Download email attachments in bulk with a clean summary, really easing the job of recruiters.
            </p>
            <p className="text-gray-600 dark:text-[#A0A0A0] text-xs italic">
              Built with love and to express gratitude by{" "}
              <a
                href="https://github.com/yayaq1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2C64FF] hover:underline"
              >
                yayaq1
              </a>
            </p>
            <p className="text-gray-600 dark:text-[#A0A0A0] text-sm mt-2 italic">
              <button onClick={() => setShowPrivacyModal(true)} className="text-[#2C64FF] hover:underline cursor-pointer">Secure</button>. <a href="https://github.com/yayaq1/mail-dl-app" target="_blank" rel="noopener noreferrer" className="text-[#2C64FF] hover:underline">Open-source</a>. Feel free to contribute.
            </p>
          </div>
        </div>
      </div>
      
      {/* Privacy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
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
                <p className="text-xs text-gray-600 dark:text-gray-300">We don&apos;t collect, store, or track any personal information beyond what&apos;s necessary for the service.</p>
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
                href="https://github.com/yayaq1/mail-dl-app" 
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
    </footer>
  );
}
