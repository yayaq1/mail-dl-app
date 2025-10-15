'use client';

import { Github } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import PrivacyModal from './PrivacyModal';

export default function Header() {
  return (
    <header className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <a
          href="https://github.com/yayaq1"
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200"
          aria-label="View source on GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
      
      <div className="flex items-center">
        <PrivacyModal />
      </div>
    </header>
  );
}
