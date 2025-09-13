// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  //serverExternalPackages: ['pdf-parse'],
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
