import React from 'react';
import { sound } from '../../services/sound';

export type KidButtonVariant = 'primary' | 'secondary' | 'subject-viet' | 'subject-math' | 'subject-english' | 'subject-life' | 'subject-games';
export type KidButtonSize = 'md' | 'lg' | 'xl';

export interface KidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: KidButtonVariant;
  size?: KidButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  playClickSound?: boolean;
}

const variantClasses: Record<KidButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/40 border-0',
  secondary: 'bg-white hover:bg-amber-50 text-amber-950 border-3 border-amber-300 shadow-sm',
  'subject-viet': 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/40 border-4 border-amber-300',
  'subject-math': 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/40 border-4 border-blue-300',
  'subject-english': 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/40 border-4 border-emerald-300',
  'subject-life': 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/40 border-4 border-purple-300',
  'subject-games': 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/40 border-4 border-pink-300',
};

const sizeClasses: Record<KidButtonSize, string> = {
  md: 'min-h-[52px] px-6 py-3 text-base',
  lg: 'min-h-[60px] px-8 py-4 text-lg',
  xl: 'min-h-[68px] px-10 py-5 text-xl',
};

export const KidButton: React.FC<KidButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  playClickSound = true,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (playClickSound && !disabled && !isLoading) {
      sound.playClick();
    }
    // Bounce effect: briefly scale down then scale up
    const button = e.currentTarget as HTMLButtonElement;
    button.style.transition = 'transform 0.1s ease-in-out';
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    onClick?.(e);
  };

  const baseClasses = `
    kb-btn font-black rounded-2xl flex items-center justify-center gap-2
    cursor-pointer
    focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-400
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    ${fullWidth ? 'w-full' : ''}
  `;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          <span className="truncate">{children}</span>
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};