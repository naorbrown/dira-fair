/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/dira-fair",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
