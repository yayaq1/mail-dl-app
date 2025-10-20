import { LandingHeader } from "@/components/LandingHeader";
import { ScrollHighlightSection } from "@/components/ScrollHighlightSection";
import { LandingFooter } from "@/components/LandingFooter";
import { SmoothScroll } from "@/components/SmoothScroll";

export default function Home() {
  return (
    <div className="bg-[#0A0A0A] text-[#F7F7F7] min-h-screen">
      <SmoothScroll>
        <LandingHeader />
        <main className="pt-20">
          <ScrollHighlightSection />
          {/* CTA Section */}
          <section className="py-24 px-6 text-center bg-[#0A0A0A]">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6 text-[#F7F7F7]">
                Ready to save hours every&nbsp;week?
              </h2>
              <p className="text-lg text-[#A0A0A0] mb-8 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of recruiters who have already automated their&nbsp;workflow. 
                Open-source, secure, and built by the&nbsp;community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="/app"
                  className="px-8 py-4 bg-[#2C64FF] text-[#F7F7F7] text-base font-medium rounded-full hover:bg-[#2C64FF]/90 hover:shadow-lg hover:shadow-[#2C64FF]/20 transition-all duration-200 inline-block"
                >
                  Try It Free
                </a>
                <a
                  href="https://github.com/yayaq1/fetchr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border border-white/20 text-[#F7F7F7] text-base font-medium rounded-full hover:border-[#2C64FF]/50 hover:bg-[#2C64FF]/5 transition-all duration-200 inline-block"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </SmoothScroll>
    </div>
  );
}
