"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AtSymbolIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }
    try {
      const registerSuccess = await register(formData.username, formData.email, formData.password);
      if (registerSuccess) {
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

        {/* Register Form */}
        <div className="login-form-container">
          <div className="form-header">
            <h2 className="form-title">Join Our Community</h2>
            <p className="form-subtitle">Create an account to start your creative journey</p>
          </div>

          {(error || formError) && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span>{error || formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className={`input-wrapper ${isUsernameFocused ? 'focused' : ''} ${formData.username ? 'filled' : ''}`}>
                <UserIcon className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setIsUsernameFocused(true)}
                  onBlur={() => setIsUsernameFocused(false)}
                  className="form-input"
                  required
                />
                <div className="input-highlight"></div>
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className={`input-wrapper ${isEmailFocused ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                <AtSymbolIcon className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
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
              <div className={`input-wrapper ${isPasswordFocused ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
                <LockClosedIcon className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className={`input-wrapper ${isConfirmPasswordFocused ? 'focused' : ''} ${formData.confirmPassword ? 'filled' : ''}`}>
                <LockClosedIcon className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  className="form-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                <div className="input-highlight"></div>
              </div>
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg className="button-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
              <div className="button-ripple"></div>
            </button>
          </form>

          {/* Login Link */}
          <div className="register-link">
            <span>Already have an account?</span>
            <a href="/login" className="register-cta">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}