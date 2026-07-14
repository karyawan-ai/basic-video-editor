import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  staticFile,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { DEFAULT_FPS, dimensions, formatSchema } from "../lib/format";
import { FadeUp } from "../components/animations";

// Satu bagian/pelajaran e-course:
// - video avatar (talking-head) opsional yang menjelaskan, dipotong sesuai narasi
// - slide: judul + poin-poin + gambar opsional
// Kalau avatar diisi, suara narasi ikut dari audio video avatar (tidak dibisukan)
// dan durasi bagian = trimEnd - trimStart. Kalau avatar dikosongkan (""), bagian
// jadi slide murni (tanpa PIP/audio) dan durasinya dari `durationSeconds`.
const lessonSchema = z.object({
  // Nama file video avatar di public/ (mis. "narasi-bab1.mp4"). Kosongkan ("")
  // untuk bagian tanpa avatar/talking-head.
  avatar: z.string().default(""),
  trimStart: z.number().min(0).default(0),
  trimEnd: z.number().min(0).default(30),
  // Durasi bagian (detik) dipakai HANYA kalau avatar dikosongkan.
  durationSeconds: z.number().min(1).default(8),
  title: z.string().default("Judul Bagian"),
  // Poin-poin yang muncul di slide (bullet), tampil bertahap.
  bullets: z.array(z.string()).default([]),
  // Gambar slide opsional di public/ (mis. "diagram.png"). Kosong = tanpa gambar.
  image: z.string().default(""),
});

export const ecourseSchema = z.object({
  format: formatSchema,
  fps: z.number().optional(),
  // Kartu pembuka opsional. introSeconds = 0 untuk melewati.
  courseTitle: z.string().default("Judul E-Course"),
  subtitle: z.string().default(""),
  introSeconds: z.number().min(0).default(3),
  // Daftar bagian/pelajaran, diputar berurutan.
  lessons: z
    .array(lessonSchema)
    .min(1)
    .default([
      {
        avatar: "",
        trimStart: 0,
        trimEnd: 30,
        durationSeconds: 8,
        title: "Pengantar",
        bullets: [],
        image: "",
      },
    ]),
  // Tata letak avatar PIP.
  avatarPosition: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  avatarShape: z.enum(["portrait", "circle"]).default("portrait"),
  // Lebar avatar sebagai fraksi lebar video (0.1–0.6).
  avatarSize: z.number().min(0.1).max(0.6).default(0.26),
  // Transisi antar bagian.
  transition: z.enum(["cut", "fade"]).default("fade"),
  transitionSeconds: z.number().min(0).default(0.4),
  // Musik latar opsional (pelan, di bawah suara narasi). File di public/.
  music: z.string().default(""),
  musicVolume: z.number().min(0).max(1).default(0.12),
  backgroundColor: zColor().default("#0f172a"),
  accentColor: zColor().default("#38bdf8"),
  textColor: zColor().default("#f8fafc"),
});

type Props = z.infer<typeof ecourseSchema>;
type Lesson = z.infer<typeof lessonSchema>;

const lessonFrames = (l: Lesson, fps: number) =>
  l.avatar
    ? Math.max(1, Math.round((l.trimEnd - l.trimStart) * fps))
    : Math.max(1, Math.round(l.durationSeconds * fps));

// Durasi total = intro + jumlah durasi tiap bagian, dikurangi overlap transisi fade.
export const ecourseMetadata: CalculateMetadataFunction<Props> = ({ props }) => {
  const { width, height } = dimensions[props.format];
  const fps = props.fps ?? DEFAULT_FPS;
  const introFrames =
    props.introSeconds > 0 ? Math.round(props.introSeconds * fps) : 0;
  const lessonsSum = props.lessons.reduce((a, l) => a + lessonFrames(l, fps), 0);
  const sequences = (introFrames > 0 ? 1 : 0) + props.lessons.length;
  const overlap =
    props.transition === "fade"
      ? Math.max(0, sequences - 1) * Math.round(props.transitionSeconds * fps)
      : 0;
  return {
    width,
    height,
    fps,
    durationInFrames: Math.max(1, introFrames + lessonsSum - overlap),
  };
};

