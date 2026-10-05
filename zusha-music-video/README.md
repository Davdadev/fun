# Don't Leave Me On My Own — Minecraft scrapbook music video

A fan-made music video for **Zusha – "Don't Leave Me On My Own"**, styled as a bright, calm,
dreamy Minecraft scrapbook: pastel paper pages, polaroids of pixel-art scenes, washi tape,
label-maker titles, pixel stickers, handwritten captions and a 12 fps stop-motion feel.

It's a 9:16 (1080×1920) vertical video sized for TikTok, timed to the song's 3:07 at 78 BPM.

## Pages

| # | Page | Starts | Scene |
|---|------|--------|-------|
| · | Cover | 0:00 | grass block floating in a pastel sky, title written in |
| 01 | First light | 0:12 | sunrise over blocky hills, a bee flying across the page |
| 02 | The long way | 0:37 | two friends walking through a birch meadow (panorama), flower close-ups, a ticket stub |
| 03 | Cherry season | 1:02 | cherry grove with falling petals |
| 04 | Lantern light | 1:26 | cabin at dusk, lit window, fireflies, stars |
| 05 | Together | 1:51 | two friends sitting on a cliff at sunset, hearts, photo-booth strip |
| 06 | Still water | 2:15 | boat on a moonlit lake with reflections |
| 07 | Keep this | 2:40 | all six photos together, the title on a paper strip |
| · | The end | 2:58 | credits |

Pages change with a page-turn every 8 bars. Everything is drawn in code on a canvas;
there are no image files.

## Watch it with the song

Open `index.html` (or the published artifact), press **Add the song file**, pick your own
copy of the song (mp3/m4a), and press **Play**. The song never leaves your device.

**Lyrics (optional):** open *Add lyrics*, paste timed lyrics in LRC format
(`[00:21.40] a line`), or paste plain lines and press **Tap to time**, then tap Space at
the start of each line while the song plays. They're saved in your browser.

## Make an MP4

Needs Node, Playwright (Chromium) and ffmpeg.

```sh
node render.mjs                                   # silent MP4 → dont-leave-me-on-my-own.mp4
node render.mjs --audio song.mp3                  # with the song mixed in
node render.mjs --audio song.mp3 --lyrics song.lrc
node render.mjs --stills 10,40,80 --outdir shots  # a few PNG frames
```

Other options: `--out file.mp4`, `--fps 30`, `--size 1080`, `--from 0 --to 30`,
`--crf 22`, `--maxrate 4M` (the default cap keeps the full video under 100 MB).

With `--audio`, the timeline stretches to the file's exact length, so a version that is a
second or two different still lines up. For TikTok you can also post the silent MP4 and
add the song as the sound in the TikTok or CapCut editor, starting from 0:00.
