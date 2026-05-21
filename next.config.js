/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  sassOptions: {
    includePaths: ['src/styles']
  },
  typescript: {
    // Type safety is enforced via `npm run typecheck` (tsc --noEmit).
    // Next.js 13.1.1 build ignores skipLibCheck for test-only @types.
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
