# Basic Video Editor — panduan untuk Claude

Proyek ini adalah **editor video berbasis percakapan**. User TIDAK mengedit lewat
UI timeline — **user ngobrol dengan kamu (Claude Code)**, dan kamu yang mengedit
video dengan cara mengubah file data project.

Video dibuat dengan **Remotion** (video = komponen React + props). Setiap jenis
video adalah satu **template** (Remotion Composition). Isi/teks/warna/aset sebuah
video disimpan sebagai **file JSON di `projects/`**. Kamu mengedit JSON itu, lalu
render jadi MP4.

## Peran kamu

Saat user minta sesuatu ("bikin promo sepatu diskon 50%", "ganti judulnya jadi X",
"potong videonya dari detik 5 sampai 20", "tambah teks 'follow ya' di bawah"):

1. **Pahami template mana** yang cocok (lihat daftar di bawah).
2. **Tanya bahan utama dulu.** Sebelum mulai, tanyakan apakah user **sudah punya
   file video dan/atau audio** sebagai dasar:
   - Kalau **ada video** → kemungkinan `VideoEdit` (satu video) atau `StitchVideos`
     (beberapa video disambung). Minta user menaruh filenya di `public/`, dan
     tawarkan cek durasinya dulu.
   - Kalau **ada audio/musik** → tanya apakah dipakai sebagai musik latar
     (`music`) atau sebagai timeline utama (mis. slideshow mengikuti lagu).
   - Kalau **belum ada bahan** → arahkan ke template yang tidak butuh aset
     (`TitleIntro`, `Quote`) atau bantu rancang dari nol.
3. **Tanyakan rasio video** kalau membuat video BARU dan user belum menyebut:
   `9:16` (TikTok/Reels), `16:9` (YouTube), atau `1:1` (feed IG).
4. **Buat/edit file JSON** di `projects/<nama>.json` sesuai schema template.
5. **Render** ke MP4 (lihat perintah di bawah), atau arahkan user buka preview.
6. Laporkan hasil + path filenya.

Selalu edit JSON di `projects/`, JANGAN ubah kode template kecuali user minta fitur
baru yang memang belum ada.

## Template yang tersedia

| Template (id)  | Untuk apa                                  | Aset di `public/` |
|----------------|--------------------------------------------|-------------------|
| `TitleIntro`   | Judul + subjudul beranimasi (pembuka)      | tidak perlu       |
| `Quote`        | Kutipan + penulis di atas gradient         | tidak perlu       |
| `PromoProduct` | Promo jualan: gambar, harga, badge, CTA    | gambar (opsional) |
| `Slideshow`    | Beberapa foto bergantian + caption + musik | gambar + musik    |
| `VideoEdit`    | **Edit video milik user**: potong + overlay teks + musik | video user (wajib) |
| `StitchVideos` | **Sambung beberapa video** jadi satu: tiap klip dipotong + overlay, transisi cut/fade, musik latar | beberapa video user (wajib) |
| `Ecourse`      | **Video kursus 3–10 menit**: kartu intro + beberapa bagian (judul + poin + gambar) dengan **avatar talking-head (PIP)** yang menjelaskan; narasi ikut dari audio video avatar | video avatar (wajib), gambar (opsional), musik (opsional) |

Schema/field tiap template ada di `src/templates/<Nama>.tsx` (lihat objek
`...Schema`). Itu sumber kebenaran untuk field yang boleh diisi — baca dari sana,
jangan menebak.

## Aset (gambar / video / musik)

Semua aset diletakkan user di folder `public/`. Di JSON cukup tulis **nama file**-nya
(mis. `"produk.png"`, `"input.mp4"`, `"musik.mp3"`), bukan path lengkap.

- `PromoProduct.productImage`: kosongkan (`""`) untuk pakai placeholder.
- `VideoEdit.src`: WAJIB ada file videonya di `public/`. Kalau belum ada, minta user
  menaruh filenya dulu, dan tawarkan untuk cek durasinya.
- `StitchVideos.clips[].src`: tiap klip WAJIB ada filenya di `public/`. Klip disambung
  sesuai urutan di array. `transition: "fade"` bikin durasi total berkurang
  `transitionSeconds` per sambungan (silang); `"cut"` = potong tegas tanpa pengurangan.
- `Ecourse.lessons[].avatar`: tiap bagian WAJIB merujuk file video avatar di `public/`.
  Boleh satu file panjang yang dipotong beda-beda per bagian (atur `trimStart`/`trimEnd`),
  atau file terpisah tiap bagian. Suara narasi diambil dari audio video avatar ini, jadi
  pastikan videonya sudah ada suaranya. `image` per bagian opsional (kosongkan `""`).
  Durasi total = `introSeconds` + jumlah durasi tiap bagian (− overlap kalau `transition: "fade"`).
- Sebelum render VideoEdit/StitchVideos/Ecourse, pastikan tiap `trimEnd` tidak melebihi
  durasi video aslinya.

## Perintah

```bash
# Preview interaktif (Remotion Studio) — semua template & props bisa diutak-atik
npm run dev

# Render satu video ke MP4 memakai data dari sebuah project JSON
npx remotion render <TemplateId> out/<nama>.mp4 --props=projects/<nama>.json

# Contoh nyata:
npx remotion render TitleIntro   out/intro.mp4     --props=projects/contoh-intro.json
npx remotion render Quote        out/quote.mp4     --props=projects/contoh-quote.json
npx remotion render PromoProduct out/promo.mp4     --props=projects/contoh-promo.json
npx remotion render Slideshow    out/slideshow.mp4 --props=projects/contoh-slideshow.json
npx remotion render VideoEdit    out/edit.mp4      --props=projects/contoh-videoedit.json
npx remotion render StitchVideos out/gabungan.mp4  --props=projects/contoh-stitch.json
npx remotion render Ecourse      out/ecourse.mp4    --props=projects/contoh-ecourse.json
```

Hasil render ada di folder `out/`. Ukuran & durasi video otomatis dihitung dari
props (`format`, `durationInSeconds`/`trim`/jumlah gambar) lewat `calculateMetadata`,
jadi tidak perlu set resolusi manual.

## Alur membuat video baru (ringkas)

1. Tanya kebutuhan + rasio kalau belum jelas.
2. Salin contoh JSON yang relevan jadi `projects/<nama-baru>.json`, sesuaikan isinya.
3. (Kalau perlu aset) pastikan filenya ada di `public/`.
4. `npx remotion render <TemplateId> out/<nama>.mp4 --props=projects/<nama-baru>.json`
5. Beri tahu user path hasilnya.

## Menambah template baru (kalau diminta)

1. Buat `src/templates/Xxx.tsx`: export `xxxSchema` (pakai `zod` + `zColor`),
   komponen React-nya, dan (kalau durasi dinamis) `xxxMetadata`.
2. Daftarkan `<Composition>` baru di `src/Root.tsx` dengan schema, defaultProps,
   dan calculateMetadata.
3. Tambahkan barisnya ke tabel template di atas.
