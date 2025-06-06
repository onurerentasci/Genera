'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import '../styles.css';
import { 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Art {
  _id: string;
  title: string;
  imageUrl: string;
  prompt: string;
  slug: string;
  createdBy: {
    _id: string;
    username: string;
  };
  likesCount: number;
  commentsCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminArtsPage() {
  // Arts list state
  const [artsList, setArtsList] = useState<Art[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  
  // Fetch arts list
  useEffect(() => {
    const fetchArts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/admin/arts?page=${currentPage}&limit=10`);
        
        if (response.data.success) {
          setArtsList(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError(response.data.message || 'Failed to fetch arts');
        }
      } catch (err: any) {
        console.error('Error fetching arts:', err);
        // Handle 403 Forbidden errors specifically for better UX
        if (err.response?.status === 403) {
          setError('You do not have permission to access admin content. Admin rights are required.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in to access this content.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch arts');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchArts();
  }, [currentPage]);
  
  // Handle delete art
  const handleDeleteArt = async (artId: string) => {
    try {
      setError(null);
      
      const response = await axios.delete(`/api/admin/arts/${artId}`);
      
      if (response.data.success) {
        // Remove the deleted art from the list
        setArtsList(prev => prev.filter(art => art._id !== artId));
        setDeleteConfirmation(null);
      } else {
        setError(response.data.message || 'Failed to delete art');
      }
    } catch (err: any) {
      console.error(`Error deleting art with ID ${artId}:`, err);
      if (err.response?.status === 403) {
        setError('You do not have permission to delete arts. Admin rights are required.');
      } else {
        setError(err.response?.data?.message || 'Failed to delete art');
      }
    }
  };
  
  // Pagination controls
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  return (
    <AdminLayout 
      title="Arts Management" 
      description="Manage user-generated artworks across the platform"
    >
      {/* Error message */}
      {error && (
        <div className="error-alert mb-6 flex items-center p-4 rounded-lg" style={{
          background: 'var(--color-danger-soft)',
          border: '1px solid var(--color-danger-muted)',
          color: 'var(--color-danger)'
        }}>
          {error.includes('permission') || error.includes('Admin rights') ? (
            <ShieldExclamationIcon className="h-6 w-6 mr-3" style={{ color: 'var(--color-warning)' }} />
          ) : (
            <ExclamationCircleIcon className="h-6 w-6 mr-3" style={{ color: 'var(--color-danger)' }} />
          )}
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="loading-container p-8 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 rounded mb-4" style={{ background: 'var(--color-surface-variant)' }}></div>
            <div className="h-64 w-full max-w-2xl rounded" style={{ background: 'var(--color-surface-variant)' }}></div>
          </div>
        </div>
      ) : (
        <>
          {/* Arts list table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Image</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Title</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Creator</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Stats</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Created</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artsList.length > 0 ? (
                  artsList.map((art) => (
                    <tr key={art._id} className="hover:opacity-90" style={{
                      background: 'var(--color-surface-variant)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <td style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>
                        <div className="art-thumbnail" style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundImage: `url(${art.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}></div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{art.title}</div>
                        <div className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>{art.prompt.slice(0, 50)}...</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link href={`/user/${art.createdBy.username}`} className="text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>
                          @{art.createdBy.username}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1" title="Likes">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>❤️ {art.likesCount}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Comments">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>💬 {art.commentsCount}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Views">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>👁️ {art.views}</span>
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {format(new Date(art.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0', textAlign: 'center' }}>
                        <div className="flex justify-center gap-2">
                          <Link href={`/art/${art.slug}`} target="_blank" className="action-button" title="View art">
                            <EyeIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                          </Link>
                          <button
                            className="action-button"
                            title="Delete art"
                            onClick={() => setDeleteConfirmation(art._id)}
                          >
                            <TrashIcon className="h-5 w-5" style={{ color: 'var(--color-danger)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No arts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination flex justify-center mt-6">
              <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    background: 'var(--color-surface-variant)',
                    color: currentPage === 1 ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
                    borderRight: '1px solid var(--color-border)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className="px-4 py-2 text-sm transition-colors"
                    style={{
                      background: currentPage === i + 1 ? 'var(--color-primary)' : 'var(--color-surface-variant)',
                      color: currentPage === i + 1 ? 'white' : 'var(--color-text-secondary)',
                      borderRight: i < totalPages - 1 ? '1px solid var(--color-border)' : 'none'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{
                    background: 'var(--color-surface-variant)',
                    color: currentPage === totalPages ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
                    borderLeft: '1px solid var(--color-border)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal p-6 rounded-lg max-w-md w-full" style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Confirm Deletion</h3>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  background: 'var(--color-surface-variant)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirmation && handleDeleteArt(deleteConfirmation)}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  background: 'var(--color-danger)',
                  color: 'white'
                }}
              >
                Delete Artwork
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
