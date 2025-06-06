'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/components/AdminLayout';
import '../styles.css';
import { 
  ExclamationCircleIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  CogIcon,
  ServerIcon,
  GlobeAltIcon,
  LockClosedIcon,
  BellIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  enableUserRegistration: boolean;
  maxUploadSize: number;
  defaultUserRole: string;
  notificationSettings: {
    enableEmails: boolean;
    adminAlerts: boolean;
  };
  cache: {
    enabled: boolean;
    duration: number;
  };
}

export default function AdminSettingsPage() {
  // Settings state
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Genera',
    siteDescription: 'AI-Generated Art Sharing Platform',
    maintenanceMode: false,
    enableUserRegistration: true,
    maxUploadSize: 5,
    defaultUserRole: 'user',
    notificationSettings: {
      enableEmails: true,
      adminAlerts: true,
    },
    cache: {
      enabled: true,
      duration: 60
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/api/admin/settings');
        
        if (response.data.success) {
          setSettings(response.data.settings);
        } else {
          setError(response.data.message || 'Failed to fetch system settings');
        }
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        if (err.response?.status === 403) {
          setError('You do not have permission to access system settings. Admin rights are required.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in to access system settings.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch system settings');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Uncomment when backend API is ready
    // fetchSettings();
    
    // For now, simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Handle settings update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      // Uncomment when backend API is ready
      /*
      const response = await axios.put('/api/admin/settings', settings);
      
      if (response.data.success) {
        setSuccessMessage('System settings updated successfully');
      } else {
        setError(response.data.message || 'Failed to update system settings');
      }
      */
      
      // For now, simulate success
      setTimeout(() => {
        setSuccessMessage('System settings updated successfully');
        setIsSubmitting(false);
      }, 800);
      
    } catch (err: any) {
      console.error('Error updating settings:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to modify system settings. Admin rights are required.');
      } else {
        setError(err.response?.data?.message || 'Failed to update system settings');
      }
      setIsSubmitting(false);
    }
  };
    // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      // Handle nested properties
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setSettings(prev => {
          // Create a safe copy of the parent object with proper typing
          const parentObj = prev[parent as keyof SystemSettings] as Record<string, any> || {};
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: checked
            }
          };
        });
      } else {
        setSettings(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } 
    // Handle number inputs
    else if (type === 'number') {
      const numberValue = parseFloat(value);
      
      // Handle nested properties
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setSettings(prev => {
          // Create a safe copy of the parent object with proper typing
          const parentObj = prev[parent as keyof SystemSettings] as Record<string, any> || {};
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: numberValue
            }
          };
        });
      } else {
        setSettings(prev => ({
          ...prev,
          [name]: numberValue
        }));
      }
    } 
    // Handle text inputs and selects
    else {
      // Handle nested properties
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setSettings(prev => {
          // Create a safe copy of the parent object with proper typing
          const parentObj = prev[parent as keyof SystemSettings] as Record<string, any> || {};
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: value
            }
          };
        });
      } else {
        setSettings(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };
  
  // Reset success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  return (
    <AdminLayout 
      title="Admin Settings" 
      description="Configure system-wide settings and parameters"
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
      
      {/* Success message */}
      {successMessage && (
        <div className="success-alert mb-6 flex items-center p-4 rounded-lg" style={{
          background: 'var(--color-success-soft)',
          border: '1px solid var(--color-success-muted)',
          color: 'var(--color-success)'
        }}>
          <CheckCircleIcon className="h-6 w-6 mr-3" style={{ color: 'var(--color-success)' }} />
          <span>{successMessage}</span>
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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Settings */}
            <div className="settings-section">
              <div className="section-header flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <CogIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>General Settings</h2>
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="siteName" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: 'var(--color-surface-variant)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="siteDescription" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: 'var(--color-surface-variant)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <div className="form-group mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableUserRegistration"
                    name="enableUserRegistration"
                    checked={settings.enableUserRegistration}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="enableUserRegistration" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Enable User Registration
                  </label>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  When disabled, new users cannot create accounts
                </p>
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="maxUploadSize" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Maximum Upload Size (MB)
                </label>
                <input
                  type="number"
                  id="maxUploadSize"
                  name="maxUploadSize"
                  value={settings.maxUploadSize}
                  onChange={handleChange}
                  min={1}
                  max={20}
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: 'var(--color-surface-variant)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </div>
            
            {/* System Settings */}
            <div className="settings-section">
              <div className="section-header flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <ServerIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>System Settings</h2>
              </div>
              
              <div className="form-group mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="maintenanceMode" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Maintenance Mode
                  </label>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  When enabled, only administrators can access the site
                </p>
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="defaultUserRole" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Default User Role
                </label>
                <select
                  id="defaultUserRole"
                  name="defaultUserRole"
                  value={settings.defaultUserRole}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: 'var(--color-surface-variant)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="user">Creator</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
              
              <div className="form-group mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cache.enabled"
                    name="cache.enabled"
                    checked={settings.cache.enabled}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="cache.enabled" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Enable Caching
                  </label>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Improves performance by caching frequently accessed data
                </p>
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="cache.duration" className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Cache Duration (minutes)
                </label>
                <input
                  type="number"
                  id="cache.duration"
                  name="cache.duration"
                  value={settings.cache.duration}
                  onChange={handleChange}
                  min={5}
                  max={1440}
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: 'var(--color-surface-variant)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="settings-section">
              <div className="section-header flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <BellIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Notification Settings</h2>
              </div>
              
              <div className="form-group mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notificationSettings.enableEmails"
                    name="notificationSettings.enableEmails"
                    checked={settings.notificationSettings.enableEmails}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="notificationSettings.enableEmails" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Enable Email Notifications
                  </label>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Send email notifications to users for important events
                </p>
              </div>
              
              <div className="form-group mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notificationSettings.adminAlerts"
                    name="notificationSettings.adminAlerts"
                    checked={settings.notificationSettings.adminAlerts}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="notificationSettings.adminAlerts" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Admin Alerts
                  </label>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Send alerts to administrators for important system events
                </p>
              </div>
            </div>
            
            {/* Security Settings */}
            <div className="settings-section">
              <div className="section-header flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <LockClosedIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Security Settings</h2>
              </div>
              
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Security settings are managed through the environment variables for enhanced protection.
                Please contact your system administrator to modify these settings.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md" style={{ backgroundColor: 'var(--color-surface-variant)' }}>
                <ul className="list-disc pl-5">
                  <li className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>JWT Token Expiry: 7 days</li>
                  <li className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>CORS Origin: http://localhost:3000</li>
                  <li className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>API Rate Limiting: Enabled</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Cache Control */}
          <div className="mt-8 pb-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <ArrowPathIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Cache Management</h3>
            </div>
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md"
              style={{
                backgroundColor: 'var(--color-surface-variant)',
                color: 'var(--color-text-secondary)'
              }}
              onClick={() => {
                setSuccessMessage('System cache cleared successfully');
              }}
            >
              Clear System Cache
            </button>
            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Use this option to clear all cached data and force fresh data loading
            </p>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-md font-medium transition-transform duration-300"
              style={{
                background: isSubmitting ? 'var(--color-primary-muted)' : 'var(--color-primary)',
                color: 'white',
                transform: isSubmitting ? 'none' : '',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = '';
                }
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
