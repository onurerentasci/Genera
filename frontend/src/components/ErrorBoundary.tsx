'use client';

import React, { Component, ReactNode } from 'react';
import { logger } from '@/services/logger.service';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary Component
 * Catches React errors and provides fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: 'var(--spacing-md)',
              color: 'var(--color-text-primary)'
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              We're sorry for the inconvenience. Please try refreshing the page or click the button below.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre style={{
                background: 'var(--color-background)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                textAlign: 'left',
                overflow: 'auto',
                marginBottom: 'var(--spacing-md)',
                color: 'var(--color-error)'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                padding: 'var(--spacing-md) var(--spacing-xl)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
