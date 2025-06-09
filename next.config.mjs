/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*',
            },
            {
                protocol: 'http',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_PIAPI_KEY: process.env.SWAPFACE_API_KEY,
    },
};

export default nextConfig;
