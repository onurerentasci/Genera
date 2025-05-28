'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import Link from 'next/link';

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

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/news?page=${currentPage}&limit=5`);
        
        if (response.data.success) {
          setNewsList(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError(response.data.message || 'Failed to fetch news');
        }
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError(err.response?.data?.message || 'Failed to fetch news');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [currentPage]);
  
  const truncateContent = (content: string, maxLength: number = 250) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '900px' }}>
        {/* Hero Section */}
        <div className="news-hero text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            News & Announcements
          </h1>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Stay updated with the latest announcements, features, and updates from the Genera team.
          </p>
        </div>
        
        {/* News Content */}
        <div className="news-content">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-8 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-6 rounded-xl" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="h-6 w-3/4 rounded mb-4" style={{ background: 'var(--color-surface-elevated)' }}></div>
                  <div className="h-4 w-1/4 rounded mb-6" style={{ background: 'var(--color-surface-elevated)' }}></div>
                  <div className="space-y-2">
                    <div className="h-4 rounded w-full" style={{ background: 'var(--color-surface-elevated)' }}></div>
                    <div className="h-4 rounded w-full" style={{ background: 'var(--color-surface-elevated)' }}></div>
                    <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-surface-elevated)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <p className="text-xl mb-4" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Please try again later.
              </p>
            </div>
          ) : newsList.length === 0 ? (
            // Empty state
            <div className="text-center py-12 px-4 rounded-xl" style={{ 
              background: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <p className="text-xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
                No news articles available
              </p>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Check back later for updates and announcements.
              </p>
            </div>
          ) : (
            // News list
            <div className="space-y-8">
              {newsList.map((news) => (
                <article 
                  key={news._id}
                  className="news-card p-6 transition-all duration-300"
                  style={{ 
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  {/* Cover Image */}
                  {news.coverImage && (
                    <div className="news-cover mb-6">
                      <img 
                        src={news.coverImage} 
                        alt={news.title}
                        className="w-full h-48 object-cover rounded-lg"
                        style={{ background: 'var(--color-surface-elevated)' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Article Header */}
                  <header className="mb-4">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {news.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
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
                  
                  {/* Article Body */}
                  <div className="prose max-w-none mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    <p>{truncateContent(news.content)}</p>
                  </div>
                  
                  {/* Read More Link - for future implementation of article detail page */}
                  <Link
                    href={`/news/${news._id}`}
                    className="inline-flex items-center text-sm font-medium transition-all duration-300"
                    style={{
                      color: 'var(--color-primary)',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-primary-hover)';
                      e.currentTarget.style.gap = '8px';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.gap = '4px';
                    }}
                  >
                    <span>Read more</span>
                    <span className="transition-all duration-300" style={{ marginLeft: '4px' }}>→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="pagination flex justify-center mt-12 gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-md transition-all duration-300"
                  style={{
                    background: currentPage === i + 1 ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: currentPage === i + 1 ? 'white' : 'var(--color-text-secondary)',
                    border: '1px solid',
                    borderColor: currentPage === i + 1 ? 'var(--color-primary)' : 'var(--color-border)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== i + 1) {
                      e.currentTarget.style.background = 'var(--color-surface-elevated)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== i + 1) {
                      e.currentTarget.style.background = 'var(--color-surface)';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}