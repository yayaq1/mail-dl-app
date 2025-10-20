"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollHighlightSection() {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    // Let Lenis initialize first
    const initTimer = setTimeout(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      
      if (!container || !content) return;
    
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
    
      // Refresh ScrollTrigger after all animations are set up
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(initTimer);
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

  const renderWord = (word: string, isHighlight = false) => {
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
      className="relative min-h-[500vh]"
    >
      <div
        ref={contentRef}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="w-full max-w-6xl mx-auto px-8">
          <h4 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light leading-[1.8] md:leading-[1.9] text-center">
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
            {renderWord("Secure.", true)}{" "}
            {renderWord("Open-source.", true)}{" "}
            {renderWord("Try it free.", true)}
          </h4>
        </div>
      </div>
    </section>
  );
}