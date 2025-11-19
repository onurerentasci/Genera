'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="empty-state flex flex-col items-center justify-center text-center" style={{
      padding: `var(--spacing-2xl)`,
      background: 'var(--color-surface)',
      border: `2px dashed var(--color-border)`,
      borderRadius: 'var(--radius-lg)'
    }}>
      <div className="h-16 w-16 mb-4 empty-icon" style={{ color: 'var(--color-text-tertiary)' }}>
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h3>
      <p className="max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link 
            href={actionHref}
            className="font-medium transition-all duration-300 hover:transform hover:scale-105"
            style={{ 
              marginTop: 'var(--spacing-md)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: 'var(--color-text-primary)',
              padding: `var(--spacing-sm) var(--spacing-md)`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          >
            {actionLabel}
          </Link>
        ) : (
          <button 
            onClick={onAction}
            className="font-medium transition-all duration-300 hover:transform hover:scale-105"
            style={{ 
              marginTop: 'var(--spacing-md)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: 'var(--color-text-primary)',
              padding: `var(--spacing-sm) var(--spacing-md)`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
