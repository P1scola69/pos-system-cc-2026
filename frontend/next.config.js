/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination:
          `${process.env.NEXT_PUBLIC_API_URL || 'https://pos-backend-api-eval2026-v2.azurewebsites.net'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;