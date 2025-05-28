'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  Bars3Icon, 
  XMarkIcon,
  SparklesIcon,
  NewspaperIcon,
  PhotoIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Base navigation items
  const baseNavigationItems = [
    {
      name: 'Explore',
      href: '/',
      icon: PhotoIcon,
      description: 'Discover artworks'
    },
    {
      name: 'News',
      href: '/news',
      icon: NewspaperIcon,
      description: 'Latest updates'
    }
  ];
  
  // Add admin link if user is an admin
  const navigationItems = user?.role === 'admin' 
    ? [
        ...baseNavigationItems,
        {
          name: 'Admin',
          href: '/admin',
          icon: SparklesIcon,
          description: 'Manage content'
        }
      ] 
    : baseNavigationItems;

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo & Brand */}
        <Link href="/" className="brand-logo">
          <div className="logo-wrapper">
            <div className="logo-icon">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <span className="logo-text">Genera</span>
          </div>
          <div className="logo-glow"></div>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          {navigationItems.map((item) => (
            <Link key={item.name} href={item.href} className="nav-item">
              <item.icon className="nav-icon" />
              <span className="nav-text">{item.name}</span>
              <div className="nav-indicator"></div>
            </Link>
          ))}
        </div>

        {/* Desktop Auth Section */}
        <div className="desktop-auth">
          {isAuthenticated ? (
            <div className="user-section">
              {/* Quick Create Button */}
              <Link href="/generate" className="create-button">
                <PlusIcon className="w-4 h-4" />
                <span>Create</span>
              </Link>

              {/* User Menu */}
              <div className="user-menu-wrapper">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="user-menu-trigger"
                >
                  <div className="user-avatar">
                    <UserCircleIcon className="w-6 h-6" />
                  </div>                  <div className="user-info">
                    <span className="username">{user?.username}</span>
                    <span className="user-role">{user?.role === 'admin' ? 'Admin' : 'Creator'}</span>
                  </div>
                  <ChevronDownIcon className={`chevron ${userMenuOpen ? 'rotated' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="user-dropdown">
                    <Link href={`/user/${user?.username}`} className="dropdown-item">
                      <PhotoIcon className="w-5 h-5" />
                      <span>My Gallery</span>
                    </Link>
                    <Link href="/settings" className="dropdown-item">
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={logout} className="dropdown-item logout">
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="auth-button secondary">
                Sign In
              </Link>
              <Link href="/register" className="auth-button primary">
                Get Started
                <div className="button-shine"></div>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="hamburger-icon">
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {/* Mobile Navigation */}
          <div className="mobile-nav">
            {navigationItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mobile-nav-icon">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="mobile-nav-text">
                  <span className="nav-title">{item.name}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Auth */}
          <div className="mobile-auth">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-avatar">
                    <UserCircleIcon className="w-8 h-8" />
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-username">{user?.username}</span>
                    <span className="mobile-user-role">Creator</span>
                  </div>
                </div>
                
                <div className="mobile-user-actions">
                  <Link href={`/user/${user?.username}`} className="mobile-action-button">
                    <PhotoIcon className="w-5 h-5" />
                    My Gallery
                  </Link>
                  <button onClick={logout} className="mobile-action-button logout">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link href="/login" className="mobile-auth-button secondary">
                  Sign In
                </Link>
                <Link href="/register" className="mobile-auth-button primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}