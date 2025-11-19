'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ProfileHeader from '@/components/ProfileHeader';
import GalleryGrid from '@/components/GalleryGrid';
import EmptyState from '@/components/EmptyState';
import ImageGalleryModal from '@/components/ImageGalleryModal';
import { useUser, useUserGallery, useUserLiked } from '@/hooks/useSWR';
import '@/app/user/styles.css';
import { Tab } from '@headlessui/react';
import { UserCircleIcon, PhotoIcon, HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Types
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
  
  // SWR data fetching
  const { data: userData, error: userError, isLoading: userLoading } = useUser(username);
  const { data: galleryData, isLoading: galleryLoading } = useUserGallery(username, 1);
  const { data: likedData, isLoading: likedLoading } = useUserLiked(username, 1);
  
  // UI states
  const [activeTab, setActiveTab] = useState(0);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<Art[]>([]);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);

  // Modal handlers
  const openGalleryModal = (images: Art[], initialIndex: number) => {
    setModalImages(images);
    setModalInitialIndex(initialIndex);
    setIsGalleryModalOpen(true);
  };

  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
  };

  // Loading state
  if (userLoading) {
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

  // Error or not found
  if (userError || !userData?.data) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]" style={{ padding: 'var(--spacing-md)' }}>
          <UserCircleIcon className="h-20 w-20 mb-4" style={{ color: 'var(--color-text-tertiary)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>User Not Found</h1>
          <p className="mb-6 text-center max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
            {userError || "The user you're looking for doesn't exist or has been removed."}
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
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const user = userData.data;
  const isCurrentUser = isAuthenticated && currentUser?.username === username;
  const galleryArts = galleryData?.data || [];
  const likedArts = likedData?.data || [];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Navbar />
      
      {/* Profile Header Component */}
      <ProfileHeader 
        user={user}
        isCurrentUser={isCurrentUser}
        onEditProfile={() => router.push('/settings/profile')}
      />

      {/* Tabs and Content */}
      <div className="container mx-auto px-4" style={{ 
        maxWidth: '99vw',
        padding: `var(--spacing-2xl) var(--spacing-md)`
      }}>
        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="tab-list flex rounded-xl mb-6" style={{ 
            background: 'var(--color-surface)',
            border: `1px solid var(--color-border)`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xs)',
            gap: 'var(--spacing-xs)',
            width: '100%',
            margin: '0 auto var(--spacing-xl) auto'
          }}>
            {/* Gallery Tab */}
            <Tab>
              {({ selected }) => (
                <TabButton selected={selected} icon={<PhotoIcon className="h-5 w-5" />} label="Gallery" />
              )}
            </Tab>
            
            {/* Liked Tab */}
            <Tab>
              {({ selected }) => (
                <TabButton selected={selected} icon={<HeartIcon className="h-5 w-5" />} label="Liked" />
              )}
            </Tab>
          </Tab.List>

          <Tab.Panels className="mx-auto w-full" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Gallery Panel */}
            <Tab.Panel>
              {galleryLoading ? (
                <div className="text-center py-8">Loading gallery...</div>
              ) : galleryArts.length === 0 ? (
                <EmptyState
                  icon={<PhotoIcon className="h-full w-full" />}
                  title="No artworks yet"
                  description={isCurrentUser 
                    ? "You haven't created any artworks yet. Start creating!" 
                    : `${username} hasn't created any artworks yet.`}
                  actionLabel={isCurrentUser ? "Create Art" : undefined}
                  actionHref={isCurrentUser ? "/generate" : undefined}
                />
              ) : (
                <GalleryGrid 
                  arts={galleryArts}
                  onImageClick={(index) => openGalleryModal(galleryArts, index)}
                />
              )}
            </Tab.Panel>
            
            {/* Liked Arts Panel */}
            <Tab.Panel>
              {likedLoading ? (
                <div className="text-center py-8">Loading liked arts...</div>
              ) : likedArts.length === 0 ? (
                <EmptyState
                  icon={<HeartIcon className="h-full w-full" />}
                  title="No liked artworks"
                  description={isCurrentUser 
                    ? "You haven't liked any artworks yet." 
                    : `${username} hasn't liked any artworks yet.`}
                  actionLabel={isCurrentUser ? "Explore Artworks" : undefined}
                  actionHref={isCurrentUser ? "/" : undefined}
                />
              ) : (
                <GalleryGrid 
                  arts={likedArts}
                  onImageClick={(index) => openGalleryModal(likedArts, index)}
                  showCreator={true}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryModalOpen}
        images={modalImages}
        initialIndex={modalInitialIndex}
        onClose={closeGalleryModal}
      />
    </div>
  );
}

// TabButton sub-component for cleaner code
function TabButton({ selected, icon, label }: { selected: boolean; icon: React.ReactNode; label: string }) {
  return (
    <div
      className={`w-full rounded-lg text-sm font-medium leading-5 transition-all duration-300 cursor-pointer ${
        selected ? 'text-white shadow-lg' : 'hover:bg-opacity-20'
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
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="flex items-center justify-center" style={{ gap: 'var(--spacing-sm)' }}>
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
}