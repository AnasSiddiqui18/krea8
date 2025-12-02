export const NextTemplate = {
  "src/app/layout.tsx": `import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js Starter Template",
  description: "A minimal Next.js 15.1.3 setup with Tailwind CSS.",
  keywords: ["Next.js", "Tailwind", "Template", "Starter"],
  openGraph: {
    title: "Next.js Starter Template",
    description: "A minimal Next.js 15.1.3 setup with Tailwind CSS.",
    siteName: "Next Starter",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,
  "src/app/page.tsx": `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        🚀 Welcome to Next.js Starter
      </h1>
      <p className="mt-4 text-gray-500">
        Edit <code className="font-mono text-sm">src/app/page.tsx</code> to get started.
      </p>
    </main>
  );
}`,

  "src/app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}


:root {
  --background: #ffffff;
  --foreground: #111111;
}

body {
  color: var(--foreground);
  background-color: var(--background);
  font-family: Arial, Helvetica, sans-serif;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}`,

  "tailwind.config.mjs": `const config= {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;`,

  "postcss.config.mjs": `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,

  "package.json": `{
  "name": "nextjs-starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "lucide-react": "^0.548.0",
    "autoprefixer": "^10.4.21",
    "next": "15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.3",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}`,
} as Record<string, string>;
