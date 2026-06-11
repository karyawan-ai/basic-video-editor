import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { formatSchema } from "../lib/format";
import { FadeUp } from "../components/animations";

export const titleIntroSchema = z.object({
  format: formatSchema,
  durationInSeconds: z.number().min(1).default(4),
  title: z.string().default("Judul Video Kamu"),
  subtitle: z.string().default("subjudul singkat di sini"),
  backgroundColor: zColor().default("#0f172a"),
  textColor: zColor().default("#ffffff"),
  accentColor: zColor().default("#38bdf8"),
});

type Props = z.infer<typeof titleIntroSchema>;

export const TitleIntro: React.FC<Props> = ({
  title,
  subtitle,
  backgroundColor,
  textColor,
  accentColor,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, Helvetica, Arial, sans-serif",
        padding: 80,
        textAlign: "center",
      }}
    >
      <FadeUp delay={4}>
        <div
          style={{
            width: 80,
            height: 6,
            borderRadius: 999,
            backgroundColor: accentColor,
            margin: "0 auto 32px",
          }}
        />
      </FadeUp>
      <FadeUp delay={8}>
        <h1
          style={{
            color: textColor,
            fontSize: 96,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>
      </FadeUp>
      <FadeUp delay={18}>
        <p
          style={{
            color: textColor,
            opacity: 0.7,
            fontSize: 40,
            fontWeight: 400,
            marginTop: 24,
          }}
        >
          {subtitle}
        </p>
      </FadeUp>
    </AbsoluteFill>
  );
};
