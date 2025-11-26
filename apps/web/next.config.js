/** @type {import('next').NextConfig} */

async function headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
      ],
    },
  ];
}

const nextConfig = {
  devIndicators: false,

  // headers,
};

export default nextConfig;
