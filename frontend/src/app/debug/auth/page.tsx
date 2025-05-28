'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export default function TokenDebugPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [tokenCheckResult, setTokenCheckResult] = useState<any>(null);
  const [adminCheckResult, setAdminCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${backendUrl}/api/debug/token-check`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTokenCheckResult(response.data);
    } catch (err: any) {
      console.error('Error checking token:', err);
      setError(err.response?.data?.message || 'Error checking token');
      setTokenCheckResult(err.response?.data || { error: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${backendUrl}/api/debug/admin-check`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdminCheckResult(response.data);
    } catch (err: any) {
      console.error('Error checking admin status:', err);
      setError(err.response?.data?.message || 'Error checking admin status');
      setAdminCheckResult(err.response?.data || { error: 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-background)' }}>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>Auth Debug Tool</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Authenticated:</p>
              <p>{isAuthenticated ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="font-medium">User Role:</p>
              <p>{user?.role || 'No user'}</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium">Token:</p>
              <textarea 
                className="w-full p-2 border rounded" 
                rows={3} 
                readOnly 
                value={token || 'No token'} 
              ></textarea>
            </div>
            <div className="col-span-2">
              <p className="font-medium">User Data:</p>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={checkToken}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            Test Token on Backend
          </button>
          <button
            onClick={checkAdminStatus}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            disabled={loading}
          >
            Check Admin Access
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="text-center p-4">Loading...</div>
        )}
        
        {tokenCheckResult && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Token Check Result</h2>
            <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(tokenCheckResult, null, 2)}
            </pre>
          </div>
        )}
        
        {adminCheckResult && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Admin Check Result</h2>
            <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(adminCheckResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
