export function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Brand & Description */}
          <div>
            <h2 className="font-serif text-2xl font-light mb-2 text-gray-900 dark:text-[#F7F7F7]">Fetchr</h2>
            <p className="text-gray-600 dark:text-[#A0A0A0] text-sm max-w-md mb-2">
              Making recruitment effortless, one email at a time.
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
              Secure. Open-source. Feel free to contribute.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
