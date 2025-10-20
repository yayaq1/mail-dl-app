'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Github } from 'lucide-react';

export default function LandingThemeToggle() {
  const [isDark, setIsDark] = useState(true); // Default to dark for landing page

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || !savedTheme) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* GitHub Button */}
      <a
        href="https://github.com/yayaq1/mail-dl-app"
        target="_blank"
        rel="noopener noreferrer"
        className="h-12 w-12 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all flex items-center justify-center text-gray-900 dark:text-gray-100"
        aria-label="View on GitHub"
      >
        <Github className="h-5 w-5" />
      </a>
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="h-12 w-12 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all flex items-center justify-center text-gray-900 dark:text-gray-100"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

