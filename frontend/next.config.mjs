/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "export",
  trailingSlash: true,   // Genera huecos/index.html en vez de huecos.html → compatible con Azure Static Hosting
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
