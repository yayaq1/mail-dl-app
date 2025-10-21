"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Lock, Eye, Trash2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollHighlightSection() {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    
    // Get all characters and highlight words
    const chars = content.querySelectorAll(".char");
    const highlightWords = content.querySelectorAll(".highlight-word");

    // Create the pinning effect - stays pinned for the entire scroll
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: content,
      pinSpacing: false,
    });

    // Animate all characters based on scroll progress
    // Use nearly the full scroll range to ensure all text is highlighted
    gsap.to(chars, {
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "95% bottom", // Use 95% of the scroll distance for character animation
        scrub: 2,
      },
    });

    // Animate highlight words with better timing
    highlightWords.forEach((word, index) => {
      gsap.to(word, {
        opacity: 1,
        scrollTrigger: {
          trigger: container,
          start: `${index * 12}% top`,
          end: `${95 - (highlightWords.length - index) * 12}% bottom`,
          scrub: 2,
          onEnter: () => {
            word.classList.add("underline", "decoration-2", "underline-offset-[0.35em]", "decoration-[#2C64FF]");
          },
          onLeave: () => {
            word.classList.remove("underline", "decoration-2", "underline-offset-[0.35em]", "decoration-[#2C64FF]");
          },
          onEnterBack: () => {
            word.classList.add("underline", "decoration-2", "underline-offset-[0.35em]", "decoration-[#2C64FF]");
          },
          onLeaveBack: () => {
            word.classList.remove("underline", "decoration-2", "underline-offset-[0.35em]", "decoration-[#2C64FF]");
          },
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const splitText = (text: string) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char" style={{ opacity: 0.25 }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  const renderWord = (word: string, isHighlight = false, isCTA = false, isPrivacyLink = false, isGitHubLink = false) => {
    if (isCTA) {
      return (
        <a 
          href="/app"
          className="highlight-word whitespace-nowrap inline-block border-2 border-[#2C64FF] rounded-2xl px-6 py-2 mt-2 hover:bg-[#2C64FF]/10 transition-all cursor-pointer"
          style={{ opacity: 0.25 }}
        >
          <span className="text-[#2C64FF] font-medium underline decoration-2 underline-offset-4">
            {splitText(word)}
          </span>
        </a>
      );
    }
    if (isPrivacyLink) {
      return (
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="highlight-word whitespace-nowrap cursor-pointer hover:text-[#2C64FF] transition-colors"
          style={{ opacity: 0.25 }}
        >
          {splitText(word)}
        </button>
      );
    }
    if (isGitHubLink) {
      return (
        <a
          href="https://github.com/yayaq1/mail-dl-app"
          target="_blank"
          rel="noopener noreferrer"
          className="highlight-word whitespace-nowrap cursor-pointer hover:text-[#2C64FF] transition-colors"
          style={{ opacity: 0.25 }}
        >
          {splitText(word)}
        </a>
      );
    }
    if (isHighlight) {
      return (
        <span className="highlight-word whitespace-nowrap" style={{ opacity: 0.25 }}>
          {splitText(word)}
        </span>
      );
    }
    return <span>{splitText(word)}</span>;
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[500vh] z-0"
    >
      <div
        ref={contentRef}
        className="flex items-center justify-center min-h-screen pt-20 md:pt-0"
      >
        <div className="w-full max-w-6xl mx-auto px-8">
          <h4 className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-[1.7] md:leading-[1.8] text-center text-gray-900 dark:text-[#F7F7F7]">
            {renderWord("Recruiters", true)}{" "}
            {renderWord("receive")}{" "}
            {renderWord("hundreds")}{" "}
            {renderWord("of")}{" "}
            {renderWord("emails")}{" "}
            {renderWord("daily.")}{" "}
            {renderWord("Each")}{" "}
            {renderWord("one")}{" "}
            {renderWord("contains")}{" "}
            {renderWord("a")}{" "}
            {renderWord("resume", true)}{" "}
            {renderWord("or")}{" "}
            {renderWord("portfolio.")}{" "}
            {renderWord("Open.")}{" "}
            {renderWord("Click.")}{" "}
            {renderWord("Download.")}{" "}
            {renderWord("Repeat", true)}{" "}
            {renderWord("endlessly.")}{" "}
            {renderWord("It's")}{" "}
            {renderWord("exhausting.")}{" "}
            {renderWord("It's")}{" "}
            {renderWord("inefficient.")}{" "}
            {renderWord("End the chaos.", true)}{" "}
            {renderWord("Fetchr", true)}{" "}
            {renderWord("downloads")}{" "}
            {renderWord("every")}{" "}
            {renderWord("attachment")}{" "}
            {renderWord("automatically")}{" "}
            {renderWord("with")}{" "}
            {renderWord("a")}{" "}
            {renderWord("clean")}{" "}
            {renderWord("Excel")}{" "}
            {renderWord("summary")}{" "}
            {renderWord("of")}{" "}
            {renderWord("candidates.")}{" "}
            {renderWord("Secure.", true, false, true, false)}{" "}
            {renderWord("Open-source.", true, false, false, true)}{" "}
            {renderWord("Try it free.", false, true)}
          </h4>
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
    </section>
  );
}