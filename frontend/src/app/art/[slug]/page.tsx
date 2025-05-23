"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { HeartIcon, ChatBubbleLeftIcon, EyeIcon, ClockIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  text: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface Art {
  _id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  likes: string[];
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
  views: number;
}

export default function ArtDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [art, setArt] = useState<Art | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {    const fetchArtDetails = async () => {
      try {
        const response = await axios.get(
          `/api/art/${slug}`,
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setArt(response.data.data);
          // Check if current user has liked this art
          if (user && response.data.data.likes.includes(user.id)) {
            setIsLiked(true);
          }
        } else {
          setError('Failed to load art details');
        }
      } catch (error) {
        console.error('Error fetching art details:', error);
        setError('Something went wrong while loading the art');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArtDetails();
    }
  }, [slug, user]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
      try {
      if (!isLiked) {
        await axios.post(
          `/api/like/${slug}`, 
          {}, 
          { withCredentials: true }
        );setIsLiked(true);
        if (art && user) {
          setArt({
            ...art,
            likesCount: art.likesCount + 1,
            likes: [...art.likes, user.id]
          });
        }      } else {
        await axios.delete(
          `/api/like/${slug}?artId=${slug}`, 
          { withCredentials: true }
        );setIsLiked(false);
        if (art && user) {
          setArt({
            ...art,
            likesCount: art.likesCount - 1,
            likes: art.likes.filter(id => id !== user.id)
          });
        }
      }
    } catch (error) {
      console.error('Error liking/unliking art:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
      try {
      const response = await axios.post(
        `/api/comment/${slug}`,
        { text: newComment },
        { withCredentials: true }
      );
      
      if (response.data.success && art) {
        // Add the new comment to the list
        const newCommentObj = response.data.comment;
        setArt({
          ...art,
          comments: [...art.comments, newCommentObj],
          commentsCount: art.commentsCount + 1
        });
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated || !user) {
      return;
    }
    
    try {
      const response = await axios.delete(
        `/api/comment/delete/${commentId}`,
        { withCredentials: true }
      );
      
      if (response.data.success && art) {
        // Remove the comment from the list
        setArt({
          ...art,
          comments: art.comments.filter(comment => comment._id !== commentId),
          commentsCount: art.commentsCount - 1
        });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Track view when page loads
  useEffect(() => {
    const trackArtView = async () => {
      if (slug) {
        try {
          await axios.post(`/api/view/${slug}`);
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      }
    };

    trackArtView();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !art) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Art not found'}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-10">
      <div className="container mx-auto px-4">
        {/* Art Display Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="relative h-[500px] md:h-auto">
              <img 
                src={art.imageUrl} 
                alt={art.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Details Section */}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{art.title}</h1>
              
              {/* Creator and Date Info */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                    <span className="text-gray-700 font-medium">
                      {art.createdBy.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="ml-2 text-gray-700">@{art.createdBy.username}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-1" />
                  <span>{formatDistanceToNow(new Date(art.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              
              {/* Prompt Section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Prompt</h2>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-start">
                    <PencilIcon className="h-5 w-5 text-gray-500 mt-1 mr-2" />
                    <p className="text-gray-700">{art.prompt}</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Section */}
              <div className="flex justify-around py-4 mb-6 border-t border-b border-gray-200">
                <div className="flex items-center">
                  <button 
                    onClick={handleLike}
                    className="flex items-center hover:scale-110 transition-transform"
                  >
                    {isLiked ? (
                      <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-700" />
                    )}
                  </button>
                  <span className="ml-1 text-gray-700">{art.likesCount}</span>
                </div>
                
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-gray-700" />
                  <span className="ml-1 text-gray-700">{art.commentsCount}</span>
                </div>
                
                <div className="flex items-center">
                  <EyeIcon className="h-6 w-6 text-gray-700" />
                  <span className="ml-1 text-gray-700">{art.views}</span>
                </div>
              </div>
              
              {/* Comments Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
                
                {/* Comment Form */}
                {isAuthenticated && (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Comments List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {art.comments && art.comments.length > 0 ? (
                    art.comments.map((comment) => (
                      <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center">
                              <span className="text-gray-700 font-medium">
                                {comment.createdBy.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="ml-2 font-medium text-gray-800">
                              @{comment.createdBy.username}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                            {isAuthenticated && user && comment.createdBy._id === user.id && (
                              <button 
                                onClick={() => handleDeleteComment(comment._id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-700">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}