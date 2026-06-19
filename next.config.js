 /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    transpilePackages: ['undici'], // Paksa Next.js transpile library undici
  }

  module.exports = nextConfig