// Keep the bundled CSS font coverage honest. No dependencies, and never changes a font or a visual rule.
// Run: node tools/font-ranges.js          Regenerate the unicode-range descriptors after replacing fonts.
//      node tools/font-ranges.js --check  Refuse stale descriptors without writing anything.
const fs = require('node:fs');
const path = require('node:path');

function codepoints(font) {
  let cmap;
  for (let i = 0; i < font.readUInt16BE(4); i++) {
    const entry = 12 + i * 16;
    if (font.toString('ascii', entry, entry + 4) === 'cmap') cmap = font.readUInt32BE(entry + 8);
  }
  if (cmap === undefined) throw new Error('The font has no cmap table.');

  // The full Unicode map takes precedence over a BMP-only map, as in a browser. Older Unicode and
  // Windows Unicode encodings are supported too; symbol and legacy non-Unicode maps never count.
  const preference = [[3, 10], [0, 6], [0, 4], [3, 1], [0, 3], [0, 2], [0, 1], [0, 0]];
  const maps = [];
  for (let i = 0; i < font.readUInt16BE(cmap + 2); i++) {
    const entry = cmap + 4 + i * 8;
    const platform = font.readUInt16BE(entry), encoding = font.readUInt16BE(entry + 2);
    const rank = preference.findIndex(([p, e]) => p === platform && e === encoding);
    if (rank !== -1) maps.push({ offset: cmap + font.readUInt32BE(entry + 4), rank });
  }
  maps.sort((a, b) => a.rank - b.rank);
  if (!maps.length) throw new Error('The font has no supported Unicode cmap.');
  const offset = maps[0].offset, format = font.readUInt16BE(offset);
  const points = [];
  const add = (point, glyph) => {
    if (glyph !== 0 && point <= 0x10FFFF && !(point >= 0xD800 && point <= 0xDFFF)) points.push(point);
  };
  if (format === 12) {
    for (let i = 0; i < font.readUInt32BE(offset + 12); i++) {
      const group = offset + 16 + i * 12;
      const start = font.readUInt32BE(group), end = font.readUInt32BE(group + 4), glyph = font.readUInt32BE(group + 8);
      if (end < start || end > 0x10FFFF) throw new Error('Invalid Unicode cmap group.');
      for (let point = start; point <= end; point++) add(point, glyph + point - start);
    }
  } else if (format === 4) {
    const segments = font.readUInt16BE(offset + 6) / 2;
    for (let i = 0; i < segments; i++) {
      const end = font.readUInt16BE(offset + 14 + i * 2);
      const start = font.readUInt16BE(offset + 16 + segments * 2 + i * 2);
      const delta = font.readInt16BE(offset + 16 + segments * 4 + i * 2);
      const rangeAddress = offset + 16 + segments * 6 + i * 2;
      const range = font.readUInt16BE(rangeAddress);
      for (let point = start; point <= end; point++) {
        const mapped = range === 0 ? point : font.readUInt16BE(rangeAddress + range + (point - start) * 2);
        add(point, range !== 0 && mapped === 0 ? 0 : (mapped + delta) & 0xFFFF);
      }
    }
  } else {
    throw new Error('Unsupported Unicode cmap format ' + format + '.');
  }
  if (!points.length) throw new Error('The Unicode cmap has no glyphs.');
  return [...new Set(points)].sort((a, b) => a - b);
}

function unicodeRange(font) {
  const ranges = [];
  for (const point of codepoints(font)) {
    const last = ranges[ranges.length - 1];
    if (last && point === last[1] + 1) last[1] = point;
    else ranges.push([point, point]);
  }
  const hex = (point) => point.toString(16).toUpperCase();
  return ranges.map(([start, end]) => 'U+' + hex(start) + (end === start ? '' : '-' + hex(end))).join(', ');
}

function updateCss(css, previewDir) {
  let faces = 0;
  const updated = css.replace(/@font-face\s*\{[^}]*\}/g, (face) => {
    const source = face.match(/src:\s*url\('([^']+\.ttf)'\)/);
    if (!source) throw new Error('A bundled font face has no local TTF source.');
    const range = unicodeRange(fs.readFileSync(path.join(previewDir, source[1])));
    faces++;
    return face.replace(/\s*unicode-range:\s*[^;]+;/, '').replace(/\s*\}$/, ' unicode-range: ' + range + '; }');
  });
  if (!faces) throw new Error('No bundled font faces were found.');
  return updated;
}

module.exports = { codepoints, unicodeRange, updateCss };

if (require.main === module) {
  const previewDir = path.join(__dirname, '..', 'skills', 'project-docs', 'assets', 'preview');
  const file = path.join(previewDir, 'preview.css');
  const css = fs.readFileSync(file, 'utf8'), updated = updateCss(css, previewDir);
  if (process.argv.includes('--check')) {
    if (css !== updated) {
      console.error('Bundled font ranges are stale. Run node tools/font-ranges.js.');
      process.exitCode = 1;
    } else console.log('Bundled font ranges match every TTF.');
  } else {
    fs.writeFileSync(file, updated);
    console.log('Updated bundled font ranges in preview.css.');
  }
}
