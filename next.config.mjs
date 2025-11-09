import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  // temp unblock during dev if needed:
  // typescript: { ignoreBuildErrors: true },
  // eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    config.resolve.alias = { ...(config.resolve.alias || {}), '@': path.resolve(__dirname) };
    return config;
  },
};

export default nextConfig;
