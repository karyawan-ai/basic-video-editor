import { z } from "zod";

// Rasio video yang didukung. Setiap project memilih salah satu.
// Claude akan menanyakan rasio ini ke user saat membuat video baru.
export const formatSchema = z
  .enum(["9:16", "16:9", "1:1"])
  .describe("Rasio video: 9:16 (TikTok/Reels), 16:9 (YouTube), 1:1 (feed IG)");

export type Format = z.infer<typeof formatSchema>;

export const dimensions: Record<Format, { width: number; height: number }> = {
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
  "1:1": { width: 1080, height: 1080 },
};

export const DEFAULT_FPS = 30;
