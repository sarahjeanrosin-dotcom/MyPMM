export const theme = {
  colors: {
    navy: '#0A2F6B',
    blue: '#1565C0',
    bright: '#2196F3',
    light: '#E3F2FD',
    white: '#FFFFFF',
  },
  fonts: {
    body: "'Inter', system-ui, sans-serif",
  },
};

export function GeneaLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { text: 'text-lg', badge: 'text-xs px-1.5 py-0.5' },
    md: { text: 'text-2xl', badge: 'text-xs px-2 py-0.5' },
    lg: { text: 'text-4xl', badge: 'text-sm px-2.5 py-1' },
    xl: { text: 'text-5xl', badge: 'text-base px-3 py-1' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {/* Shield icon */}
        <svg width={size === 'xl' ? 40 : size === 'lg' ? 32 : size === 'sm' ? 18 : 24} height={size === 'xl' ? 46 : size === 'lg' ? 37 : size === 'sm' ? 21 : 28} viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2L4 8V22C4 32.5 11.5 42 20 44C28.5 42 36 32.5 36 22V8L20 2Z" fill="#0A2F6B"/>
          <path d="M20 6L8 11V22C8 30.5 13.5 38.5 20 40.5C26.5 38.5 32 30.5 32 22V11L20 6Z" fill="#1565C0"/>
          <path d="M16 22L19 25L25 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={`font-extrabold tracking-wider text-genea-navy ${s.text}`}>
          GENEA
        </span>
      </div>
      <span className={`bg-genea-bright text-white font-semibold rounded ${s.badge} hidden sm:inline`}>
        Security
      </span>
    </div>
  );
}

export function GeneaLogoWhite({ size = 'md', className = '' }) {
  const sizes = {
    sm: { text: 'text-lg' },
    md: { text: 'text-2xl' },
    lg: { text: 'text-4xl' },
    xl: { text: 'text-5xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size === 'xl' ? 40 : size === 'lg' ? 32 : size === 'sm' ? 18 : 24} height={size === 'xl' ? 46 : size === 'lg' ? 37 : size === 'sm' ? 21 : 28} viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2L4 8V22C4 32.5 11.5 42 20 44C28.5 42 36 32.5 36 22V8L20 2Z" fill="rgba(255,255,255,0.3)"/>
        <path d="M20 6L8 11V22C8 30.5 13.5 38.5 20 40.5C26.5 38.5 32 30.5 32 22V11L20 6Z" fill="rgba(255,255,255,0.6)"/>
        <path d="M16 22L19 25L25 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className={`font-extrabold tracking-wider text-white ${s.text}`}>
        GENEA
      </span>
    </div>
  );
}
