// Preconnect hints — React 19 automatically hoists <link> tags to <head>.
// These establish TCP/TLS connections early without downloading any scripts.
export function CalendlyPrefetch() {
  return (
    <>
      <link rel="preconnect" href="https://assets.calendly.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://calendly.com" />
    </>
  );
}
