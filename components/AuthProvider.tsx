'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStorage } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = authStorage.getToken();
    const isLoginPage = pathname === '/login';
    const isHomePage = pathname === '/';

    // If not logged in and trying to access protected route
    if (!token && !isLoginPage && !isHomePage) {
      router.push('/login');
    }

    // If logged in and on login page, redirect to dashboard
    if (token && isLoginPage) {
      router.push('/cars');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
