/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_SECRET: "defaultSecret",
    NEXTAUTH_URL: "http://localhost:3000",
  },
};

module.exports = nextConfig;
