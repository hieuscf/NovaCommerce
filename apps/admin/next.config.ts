import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@novacommerce/ui', '@novacommerce/frontend'],
};

export default nextConfig;
