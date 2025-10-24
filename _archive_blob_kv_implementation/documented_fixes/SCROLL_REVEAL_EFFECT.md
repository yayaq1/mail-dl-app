# The Progressive Text Reveal Scroll Effect

## What to Call It

I'd call this the **"Progressive Text Reveal with Pin"** or **"Scroll-Locked Character Revelation"** effect. It's also known as:

- **Typewriter Scroll Effect** (though it's revealing, not typing)
- **Pinned Text Fade-In**
- **Scroll-Triggered Text Highlighting**
- **Story Scroll Effect** (popularized by Apple, Stripe, and Vercel)

The most accurate name: **"Character-by-Character Scroll Reveal with Section Pinning"**

---

## What Is This Effect?

This is an **immersive storytelling technique** where text progressively reveals itself as the user scrolls, creating a narrative experience. The key characteristics:

1. **Section Pinning**: The text content stays fixed in the viewport (pinned) while the user scrolls
2. **Character-Level Animation**: Each character starts dim (opacity 0.25) and brightens to full opacity
3. **Staggered Reveal**: Characters reveal sequentially, creating a reading flow
4. **Selective Highlighting**: Key words get underlined dynamically as they come into focus
5. **Extended Scroll Distance**: The section occupies much more vertical space than the visible content (500vh in this case)
6. **Smooth Scrolling**: Butter-smooth momentum scrolling using Lenis

### Visual Experience

```
User scrolls down ↓

┌─────────────────────────────────┐
│  Recruiters receive hundreds... │ ← Pinned in viewport
│  [25% opacity → 100% opacity]   │
│  ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░      │ ← Progress indicator (conceptual)
└─────────────────────────────────┘

More scrolling ↓

┌─────────────────────────────────┐
│  Recruiters receive hundreds... │
│  [All visible, some underlined] │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░        │
└─────────────────────────────────┘

Continue scrolling ↓

┌─────────────────────────────────┐
│  ...Try it free.                │
│  [Fully revealed, CTA visible]  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │
└─────────────────────────────────┘
```

---

## The Technical Stack

### Core Technologies

1. **GSAP (GreenSock Animation Platform)**
   - Industry-standard animation library
   - ScrollTrigger plugin for scroll-based animations
   - Provides precise control over animation timing

2. **Lenis Smooth Scroll**
   - Momentum-based smooth scrolling
   - Natural, physics-based scroll behavior
   - Integrates seamlessly with GSAP

3. **React** (with hooks)
   - Component-based architecture
   - useEffect for lifecycle management
   - useRef for DOM manipulation

4. **TypeScript**
   - Type safety for configuration
   - Better developer experience

---

## How It Works: Deep Dive

### The Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Container Section                     │
│              (500vh height = 5x viewport)                │
│  ┌────────────────────────────────────────────────┐     │
│  │         Content Div (Pinned)                   │     │
│  │  - Fixed in viewport as user scrolls           │     │
│  │  - Contains all text                           │     │
│  │  - Text split into individual characters       │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  [Scroll progress: 0% → 100% triggers animations]       │
└──────────────────────────────────────────────────────────┘
```

### Step-by-Step Breakdown

#### 1. **Text Splitting** (Preparation)

```typescript
const splitText = (text: string) => {
  return text.split("").map((char, i) => (
    <span key={i} className="char" style={{ opacity: 0.25 }}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
};
```

**Purpose**: Break text into individual `<span>` elements for granular animation control
- Each character becomes an animatable DOM element
- Initial opacity: 0.25 (dim but readable)
- Spaces preserved as non-breaking spaces (`\u00A0`)

#### 2. **Section Pinning** (GSAP ScrollTrigger)

```typescript
ScrollTrigger.create({
  trigger: container,        // The 500vh tall section
  start: "top top",         // Pin when section top hits viewport top
  end: "bottom bottom",     // Unpin when section bottom hits viewport bottom
  pin: content,             // The element to pin (your text div)
  pinSpacing: false,        // Don't add extra spacing
});
```

**Purpose**: Keep text fixed in viewport while scroll progresses
- `trigger`: The tall container (500vh)
- `pin`: The content stays fixed
- User scrolls through 500vh but content doesn't move
- Creates illusion of "reading through" the text

#### 3. **Character Animation** (Progressive Reveal)

```typescript
gsap.to(chars, {
  opacity: 1,                    // Fade from 0.25 → 1
  stagger: 0.05,                 // 0.05s delay between each character
  scrollTrigger: {
    trigger: container,
    start: "top top",
    end: "95% bottom",          // Use 95% of scroll distance
    scrub: 2,                   // Smoothly sync with scroll (2s smoothing)
  },
});
```

**Purpose**: Gradually reveal text character by character
- `stagger: 0.05`: Each character animates slightly after the previous
- `scrub: 2`: Animation progress tied to scroll position (with 2s smoothing)
- `end: "95% bottom"`: Use 95% of scroll range for animation

**Math**: If you have 100 characters, each character gets revealed across ~1% of the scroll distance

#### 4. **Word Highlighting** (Dynamic Underlines)

```typescript
highlightWords.forEach((word, index) => {
  gsap.to(word, {
    opacity: 1,
    scrollTrigger: {
      trigger: container,
      start: `${index * 12}% top`,                          // Stagger starts
      end: `${95 - (highlightWords.length - index) * 12}% bottom`,
      scrub: 2,
      onEnter: () => {
        word.classList.add("underline", "decoration-2", 
                          "underline-offset-[0.35em]", 
                          "decoration-[#2C64FF]");
      },
      onLeave: () => {
        word.classList.remove("underline", "decoration-2", 
                             "underline-offset-[0.35em]", 
                             "decoration-[#2C64FF]");
      },
      onEnterBack: () => { /* Re-add on reverse scroll */ },
      onLeaveBack: () => { /* Remove on reverse scroll */ },
    },
  });
});
```

**Purpose**: Emphasize key words with temporary underlines
- Each highlight word gets its own ScrollTrigger
- Underline appears when word enters focus zone
- Underline disappears when word leaves focus zone
- Works bidirectionally (forward and backward scrolling)

#### 5. **Smooth Scrolling** (Lenis Integration)

```typescript
const lenis = new Lenis({
  duration: 1.2,              // Scroll animation duration
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
  orientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Use GSAP ticker for smooth animation frames
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
```

**Purpose**: Replace browser's default janky scrolling with smooth momentum
- `duration: 1.2`: How long scroll animations take
- `easing`: Custom easing function for natural deceleration
- `lenis.on('scroll', ScrollTrigger.update)`: Keep ScrollTrigger synced
- `gsap.ticker`: Use GSAP's animation frame system

---

## How to Replicate This Effect

### Prerequisites

```bash
npm install gsap @studio-freight/lenis
```

### File Structure

```
your-app/
├── components/
│   ├── SmoothScroll.tsx          # Lenis wrapper
│   └── ScrollRevealSection.tsx   # Main effect component
├── app/
│   ├── globals.css               # Lenis styles
│   └── page.tsx                  # Use the components
```

### Step 1: Set Up Smooth Scrolling

Create `components/SmoothScroll.tsx`:

```typescript
"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);

  return <>{children}</>;
}
```

### Step 2: Create the Scroll Reveal Component

Create `components/ScrollRevealSection.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollRevealSection() {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    const chars = content.querySelectorAll(".char");
    const highlightWords = content.querySelectorAll(".highlight-word");

    // Pin the content while scrolling
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: content,
      pinSpacing: false,
    });

    // Animate characters
    gsap.to(chars, {
      opacity: 1,
      stagger: 0.05,
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "95% bottom",
        scrub: 2,
      },
    });

    // Animate highlight words
    highlightWords.forEach((word, index) => {
      gsap.to(word, {
        opacity: 1,
        scrollTrigger: {
          trigger: container,
          start: `${index * 12}% top`,
          end: `${95 - (highlightWords.length - index) * 12}% bottom`,
          scrub: 2,
          onEnter: () => word.classList.add("underline", "decoration-blue-500"),
          onLeave: () => word.classList.remove("underline", "decoration-blue-500"),
          onEnterBack: () => word.classList.add("underline", "decoration-blue-500"),
          onLeaveBack: () => word.classList.remove("underline", "decoration-blue-500"),
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
      className="relative min-h-[500vh]" // 5x viewport height
    >
      <div
        ref={contentRef}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="w-full max-w-6xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-light leading-relaxed text-center">
            {renderWord("Your")} {renderWord("story", true)} {renderWord("starts")}{" "}
            {renderWord("here.")} {renderWord("Every")} {renderWord("word", true)}{" "}
            {renderWord("reveals")} {renderWord("something")} {renderWord("new", true)}{" "}
            {renderWord("as")} {renderWord("you")} {renderWord("scroll.")}{" "}
            {renderWord("Beautiful", true)} {renderWord("and")}{" "}
            {renderWord("immersive", true)} {renderWord("storytelling.")}{" "}
            {renderWord("Try it now.", true)}
          </h2>
        </div>
      </div>
    </section>
  );
}
```

### Step 3: Add Lenis Styles

In `app/globals.css`:

```css
/* Lenis smooth scroll */
html {
  scroll-behavior: auto;
}

html.lenis {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.lenis.lenis-scrolling iframe {
  pointer-events: none;
}
```

### Step 4: Use in Your Page

```typescript
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollRevealSection } from "@/components/ScrollRevealSection";

export default function Page() {
  return (
    <SmoothScroll>
      <ScrollRevealSection />
      {/* Other content */}
    </SmoothScroll>
  );
}
```

---

## Configuration & Customization

### Timing Parameters

```typescript
// Character reveal timing
stagger: 0.05,        // Time between each character (seconds)
scrub: 2,             // Scroll smoothing (higher = smoother but slower)

// Scroll distance
min-h-[500vh]         // 500vh = 5x viewport height
                      // More height = slower reveal
                      // Less height = faster reveal
```

### Opacity Values

```typescript
// Starting opacity (dim)
style={{ opacity: 0.25 }}   // 25% visible

// Ending opacity (full)
opacity: 1                   // 100% visible

// Alternative: Start completely hidden
style={{ opacity: 0 }}
```

### Highlight Timing

```typescript
// Stagger highlight appearances
start: `${index * 12}% top`,  // 12% scroll between each highlight
                              // Increase for more space
                              // Decrease for closer highlights
```

### Scroll Distance Formula

```typescript
// If you want the effect to take 3x viewport height:
min-h-[300vh]

// If you want the effect to take 8x viewport height:
min-h-[800vh]

// Rule of thumb: 
// More vh = more scrolling = slower reveal = more dramatic
// Less vh = less scrolling = faster reveal = more concise
```

---

## Performance Considerations

### Optimization Tips

1. **Limit Text Length**
   - 50-200 words is optimal
   - Too many characters = performance issues

2. **Use `will-change` Sparingly**
   ```css
   .char {
     will-change: opacity; /* Only if needed */
   }
   ```

3. **Disable on Mobile** (Optional)
   ```typescript
   const isMobile = window.innerWidth < 768;
   
   if (isMobile) {
     // Show text without animation
     return <StaticText />;
   }
   ```

4. **Cleanup ScrollTriggers**
   ```typescript
   return () => {
     ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
   };
   ```

### Performance Metrics

- **Characters**: < 500 recommended
- **Highlight Words**: < 15 recommended
- **Scroll Height**: 300vh - 800vh sweet spot
- **Frame Rate**: Should maintain 60fps on modern devices

---

## Use Cases & Examples

### Perfect For:

✅ **Product Landing Pages**
- Tell your product story
- Guide users through features
- Create emotional connection

✅ **Portfolio Sites**
- Showcase your journey
- Highlight key achievements
- Stand out from competition

✅ **Marketing Campaigns**
- Launch announcements
- Brand storytelling
- Immersive experiences

✅ **Case Studies**
- Project narratives
- Problem → Solution flow
- Client testimonials

### Not Ideal For:

❌ **Content-Heavy Pages**
- Blog posts (too much text)
- Documentation (users need to skim)
- Data-heavy pages (information density)

❌ **Mobile-First Apps**
- Small screens limit effectiveness
- Touch scrolling can feel unnatural
- Performance concerns

❌ **Accessibility-Critical**
- Screen readers struggle with pinned content
- Users who prefer reduced motion
- Keyboard navigation challenges

---

## Accessibility Improvements

### Respect User Preferences

```typescript
useEffect(() => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    // Show all text immediately, skip animations
    gsap.set(chars, { opacity: 1 });
    return;
  }

  // ... normal animation code
}, []);
```

### Keyboard Navigation

```typescript
<section
  ref={containerRef}
  tabIndex={0}
  aria-label="Scroll to reveal story"
  className="relative min-h-[500vh]"
>
```

### Screen Reader Friendly

```typescript
// Add a hidden, fully visible version for screen readers
<div className="sr-only">
  Your complete text here without animation effects
</div>

<div aria-hidden="true" ref={contentRef}>
  {/* Animated version */}
</div>
```

---

## Variations & Enhancements

### 1. **Color Transitions**

Transition text color as it reveals:

```typescript
gsap.to(chars, {
  opacity: 1,
  color: "#2C64FF",  // Add color transition
  stagger: 0.05,
  scrollTrigger: { /* ... */ },
});
```

### 2. **Scale Effect**

Scale characters as they appear:

```typescript
gsap.to(chars, {
  opacity: 1,
  scale: 1,  // Animate from smaller to full size
  stagger: 0.05,
  scrollTrigger: { /* ... */ },
});

// Initial state:
<span style={{ opacity: 0.25, transform: 'scale(0.8)' }}>
```

### 3. **Blur to Focus**

Blur characters initially, sharpen as they reveal:

```typescript
gsap.to(chars, {
  opacity: 1,
  filter: "blur(0px)",  // From blur to sharp
  stagger: 0.05,
  scrollTrigger: { /* ... */ },
});

// Initial state:
<span style={{ opacity: 0.25, filter: 'blur(3px)' }}>
```

### 4. **Typewriter Sound** (Optional)

Add subtle audio feedback:

```typescript
let lastPlayedIndex = 0;

scrollTrigger: {
  onUpdate: (self) => {
    const currentIndex = Math.floor(self.progress * chars.length);
    if (currentIndex > lastPlayedIndex) {
      playTypeSound(); // Your audio function
      lastPlayedIndex = currentIndex;
    }
  },
}
```

### 5. **Progress Indicator**

Show scroll progress:

```typescript
<div className="fixed bottom-8 left-1/2 -translate-x-1/2">
  <div className="w-48 h-1 bg-gray-200 rounded">
    <div 
      className="h-full bg-blue-500 rounded transition-all"
      style={{ width: `${scrollProgress}%` }}
    />
  </div>
</div>
```

---

## Real-World Examples

### Companies Using Similar Effects:

1. **Apple** - Product launches (e.g., iPhone reveals)
2. **Stripe** - Homepage storytelling
3. **Vercel** - Product feature pages
4. **Linear** - About page narrative
5. **Lenis** - Their own demo page

### Open Source Examples:

- [GSAP ScrollTrigger Demos](https://greensock.com/st-demos/)
- [Lenis Examples](https://github.com/studio-freight/lenis)
- [Awwwards Winners](https://www.awwwards.com/websites/scroll-animation/)

---

## Troubleshooting

### Common Issues

**Problem**: Text doesn't reveal smoothly
```typescript
// Solution: Increase scrub value
scrub: 2,  // Try 3 or 4 for smoother transitions
```

**Problem**: Highlight words flash
```typescript
// Solution: Adjust timing overlap
start: `${index * 15}% top`,  // Increase spacing
```

**Problem**: Pinning doesn't work
```typescript
// Solution: Check container height
className="relative min-h-[500vh]"  // Must be taller than viewport
```

**Problem**: Lenis scroll feels laggy
```typescript
// Solution: Adjust duration and easing
duration: 0.8,  // Faster response
wheelMultiplier: 0.8,  // Less sensitive
```

**Problem**: Animation jank on mobile
```typescript
// Solution: Disable on mobile
if (window.innerWidth < 768) {
  return <StaticVersion />;
}
```

---

## My Personal Take

Having worked on this implementation, here's what I think:

### What Makes It Special

1. **Elegance**: Simple concept, sophisticated execution
2. **Engagement**: Users actively participate in revealing the story
3. **Flexibility**: Works with any text content
4. **Polish**: Smooth scrolling makes it feel premium

### What Could Be Better

1. **Accessibility**: Needs more work for screen readers
2. **Mobile**: Not as effective on small screens
3. **Load Time**: Initial GSAP + Lenis bundle (~50KB)
4. **Content Limitation**: Can't use for long-form content

### When to Use It

**Use it when:**
- You have a short, powerful message (< 200 words)
- Your audience uses desktop primarily
- You want to create a memorable first impression
- Performance budget allows for animation libraries

**Skip it when:**
- Content is long-form or information-dense
- Mobile is your primary platform
- Accessibility is non-negotiable
- Users need to quickly scan content

---

## Conclusion

The Progressive Text Reveal effect is a **powerful storytelling tool** that, when used appropriately, creates memorable user experiences. It combines:

- **GSAP ScrollTrigger** for precision scroll control
- **Lenis** for buttery-smooth scrolling
- **React** for component architecture
- **Typography** as the hero element

It's not just an animation—it's a **narrative technique** that guides users through your message at a controlled pace, ensuring they absorb every word.

**Bottom line**: Use it sparingly, optimize it well, and watch your engagement metrics soar. ✨

---

*Created as part of the Fetchr project. See the full implementation in `/components/ScrollHighlightSection.tsx`*

