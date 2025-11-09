import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Next Image: allow any https host (tighten later if needed)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }]
  },

  // If you used the experimental staleTimes flag earlier, keep it here:
  // experimental: { staleTimes: { dynamic: 5 * 60 * 1000 } },

  // Webpack alias so "@/..." works at runtime (Vercel/Linux is case-sensitive)
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd())
    };
    return config;
  }

  // ---- TEMP (uncomment ONLY if build is blocked by TS/ESLint) ----
  // ,typescript: { ignoreBuildErrors: true }
  // ,eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;
