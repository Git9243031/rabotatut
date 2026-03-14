/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript:  { ignoreBuildErrors: true },
  eslint:      { ignoreDuringBuilds: true },
  // Не бандлить firebase на сервере
  serverExternalPackages: ['firebase', 'firebase-admin'],
}
export default nextConfig
