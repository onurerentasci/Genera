'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import '@/app/user/styles.css';
import { Tab } from '@headlessui/react';
import { 
  UserCircleIcon, 
  PhotoIcon, 
  HeartIcon, 
  CalendarIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

// Types
interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  role: string;
  bio?: string;
  profileImage?: string;
}

interface Art {
  _id: string;
  imageUrl: string;
  title: string;
  slug: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  views: number;
}

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: currentUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [galleryArts, setGalleryArts] = useState<Art[]>([]);
  const [likedArts, setLikedArts] = useState<Art[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [galleryPage, setGalleryPage] = useState(1);
  const [likedPage, setLikedPage] = useState(1);
  const [galleryHasMore, setGalleryHasMore] = useState(true);
  const [likedHasMore, setLikedHasMore] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/user/${username}`);
        setUser(response.data.data);
        
        // Reset pagination when username changes
        setGalleryPage(1);
        setLikedPage(1);
        setGalleryArts([]);
        setLikedArts([]);
        
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  // Fetch gallery
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(`/api/user/${username}/gallery?page=${galleryPage}&limit=12`);
        
        if (galleryPage === 1) {
          setGalleryArts(response.data.data);
        } else {
          setGalleryArts(prev => [...prev, ...response.data.data]);
        }
        
        // Check if there are more pages
        const { page, pages } = response.data.pagination;
        setGalleryHasMore(page < pages);
        
      } catch (err) {
        console.error('Error fetching gallery:', err);
      }
    };

    if (username && activeTab === 0) {
      fetchGallery();
    }
  }, [username, galleryPage, activeTab]);

  // Fetch liked arts
  useEffect(() => {
    const fetchLikedArts = async () => {
      try {
        const response = await axios.get(`/api/user/${username}/liked?page=${likedPage}&limit=12`);
        
        if (likedPage === 1) {
          setLikedArts(response.data.data);
        } else {
          setLikedArts(prev => [...prev, ...response.data.data]);
        }
        
        // Check if there are more pages
        const { page, pages } = response.data.pagination;
        setLikedHasMore(page < pages);
        
      } catch (err) {
        console.error('Error fetching liked arts:', err);
      }
    };

    if (username && activeTab === 1) {
      fetchLikedArts();
    }
  }, [username, likedPage, activeTab]);

  const loadMoreGallery = () => {
    setGalleryPage(prev => prev + 1);
  };

  const loadMoreLiked = () => {
    setLikedPage(prev => prev + 1);
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
  if (error || !user) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]" style={{ padding: 'var(--spacing-md)' }}>
          <UserCircleIcon className="h-20 w-20 mb-4" style={{ color: 'var(--color-text-tertiary)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>User Not Found</h1>
          <p className="mb-6 text-center max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
            {error || "The user you're looking for doesn't exist or has been removed."}
          </p>
          <Link 
            href="/" 
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:transform hover:scale-105"
            style={{ 
              background: 'var(--color-primary)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentUser = isAuthenticated && currentUser?.username === username;
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Navbar />
      
      {/* Profile Header */}
      <div className="profile-header" style={{ 
        background: 'var(--color-surface)',
        borderBottom: `1px solid var(--color-border)`,
        boxShadow: 'var(--shadow-md)'
      }}>        <div className="container mx-auto px-4" style={{ 
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
                    onClick={() => router.push('/settings/profile')}
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
      </div>      {/* Tabs and Content */}      <div className="container mx-auto px-4" style={{ 
        maxWidth: '99vw',
        padding: `var(--spacing-2xl) var(--spacing-md)`
      }}>
        <Tab.Group onChange={setActiveTab}><Tab.List className="tab-list flex rounded-xl mb-6" style={{ 
            background: 'var(--color-surface)',
            border: `1px solid var(--color-border)`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xs)',
            gap: 'var(--spacing-xs)',
            width: '100%',
            margin: '0 auto var(--spacing-xl) auto'
          }}>            <Tab>
              {({ selected }) => (
                <div
                  className={`w-full rounded-lg text-sm font-medium leading-5 transition-all duration-300 cursor-pointer ${
                    selected 
                      ? 'text-white shadow-lg'
                      : 'hover:bg-opacity-20'
                  }`}
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    background: selected 
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))'
                      : 'transparent',
                    color: selected 
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: selected ? 'var(--shadow-md)' : 'none',
                    border: 'none',
                    outline: 'none',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = 'var(--color-surface-glass)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  <div className="flex items-center justify-center" style={{ gap: 'var(--spacing-sm)' }}>
                    <PhotoIcon className="h-5 w-5" />
                    <span>Gallery</span>
                  </div>
                </div>
              )}
            </Tab>            <Tab>
              {({ selected }) => (
                <div
                  className={`w-full rounded-lg text-sm font-medium leading-5 transition-all duration-300 cursor-pointer ${
                    selected 
                      ? 'text-white shadow-lg'
                      : 'hover:bg-opacity-20'
                  }`}
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    background: selected 
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))'
                      : 'transparent',
                    color: selected 
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: selected ? 'var(--shadow-md)' : 'none',
                    border: 'none',
                    outline: 'none',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = 'var(--color-surface-glass)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  <div className="flex items-center justify-center" style={{ gap: 'var(--spacing-sm)' }}>
                    <HeartIcon className="h-5 w-5" />
                    <span>Liked</span>
                  </div>
                </div>
              )}
            </Tab>
          </Tab.List>            <Tab.Panels className="mx-auto w-full" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Gallery Panel */}
            <Tab.Panel>
              {galleryArts.length === 0 ? (
                <div className="empty-state flex flex-col items-center justify-center text-center" style={{
                  padding: `var(--spacing-2xl)`,
                  background: 'var(--color-surface)',
                  border: `2px dashed var(--color-border)`,
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <PhotoIcon className="h-16 w-16 mb-4 empty-icon" style={{ color: 'var(--color-text-tertiary)' }} />
                  <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    No artworks yet
                  </h3>
                  <p className="max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
                    {isCurrentUser 
                      ? "You haven't created any artworks yet. Start creating!" 
                      : `${username} hasn't created any artworks yet.`}
                  </p>
                  {isCurrentUser && (
                    <Link 
                      href="/generate" 
                      className="font-medium transition-all duration-300 hover:transform hover:scale-105"
                      style={{ 
                        marginTop: 'var(--spacing-md)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        color: 'var(--color-text-primary)',
                        padding: `var(--spacing-sm) var(--spacing-md)`,
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                    >
                      Create Art
                    </Link>
                  )}
                </div>              ) : (
                <div className="gallery-grid w-full" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 'var(--spacing-lg)',
                  margin: '0 auto',
                  justifyContent: 'center'
                }}>
                  {galleryArts.map((art) => (
                    <Link
                      href={`/art/${art.slug || art._id}`}
                      key={art._id}
                      className="gallery-item group"
                    >
                      <div className="relative aspect-square overflow-hidden" style={{
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-surface-elevated)',
                        border: `1px solid var(--color-border)`,
                        transition: 'var(--transition-normal)'
                      }}>
                        <img 
                          src={art.imageUrl} 
                          alt={art.title} 
                          className="gallery-image object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="gallery-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                          padding: 'var(--spacing-md)'
                        }}>
                          <h3 className="font-medium text-sm truncate">{art.title}</h3>
                          <div className="flex items-center mt-1 text-xs" style={{ gap: 'var(--spacing-md)' }}>
                            <span className="flex items-center">
                              <HeartIcon className="h-3 w-3" style={{ marginRight: 'var(--spacing-xs)' }} />
                              {art.likesCount}
                            </span>
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3" style={{ marginRight: 'var(--spacing-xs)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                              </svg>
                              {art.commentsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Load More Button */}
              {galleryHasMore && (
                <div className="load-more-container flex justify-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <button
                    onClick={loadMoreGallery}
                    className="load-more-button font-medium transition-all duration-300 hover:transform hover:scale-105"
                    style={{
                      padding: `var(--spacing-sm) var(--spacing-xl)`,
                      background: 'var(--color-surface-glass)',
                      border: `1px solid var(--color-border)`,
                      borderRadius: 'var(--radius-md)',
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
                    Load More
                  </button>
                </div>
              )}
            </Tab.Panel>            
            {/* Liked Arts Panel */}
            <Tab.Panel>
              {likedArts.length === 0 ? (
                <div className="empty-state flex flex-col items-center justify-center text-center" style={{
                  padding: `var(--spacing-2xl)`,
                  background: 'var(--color-surface)',
                  border: `2px dashed var(--color-border)`,
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <HeartIcon className="h-16 w-16 mb-4 empty-icon" style={{ color: 'var(--color-text-tertiary)' }} />
                  <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    No liked artworks
                  </h3>
                  <p className="max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
                    {isCurrentUser 
                      ? "You haven't liked any artworks yet." 
                      : `${username} hasn't liked any artworks yet.`}
                  </p>
                  {isCurrentUser && (
                    <Link 
                      href="/" 
                      className="font-medium transition-all duration-300 hover:transform hover:scale-105"
                      style={{ 
                        marginTop: 'var(--spacing-md)',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        color: 'var(--color-text-primary)',
                        padding: `var(--spacing-sm) var(--spacing-md)`,
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                    >
                      Explore Artworks
                    </Link>
                  )}
                </div>              ) : (
                <div className="gallery-grid w-full" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 'var(--spacing-lg)',
                  margin: '0 auto',
                  justifyContent: 'center'
                }}>
                  {likedArts.map((art) => (
                    <Link
                      href={`/art/${art.slug || art._id}`}
                      key={art._id}
                      className="gallery-item group"
                    >
                      <div className="relative aspect-square overflow-hidden" style={{
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-surface-elevated)',
                        border: `1px solid var(--color-border)`,
                        transition: 'var(--transition-normal)'
                      }}>
                        <img 
                          src={art.imageUrl} 
                          alt={art.title} 
                          className="gallery-image object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="gallery-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                          padding: 'var(--spacing-md)'
                        }}>
                          <h3 className="font-medium text-sm truncate">{art.title}</h3>
                          <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            by @{art.createdBy.username}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Load More Button */}
              {likedHasMore && (
                <div className="load-more-container flex justify-center" style={{ marginTop: 'var(--spacing-2xl)' }}>
                  <button
                    onClick={loadMoreLiked}
                    className="load-more-button font-medium transition-all duration-300 hover:transform hover:scale-105"
                    style={{
                      padding: `var(--spacing-sm) var(--spacing-xl)`,
                      background: 'var(--color-surface-glass)',
                      border: `1px solid var(--color-border)`,
                      borderRadius: 'var(--radius-md)',
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
                    Load More
                  </button>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}