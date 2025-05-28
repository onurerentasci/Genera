'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTopRightOnSquareIcon,
  ShieldExclamationIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface News {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  createdBy: {
    _id: string;
    username: string;
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  _id?: string;
  title: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
}

export default function AdminNewsPage() {
  // News list state
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    coverImage: '',
    isPublished: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  
  // Fetch news list
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/admin/news?page=${currentPage}&limit=10`);
        
        if (response.data.success) {
          setNewsList(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError(response.data.message || 'Failed to fetch news');
        }      } catch (err: any) {
        console.error('Error fetching news:', err);
        // Handle 403 Forbidden errors specifically for better UX
        if (err.response?.status === 403) {
          setError('You do not have permission to access admin content. Admin rights are required.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch news');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [currentPage]);
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.content) {
      setFormError('Title and content are required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      if (isEditing && formData._id) {
        // Update existing news
        const response = await axios.put(`/api/admin/news/${formData._id}`, formData);
        
        if (response.data.success) {
          // Update news list
          setNewsList(prev => 
            prev.map(item => 
              item._id === formData._id ? response.data.data : item
            )
          );
          setSuccessMessage('News updated successfully');
        } else {
          setFormError(response.data.message || 'Failed to update news');
        }
      } else {
        // Create new news
        const response = await axios.post('/api/admin/news', formData);
        
        if (response.data.success) {
          // Add new news to list if on first page
          if (currentPage === 1) {
            setNewsList(prev => [response.data.data, ...prev].slice(0, 10));
          }
          setSuccessMessage('News created successfully');
        } else {
          setFormError(response.data.message || 'Failed to create news');
        }
      }
      
      // Reset form after successful submission
      if (!formError) {
        resetForm();
      }
    } catch (err: any) {
      console.error('Error submitting news:', err);
      setFormError(err.response?.data?.message || 'Failed to submit news');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle edit news
  const handleEditNews = (news: News) => {
    setFormData({
      _id: news._id,
      title: news.title,
      content: news.content,
      coverImage: news.coverImage || '',
      isPublished: news.isPublished
    });
    setIsEditing(true);
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle delete news
  const handleDeleteNews = async (id: string) => {
    // Check if already confirming
    if (deleteConfirmation === id) {
      try {
        const response = await axios.delete(`/api/admin/news/${id}`);
        
        if (response.data.success) {
          // Remove from list
          setNewsList(prev => prev.filter(item => item._id !== id));
          setSuccessMessage('News deleted successfully');
        } else {
          setError(response.data.message || 'Failed to delete news');
        }
      } catch (err: any) {
        console.error('Error deleting news:', err);
        setError(err.response?.data?.message || 'Failed to delete news');
      } finally {
        setDeleteConfirmation(null);
      }
    } else {
      // Ask for confirmation
      setDeleteConfirmation(id);
      
      // Auto-cancel after 5 seconds
      setTimeout(() => {
        setDeleteConfirmation(null);
      }, 5000);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      coverImage: '',
      isPublished: true
    });
    setIsEditing(false);
    setShowForm(false);
    setFormError(null);
    
    // Auto-clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };
  
  return (
    <AdminLayout
      title="News Management"
      description="Create, edit and manage news articles and announcements."
    >
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center p-4 mb-6 rounded-md" style={{
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success-border)'
        }}>
          <CheckCircleIcon className="h-5 w-5 mr-2" style={{ color: 'var(--color-success)' }} />
          <span style={{ color: 'var(--color-success)' }}>{successMessage}</span>
        </div>
      )}
        {/* Error Message */}
      {error && (
        <div className="p-4 mb-6 rounded-md" style={{
          background: error.includes('permission') || error.includes('Admin rights') ? 
            'var(--color-warning-bg)' : 'var(--color-danger-bg)',
          border: '1px solid',
          borderColor: error.includes('permission') || error.includes('Admin rights') ? 
            'var(--color-warning-border)' : 'var(--color-danger-border)'
        }}>
          <div className="flex items-center">
            {error.includes('permission') || error.includes('Admin rights') ? (
              <ShieldExclamationIcon className="h-6 w-6 mr-3" style={{ color: 'var(--color-warning)' }} />
            ) : (
              <ExclamationCircleIcon className="h-6 w-6 mr-3" style={{ color: 'var(--color-danger)' }} />
            )}
            <span className="font-medium" style={{ 
              color: error.includes('permission') || error.includes('Admin rights') ? 
                'var(--color-warning)' : 'var(--color-danger)'
            }}>
              {error.includes('permission') || error.includes('Admin rights') ? 
                'Access Denied' : 'Error'}
            </span>
          </div>
          
          <p className="mt-2 ml-9" style={{ 
            color: error.includes('permission') || error.includes('Admin rights') ? 
              'var(--color-text-secondary)' : 'var(--color-danger)'
          }}>
            {error}
          </p>
          
          {(error.includes('permission') || error.includes('Admin rights')) && (
            <div className="mt-4 ml-9">
              <Link 
                href="/"
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
                <span>Return to Home</span>
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Create News Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 mb-6 rounded-md transition-all duration-300"
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            boxShadow: 'var(--shadow-md)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <PlusIcon className="h-5 w-5" />
          Create News
        </button>
      )}
      
      {/* News Form */}
      {showForm && (
        <div className="news-form mb-8 p-6 rounded-lg" style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {isEditing ? 'Edit News' : 'Create News'}
          </h3>
          
          {/* Form Error */}
          {formError && (
            <div className="flex items-center p-4 mb-4 rounded-md" style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)'
            }}>
              <ExclamationCircleIcon className="h-5 w-5 mr-2" style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--color-danger)' }}>{formError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group mb-4">
              <label htmlFor="title" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
                required
              />
            </div>
            
            {/* Content */}
            <div className="form-group mb-4">
              <label htmlFor="content" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  minHeight: '150px',
                  resize: 'vertical'
                }}
                required
              ></textarea>
            </div>
            
            {/* Cover Image URL */}
            <div className="form-group mb-4">
              <label htmlFor="coverImage" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Cover Image URL (optional)
              </label>
              <input
                type="text"
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                Enter a URL to an image to display as the cover.
              </p>
            </div>
            
            {/* Published Status */}
            <div className="form-group mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 mr-2"
                  style={{
                    accentColor: 'var(--color-primary)'
                  }}
                />
                <label htmlFor="isPublished" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Publish immediately
                </label>
              </div>
              <p className="text-xs mt-1 ml-6" style={{ color: 'var(--color-text-tertiary)' }}>
                Unpublished news will not be visible to regular users.
              </p>
            </div>
            
            {/* Form Actions */}
            <div className="form-actions flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-md transition-all duration-300"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  boxShadow: 'var(--shadow-md)'
                }}
                disabled={isSubmitting}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update News' : 'Create News'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-md transition-all duration-300"
                style={{
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)'
                }}
                disabled={isSubmitting}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = 'var(--color-surface-elevated)')}
                onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = 'var(--color-surface)')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* News List */}
      <div className="news-list">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          News Articles
        </h3>
        
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-6 rounded" style={{ background: 'var(--color-surface)' }}></div>
                <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-surface)' }}></div>
              </div>
            ))}
          </div>
        ) : newsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-lg" style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)'
          }}>
            <p className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
              No news articles found. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsList.map(news => (
              <div 
                key={news._id} 
                className="p-4 rounded-lg transition-all duration-300"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {news.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        By {news.createdBy?.username || 'Admin'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {format(new Date(news.createdAt), 'MMM dd, yyyy')}
                      </span>
                      <span 
                        className="flex items-center text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          background: news.isPublished ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                          color: news.isPublished ? 'var(--color-success)' : 'var(--color-danger)'
                        }}
                      >
                        {news.isPublished ? (
                          <>
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="h-3 w-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </div>
                    <p 
                      className="mt-2 text-sm line-clamp-2" 
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {news.content}
                    </p>
                  </div>
                    <div className="flex items-center gap-2 ml-4">
                    {/* View button - only for published articles */}
                    {news.isPublished && (
                      <Link
                        href={`/news/${news._id}`}
                        target="_blank"
                        className="p-2 rounded-full transition-all duration-300"
                        style={{
                          background: 'var(--color-surface-elevated)',
                          color: 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-surface-hover)';
                          e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--color-surface-elevated)';
                          e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                        title="View Published Article"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </Link>
                    )}
                    
                    <button
                      onClick={() => handleEditNews(news)}
                      className="p-2 rounded-full transition-all duration-300"
                      style={{
                        background: 'var(--color-surface-elevated)',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-border)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface-elevated)'}
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteNews(news._id)}
                      className={`p-2 rounded-full transition-all duration-300 ${deleteConfirmation === news._id ? 'animate-pulse' : ''}`}
                      style={{
                        background: deleteConfirmation === news._id ? 'var(--color-danger)' : 'var(--color-surface-elevated)',
                        color: deleteConfirmation === news._id ? 'white' : 'var(--color-danger)',
                        border: '1px solid',
                        borderColor: deleteConfirmation === news._id ? 'var(--color-danger)' : 'var(--color-border)'
                      }}
                      onMouseEnter={(e) => {
                        if (deleteConfirmation !== news._id) {
                          e.currentTarget.style.background = 'var(--color-danger-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (deleteConfirmation !== news._id) {
                          e.currentTarget.style.background = 'var(--color-surface-elevated)';
                        }
                      }}
                      title={deleteConfirmation === news._id ? 'Click again to confirm' : 'Delete'}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination flex justify-center mt-8 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300"
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
    </AdminLayout>
  );
}