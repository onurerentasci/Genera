'use client';

import { UserCircleIcon, CalendarIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Image from 'next/image';

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  role: string;
  bio?: string;
  profileImage?: string;
}

interface ProfileHeaderProps {
  user: User;
  isCurrentUser: boolean;
  onEditProfile: () => void;
}

export default function ProfileHeader({ user, isCurrentUser, onEditProfile }: ProfileHeaderProps) {
  return (
    <div className="profile-header" style={{ 
      background: 'var(--color-surface)',
      borderBottom: `1px solid var(--color-border)`,
      boxShadow: 'var(--shadow-md)'
    }}>
      <div className="container mx-auto px-4" style={{ 
        maxWidth: '1200px',
        padding: `var(--spacing-2xl) var(--spacing-md)`
      }}>
        <div className="flex flex-col md:flex-row items-center md:items-start" style={{ gap: 'var(--spacing-xl)' }}>
          {/* Profile Image */}
          <div 
            className="profile-image h-24 w-24 md:h-32 md:w-32 rounded-full flex items-center justify-center overflow-hidden"
            style={{ 
              background: 'var(--color-surface-elevated)',
              border: `2px solid var(--color-border)`,
              borderRadius: 'var(--radius-xl)'
            }}
          >
            {user.profileImage ? (
              <Image 
                src={user.profileImage} 
                alt={user.username} 
                width={128} 
                height={128} 
                className="object-cover w-full h-full"
              />
            ) : (
              <UserCircleIcon className="h-full w-full" style={{ color: 'var(--color-text-tertiary)' }} />
            )}
          </div>
          
          {/* User Info */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center" style={{ gap: 'var(--spacing-sm)' }}>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {user.username}
              </h1>
              {user.role === 'admin' && (
                <span 
                  className="profile-badge inline-flex items-center px-2.5 py-0.5 text-xs font-medium"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    color: 'var(--color-text-primary)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  Admin
                </span>
              )}
            </div>
            
            {user.bio && (
              <p className="max-w-2xl" style={{ 
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--spacing-sm)',
                lineHeight: '1.6'
              }}>
                {user.bio}
              </p>
            )}
            
            {/* User Meta */}
            <div className="flex flex-wrap items-center justify-center md:justify-start" style={{ 
              marginTop: 'var(--spacing-md)',
              gap: 'var(--spacing-md)'
            }}>
              <span className="flex items-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                <CalendarIcon className="h-4 w-4" style={{ marginRight: 'var(--spacing-xs)' }} />
                Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
              </span>
            </div>
            
            {/* Edit Profile Button */}
            {isCurrentUser && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <button 
                  onClick={onEditProfile}
                  className="flex items-center font-medium transition-all duration-300 hover:transform hover:scale-105"
                  style={{ 
                    gap: 'var(--spacing-xs)',
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-glass)',
                    border: `1px solid var(--color-border)`,
                    color: 'var(--color-text-primary)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-elevated)';
                    e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-glass)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
