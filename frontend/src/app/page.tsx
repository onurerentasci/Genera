// page.tsx
'use client';

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import ArtCard from "@/components/ArtCard";
import axios from "axios";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Art {
  _id: string;
  imageUrl: string;
  title: string;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [arts, setArts] = useState<Art[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchArts = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/art/timeline`,
            {
              params: { page, limit: 10 },
            }
          );
          setArts((prev) => [...prev, ...response.data.data]);
          setHasMore(
            response.data.pagination.page *
              response.data.pagination.limit <
              response.data.pagination.total
          );
        } catch (error) {
          console.error("Error fetching timeline:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchArts();
    }
  }, [page, isAuthenticated]);

  const loadMore = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <div className="landing-container">
        <div className="landing-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        
        <div className="landing-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">Create</span> & 
              <span className="gradient-text"> Share</span>
              <br />
              AI-Generated Art
            </h1>
            <p className="hero-description">
              Transform your imagination into stunning visuals with AI. 
              Join our creative community and discover endless possibilities.
            </p>
          </div>
          
          <div className="hero-actions">
            <button
              className="cta-button primary-cta"
              onClick={() => router.push('/login')}
            >
              <span>Get Started</span>
              <svg className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="cta-button secondary-cta">
              <span>Explore Gallery</span>
            </button>
          </div>
          
          <div className="features-preview">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>AI-Powered Creation</h3>
              <p>Generate unique artwork from text prompts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Global Community</h3>
              <p>Share and discover amazing creations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>Create stunning visuals in seconds</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        <div className="content-header">
          <h2 className="section-title">Your Creative Timeline</h2>
          <p className="section-subtitle">Discover the latest AI-generated masterpieces</p>
        </div>
        
        <div className="gallery-grid">
          {isLoading && page === 1 ? (
            // Initial loading state
            Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-subtitle"></div>
                </div>
              </div>
            ))
          ) : (
            arts.map((art, index) => (
              <div key={`${art._id}-${index}`} className="art-card-wrapper">
                <ArtCard imageUrl={art.imageUrl} title={art.title} />
              </div>
            ))
          )}
          
          {/* Load more loading state */}
          {isLoading && page > 1 && (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`loading-${index}`} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-subtitle"></div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {hasMore && !isLoading && (
          <div className="load-more-container">
            <button onClick={loadMore} className="load-more-button">
              <span>Load More Artworks</span>
              <div className="button-ripple"></div>
            </button>
          </div>
        )}
        
        {!hasMore && arts.length > 0 && (
          <div className="end-message">
            <p>You've reached the end of your timeline ✨</p>
          </div>
        )}
      </main>
    </div>
  );
}