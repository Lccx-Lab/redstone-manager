import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 装備・ステータス画面のスクリーンショットアップロード用にデフォルト(1MB)から引き上げ
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
