import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { DEFAULT_FPS, dimensions, formatSchema } from "../lib/format";

export const slideshowSchema = z.object({
  format: formatSchema,
  fps: z.number().optional(),
  // Nama-nama file gambar di folder public/.
  images: z.array(z.string()).default(["slide-1.jpg", "slide-2.jpg", "slide-3.jpg"]),
  // Caption opsional; index-nya sejajar dengan images.
  captions: z.array(z.string()).default([]),
  secondsPerImage: z.number().min(0.5).default(2.5),
  // File audio opsional di public/, mis. "musik.mp3".
  music: z.string().default(""),
  backgroundColor: zColor().default("#000000"),
  textColor: zColor().default("#ffffff"),
});

type Props = z.infer<typeof slideshowSchema>;

// Durasi total = jumlah gambar x detik per gambar.
export const slideshowMetadata: CalculateMetadataFunction<Props> = ({ props }) => {
  const { width, height } = dimensions[props.format];
  const fps = props.fps ?? DEFAULT_FPS;
  const count = Math.max(1, props.images.length);
  return {
    width,
    height,
    fps,
    durationInFrames: Math.round(count * props.secondsPerImage * fps),
  };
};

const Slide: React.FC<{
  src: string;
  caption?: string;
  totalFrames: number;
  textColor: string;
}> = ({ src, caption, totalFrames, textColor }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 10, totalFrames - 10, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Ken Burns: zoom pelan supaya tidak statis.
  const scale = interpolate(frame, [0, totalFrames], [1, 1.08]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      {caption ? (
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            padding: 80,
            background: "linear-gradient(transparent 55%, rgba(0,0,0,0.7))",
          }}
        >
          <h2
            style={{
              color: textColor,
              fontSize: 56,
              fontWeight: 800,
              margin: 0,
              fontFamily: "system-ui, sans-serif",
              textAlign: "center",
            }}
          >
            {caption}
          </h2>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Slideshow: React.FC<Props> = ({
  images,
  captions,
  secondsPerImage,
  music,
  backgroundColor,
  textColor,
}) => {
  const { fps } = useVideoConfig();
  const perImage = Math.round(secondsPerImage * fps);

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {images.map((src, i) => (
        <Sequence key={`${src}-${i}`} from={i * perImage} durationInFrames={perImage}>
          <Slide
            src={src}
            caption={captions[i]}
            totalFrames={perImage}
            textColor={textColor}
          />
        </Sequence>
      ))}
      {music ? <Audio src={staticFile(music)} /> : null}
    </AbsoluteFill>
  );
};
