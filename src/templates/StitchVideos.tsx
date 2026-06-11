import React from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  staticFile,
  type CalculateMetadataFunction,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { z } from "zod";
import { DEFAULT_FPS, dimensions, formatSchema } from "../lib/format";
import { Overlays, overlaySchema } from "../components/Overlays";

// Satu klip dalam rangkaian: video user yang dipotong + overlay teks opsional.
const clipSchema = z.object({
  src: z.string(),
  trimStart: z.number().min(0).default(0),
  trimEnd: z.number().min(0).default(5),
  overlays: z.array(overlaySchema).default([]),
});

export const stitchVideosSchema = z.object({
  format: formatSchema,
  fps: z.number().optional(),
  // Daftar klip yang akan disambung berurutan jadi satu video.
  clips: z.array(clipSchema).min(1).default([{ src: "klip-1.mp4", trimStart: 0, trimEnd: 5, overlays: [] }]),
  // Transisi antar-klip: "cut" (potong tegas) atau "fade" (silang halus).
  transition: z.enum(["cut", "fade"]).default("fade"),
  transitionSeconds: z.number().min(0).default(0.5),
  // Pertahankan audio asli tiap klip?
  keepClipAudio: z.boolean().default(true),
  // Musik latar opsional yang menutupi seluruh video (file di public/).
  music: z.string().default(""),
  musicVolume: z.number().min(0).max(1).default(0.5),
});

type Props = z.infer<typeof stitchVideosSchema>;

const clipFrames = (clip: Props["clips"][number], fps: number) =>
  Math.max(1, Math.round((clip.trimEnd - clip.trimStart) * fps));

// Durasi total = jumlah durasi tiap klip, dikurangi overlap transisi.
export const stitchVideosMetadata: CalculateMetadataFunction<Props> = ({ props }) => {
  const { width, height } = dimensions[props.format];
  const fps = props.fps ?? DEFAULT_FPS;
  const sum = props.clips.reduce((acc, c) => acc + clipFrames(c, fps), 0);
  const overlap =
    props.transition === "fade"
      ? Math.max(0, props.clips.length - 1) * Math.round(props.transitionSeconds * fps)
      : 0;
  return {
    width,
    height,
    fps,
    durationInFrames: Math.max(1, sum - overlap),
  };
};

export const StitchVideos: React.FC<Props> = ({
  clips,
  transition,
  transitionSeconds,
  keepClipAudio,
  music,
  musicVolume,
  fps: fpsProp,
}) => {
  const fps = fpsProp ?? DEFAULT_FPS;
  const transitionFrames = Math.max(1, Math.round(transitionSeconds * fps));

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {clips.flatMap((clip, i) => {
          const nodes: React.ReactNode[] = [];

          if (i > 0 && transition === "fade") {
            nodes.push(
              <TransitionSeries.Transition
                key={`t-${i}`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: transitionFrames })}
              />,
            );
          }

          nodes.push(
            <TransitionSeries.Sequence
              key={`s-${i}`}
              durationInFrames={clipFrames(clip, fps)}
            >
              <AbsoluteFill style={{ backgroundColor: "#000" }}>
                <OffthreadVideo
                  src={staticFile(clip.src)}
                  startFrom={Math.round(clip.trimStart * fps)}
                  endAt={Math.round(clip.trimEnd * fps)}
                  muted={!keepClipAudio}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Overlays overlays={clip.overlays} fps={fps} />
              </AbsoluteFill>
            </TransitionSeries.Sequence>,
          );

          return nodes;
        })}
      </TransitionSeries>

      {music ? <Audio src={staticFile(music)} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};
