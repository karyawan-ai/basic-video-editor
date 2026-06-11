import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { FadeUp } from "./animations";

// Satu teks yang ditempel di atas video pada rentang waktu tertentu.
// startSec/endSec dihitung relatif terhadap awal klip tempat overlay ini dipakai.
export const overlaySchema = z.object({
  text: z.string(),
  startSec: z.number().min(0).default(0),
  endSec: z.number().min(0).default(3),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  fontSize: z.number().default(56),
  color: zColor().default("#ffffff"),
});

export type Overlay = z.infer<typeof overlaySchema>;

const positionStyle: Record<Overlay["position"], React.CSSProperties> = {
  top: { justifyContent: "flex-start", paddingTop: 120 },
  center: { justifyContent: "center" },
  bottom: { justifyContent: "flex-end", paddingBottom: 120 },
};

export const Overlays: React.FC<{ overlays: Overlay[]; fps: number }> = ({
  overlays,
  fps,
}) => {
  return (
    <>
      {overlays.map((o, i) => {
        const from = Math.round(o.startSec * fps);
        const duration = Math.max(1, Math.round((o.endSec - o.startSec) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <AbsoluteFill
              style={{
                alignItems: "center",
                padding: 60,
                textAlign: "center",
                fontFamily: "system-ui, sans-serif",
                ...positionStyle[o.position],
              }}
            >
              <FadeUp>
                <span
                  style={{
                    color: o.color,
                    fontSize: o.fontSize,
                    fontWeight: 800,
                    textShadow: "0 2px 12px rgba(0,0,0,0.7)",
                    background: "rgba(0,0,0,0.25)",
                    padding: "10px 24px",
                    borderRadius: 12,
                  }}
                >
                  {o.text}
                </span>
              </FadeUp>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
};
