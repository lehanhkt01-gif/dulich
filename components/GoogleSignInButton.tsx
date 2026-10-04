'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

interface GoogleSignInButtonProps {
  callbackUrl?: string;
  className?: string;
  text?: string;
  variant?: 'default' | 'outline' | 'pill';
  onSuccess?: () => void;
}

export default function GoogleSignInButton({
  callbackUrl = '/',
  className = '',
  text = 'Tiếp tục bằng tài khoản Google',
  variant = 'default',
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Lỗi khi kích hoạt đăng nhập Google:', error);
      setIsLoading(false);
    }
  };

  const baseStyles =
    'relative inline-flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm transition-all duration-200 select-none disabled:opacity-60 disabled:cursor-not-allowed shadow-xs hover:shadow-md active:scale-[0.99]';

  const variantStyles = {
    default:
      'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 hover:border-stone-400 py-3 px-5 rounded-2xl w-full',
    outline:
      'bg-white text-stone-800 border-2 border-stone-200 hover:border-[#4285F4] py-2.5 px-4 rounded-xl',
    pill:
      'bg-white text-stone-700 border border-stone-300 hover:border-[#4285F4] hover:bg-blue-50/30 py-2 px-4 rounded-full',
  };

  return (
    <button
      type="button"
      id="btn-google-signin"
      onClick={handleSignIn}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label="Đăng nhập bằng tài khoản Google"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-stone-300 border-t-[#4285F4] rounded-full animate-spin shrink-0" />
      ) : (
        /* SVG Logo Google Chuẩn 4 Màu Brand Guidelines */
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span className="whitespace-nowrap truncate font-medium">
        {isLoading ? 'Đang kết nối Google...' : text}
      </span>
    </button>
  );
}
