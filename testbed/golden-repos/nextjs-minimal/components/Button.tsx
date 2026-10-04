import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'solid' | 'outline';
}

export function Button({ href, variant = 'solid', children, className = '', ...props }: ButtonProps) {
  const baseClass = variant === 'solid' ? 'bg-blue-600 text-white' : 'border border-gray-300';
  if (href) {
    return (
      <a href={href} className={`px-4 py-2 rounded font-medium ${baseClass} ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <button className={`px-4 py-2 rounded font-medium ${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
