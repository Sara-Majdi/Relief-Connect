/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'lh3.googleusercontent.com',
        'avatars.githubusercontent.com',
        'kljyabbkgufeysuuudpu.supabase.co',
        'assets.nst.com.my'
      ],
      remotePatterns: [
        {
          protocol: "https",
          hostname: "images.unsplash.com",
        },
        {
          protocol: "https",
          hostname: "kljyabbkgufeysuuudpu.supabase.co",
        },
        {
          protocol: "https",
          hostname: "assets.nst.com.my",
        },
      ],
  },
};

export default nextConfig;
