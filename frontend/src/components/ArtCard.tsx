"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import './ArtCard.css';

interface ArtCardProps {
  id: string;
  imageUrl: string;
  title: string;
  createdBy: {
    id: string;
    username: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  liked?: boolean;
  onLike?: (id: string, liked: boolean) => void;
}

export default function ArtCard({ 
  id, 
  imageUrl, 
  title, 
  createdBy, 
  createdAt, 
  likesCount = 0, 
  commentsCount = 0, 
  views = 0,
  liked = false,
  onLike
}: ArtCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(liked);
  const [likesCountState, setLikesCountState] = useState(likesCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (isLikeLoading) return;
    
    setIsLikeLoading(true);
    
    try {      if (!isLiked) {
        await axios.post(
          `/api/like/${id}`, 
          {}, 
          { withCredentials: true }
        );
        setIsLiked(true);
        setLikesCountState(prev => prev + 1);
        if (onLike) onLike(id, true);      } else {
        await axios.delete(
          `/api/like/${id}?artId=${id}`, 
          { withCredentials: true }
        );
        setIsLiked(false);
        setLikesCountState(prev => prev - 1);
        if (onLike) onLike(id, false);
      }
    } catch (error) {
      console.error('Error liking/unliking art:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const navigateToDetails = () => {
    router.push(`/art/${id}`);
  };

  // Format the date
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  return (
    <div 
      className="art-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={navigateToDetails}
    >
      {/* Art Image */}
      <img 
        src={imageUrl} 
        alt={title} 
        className="art-image" 
      />
      
      {/* Overlay that appears on hover */}
      <div className="art-overlay" />
      
      {/* Creator and Date (top corners) - visible on hover */}
      <div className="art-info-top">
        <p className="text-sm font-medium">@{createdBy.username}</p>
        <p className="text-sm font-medium">{formattedDate}</p>
      </div>
      
      {/* Stats (bottom) - visible on hover */}
      <div className="art-stats">
        {/* Like button */}
        <button 
          onClick={handleLike}
          className="art-like-button"
          disabled={isLikeLoading}
        >
          {isLiked ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className="ml-1">{likesCountState}</span>
        </button>
        
        {/* Comments */}
        <div className="art-stat">
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span className="ml-1">{commentsCount}</span>
        </div>
        
        {/* Views */}
        <div className="art-stat">
          <EyeIcon className="h-5 w-5" />
          <span className="ml-1">{views}</span>
        </div>
      </div>
    </div>
  );
}
