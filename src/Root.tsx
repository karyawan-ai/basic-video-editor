import React from "react";
import { Composition } from "remotion";
import { standardMetadata } from "./lib/metadata";

import { TitleIntro, titleIntroSchema } from "./templates/TitleIntro";
import { Quote, quoteSchema } from "./templates/Quote";
import { PromoProduct, promoProductSchema } from "./templates/PromoProduct";
import { Slideshow, slideshowSchema, slideshowMetadata } from "./templates/Slideshow";
import { VideoEdit, videoEditSchema, videoEditMetadata } from "./templates/VideoEdit";
import { StitchVideos, stitchVideosSchema, stitchVideosMetadata } from "./templates/StitchVideos";

// Setiap <Composition> = satu template.
// Ukuran & durasi dihitung dinamis lewat calculateMetadata berdasarkan props,
// jadi rasio (9:16 / 16:9 / 1:1) ditentukan oleh data project, bukan di-hardcode.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TitleIntro"
        component={TitleIntro}
        schema={titleIntroSchema}
        defaultProps={{
          format: "9:16" as const,
          durationInSeconds: 4,
          title: "Judul Video Kamu",
          subtitle: "subjudul singkat di sini",
          backgroundColor: "#0f172a",
          textColor: "#ffffff",
          accentColor: "#38bdf8",
        }}
        calculateMetadata={standardMetadata()}
        // Nilai placeholder; akan dioverride calculateMetadata.
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="Quote"
        component={Quote}
        schema={quoteSchema}
        defaultProps={{
          format: "9:16" as const,
          durationInSeconds: 6,
          quote:
            "Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras.",
          author: "— Anonim",
          gradientFrom: "#7c3aed",
          gradientTo: "#db2777",
          textColor: "#ffffff",
        }}
        calculateMetadata={standardMetadata()}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="PromoProduct"
        component={PromoProduct}
        schema={promoProductSchema}
        defaultProps={{
          format: "9:16" as const,
          durationInSeconds: 8,
          productImage: "",
          title: "Nama Produk",
          price: "Rp149.000",
          badge: "DISKON 50%",
          cta: "Beli Sekarang",
          backgroundColor: "#fef3c7",
          accentColor: "#ef4444",
          textColor: "#1f2937",
        }}
        calculateMetadata={standardMetadata()}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="Slideshow"
        component={Slideshow}
        schema={slideshowSchema}
        defaultProps={{
          format: "9:16" as const,
          images: ["slide-1.jpg", "slide-2.jpg", "slide-3.jpg"],
          captions: [],
          secondsPerImage: 2.5,
          music: "",
          backgroundColor: "#000000",
          textColor: "#ffffff",
        }}
        calculateMetadata={slideshowMetadata}
        durationInFrames={225}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="VideoEdit"
        component={VideoEdit}
        schema={videoEditSchema}
        defaultProps={{
          format: "9:16" as const,
          src: "input.mp4",
          trimStart: 0,
          trimEnd: 10,
          overlays: [],
          keepAudio: true,
          music: "",
          musicVolume: 0.5,
        }}
        calculateMetadata={videoEditMetadata}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="StitchVideos"
        component={StitchVideos}
        schema={stitchVideosSchema}
        defaultProps={{
          format: "9:16" as const,
          clips: [
            { src: "klip-1.mp4", trimStart: 0, trimEnd: 5, overlays: [] },
            { src: "klip-2.mp4", trimStart: 0, trimEnd: 5, overlays: [] },
          ],
          transition: "fade" as const,
          transitionSeconds: 0.5,
          keepClipAudio: true,
          music: "",
          musicVolume: 0.5,
        }}
        calculateMetadata={stitchVideosMetadata}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