// ---- Kartu pembuka ----
const IntroCard: React.FC<{
  courseTitle: string;
  subtitle: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
}> = ({ courseTitle, subtitle, backgroundColor, accentColor, textColor }) => (
  <AbsoluteFill
    style={{
      backgroundColor,
      justifyContent: "center",
      alignItems: "center",
      padding: 80,
      textAlign: "center",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <FadeUp>
      <div
        style={{
          color: accentColor,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
        }}
      >
        E-Course
      </div>
    </FadeUp>
    <FadeUp delay={8}>
      <h1
        style={{
          color: textColor,
          fontSize: 92,
          fontWeight: 900,
          margin: "24px 0 0",
          lineHeight: 1.05,
        }}
      >
        {courseTitle}
      </h1>
    </FadeUp>
    {subtitle ? (
      <FadeUp delay={16}>
        <p style={{ color: textColor, opacity: 0.8, fontSize: 40, marginTop: 28 }}>
          {subtitle}
        </p>
      </FadeUp>
    ) : null}
  </AbsoluteFill>
);

// ---- Avatar PIP (video talking-head di pojok) ----
const positionStyle: Record<
  Props["avatarPosition"],
  React.CSSProperties
> = {
  "bottom-right": { bottom: 48, right: 48 },
  "bottom-left": { bottom: 48, left: 48 },
  "top-right": { top: 48, right: 48 },
  "top-left": { top: 48, left: 48 },
};

const AvatarPip: React.FC<{
  lesson: Lesson;
  position: Props["avatarPosition"];
  shape: Props["avatarShape"];
  size: number;
  accentColor: string;
  fps: number;
}> = ({ lesson, position, shape, size, accentColor, fps }) => {
  const { width } = useVideoConfig();
  const boxW = Math.round(size * width);
  const boxH = shape === "circle" ? boxW : Math.round((boxW * 4) / 3);
  return (
    <div
      style={{
        position: "absolute",
        ...positionStyle[position],
        width: boxW,
        height: boxH,
        borderRadius: shape === "circle" ? "50%" : 24,
        overflow: "hidden",
        border: `4px solid ${accentColor}`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}
    >
      <OffthreadVideo
        src={staticFile(lesson.avatar)}
        startFrom={Math.round(lesson.trimStart * fps)}
        endAt={Math.round(lesson.trimEnd * fps)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

// ---- Slide (judul + poin + gambar) di belakang avatar ----
const Slide: React.FC<{
  lesson: Lesson;
  avatarPosition: Props["avatarPosition"];
  backgroundColor: string;
  accentColor: string;
  textColor: string;
}> = ({ lesson, avatarPosition, backgroundColor, accentColor, textColor }) => {
  // Beri ruang kosong di sisi tempat avatar menempel agar tidak menutupi konten
  // (hanya kalau bagian ini memang punya avatar).
  const avatarBottom = Boolean(lesson.avatar) && avatarPosition.startsWith("bottom");
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        padding: 80,
        paddingBottom: avatarBottom ? 220 : 80,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <FadeUp>
        <h1
          style={{
            color: textColor,
            fontSize: 68,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {lesson.title}
        </h1>
        <div
          style={{
            height: 6,
            width: 140,
            background: accentColor,
            marginTop: 18,
            borderRadius: 99,
          }}
        />
      </FadeUp>

      <div style={{ display: "flex", gap: 56, marginTop: 48, flex: 1 }}>
        {lesson.bullets.length > 0 ? (
          <ul style={{ flex: 1, listStyle: "none", margin: 0, padding: 0 }}>
            {lesson.bullets.map((b, i) => (
              <FadeUp key={i} delay={10 + i * 8}>
                <li
                  style={{
                    color: textColor,
                    fontSize: 40,
                    lineHeight: 1.4,
                    marginBottom: 28,
                    display: "flex",
                    gap: 18,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: accentColor, fontWeight: 900 }}>▸</span>
                  <span>{b}</span>
                </li>
              </FadeUp>
            ))}
          </ul>
        ) : null}

        {lesson.image ? (
          <FadeUp delay={12} style={{ flex: 1, display: "flex" }}>
            <Img
              src={staticFile(lesson.image)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 20,
              }}
            />
          </FadeUp>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const Ecourse: React.FC<Props> = ({
  courseTitle,
  subtitle,
  introSeconds,
  lessons,
  avatarPosition,
  avatarShape,
  avatarSize,
  transition,
  transitionSeconds,
  music,
  musicVolume,
  backgroundColor,
  accentColor,
  textColor,
  fps: fpsProp,
}) => {
  const fps = fpsProp ?? DEFAULT_FPS;
  const transitionFrames = Math.max(1, Math.round(transitionSeconds * fps));
  const introFrames = introSeconds > 0 ? Math.round(introSeconds * fps) : 0;

  type Item =
    | { kind: "intro"; frames: number }
    | { kind: "lesson"; frames: number; lesson: Lesson };

  const items: Item[] = [];
  if (introFrames > 0) items.push({ kind: "intro", frames: introFrames });
  lessons.forEach((lesson) =>
    items.push({ kind: "lesson", frames: lessonFrames(lesson, fps), lesson }),
  );

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <TransitionSeries>
        {items.flatMap((it, idx) => {
          const nodes: React.ReactNode[] = [];

          if (idx > 0 && transition === "fade") {
            nodes.push(
              <TransitionSeries.Transition
                key={`t-${idx}`}
                presentation={fade()}
                timing={linearTiming({ durationInFrames: transitionFrames })}
              />,
            );
          }

          nodes.push(
            <TransitionSeries.Sequence key={`s-${idx}`} durationInFrames={it.frames}>
              {it.kind === "intro" ? (
                <IntroCard
                  courseTitle={courseTitle}
                  subtitle={subtitle}
                  backgroundColor={backgroundColor}
                  accentColor={accentColor}
                  textColor={textColor}
                />
              ) : (
                <AbsoluteFill>
                  <Slide
                    lesson={it.lesson}
                    avatarPosition={avatarPosition}
                    backgroundColor={backgroundColor}
                    accentColor={accentColor}
                    textColor={textColor}
                  />
                  {it.lesson.avatar ? (
                    <AvatarPip
                      lesson={it.lesson}
                      position={avatarPosition}
                      shape={avatarShape}
                      size={avatarSize}
                      accentColor={accentColor}
                      fps={fps}
                    />
                  ) : null}
                </AbsoluteFill>
              )}
            </TransitionSeries.Sequence>,
          );

          return nodes;
        })}
      </TransitionSeries>

      {music ? <Audio src={staticFile(music)} volume={musicVolume} /> : null}
    </AbsoluteFill>
  );
};
