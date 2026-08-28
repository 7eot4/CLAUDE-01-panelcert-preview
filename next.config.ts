import type { NextConfig } from "next";

// GITHUB_PAGES_BUILD switches to a static export, used only by the GitHub Pages
// preview workflow (.github/workflows/gh-pages.yml). The real deployment (Vercel/Node
// host) never sets this and keeps the normal server build with working API routes.
const isGithubPagesBuild = process.env.GITHUB_PAGES_BUILD === "1";
const basePath = process.env.GITHUB_PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = isGithubPagesBuild
  ? {
      output: "export",
      basePath,
      assetPrefix: basePath ? `${basePath}/` : undefined,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
