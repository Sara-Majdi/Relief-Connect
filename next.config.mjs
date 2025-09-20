/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "images.unsplash.com",
        },
      ],
  },
};

export default nextConfig;
