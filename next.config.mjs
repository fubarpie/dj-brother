/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    webpack: (config) => {
        config.externals.push('@prisma/client', 'prisma');
        return config;
    },
};

export default nextConfig;
