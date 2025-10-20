'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-gray-50/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="font-serif text-2xl font-light tracking-tight text-gray-900 dark:text-[#F7F7F7] hover:text-[#2C64FF] dark:hover:text-[#2C64FF] transition-colors">
              Fetchr
            </a>
          </div>

          {/* CTA Button */}
          <div>
            <a
              href="/"
              className="px-6 py-2.5 bg-[#2C64FF] text-white text-sm font-medium rounded-full hover:bg-[#2C64FF]/90 transition-all duration-200 inline-block"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
