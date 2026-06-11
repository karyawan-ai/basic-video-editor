// Konfigurasi Remotion CLI/Studio.
// Dokumentasi: https://www.remotion.dev/docs/config
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Codec default saat render. Bisa dioverride dgn flag: --codec=...
Config.setCodec("h264");
