'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { authStorage } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function LogoutButton({ variant = 'outline', size = 'default', className = '' }: any) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
    authStorage.clearAuth();
    toast({ title: 'Logged out successfully' });
    setTimeout(() => {
      window.location.href = '/login';
    }, 300);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
      title="Logout"
    >
      <LogOut className="h-4 w-4" />
      <span className="ml-2 hidden sm:inline">Logout</span>
    </Button>
  );
}
