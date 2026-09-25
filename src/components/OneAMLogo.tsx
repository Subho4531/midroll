import React from 'react';

interface OneAMLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
}

export const OneAMLogo: React.FC<OneAMLogoProps> = ({ className = '', size = 'md' }) => {
  const isCustomNumber = typeof size === 'number';

  const sizeStyles = !isCustomNumber
    ? {
        sm: 'w-6 h-6 text-[10px] rounded-lg',
        md: 'w-8 h-8 text-xs rounded-xl',
        lg: 'w-10 h-10 text-sm rounded-xl',
        xl: 'w-12 h-12 text-base rounded-2xl',
      }[size]
    : '';

  const customStyle: React.CSSProperties = isCustomNumber
    ? {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(8, Math.round(size * 0.42))}px`,
        borderRadius: `${Math.max(4, Math.round(size * 0.28))}px`,
      }
    : {};

  return (
    <div
      style={customStyle}
      className={`inline-flex items-center justify-center font-black font-mono tracking-tight bg-[#17211b] text-[#d7ff65] border border-[#2a382e] shadow-sm select-none shrink-0 relative overflow-hidden group ${sizeStyles} ${className}`}
      title="1AM Wallet for Midnight"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#d7ff65]/10 via-transparent to-transparent opacity-60" />
      <span className="relative z-10 font-black tracking-tighter font-mono leading-none">1AM</span>
    </div>
  );
};
