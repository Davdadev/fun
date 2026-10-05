#!/usr/bin/env node
// Renders the scrapbook video in index.html to an MP4 using headless Chromium + ffmpeg.
//
//   node render.mjs                                  # silent 1920x1080 MP4, 30 fps
//   node render.mjs --audio song.mp3                 # same, with the song muxed in
//   node render.mjs --audio song.mp3 --lyrics song.lrc
//   node render.mjs --stills 10,40,70 --outdir shots # just a few PNG frames
//
// Options: --out <file> --fps <n> --size <width> --from <s> --to <s>
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
const fps = +(args.fps || 30);
const size = +(args.size || 1920);
const out = path.resolve(args.out || path.join(here, 'dont-leave-me-on-my-own.mp4'));
const audio = args.audio ? path.resolve(args.audio) : null;
const lyrics = args.lyrics ? fs.readFileSync(path.resolve(args.lyrics), 'utf8') : null;

// The page is written as an artifact body, so wrap it in a document skeleton.
const body = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${body}</body></html>`;
// Served through request interception, so nothing listens on a port and the proxy never sees it.
const url = 'http://scrapbook.local/index.html';

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await playwright.chromium.launch({
  proxy: proxy ? { server: proxy } : undefined,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
page.on('pageerror', e => console.error('page error:', e.message));
await page.route(url, r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }));
if (proxy) {
  // Behind a TLS-inspecting proxy Chromium may not trust the proxy's CA, so fetch the
  // Google Fonts files with curl (which reads the system CA bundle) and hand them over.
  const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
  await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, async r => {
    try {
      const buf = execSync(`curl -sSfL -A "${UA}" "${r.request().url()}"`, { maxBuffer: 1 << 26 });
      const css = r.request().url().includes('googleapis');
      await r.fulfill({ status: 200, body: buf, contentType: css ? 'text/css' : 'font/woff2', headers: { 'access-control-allow-origin': '*' } });
    } catch { await r.abort(); }
  });
}
await page.goto(url, { waitUntil: 'networkidle' }).catch(() => page.goto(url));
await page.waitForFunction(() => window.MV);
await page.evaluate(() => window.MV.ready);
const fontsOk = await page.evaluate(() => [...document.fonts].some(f => f.status === 'loaded'));
if (!fontsOk) console.warn('warning: web fonts did not load; frames will use fallback fonts');

let duration = 187;
if (audio) {
  duration = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${audio}"`).toString());
}
await page.evaluate(([w, d, lrc]) => { MV.setResolution(w); MV.setDuration(d); if (lrc) MV.setLyrics(lrc); }, [size, duration, lyrics]);

if (args.stills) {
  const dir = path.resolve(args.outdir || path.join(here, 'stills'));
  fs.mkdirSync(dir, { recursive: true });
  for (const s of String(args.stills).split(',').map(Number)) {
    const b64 = await page.evaluate(s => { MV.renderFrame(s); return MV.canvas.toDataURL('image/png').slice(22); }, s);
    const file = path.join(dir, `still-${String(s).replace('.', '_')}.png`);
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
    console.log('wrote', file);
  }
  await browser.close();
  process.exit(0);
}

const from = +(args.from || 0), to = Math.min(+(args.to || duration), duration);
const total = Math.round((to - from) * fps);
const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  ...(audio ? ['-ss', String(from), '-t', String(to - from), '-i', audio] : []),
  '-map', '0:v', ...(audio ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
  // Capped bitrate keeps a 3-minute 1080x1920 file shareable (TikTok re-encodes uploads anyway).
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 22), '-maxrate', args.maxrate || '4M', '-bufsize', '12M',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  out,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const write = buf => new Promise(r => ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r));

const BATCH = 12;
const started = Date.now();
for (let f = 0; f < total; f += BATCH) {
  const n = Math.min(BATCH, total - f);
  const frames = await page.evaluate(({ f, n, fps, from }) => {
    const res = [];
    for (let i = 0; i < n; i++) { MV.renderFrame(from + (f + i) / fps); res.push(MV.canvas.toDataURL('image/jpeg', 0.93).slice(23)); }
    return res;
  }, { f, n, fps, from });
  for (const b64 of frames) await write(Buffer.from(b64, 'base64'));
  if ((f / BATCH) % 25 === 0) {
    const pct = (f / total * 100).toFixed(1), el = (Date.now() - started) / 1000;
    console.log(`frame ${f}/${total} (${pct}%) · ${el.toFixed(0)}s elapsed`);
  }
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await browser.close();
console.log('wrote', out);
