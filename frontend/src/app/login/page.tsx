"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AtSymbolIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginSuccess = await login(email, password);
      if (loginSuccess) {
        router.push("/");
      }
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-background">
        <div className="floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
          <div className="orb orb-5"></div>
        </div>
        <div className="gradient-mesh"></div>
      </div>

      {/* Main Content */}
      <div className="login-content">
        {/* Logo/Brand Section */}
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="url(#gradient1)" />
                <path d="M20 12L28 16V24L20 28L12 24V16L20 12Z" fill="url(#gradient2)" opacity="0.8" />
                <defs>
                  <linearGradient id="gradient1" x1="4" y1="4" x2="36" y2="36">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="12" y1="12" x2="28" y2="28">
                    <stop stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="brand-name">Genera</h1>
          </div>
          <p className="brand-tagline">Create. Share. Inspire.</p>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          <div className="form-header">
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-subtitle">Sign in to continue your creative journey</p>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className={`input-wrapper ${isEmailFocused ? 'focused' : ''} ${email ? 'filled' : ''}`}>
                <AtSymbolIcon className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className="form-input"
                  required
                />
                <div className="input-highlight"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className={`input-wrapper ${isPasswordFocused ? 'focused' : ''} ${password ? 'filled' : ''}`}>
                <LockClosedIcon className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="form-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                <div className="input-highlight"></div>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="form-options">
              <a href="/forgot-password" className="forgot-link">
                Forgot your password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              <span className="button-content">
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="button-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              <div className="button-ripple"></div>
            </button>
          </form>

          {/* Register Link */}
          <div className="register-link">
            <span>New to Genera?</span>
            <a href="/register" className="register-cta">
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}