import type { CalculateMetadataFunction } from "remotion";
import { DEFAULT_FPS, dimensions, type Format } from "./format";

// Props minimal yang dipakai untuk menghitung metadata composition.
type WithFormatAndDuration = {
  format: Format;
  durationInSeconds: number;
  fps?: number;
};

// Helper umum: ukuran composition mengikuti rasio yang dipilih,
// dan jumlah frame dihitung dari durasi (detik) x fps.
// Dipakai oleh template yang durasinya ditentukan langsung oleh user.
export function standardMetadata<
  T extends WithFormatAndDuration,
>(): CalculateMetadataFunction<T> {
  return ({ props }) => {
    const { width, height } = dimensions[props.format];
    const fps = props.fps ?? DEFAULT_FPS;
    return {
      width,
      height,
      fps,
      durationInFrames: Math.max(1, Math.round(props.durationInSeconds * fps)),
    };
  };
}
