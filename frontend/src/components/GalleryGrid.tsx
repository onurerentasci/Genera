'use client';

import { HeartIcon } from '@heroicons/react/24/outline';

interface Art {
  _id: string;
  imageUrl: string;
  title: string;
  slug: string;
  createdBy: {
    _id: string;
    username: string;
  };
  likesCount: number;
  commentsCount: number;
}

interface GalleryGridProps {
  arts: Art[];
  onImageClick: (index: number) => void;
  showCreator?: boolean;
}

export default function GalleryGrid({ arts, onImageClick, showCreator = false }: GalleryGridProps) {
  return (
    <div className="gallery-grid w-full" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 'var(--spacing-lg)',
      margin: '0 auto',
      justifyContent: 'center'
    }}>
      {arts.map((art, index) => (
        <button
          onClick={(e) => {
            e.preventDefault();
            onImageClick(index);
          }}
          key={art._id}
          className="gallery-item group cursor-pointer border-none bg-transparent p-0"
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
              {showCreator && (
                <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  by @{art.createdBy.username}
                </p>
              )}
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
        </button>
      ))}
    </div>
  );
}
