import React from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Muncul dengan fade + naik sedikit. delay dalam frame.
export const FadeUp: React.FC<{
  delay?: number;
  distance?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, distance = 24, durationInFrames = 20, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: { damping: 200 },
  });
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Fade in di awal & fade out di akhir sebuah klip/sequence.
// `frame` dihitung relatif terhadap sequence tempat komponen ini dipakai.
export const useClipFade = (
  totalFrames: number,
  fadeFrames = 12,
): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeFrames, totalFrames - fadeFrames, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};
