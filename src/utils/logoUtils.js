import geneaLogoRaw from '../assets/genea-logo.svg?raw';

export const LOGO_ASPECT = 735.8 / 131.6; // native SVG width / height ≈ 5.591

let cachedWhite = null;
let cachedNavy  = null;

function recolorSvg(svgText, hexColor) {
  return svgText
    .replace(/\.st0\s*\{[^}]*fill:[^;}]+;?/g, `.st0{fill:${hexColor};`)
    .replace(/fill:#003865/gi, `fill:${hexColor}`);
}

function svgToDataUrl(svgText, widthPx) {
  const heightPx = Math.round(widthPx / LOGO_ASPECT);
  return new Promise((resolve) => {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = widthPx;
      canvas.height = heightPx;
      canvas.getContext('2d').drawImage(img, 0, 0, widthPx, heightPx);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export async function getLogoDataUrl(variant = 'white') {
  if (variant === 'white' && cachedWhite) return cachedWhite;
  if (variant === 'navy'  && cachedNavy)  return cachedNavy;

  const color    = variant === 'white' ? '#FFFFFF' : '#003865';
  const colored  = recolorSvg(geneaLogoRaw, color);
  const dataUrl  = await svgToDataUrl(colored, 640);

  if (variant === 'white') cachedWhite = dataUrl;
  else                     cachedNavy  = dataUrl;
  return dataUrl;
}
