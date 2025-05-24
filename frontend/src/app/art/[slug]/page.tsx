"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { HeartIcon, ChatBubbleLeftIcon, EyeIcon, ClockIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '@/components/Navbar';

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

export default function ArtDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
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
  return (    <div className="min-h-screen bg-background-light py-10">
      <Navbar />
      <div style={{padding: '5rem 1rem', margin: '0 auto', display: 'flex', justifyContent: 'center'}} className="container">
        <div style={{gap: '2.5rem', maxWidth: '72rem', width: '100%'}} className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative h-[500px] md:h-auto">
            <img 
              src={art.imageUrl} 
              alt={art.title} 
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
          </div>          {/* Details Section */}          <div style={{paddingBottom: '2.5rem',paddingTop: '2.5rem', paddingLeft:'1rem', paddingRight:'1rem'}} className="bg-gray-900 text-white rounded-lg shadow-lg">
            <h1 style={{marginBottom: '2rem', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'}} className="text-3xl font-bold">{art.title}</h1><div style={{marginBottom: '1.5rem'}} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-gray-700 rounded-full h-10 w-10 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {art.createdBy.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span style={{marginLeft: '0.5rem'}}>@{art.createdBy.username}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-1" />
                <span>{formatDistanceToNow(new Date(art.createdAt), { addSuffix: true })}</span>
              </div>
            </div>            <div style={{marginBottom: '1.5rem'}}>
              <h2 style={{marginBottom: '0.5rem'}} className="text-xl font-semibold">Prompt</h2>
              <div style={{padding: '1rem'}} className="bg-gray-700 rounded-lg">
                <div className="flex items-start">
                  <PencilIcon style={{marginTop: '0.25rem', marginRight: '0.5rem'}} className="h-5 w-5 text-gray-400" />
                  <p>{art.prompt}</p>
                </div>
              </div>
            </div>            <div style={{padding: '1rem 0', marginBottom: '1.5rem', borderTop: '1px solid rgba(75, 85, 99, 1)', borderBottom: '1px solid rgba(75, 85, 99, 1)'}} className="flex justify-around">
              <div className="flex items-center">
                <button onClick={handleLike} className="flex items-center">
                  {isLiked ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <span style={{marginLeft: '0.25rem'}}>{art.likesCount}</span>
              </div>              <div className="flex items-center">
                <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400" />
                <span style={{marginLeft: '0.25rem'}}>{art.commentsCount}</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="h-6 w-6 text-gray-400" />
                <span style={{marginLeft: '0.25rem'}}>{art.views}</span>
              </div>
            </div>            <div>
              <h2 style={{marginBottom: '1rem'}} className="text-xl font-semibold">Comments</h2>
              {isAuthenticated && (
                <form onSubmit={handleSubmitComment} style={{marginBottom: '1.5rem'}} className="flex">                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    style={{flex: 1, borderWidth: '1px', borderColor: 'rgba(75, 85, 99, 1)', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem', padding: '0.5rem 1rem'}}
                    className="focus:outline-none focus:ring-2 focus:ring-primary"
                  />                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    style={{padding: '0.5rem 1rem', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem'}}
                    className="bg-primary text-white hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                  >
                    Post
                  </button>
                </form>
              )}              <div style={{gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem'}} className="space-y-4">
                {art.comments && art.comments.length > 0 ? (
                  art.comments.map((comment) => (
                    <div key={comment._id} style={{padding: '1rem'}} className="bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">                          <div className="bg-gray-600 rounded-full h-8 w-8 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {comment.createdBy.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span style={{marginLeft: '0.5rem'}} className="font-medium">@{comment.createdBy.username}</span>
                        </div>
                        <div className="flex items-center">                          <span style={{marginRight: '0.5rem'}} className="text-sm text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {isAuthenticated && user && comment.createdBy._id === user.id && (
                            <button onClick={() => handleDeleteComment(comment._id)} className="text-gray-400 hover:text-red-500">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{marginTop: '0.5rem'}} className="text-gray-300">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p style={{padding: '1rem 0'}} className="text-gray-400 text-center">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}