import React from "react";
import { AbsoluteFill, Img, staticFile, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { formatSchema } from "../lib/format";
import { FadeUp } from "../components/animations";

export const promoProductSchema = z.object({
  format: formatSchema,
  durationInSeconds: z.number().min(1).default(8),
  // Nama file gambar di folder public/, mis. "produk.png".
  // Kosongkan untuk memakai placeholder warna.
  productImage: z.string().default(""),
  title: z.string().default("Nama Produk"),
  price: z.string().default("Rp149.000"),
  badge: z.string().default("DISKON 50%"),
  cta: z.string().default("Beli Sekarang"),
  backgroundColor: zColor().default("#fef3c7"),
  accentColor: zColor().default("#ef4444"),
  textColor: zColor().default("#1f2937"),
});

type Props = z.infer<typeof promoProductSchema>;

export const PromoProduct: React.FC<Props> = ({
  productImage,
  title,
  price,
  badge,
  cta,
  backgroundColor,
  accentColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 6, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, Helvetica, Arial, sans-serif",
        padding: 80,
        textAlign: "center",
        gap: 32,
      }}
    >
      {badge ? (
        <div
          style={{
            transform: `scale(${pop}) rotate(-6deg)`,
            backgroundColor: accentColor,
            color: "#fff",
            fontSize: 40,
            fontWeight: 800,
            padding: "12px 28px",
            borderRadius: 999,
          }}
        >
          {badge}
        </div>
      ) : null}

      <FadeUp delay={10}>
        <div
          style={{
            width: 520,
            height: 520,
            borderRadius: 32,
            overflow: "hidden",
            backgroundColor: "rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
          }}
        >
          {productImage ? (
            <Img
              src={staticFile(productImage)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: textColor, opacity: 0.4, fontSize: 28 }}>
              taruh gambar di public/
            </span>
          )}
        </div>
      </FadeUp>

      <FadeUp delay={20}>
        <h1 style={{ color: textColor, fontSize: 72, fontWeight: 800, margin: 0 }}>
          {title}
        </h1>
      </FadeUp>

      <FadeUp delay={26}>
        <div style={{ color: accentColor, fontSize: 88, fontWeight: 900 }}>{price}</div>
      </FadeUp>

      <FadeUp delay={32}>
        <div
          style={{
            backgroundColor: accentColor,
            color: "#fff",
            fontSize: 44,
            fontWeight: 700,
            padding: "20px 56px",
            borderRadius: 16,
          }}
        >
          {cta}
        </div>
      </FadeUp>
    </AbsoluteFill>
  );
};
