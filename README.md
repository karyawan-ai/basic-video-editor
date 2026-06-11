# Basic Video Editor

Boilerplate **editor video simpel** di mana **Claude Code yang jadi editornya**.
Kamu cukup ngobrol ("bikin promo diskon 50%", "potong video dari detik 5", "ganti
judulnya"), Claude mengubah data video lalu me-render jadi MP4. Mesin video-nya
adalah [Remotion](https://www.remotion.dev) (video = React + props).

## Konsep

- **Template** = jenis video (lihat di bawah), berupa Remotion Composition di `src/templates/`.
- **Project** = satu video konkret, disimpan sebagai JSON di `projects/`.
- **Claude** membaca permintaanmu → mengedit JSON → render. Tidak ada timeline manual.

## Template bawaan

- `TitleIntro` — judul/intro beranimasi
- `Quote` — kutipan di atas gradient
- `PromoProduct` — promo jualan (gambar, harga, badge, CTA)
- `Slideshow` — foto bergantian + caption + musik
- `VideoEdit` — **edit video milikmu**: potong, overlay teks, musik latar
- `StitchVideos` — **sambung beberapa video** jadi satu: tiap klip dipotong + overlay, transisi cut/fade, musik latar

Rasio bisa `9:16`, `16:9`, atau `1:1` per project (field `format`).

## Mulai

```bash
npm install
npm run dev      # buka Remotion Studio untuk preview & utak-atik props
```

Render sebuah project ke MP4:

```bash
npx remotion render TitleIntro out/intro.mp4 --props=projects/contoh-intro.json
```

Taruh aset (gambar, video, musik) di `public/`, lalu rujuk dengan nama filenya di JSON.

## Cara pakai sehari-hari

Buka folder ini di Claude Code, lalu ngobrol biasa. Contoh:

> "Bikin video promo kopi susu, harga 18 ribu, badge 'NEW', vertikal."
>
> "Aku taruh klip.mp4 di public/. Potong dari detik 3 sampai 15, kasih teks
> 'resep rahasia' di tengah dari detik 1–4."

Claude tahu workflow-nya dari [`CLAUDE.md`](CLAUDE.md).
# basic-video-editor
