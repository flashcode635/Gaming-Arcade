import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  // Type errors are real errors — the build fails on them now that tsc is clean.
  reactStrictMode: false,
  async redirects() {
    // The games moved under /arcade/<game> — keep old deep links alive.
    return ["plinko", "snake", "memory", "minesweeper", "sudoku", "tictactoe"].map(
      (game) => ({
        source: `/${game}`,
        destination: `/arcade/${game}`,
        permanent: true,
      }),
    );
  },
};

export default nextConfig;
