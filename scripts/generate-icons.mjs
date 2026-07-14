// Generates the extension icons from the source artwork (icon.png, repo root)
// with no image dependencies: PNG decode/encode is done by hand around
// node:zlib.
//
// Pipeline: decode → make the outer background transparent (flood fill from
// the edges, so white pixels inside the artwork are preserved) → crop to
// content → pad to a square → box-filter downscale to each icon size.

import { deflateSync, inflateSync } from "node:zlib";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "icon.png");
const outDir = path.join(root, "src/assets/icons");
const SIZES = [16, 32, 48, 128];

// Pixels at least this bright (and opaque) count as background when they
// touch the image border.
const WHITE_THRESHOLD = 240;
// Transparent margin added around the cropped artwork, as a fraction of size.
const MARGIN = 0.04;

// --- PNG decode (8-bit, non-interlaced, greyscale/RGB/RGBA) ---------------

function decodePng(buffer) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];
  const interlace = buffer[28];
  if (bitDepth !== 8 || interlace !== 0 || ![0, 2, 6].includes(colorType)) {
    throw new Error(`Unsupported PNG (bitDepth=${bitDepth} colorType=${colorType})`);
  }
  const channels = { 0: 1, 2: 3, 6: 4 }[colorType];

  const idat = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "IDAT") idat.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(idat));

  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * 4);
  const prior = Buffer.alloc(stride);
  const line = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    raw.copy(line, 0, y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const left = i >= channels ? line[i - channels] : 0;
      const up = prior[i];
      const upLeft = i >= channels ? prior[i - channels] : 0;
      switch (filter) {
        case 1:
          line[i] = (line[i] + left) & 0xff;
          break;
        case 2:
          line[i] = (line[i] + up) & 0xff;
          break;
        case 3:
          line[i] = (line[i] + ((left + up) >> 1)) & 0xff;
          break;
        case 4: {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          line[i] = (line[i] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 0xff;
          break;
        }
      }
    }
    line.copy(prior);
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const i = x * channels;
      if (channels === 1) {
        pixels[o] = pixels[o + 1] = pixels[o + 2] = line[i];
        pixels[o + 3] = 255;
      } else {
        pixels[o] = line[i];
        pixels[o + 1] = line[i + 1];
        pixels[o + 2] = line[i + 2];
        pixels[o + 3] = channels === 4 ? line[i + 3] : 255;
      }
    }
  }
  return { width, height, pixels };
}

// --- PNG encode (RGBA) -----------------------------------------------------

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const scanlines = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    rgba.copy(scanlines, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Processing -------------------------------------------------------------

function isBackground(pixels, o) {
  return (
    pixels[o + 3] === 0 ||
    (pixels[o] >= WHITE_THRESHOLD &&
      pixels[o + 1] >= WHITE_THRESHOLD &&
      pixels[o + 2] >= WHITE_THRESHOLD)
  );
}

/** Clears the background reachable from the image border, leaving interior whites intact. */
function clearOuterBackground({ width, height, pixels }) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const push = (x, y) => {
    const i = y * width + x;
    if (!visited[i] && isBackground(pixels, i * 4)) {
      visited[i] = 1;
      queue.push(i);
    }
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i / width) | 0;
    pixels[i * 4 + 3] = 0;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }
}

/** Crops to visible content and pads to a centered square with a small margin. */
function cropToSquare({ width, height, pixels }) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("icon.png has no visible content");

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const side = Math.ceil(Math.max(contentW, contentH) * (1 + MARGIN * 2));
  const out = Buffer.alloc(side * side * 4);
  const offsetX = Math.floor((side - contentW) / 2);
  const offsetY = Math.floor((side - contentH) / 2);
  for (let y = 0; y < contentH; y++) {
    const src = ((y + minY) * width + minX) * 4;
    const dst = ((y + offsetY) * side + offsetX) * 4;
    pixels.copy(out, dst, src, src + contentW * 4);
  }
  return { width: side, height: side, pixels: out };
}

/** Alpha-aware box-filter downscale to size×size. */
function resize({ width, pixels }, size) {
  const out = Buffer.alloc(size * size * 4);
  const scale = width / size;
  for (let py = 0; py < size; py++) {
    const y0 = Math.floor(py * scale);
    const y1 = Math.min(width, Math.ceil((py + 1) * scale));
    for (let px = 0; px < size; px++) {
      const x0 = Math.floor(px * scale);
      const x1 = Math.min(width, Math.ceil((px + 1) * scale));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const o = (y * width + x) * 4;
          const alpha = pixels[o + 3];
          r += pixels[o] * alpha;
          g += pixels[o + 1] * alpha;
          b += pixels[o + 2] * alpha;
          a += alpha;
          n++;
        }
      }
      const o = (py * size + px) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
        out[o + 3] = Math.round(a / n);
      }
    }
  }
  return out;
}

const source = decodePng(await readFile(SOURCE));
clearOuterBackground(source);
const square = cropToSquare(source);

await mkdir(outDir, { recursive: true });
for (const size of SIZES) {
  const png = encodePng(size, resize(square, size));
  await writeFile(path.join(outDir, `icon-${size}.png`), png);
  console.log(`icon-${size}.png (${png.length} bytes)`);
}
