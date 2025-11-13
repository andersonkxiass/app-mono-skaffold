import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ['@contracts/shared'],
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
