import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to check if the current user is an admin.
 * If not, it redirects to the homepage or login page.
 * @returns {Object} Object containing loading and error states
 */
export const useAdminCheck = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Only proceed if authentication check is complete
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // If authenticated but not admin, show error and redirect to home
      if (user && user.role !== 'admin') {
        setError('Access denied: Admin rights required');
        setTimeout(() => {
          router.push('/');
        }, 3000); // Redirect after 3 seconds
      }
    }
  }, [isAuthenticated, isLoading, user, router]);
  
  return {
    isLoading: isLoading || !user,
    error,
    isAdmin: user?.role === 'admin'
  };
};

export default useAdminCheck;