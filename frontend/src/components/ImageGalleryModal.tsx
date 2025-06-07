'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format } from 'date-fns';

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

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Art[];
  initialIndex: number;
}

export default function ImageGalleryModal({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(false);

  // Reset current index when modal opens
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRightIcon className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col items-center max-w-6xl max-h-full mx-4">
        {/* Image */}
        <div className="relative max-w-full max-h-[70vh] mb-6">
          <img
            src={currentImage.imageUrl}
            alt={currentImage.title}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onLoad={() => setIsLoading(false)}
            onLoadStart={() => setIsLoading(true)}
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Image info */}
        <div className="text-center text-white max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">{currentImage.title}</h2>
          <p className="text-gray-300 mb-4">
            by{' '}
            <Link 
              href={`/user/${currentImage.createdBy.username}`}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              @{currentImage.createdBy.username}
            </Link>
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-4">
            <span>❤️ {currentImage.likesCount} likes</span>
            <span>💬 {currentImage.commentsCount} comments</span>
            <span>👁️ {currentImage.views} views</span>
            <span>📅 {format(new Date(currentImage.createdAt), 'MMM dd, yyyy')}</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/art/${currentImage.slug || currentImage._id}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              View Details
            </Link>
            
            {images.length > 1 && (
              <span className="text-gray-400">
                {currentIndex + 1} of {images.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail strip for multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
          {images.map((image, index) => (
            <button
              key={image._id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-blue-500 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
