/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'apimg.com.br', 'www.apimg.com.br'],
  },
  serverRuntimeConfig: {
    // Aumenta o limite do corpo da requisição para 100mb
    // para permitir uploads de arquivos maiores.
    maxRequestBodySize: '20mb',
  },
};

module.exports = nextConfig;