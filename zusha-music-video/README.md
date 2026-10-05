# One Thread — a motion video for "Don't Leave Me On My Own"

An original, code-rendered motion-graphics music video for **Zusha – "Don't Leave Me On My Own"**.
Bright, calm and dreamy: the whole film is **one glowing thread that never breaks**. It travels
through nine scenes, drawing everything as it goes, because the song is about not being left on
your own.

1920×1080, timed to the song's 3:07 at 78 BPM (scenes change every 8 bars). Every frame is a pure
function of song time, so the live page and the exported MP4 match exactly.

## Scenes

| # | Scene | Starts | What the thread does |
|---|-------|--------|----------------------|
| 01 | Open | 0:00 | writes *don't leave me on my own* in one continuous stroke of script |
| 02 | Dawn | 0:12 | draws a horizon and a square (Minecraft-style) sun that fills with light |
| 03 | Hold | 0:37 | draws two people holding hands, with a tiny heart where the hands meet |
| 04 | Night | 1:02 | joins the stars into a constellation, falls, and is caught in a cradle |
| 05 | Together | 1:26 | a second, lilac thread appears and the two braid; the title lands word by word on each crossing |
| 06 | Flame | 1:51 | draws a candle, lights it, and circles it with a halo |
| 07 | Rise | 2:15 | climbs a staircase of floating grass blocks above the clouds |
| 08 | Home | 2:40 | draws a house with a lit window, the two figures again, and a heart tied off above them |
| 09 | End | 2:58 | one long calm line out of frame, then credits |

Around it: kinetic serif typography for the title hook, a mono "film slate" HUD (timecode, bar and
beat, scene number), blocky Minecraft-style clouds, square stars and floating square motes, soft
bloom, light leaks and film grain.

Typefaces: Instrument Serif and DM Mono (Google Fonts). The handwriting is the public-domain Hershey
"Script 1-stroke" single-line font, via the MIT-licensed
[hersheytext](https://github.com/techninja/hersheytextjs) JSON.

## Watch it with the song

Open `index.html` (or the published artifact), press **Add the song file**, pick your own copy of
the song (mp3/m4a) and press **Play**. The file never leaves your device. The glow reacts to the
music while it plays.

**Lyrics (optional).** The film only uses the song title on screen. To show the full lyrics word
by word, open *Add lyrics* and paste timed lyrics in LRC format (`[00:21.40] a line`, word stamps
like `<00:21.40>` work too), or paste plain lines and press **Tap to time**, then tap Space at the
start of each line while the song plays. They're saved in your browser.

## Make an MP4

Needs Node, Playwright (Chromium) and ffmpeg.

```sh
node render.mjs                                   # silent MP4 → dont-leave-me-on-my-own.mp4
node render.mjs --audio song.mp3                  # with the song mixed in
node render.mjs --audio song.mp3 --lyrics song.lrc
node render.mjs --stills 10,40,80 --outdir shots  # a few PNG frames
```

Other options: `--out file.mp4`, `--fps 30` (try 60), `--size 1920`, `--from 0 --to 30`,
`--crf 22`, `--maxrate 4M`.

With `--audio`, the timeline stretches to the file's exact length, so a version that's a second or
two different still lines up. You can also take the silent MP4 into CapCut or any editor and drop
the song in at 0:00.
