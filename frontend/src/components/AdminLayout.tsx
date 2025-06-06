'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import Navbar from '@/components/Navbar';
import '../app/admin/styles.css';
import { 
  NewspaperIcon, 
  UsersIcon, 
  PhotoIcon,
  CogIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { isLoading, error, isAdmin } = useAdminCheck();
  const router = useRouter();

  // Admin menu items
  const menuItems = [
    {
      name: 'News',
      href: '/admin',
      icon: NewspaperIcon,
      description: 'Manage news and announcements',
      active: title === 'News Management'
    },
    {
      name: 'Arts',
      href: '/admin/arts',
      icon: PhotoIcon,
      description: 'Manage user artworks',
      active: title === 'Arts Management'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      description: 'Manage user accounts',
      active: title === 'Users Management'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon,
      description: 'System settings',
      active: title === 'Admin Settings'
    }
  ];
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 rounded mb-4" style={{ background: 'var(--color-surface)' }}></div>
            <div className="h-6 w-64 rounded" style={{ background: 'var(--color-surface)' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !isAdmin) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]" style={{ padding: 'var(--spacing-md)' }}>
          <ExclamationTriangleIcon className="h-16 w-16 mb-4" style={{ color: 'var(--color-danger)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Access Denied</h1>
          <p className="mb-6 text-center max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
            {error || "You do not have permission to access the admin panel."}
          </p>
          <button 
            onClick={() => router.push('/')} 
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:transform hover:scale-105"
            style={{ 
              background: 'var(--color-primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="admin-page-container min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Navbar />
      
      <div className="admin-container" style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Back to Home button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="admin-back-btn flex items-center text-sm font-medium transition-all duration-300"
            style={{
              color: 'var(--color-text-secondary)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              width: 'fit-content'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-glass)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Admin Sidebar */}
          <div className="admin-sidebar w-full lg:w-64 flex-shrink-0" style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-md)',
            height: 'fit-content',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Admin Panel
            </h3>
            <div className="admin-nav flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`admin-nav-item flex items-center gap-3 p-3 rounded-md transition-all duration-300 ${
                    item.active ? 'active' : ''
                  }`}
                  style={{
                    background: item.active ? 
                      'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 
                      'transparent',
                    color: item.active ? 
                      'white' : 
                      'var(--color-text-secondary)',
                    boxShadow: item.active ? 
                      'var(--shadow-md)' : 
                      'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!item.active) {
                      e.currentTarget.style.background = 'var(--color-surface-glass)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Admin Content */}
          <div className="admin-content flex-1" style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: 'var(--spacing-xl)',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div className="admin-header mb-6">
              <h1 className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)' }}>
                {title}
              </h1>
              {description && (
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                  {description}
                </p>
              )}
              <div className="admin-header-divider" style={{
                height: '1px',
                background: 'var(--color-border)',
                width: '100%',
                marginTop: 'var(--spacing-md)'
              }}></div>
            </div>
            
            <div className="admin-page-content">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}