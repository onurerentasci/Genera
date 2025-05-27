'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Redirect to profile settings when loaded
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        router.push('/settings/profile');
      }
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-gray-600">Redirecting to settings...</div>
        </div>
      </div>
    </div>
  );
}
