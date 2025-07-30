import React from 'react';

interface BrandNameProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white';
}

export function BrandName({ className = "", size = 'md', variant = 'default' }: BrandNameProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const colorClasses = {
    default: {
      nebusis: 'text-primary',
      controlCore: 'text-foreground'
    },
    white: {
      nebusis: 'text-white',
      controlCore: 'text-white'
    }
  };

  return (
    <span className={`font-semibold ${sizeClasses[size]} ${className}`}>
      <span className={colorClasses[variant].nebusis}>Nebusis®</span>{' '}
      <span className={colorClasses[variant].controlCore}>ControlCore</span>
    </span>
  );
}

export default BrandName;