import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { formatSchema } from "../lib/format";
import { FadeUp } from "../components/animations";

export const quoteSchema = z.object({
  format: formatSchema,
  durationInSeconds: z.number().min(1).default(6),
  quote: z.string().default("Kerja keras mengalahkan bakat ketika bakat tidak bekerja keras."),
  author: z.string().default("— Anonim"),
  gradientFrom: zColor().default("#7c3aed"),
  gradientTo: zColor().default("#db2777"),
  textColor: zColor().default("#ffffff"),
});

type Props = z.infer<typeof quoteSchema>;

export const Quote: React.FC<Props> = ({
  quote,
  author,
  gradientFrom,
  gradientTo,
  textColor,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: 100,
        textAlign: "center",
      }}
    >
      <FadeUp delay={4}>
        <div style={{ color: textColor, fontSize: 160, lineHeight: 0.5, opacity: 0.4 }}>
          &ldquo;
        </div>
      </FadeUp>
      <FadeUp delay={10}>
        <blockquote
          style={{
            color: textColor,
            fontSize: 64,
            fontWeight: 600,
            margin: "16px 0 0",
            lineHeight: 1.25,
            maxWidth: "90%",
          }}
        >
          {quote}
        </blockquote>
      </FadeUp>
      <FadeUp delay={24}>
        <p
          style={{
            color: textColor,
            opacity: 0.85,
            fontSize: 36,
            fontStyle: "italic",
            marginTop: 40,
          }}
        >
          {author}
        </p>
      </FadeUp>
    </AbsoluteFill>
  );
};
