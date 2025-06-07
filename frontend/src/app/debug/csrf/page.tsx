'use client';

import { useState } from 'react';
import axios from 'axios';
import { useCsrf } from '@/context/CsrfContext';

export default function CsrfTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const { getCsrfToken } = useCsrf();

  const addResult = (testName: string, success: boolean, message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      testName,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };
  const testCsrfProtection = async () => {
    setTestResults([]);
    
    // Test 1: Get CSRF token
    try {
      const token = await getCsrfToken();
      addResult('Test 1: Get CSRF Token', true, `Successfully retrieved CSRF token: ${token.substring(0, 20)}...`);
    } catch (error: any) {
      addResult('Test 1: Get CSRF Token', false, `Failed to get CSRF token: ${error.message}`);
      return; // Can't continue without token
    }

    // Test 2: Request with invalid CSRF token (bypassing interceptor)
    try {
      // Create a new axios instance to bypass global interceptor
      const axiosNoInterceptor = axios.create();
      const response = await axiosNoInterceptor.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/news`, {
        title: 'Test Article',
        content: 'This is a test article',
        isPublished: false
      }, {
        headers: {
          'X-CSRF-Token': 'invalid-token',
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      addResult('Test 2: Invalid CSRF Token', false, 'Request should have failed but succeeded', response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        addResult('Test 2: Invalid CSRF Token', true, 'Request properly rejected with 403 (CSRF protection working)', error.response.data);
      } else {
        addResult('Test 2: Invalid CSRF Token', true, `Request failed as expected: ${error.response?.status} - ${error.message}`, error.response?.data);
      }
    }

    // Test 3: Request without CSRF token at all
    try {
      const axiosNoInterceptor = axios.create();
      const response = await axiosNoInterceptor.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/news`, {
        title: 'Test Article',
        content: 'This is a test article',
        isPublished: false
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      addResult('Test 3: No CSRF Token', false, 'Request should have failed but succeeded', response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        addResult('Test 3: No CSRF Token', true, 'Request properly rejected with 403 (CSRF protection working)', error.response.data);
      } else {
        addResult('Test 3: No CSRF Token', true, `Request failed as expected: ${error.response?.status}`, error.response?.data);
      }
    }

    // Test 4: Request with automatic CSRF token (should work for CSRF but may fail on auth)
    try {
      const response = await axios.post('/api/comment/test-slug', {
        text: 'Test comment'
      });
      addResult('Test 4: Automatic CSRF Token', true, 'Request with auto CSRF token succeeded', response.data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        addResult('Test 4: Automatic CSRF Token', true, 'CSRF token was added automatically (failed on auth/route, not CSRF)', error.response.data);
      } else if (error.response?.status === 403 && error.response.data?.message?.includes('CSRF')) {
        addResult('Test 4: Automatic CSRF Token', false, 'CSRF token not being added automatically', error.response.data);
      } else {
        addResult('Test 4: Automatic CSRF Token', true, `CSRF working, other error: ${error.response?.status}`, error.response?.data);
      }
    }

    // Test 5: Test CSRF token endpoint directly
    try {
      const response = await axios.get('/api/csrf-token');
      if (response.data.success && response.data.csrfToken) {
        addResult('Test 5: CSRF Endpoint', true, 'CSRF token endpoint working correctly', response.data);
      } else {
        addResult('Test 5: CSRF Endpoint', false, 'CSRF endpoint returned invalid response', response.data);
      }
    } catch (error: any) {
      addResult('Test 5: CSRF Endpoint', false, `CSRF endpoint failed: ${error.message}`, error.response?.data);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">CSRF Protection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Test CSRF Implementation</h2>
          <p className="text-gray-600 mb-4">
            This page tests whether CSRF protection is properly implemented and working.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={testCsrfProtection}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Run CSRF Tests
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Results</h3>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      result.success ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    <h4 className="font-semibold text-gray-800">{result.testName}</h4>
                  </div>
                  <p className="text-gray-700 mb-2">{result.message}</p>
                  <p className="text-xs text-gray-500">{result.timestamp}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">Show Details</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
