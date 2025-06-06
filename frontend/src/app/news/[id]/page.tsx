'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ClockIcon, UserCircleIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import '../styles.css';

interface News {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id as string;
  
  const [news, setNews] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!newsId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/news/${newsId}`);
        
        if (response.data.success) {
          setNews(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch news article');
        }
      } catch (err: any) {
        console.error('Error fetching news detail:', err);
        setError(err.response?.data?.message || 'Failed to fetch news article');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNewsDetail();
  }, [newsId]);
  
  // Function to format content paragraphs
  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => 
      paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
    );
  };

  return (
    <div className="min-h-screen news-page-container" style={{ background: 'var(--color-background)' }}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '800px' }}>
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-surface-elevated)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-surface)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to News</span>
          </Link>
        </div>
        
        {/* News Detail Content */}
        <div className="news-detail">
          {isLoading ? (
            // Loading skeleton
            <div className="animate-pulse space-y-8">
              <div className="h-8 w-3/4 rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
              <div className="flex gap-4">
                <div className="h-5 w-32 rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
                <div className="h-5 w-24 rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
              </div>
              <div className="h-64 w-full rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
              <div className="space-y-4">
                <div className="h-4 w-full rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
                <div className="h-4 w-full rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
                <div className="h-4 w-3/4 rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
                <div className="h-4 w-full rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
                <div className="h-4 w-5/6 rounded" style={{ background: 'var(--color-surface-elevated)' }}></div>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div 
              className="text-center py-12 px-4 rounded-xl"
              style={{ 
                background: 'var(--color-surface)',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <p className="text-xl mb-4" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
              <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                The article you're looking for might have been removed or is not available.
              </p>
              <button
                onClick={() => router.push('/news')}
                className="px-4 py-2 rounded-md transition-all duration-300"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary)';
                }}
              >
                Return to News
              </button>
            </div>
          ) : news ? (
            <>
              {/* News content */}
              <article className="news-article p-6 rounded-xl" style={{ 
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)'
              }}>
                {/* Article Header */}
                <header className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                    {news.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {format(new Date(news.createdAt), 'MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <UserCircleIcon className="h-4 w-4 mr-1" />
                      {news.createdBy?.username || 'Admin'}
                    </div>
                  </div>
                </header>
                
                {/* Cover Image */}
                {news.coverImage && (
                  <div className="news-cover mb-8">
                    <img 
                      src={news.coverImage} 
                      alt={news.title}
                      className="w-full rounded-lg object-cover"
                      style={{ 
                        maxHeight: '400px',
                        background: 'var(--color-surface-elevated)'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Article Content */}
                <div 
                  className="prose max-w-none mb-8" 
                  style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7' }}
                >
                  {formatContent(news.content)}
                </div>
                
                {/* Social Sharing */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="text-sm mb-4 md:mb-0" style={{ color: 'var(--color-text-tertiary)' }}>
                      Last updated: {format(new Date(news.updatedAt), 'MMMM d, yyyy')}
                    </div>
                    
                    <div className="social-share">
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: news.title,
                              text: `Check out this news on Genera: ${news.title}`,
                              url: window.location.href
                            })
                            .catch((err) => console.error('Error sharing:', err));
                          } else {
                            navigator.clipboard.writeText(window.location.href)
                              .then(() => alert('Link copied to clipboard!'))
                              .catch((err) => console.error('Error copying link:', err));
                          }
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-300"
                        style={{
                          background: 'var(--color-surface-elevated)',
                          color: 'var(--color-text-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-primary-transparent)';
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--color-surface-elevated)';
                          e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                      >
                        <ShareIcon className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
              
              {/* Related articles placeholder - could be implemented in the future */}
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                  Continue Reading
                </h3>
                <div className="flex justify-center">
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-primary-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-primary)';
                    }}
                  >
                    <span>View All News</span>
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
