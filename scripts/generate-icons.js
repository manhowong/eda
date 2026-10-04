import fs from 'fs';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const crcTable = createCrcTable();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePng(width, height, isMaskable = false) {
  // RGBA buffer
  const stride = width * 4;
  const rawData = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Normalized coords from center
      const nx = (x - width / 2) / (width / 2);
      const ny = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Background color: Slate-900 (#0f172a)
      let r = 15, g = 23, b = 42, a = 255;

      // Icon bounds
      const safeRadius = isMaskable ? 0.7 : 0.88;
      if (dist < safeRadius) {
        // Mail envelope rectangle
        const envelopeW = width * 0.65;
        const envelopeH = height * 0.45;
        const ex1 = (width - envelopeW) / 2;
        const ex2 = ex1 + envelopeW;
        const ey1 = (height - envelopeH) / 2;
        const ey2 = ey1 + envelopeH;

        if (x >= ex1 && x <= ex2 && y >= ey1 && y <= ey2) {
          // Border or inner
          const isBorder = (x <= ex1 + 8 || x >= ex2 - 8 || y <= ey1 + 8 || y >= ey2 - 8);
          if (isBorder) {
            // Sky blue border
            r = 56; g = 189; b = 248;
          } else {
            // Inner body: deep slate
            r = 30; g = 41; b = 59;
            // Check envelope flap line
            const slope = (envelopeH * 0.5) / (envelopeW * 0.5);
            const centerX = width / 2;
            const distFromCenter = Math.abs(x - centerX);
            const lineY = ey1 + distFromCenter * slope;
            if (Math.abs(y - lineY) < 6) {
              r = 56; g = 189; b = 248; // Cyan flap stroke
            }
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG structure
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = Buffer.alloc(12 + 13);
  ihdrChunk.writeUInt32BE(13, 0);
  ihdrChunk.write('IHDR', 4);
  ihdrData.copy(ihdrChunk, 8);
  const ihdrCrc = crc32(ihdrChunk.subarray(4, 21));
  ihdrChunk.writeUInt32BE(ihdrCrc, 21);

  // IDAT
  const idatChunk = Buffer.alloc(12 + compressed.length);
  idatChunk.writeUInt32BE(compressed.length, 0);
  idatChunk.write('IDAT', 4);
  compressed.copy(idatChunk, 8);
  const idatCrc = crc32(idatChunk.subarray(4, 8 + compressed.length));
  idatChunk.writeUInt32BE(idatCrc, 8 + compressed.length);

  // IEND
  const iendChunk = Buffer.alloc(12);
  iendChunk.writeUInt32BE(0, 0);
  iendChunk.write('IEND', 4);
  const iendCrc = crc32(iendChunk.subarray(4, 8));
  iendChunk.writeUInt32BE(iendCrc, 8);

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', makePng(192, 192, false));
fs.writeFileSync('./public/pwa-512x512.png', makePng(512, 512, false));
fs.writeFileSync('./public/pwa-maskable-512x512.png', makePng(512, 512, true));
fs.writeFileSync('./public/apple-touch-icon.png', makePng(180, 180, false));
fs.writeFileSync('./public/favicon.ico', makePng(32, 32, false));

console.log('Successfully generated PWA icon set in /public');
