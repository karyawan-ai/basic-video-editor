#!/usr/bin/env python3
"""Transcribe suara narasi (video/audio) jadi caption/subtitle pakai Whisper.

Dipakai untuk mengubah audio narasi (mis. dari video avatar e-course) menjadi
file caption yang bisa ditempel di video lewat komponen <Captions> Remotion,
plus file .srt umum.

Contoh:
    .venv/bin/python scripts/transcribe.py public/avatar.mp4
    .venv/bin/python scripts/transcribe.py public/narasi.mp3 --model small --lang id

Output (default di samping file sumber):
    public/avatar.captions.json   -> dipakai komponen <Captions src="avatar.captions.json" />
    public/avatar.srt             -> subtitle umum

Timestamp di JSON bersifat ABSOLUT terhadap file sumber. Di Ecourse, komponen
<Captions> otomatis menyaring/menggeser sesuai trimStart/trimEnd tiap bagian,
jadi satu file caption bisa dipakai semua bagian yang memotong video yang sama.
"""

import argparse
import json
import sys
from pathlib import Path


def format_timestamp(seconds: float) -> str:
    """Detik -> "HH:MM:SS,mmm" untuk format SRT."""
    ms = round(seconds * 1000)
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def write_srt(segments: list[dict], path: Path) -> None:
    lines: list[str] = []
    for i, seg in enumerate(segments, start=1):
        lines.append(str(i))
        lines.append(f"{format_timestamp(seg['start'])} --> {format_timestamp(seg['end'])}")
        lines.append(seg["text"])
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Transcribe audio/video -> caption JSON + SRT (Whisper).")
    parser.add_argument("input", help="File audio/video di-transcribe (mis. public/avatar.mp4).")
    parser.add_argument(
        "--model",
        default="small",
        help="Ukuran model Whisper: tiny|base|small|medium|large-v3 (default: small). "
        "Makin besar makin akurat tapi lambat & download lebih besar.",
    )
    parser.add_argument(
        "--lang",
        default=None,
        help="Kode bahasa (mis. 'id' untuk Indonesia, 'en'). Default: deteksi otomatis.",
    )
    parser.add_argument("--out", default=None, help="Path output JSON. Default: <sumber>.captions.json.")
    parser.add_argument("--no-srt", action="store_true", help="Jangan tulis file .srt.")
    parser.add_argument(
        "--compute-type",
        default="int8",
        help="Tipe komputasi CTranslate2 (int8 hemat memori; float32 lebih akurat). Default: int8.",
    )
    args = parser.parse_args()

    src = Path(args.input)
    if not src.exists():
        print(f"ERROR: file tidak ditemukan: {src}", file=sys.stderr)
        return 1

    out_json = Path(args.out) if args.out else src.with_suffix(".captions.json")

    # Import di dalam fungsi supaya pesan error import lebih jelas.
    from faster_whisper import WhisperModel

    print(f"Memuat model Whisper '{args.model}' (download otomatis bila pertama kali)...", file=sys.stderr)
    model = WhisperModel(args.model, device="cpu", compute_type=args.compute_type)

    print(f"Transcribe {src} ...", file=sys.stderr)
    segments_iter, info = model.transcribe(
        str(src),
        language=args.lang,
        vad_filter=True,  # buang bagian hening biar timestamp lebih rapi
    )

    segments: list[dict] = []
    for seg in segments_iter:
        text = seg.text.strip()
        if not text:
            continue
        segments.append({"start": round(seg.start, 3), "end": round(seg.end, 3), "text": text})
        print(f"  [{seg.start:7.2f} -> {seg.end:7.2f}] {text}", file=sys.stderr)

    result = {
        "source": src.name,
        "language": info.language,
        "duration": round(info.duration, 3),
        "segments": segments,
    }
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✓ {len(segments)} segmen ({info.language}, {info.duration:.1f}s) -> {out_json}", file=sys.stderr)

    if not args.no_srt:
        out_srt = out_json.with_suffix(".srt")
        write_srt(segments, out_srt)
        print(f"✓ subtitle -> {out_srt}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
