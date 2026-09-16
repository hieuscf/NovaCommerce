import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@novacommerce/ui', '@novacommerce/frontend', 'react-toastify'],
};

export default nextConfig;
