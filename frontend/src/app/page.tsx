// page.tsx
'use client';

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import ArtCard from "@/components/ArtCard";
import axios from "axios";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import LiveCounter from '@/components/LiveCounter';
import './fullPageLoader.css';

interface Art {
  _id: string;
  imageUrl: string;
  title: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  likes: string[];
}

export default function Home() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [arts, setArts] = useState<Art[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingArts, setIsLoadingArts] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchArts = async () => {
        setIsLoadingArts(true);        try {
          const response = await axios.get(
            `/api/art/timeline`,
            {
              params: { page, limit: 10 },
            }
          );
          
          // Sayfa 1'se, sanat eserlerini tamamen değiştir, değilse mevcut listeye ekle
          if (page === 1) {
            setArts(response.data.data);
          } else {
            setArts((prev) => [...prev, ...response.data.data]);
          }
          
          setHasMore(
            response.data.pagination.page *
              response.data.pagination.limit <
              response.data.pagination.total
          );
        } catch (error) {
          console.error("Error fetching timeline:", error);
        } finally {
          setIsLoadingArts(false);
        }
      };

      fetchArts();
    }
  }, [page, isAuthenticated]);

  const loadMore = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  // Show loading spinner while authentication state is being determined
  if (isAuthLoading) {
    return (
      <div className="full-page-loader">
        <div className="loader-content">
          <div className="spinner"></div>
          <p>Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Only render landing page after we've confirmed user is not authenticated
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
          {isLoadingArts && page === 1 ? (
            // Initial loading state
            Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-subtitle"></div>
                </div>
              </div>
            ))          ) : (
            arts.map((art, index) => (
              <div key={`${art._id}-${index}`} className="art-card-wrapper">                <ArtCard 
                  id={art._id}
                  imageUrl={art.imageUrl} 
                  title={art.title}
                  createdBy={{ 
                    id: art.createdBy._id, 
                    username: art.createdBy.username 
                  }}
                  createdAt={art.createdAt || new Date().toISOString()}                  likesCount={art.likesCount || 0}
                  commentsCount={art.commentsCount || 0}
                  views={art.views || 0}
                  liked={user ? art.likes?.includes(user.id) : false}
                  onLike={(id, liked) => {
                    if (!user) return;
                    
                    // Update local state when a like/unlike happens
                    setArts(arts.map(a => 
                      a._id === id 
                        ? { 
                            ...a, 
                            likesCount: liked ? a.likesCount + 1 : a.likesCount - 1,
                            likes: liked 
                              ? [...(a.likes || []), user.id] 
                              : (a.likes || []).filter(uid => uid !== user.id)
                          } 
                        : a
                    ));
                  }}
                />
              </div>
            ))
          )}
          
          {/* Load more loading state */}
          {isLoadingArts && page > 1 && (
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
        
        {hasMore && !isLoadingArts && (
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
          </div>        )}
      </main>
      
      {/* Live Counter - sadece authenticated kullanıcılar için */}
      {isAuthenticated && <LiveCounter position="bottom-right" />}
    </div>
  );
}