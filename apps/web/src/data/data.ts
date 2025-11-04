import type { TreeNode } from "@/components/builder/tree-view-component";

export const sampleConversation = [
  {
    role: "user",
    content: "Hey, can you help me create a landing page for my startup?",
  },
  { role: "assistant", content: "Absolutely! What’s your startup about?" },
  {
    role: "user",
    content: "It’s called “NovaSync” — a team productivity platform.",
  },
  {
    role: "assistant",
    content: "Nice! Would you like a modern or minimal design?",
  },
  {
    role: "user",
    content: "Let’s go with modern — clean but with some color.",
  },
  {
    role: "assistant",
    content: "Got it. Do you want a hero section with a headline and CTA?",
  },
  {
    role: "user",
    content: "Yes, something like 'Boost Your Team’s Productivity with AI'.",
  },
  {
    role: "assistant",
    content: "Perfect. Should I include an illustration or product image?",
  },
  { role: "user", content: "An illustration would be better." },
  {
    role: "assistant",
    content: "Great. How about sections — features, testimonials, pricing?",
  },
  { role: "user", content: "Add features and testimonials for now." },
  {
    role: "assistant",
    content:
      "Done. What color palette do you prefer — blue, purple, or custom?",
  },
  { role: "user", content: "Go with a soft blue and white combination." },
  {
    role: "assistant",
    content: "Setting that up. Any specific font style you like?",
  },
  {
    role: "user",
    content: "Maybe something geometric and professional, like Inter.",
  },
  {
    role: "assistant",
    content: "Excellent choice. Want the navigation bar to be sticky?",
  },
  { role: "user", content: "Yes, and include a 'Get Started' button on it." },
  { role: "assistant", content: "Got it. Should the page support dark mode?" },
  { role: "user", content: "Yes, please." },
  {
    role: "assistant",
    content: "Adding that now. Do you need a footer section?",
  },
  { role: "user", content: "Just a simple one with social links." },
  {
    role: "assistant",
    content: "Done. Would you like me to deploy it to preview?",
  },
  { role: "user", content: "Sure, let’s see how it looks." },
  {
    role: "assistant",
    content: "Your preview is ready — here’s the live URL.",
  },
  {
    role: "user",
    content: "Wow, this looks amazing. Thanks for the quick work!",
  },
];

const files = {
  src: {
    directory: {
      app: {
        directory: {
          "layout.tsx": {
            file: {
              contents: `import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Awesome Landing Page",
  description:
    "Discover the best solutions for your needs with our cutting-edge services.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
    {children}
      </body>
    </html>
  );
}
`,
            },
          },

          "globals.css": {
            file: {
              contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}
`,
            },
          },

          "page.tsx": {
            file: {
              contents: `export default function Home() {
  return <div className="text-red-300">some text</div>;
}`,
            },
          },
        },
      },
    },
  },

  "tailwind.config.ts": {
    file: {
      contents: `
        
import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
export default config;

        
        `,
    },
  },

  "package.json": {
    file: {
      contents: `
        {
  "name": "test",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "autoprefixer": "^10.4.21",
    "next": "15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.3",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

        
        `,
    },
  },

  "tsconfig.json": {
    file: {
      contents: `
        
        
        {
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
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

        `,
    },
  },

  "postcss.config.mjs": {
    file: {
      contents: `/** @type {import('postcss-load-config').Config} **/

const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};

export default config;
`,
    },
  },
};

export const mockFileTree: TreeNode[] = [
  {
    id: "src",
    label: "src",
    type: "dir",
    children: [
      {
        id: "app",
        label: "app",
        type: "dir",
        children: [
          {
            id: "layout.tsx",
            label: "layout.tsx",
            type: "file",
            children: [],
          },

          {
            id: "page.tsx",
            label: "page.tsx",
            type: "file",
            children: [],
          },
          {
            id: "globals.css",
            label: "globals.css",
            type: "file",
            children: [],
          },
        ],
      },
    ],
  },

  {
    id: "packge.json",
    label: "packge.json",
    type: "file",
    children: [],
  },

  {
    id: "tailwind.config.ts",
    label: "tailwind.config.ts",
    type: "file",

    children: [],
  },
];
