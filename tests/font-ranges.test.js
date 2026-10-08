// Independent known mappings catch mistakes in the TTF reader, including missing-glyph sentinels.
const test = require('node:test');
const assert = require('node:assert');
const { codepoints, unicodeRange } = require('../tools/font-ranges.js');

function fontWithCmap(subtable, encoding) {
  const font = Buffer.alloc(40 + subtable.length);
  font.writeUInt16BE(1, 4); // one sfnt table
  font.write('cmap', 12);
  font.writeUInt32BE(28, 20);
  font.writeUInt32BE(12 + subtable.length, 24);
  font.writeUInt16BE(1, 30); // one encoding record
  font.writeUInt16BE(3, 32); // Windows Unicode
  font.writeUInt16BE(encoding, 34);
  font.writeUInt32BE(12, 36);
  subtable.copy(font, 40);
  return font;
}

test('font ranges read BMP delta and glyph-array mappings, excluding glyph zero', () => {
  const cmap = Buffer.alloc(46);
  cmap.writeUInt16BE(4, 0);
  cmap.writeUInt16BE(cmap.length, 2);
  cmap.writeUInt16BE(6, 6); // three segments
  [0x43, 0x63, 0xFFFF].forEach((v, i) => cmap.writeUInt16BE(v, 14 + i * 2));
  [0x41, 0x61, 0xFFFF].forEach((v, i) => cmap.writeUInt16BE(v, 22 + i * 2));
  [-65, -3, 1].forEach((v, i) => cmap.writeInt16BE(v, 28 + i * 2));
  cmap.writeUInt16BE(4, 36); // the second segment points at the glyph array
  [3, 0, 7].forEach((v, i) => cmap.writeUInt16BE(v, 40 + i * 2));
  const font = fontWithCmap(cmap, 1);
  assert.deepStrictEqual(codepoints(font), [0x42, 0x43, 0x63]);
  assert.strictEqual(unicodeRange(font), 'U+42-43, U+63');
});

test('font ranges read full Unicode mappings, including characters beyond the BMP', () => {
  const cmap = Buffer.alloc(40);
  cmap.writeUInt16BE(12, 0);
  cmap.writeUInt32BE(cmap.length, 4);
  cmap.writeUInt32BE(2, 12);
  [0x41, 0x42, 0, 0x1F600, 0x1F601, 2].forEach((v, i) => cmap.writeUInt32BE(v, 16 + i * 4));
  const font = fontWithCmap(cmap, 10);
  assert.deepStrictEqual(codepoints(font), [0x42, 0x1F600, 0x1F601]);
  assert.strictEqual(unicodeRange(font), 'U+42, U+1F600-1F601');
});
