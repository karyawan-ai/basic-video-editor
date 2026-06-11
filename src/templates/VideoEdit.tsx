import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  staticFile,
  type CalculateMetadataFunction,
} from "remotion";
import { z } from "zod";
import { DEFAULT_FPS, dimensions, formatSchema } from "../lib/format";
import { Overlays, overlaySchema } from "../components/Overlays";

export const videoEditSchema = z.object({
  format: formatSchema,
  fps: z.number().optional(),
  // Nama file video user di folder public/, mis. "klip-saya.mp4".
  src: z.string().default("input.mp4"),
  // Potong: ambil dari detik ke-trimStart sampai detik ke-trimEnd.
  trimStart: z.number().min(0).default(0),
  trimEnd: z.number().min(0).default(10),
  // Teks yang ditempel di atas video.
  overlays: z.array(overlaySchema).default([]),
  // Pertahankan audio asli video? (false = bisukan)
  keepAudio: z.boolean().default(true),
  // Musik latar opsional (file di public/).
  music: z.string().default(""),
  musicVolume: z.number().min(0).max(1).default(0.5),
});

type Props = z.infer<typeof videoEditSchema>;

// Durasi = bagian video yang dipotong (trimEnd - trimStart).
export const videoEditMetadata: CalculateMetadataFunction<Props> = ({ props }) => {
  const { width, height } = dimensions[props.format];
  const fps = props.fps ?? DEFAULT_FPS;
  const seconds = Math.max(0.1, props.trimEnd - props.trimStart);
  return {
    width,
    height,
    fps,
    durationInFrames: Math.round(seconds * fps),
  };
};

export const VideoEdit: React.FC<Props> = ({
  src,
  trimStart,
  trimEnd,
  overlays,
  keepAudio,
  music,
  musicVolume,
  fps: fpsProp,
}) => {
  const fps = fpsProp ?? DEFAULT_FPS;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={Math.round(trimStart * fps)}
        endAt={Math.round(trimEnd * fps)}
        muted={!keepAudio}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      <Overlays overlays={overlays} fps={fps} />

      {music ? <Audio src={staticFile(music)} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};
