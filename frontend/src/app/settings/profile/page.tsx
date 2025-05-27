'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { UserCircleIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ProfileSettingsPage() {
  const { user, isAuthenticated, isLoading, updateUserProfile } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // If user data is loaded, set the form fields
    if (user) {
      setBio(user.bio || '');
      setProfileImage(user.profileImage || '');
    }

    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [user, isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      // Use the updateUserProfile method from AuthContext
      const success = await updateUserProfile({
        bio,
        profileImage
      });

      if (success) {
        setSuccessMessage('Profile updated successfully!');
        // The setSuccessMessage will be cleared after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 rounded-full mb-4" style={{ background: 'var(--color-surface)' }}></div>
            <div className="h-6 w-48 rounded mb-3" style={{ background: 'var(--color-surface)' }}></div>
            <div className="h-4 w-64 rounded" style={{ background: 'var(--color-surface)' }}></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Navbar />      <div className="flex justify-center w-full px-4 py-12">
        <div style={{
          width: '100%',
          maxWidth: '800px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--spacing-xl)'
        }}>
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Profile Settings</h1>          {successMessage && (
            <div className="mb-6 p-4 flex items-start" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--color-success)',
              borderRadius: 'var(--radius-md)'
            }}>
              <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5" style={{ color: 'var(--color-success)' }} />
              <span style={{ color: 'var(--color-text-primary)' }}>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 flex items-start" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)'
            }}>
              <ExclamationCircleIcon className="h-5 w-5 mr-3 mt-0.5" style={{ color: 'var(--color-error)' }} />
              <span style={{ color: 'var(--color-text-primary)' }}>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8">            {/* Profile Image */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Profile Photo</h3>

              {/* Profile Image Preview - Centered */}
              <div className="flex justify-center mb-6">
                <div className="relative h-32 w-32 rounded-full overflow-hidden" style={{
                  background: 'var(--color-surface-elevated)',
                  border: '2px solid var(--color-border)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'var(--transition-normal)'
                }}>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <UserCircleIcon className="h-20 w-20" style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                  )}
                  <div className={`h-full w-full flex items-center justify-center absolute top-0 left-0 ${profileImage ? 'hidden' : ''}`}
                    style={{ background: 'var(--color-surface-elevated)' }}>
                    <UserCircleIcon className="h-20 w-20" style={{ color: 'var(--color-text-tertiary)' }} />
                  </div>
                </div>              </div>              <div className="max-w-2xl mx-auto">
                <label htmlFor="profileImage" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Profile Image URL
                </label>
                <input
                  type="text"
                  id="profileImage"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    transition: 'var(--transition-fast)'
                  }}
                  className="focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <p className="mt-2 text-sm text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                  Paste a URL to an image (JPG, PNG). For best results, use a square image.
                </p>
              </div>
            </div>            {/* Bio */}
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>About You</h3>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself... What are your interests, goals, or what makes you unique?"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-md)',
                    height: '8rem',
                    resize: 'none',
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)',
                    transition: 'var(--transition-fast)'
                  }}
                  className="focus:ring-2 focus:ring-primary focus:border-primary"
                  maxLength={500}
                ></textarea>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    Tell your story in a few sentences
                  </p>
                  <span className="text-sm font-medium"
                    style={{
                      color: bio.length > 480 ? 'var(--color-error)' :
                        bio.length > 450 ? 'var(--color-warning)' :
                          'var(--color-text-secondary)'
                    }}
                  >
                    {bio.length}/500
                  </span>
                </div>
              </div>
            </div>            {/* Submit Button */}
            <div className="flex justify-center pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  marginTop: 'var(--spacing-lg)',
                  padding: 'var(--spacing-md) var(--spacing-xl)',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'var(--color-text-primary)',
                  fontWeight: '500',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: isSaving ? 'none' : 'var(--shadow-md)',
                  opacity: isSaving ? '0.7' : '1',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-normal)',
                  border: 'none',
                  outline: 'none',
                }}
                className={`transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${isSaving ? 'hover:transform-none hover:shadow-none' : ''}`}
                onMouseEnter={(e) => !isSaving && (e.currentTarget.style.boxShadow = 'var(--shadow-glow)')}
                onMouseLeave={(e) => !isSaving && (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
