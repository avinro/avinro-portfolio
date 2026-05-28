import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/contact", destination: "/", permanent: true },
      {
        source: "/work/hello-dojo",
        destination: "/case-studies/hello-dojo",
        permanent: true,
      },
      {
        source: "/work/uma",
        destination: "/case-studies/uma",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
