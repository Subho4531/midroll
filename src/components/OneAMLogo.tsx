import React from 'react';

interface OneAMLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
}

const NAMED_SIZES: Record<string, number> = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

/**
 * Official 1AM wallet mark (from 1am.xyz brand SVG).
 * Uses currentColor so it adapts to the surrounding text color.
 */
export const OneAMLogo: React.FC<OneAMLogoProps> = ({ className = '', size = 'md' }) => {
  const px = typeof size === 'number' ? size : (NAMED_SIZES[size] ?? 32);

  return (
    <svg
      width={px}
      height={px}
      viewBox="-2 -2 38 38"
      fill="none"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="1AM Wallet"
    >
      <title>1AM Wallet for Midnight</title>
      <path
        d="M22.3487 1.34876C29.8067 4.61768 33.6916 13.1099 31.0886 21.0171C28.3273 29.4053 19.31 33.9593 10.9486 31.1885C2.58715 28.4177-1.95282 19.3711 0.808541 10.9829C3.4091 3.08318 11.5581-1.41591 19.4825 0.401224L18.5554 3.21739C12.1869 1.90495 5.688 5.56745 3.60067 11.9081C1.35211 18.7386 5.06205 26.1311 11.8707 28.3874C18.6793 30.6436 26.0482 26.9213 28.2967 20.0909C30.3865 13.7427 27.3303 6.90924 21.4218 4.16441L22.3487 1.34876ZM20.0268 3.61162C20.5076 3.77095 20.9729 3.95588 21.4218 4.16441L16.9003 17.8994L14.0347 16.9498L18.5554 3.21739C19.0473 3.31878 19.5385 3.44981 20.0268 3.61162Z"
        fill="currentColor"
      />
    </svg>
  );
};
