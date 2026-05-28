import geneaLogoSrc from '../assets/genea-logo.svg';

export const theme = {
  colors: {
    navy: '#003865',
    blue: '#1565C0',
    bright: '#2196F3',
    light: '#E3F2FD',
    white: '#FFFFFF',
  },
};

export function GeneaLogo({ size = 'md', className = '' }) {
  const heights = { sm: 20, md: 28, lg: 40, xl: 52 };
  const h = heights[size] || heights.md;
  return (
    <img
      src={geneaLogoSrc}
      alt="Genea"
      style={{ height: h, width: 'auto' }}
      className={className}
    />
  );
}

export function GeneaLogoWhite({ size = 'md', className = '' }) {
  const heights = { sm: 20, md: 28, lg: 40, xl: 52 };
  const h = heights[size] || heights.md;
  return (
    <img
      src={geneaLogoSrc}
      alt="Genea"
      style={{ height: h, width: 'auto', filter: 'brightness(0) invert(1)' }}
      className={className}
    />
  );
}
