// Shared SVG builders for the Verba icon: the 5x5 letter grid in logo colors.
// Android grid geometry lives here so assets and mipmaps can't drift apart.
export const ANDROID_GRID = { span: 720 / 1_024, fontRatio: 64 / 76 };

const ROWS = ['ARTOF', 'HOURS', 'WORDS', 'LIGHT', 'CLOCK'];
const isLit = (r, c) => (r === 0 && c <= 2) || (r === 2 && c <= 3) || r === 4;

// Same geometry as public/icon.svg, parameterized by canvas size and grid span
export function gridSvg({ size, span, background, fontRatio = 55 / 76 }) {
  const pad = (size - span) / 2;
  const cw = span / 5;
  const fs = cw * fontRatio;
  let cells = '';
  ROWS.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      const x = (pad + (c + 0.5) * cw).toFixed(1);
      const y = (pad + (r + 0.5) * cw + fs * 0.35).toFixed(1);
      const opacity = isLit(r, c) ? '' : ' fill="#d2ccb6" fill-opacity="0.32"';
      cells += `<text x="${x}" y="${y}" font-size="${fs.toFixed(1)}"${opacity}>${ch}</text>`;
    }),
  );
  const bg = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  // Bi-metal (logo E): lit letters gold, dim letters platinum
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}<g font-family="Helvetica, Arial, sans-serif" font-weight="500" text-anchor="middle" fill="#e8cc60">${cells}</g></svg>`;
}

export const solidSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#0a0a0a"/></svg>`;
