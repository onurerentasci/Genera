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
  UserCircleIcon,
  ShieldExclamationIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  profileImage?: string;
  bio?: string;
  createdAt: string;
  artsCount: number;
  likesCount: number;
}

export default function AdminUsersPage() {
  // Users list state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Action states
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [roleChangeConfirmation, setRoleChangeConfirmation] = useState<{id: string, role: 'admin' | 'user'} | null>(null);
  
  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/admin/users?page=${currentPage}&limit=10`);
        
        if (response.data.success) {
          setUsersList(response.data.data);
          setTotalPages(response.data.pagination.pages);
        } else {
          setError(response.data.message || 'Failed to fetch users');
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        // Handle errors
        if (err.response?.status === 403) {
          setError('You do not have permission to access user management. Admin rights are required.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in to access this content.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch users');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentPage]);
  
  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      setError(null);
      
      const response = await axios.delete(`/api/admin/users/${userId}`);
      
      if (response.data.success) {
        // Remove the deleted user from the list
        setUsersList(prev => prev.filter(user => user._id !== userId));
        setDeleteConfirmation(null);
      } else {
        setError(response.data.message || 'Failed to delete user');
      }
    } catch (err: any) {
      console.error(`Error deleting user with ID ${userId}:`, err);
      if (err.response?.status === 403) {
        setError('You do not have permission to delete users. Admin rights are required.');
      } else {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };
  
  // Handle user role change
  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      setError(null);
      
      const response = await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      
      if (response.data.success) {
        // Update user role in the list
        setUsersList(prev => 
          prev.map(user => 
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        setRoleChangeConfirmation(null);
      } else {
        setError(response.data.message || 'Failed to update user role');
      }
    } catch (err: any) {
      console.error(`Error updating role for user with ID ${userId}:`, err);
      if (err.response?.status === 403) {
        setError('You do not have permission to modify user roles. Admin rights are required.');
      } else {
        setError(err.response?.data?.message || 'Failed to update user role');
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
      title="Users Management" 
      description="Manage user accounts, roles and permissions"
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
          {/* Users list table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>User</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Email</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500 }}>Role</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Stats</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}>Joined</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length > 0 ? (
                  usersList.map((user) => (
                    <tr key={user._id} className="hover:opacity-90" style={{
                      background: 'var(--color-surface-variant)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <td style={{ padding: '12px 16px', borderRadius: '8px 0 0 8px' }}>
                        <div className="flex items-center gap-3">
                          <div className="user-avatar" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundImage: user.profileImage ? `url(${user.profileImage})` : 'none',
                            backgroundColor: !user.profileImage ? 'var(--color-primary-muted)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {!user.profileImage && (
                              <UserCircleIcon className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{user.username}</div>
                            {user.bio && (
                              <div className="text-sm truncate max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                {user.bio.slice(0, 30)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {user.email}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className="role-badge px-3 py-1 rounded-full text-xs font-medium" 
                          style={{
                            background: user.role === 'admin' ? 'var(--color-primary-soft)' : 'var(--color-surface-glass)',
                            color: user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                          }}>
                          {user.role === 'admin' ? (
                            <span className="flex items-center gap-1">
                              <ShieldCheckIcon className="h-3 w-3" />
                              Admin
                            </span>
                          ) : (
                            'Creator'
                          )}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1" title="Arts">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>🎨 {user.artsCount || 0}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Likes received">
                            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>❤️ {user.likesCount || 0}</span>
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                        <div className="flex justify-center gap-2">
                          <Link href={`/user/${user.username}`} target="_blank" className="action-button" title="View profile">
                            <UserCircleIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                          </Link>
                          <button
                            className="action-button"
                            title={user.role === 'admin' ? "Remove admin rights" : "Make admin"}
                            onClick={() => setRoleChangeConfirmation({
                              id: user._id, 
                              role: user.role === 'admin' ? 'user' : 'admin'
                            })}
                          >
                            <ShieldCheckIcon className="h-5 w-5" style={{ 
                              color: user.role === 'admin' ? 'var(--color-warning)' : 'var(--color-success)' 
                            }} />
                          </button>
                          <button
                            className="action-button"
                            title="Delete user"
                            onClick={() => setDeleteConfirmation(user._id)}
                            disabled={user.role === 'admin'}
                          >
                            <TrashIcon className="h-5 w-5" style={{ 
                              color: user.role === 'admin' ? 'var(--color-text-disabled)' : 'var(--color-danger)' 
                            }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No users found.
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
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Confirm User Deletion</h3>
            <p className="mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <p className="mb-6 font-medium" style={{ color: 'var(--color-danger)' }}>
              Warning: All user content including arts and comments will also be deleted.
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
                onClick={() => deleteConfirmation && handleDeleteUser(deleteConfirmation)}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  background: 'var(--color-danger)',
                  color: 'white'
                }}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role change confirmation modal */}
      {roleChangeConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal p-6 rounded-lg max-w-md w-full" style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {roleChangeConfirmation.role === 'admin' ? 'Grant Admin Rights' : 'Remove Admin Rights'}
            </h3>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {roleChangeConfirmation.role === 'admin' 
                ? 'Are you sure you want to grant admin privileges to this user? They will have full access to the admin panel.'
                : 'Are you sure you want to remove admin privileges from this user? They will no longer have access to the admin panel.'
              }
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setRoleChangeConfirmation(null)}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  background: 'var(--color-surface-variant)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => roleChangeConfirmation && handleRoleChange(roleChangeConfirmation.id, roleChangeConfirmation.role)}
                className="px-4 py-2 rounded-md text-sm font-medium"
                style={{
                  background: roleChangeConfirmation.role === 'admin' ? 'var(--color-success)' : 'var(--color-warning)',
                  color: 'white'
                }}
              >
                {roleChangeConfirmation.role === 'admin' ? 'Make Admin' : 'Remove Admin Rights'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
