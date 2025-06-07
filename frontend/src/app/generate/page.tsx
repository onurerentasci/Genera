"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  SparklesIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  LightBulbIcon, 
  PencilSquareIcon,
  ExclamationCircleIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import './styles.css';

export default function GeneratePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Form states
  const [prompt, setPrompt] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  
  // Generation states
  const [generatedArt, setGeneratedArt] = useState<{ imageUrl: string; title: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'create' | 'preview'>('create');
  
  // Example prompts for inspiration
  const examplePrompts = [
    "A surreal landscape with floating islands and a purple sky",
    "A cyberpunk cityscape with neon lights and flying cars",
    "A magical forest with glowing mushrooms and fairy creatures",
    "An underwater ancient temple with mermaids and colorful fish"
  ];
  useEffect(() => {
    // Reset states on initial render
    setGeneratedArt(null);
    setPrompt('');
    setCustomTitle('');
    setSaveSuccess(false);
    setGenerationError(null);
    setSaveError(null);
    
    // Redirect if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);
  
  // Switch to preview tab after generating art
  useEffect(() => {
    if (generatedArt) {
      setActiveTab('preview');
    }
  }, [generatedArt]);

  const useExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setGenerationError('Please enter a prompt first');
      return;
    }
    
    setGenerationError(null);
    setIsGenerating(true);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/art/generate`, 
        { prompt: prompt.trim() }, 
        { withCredentials: true }
      );
      
      setGeneratedArt({ 
        imageUrl: response.data.imageUrl, 
        title: 'Generated Art' 
      });
      
      // Generate a title based on the prompt
      setCustomTitle(`Art from: ${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}`);
    } catch (error) {
      console.error('Error generating art:', error);
      setGenerationError('Failed to generate art. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };  const handleSave = async () => {
    if (!generatedArt || !prompt || !customTitle) {
      setSaveError('Please generate art and add a title before saving');
      return;
    }
    
    setSaveError(null);
    setIsSaving(true);
    
    try {
      console.log('Saving art with data:', {
        title: customTitle,
        prompt: prompt,
        imageUrl: generatedArt.imageUrl,
      });
      
      const response = await axios.post(
        '/api/art/submit',
        {
          title: customTitle,
          prompt: prompt,
          imageUrl: generatedArt.imageUrl,
        },
        { withCredentials: true } // Add credentials
      );
      
      console.log('Art saved successfully:', response.data);
      setSaveSuccess(true);
      setTimeout(() => {
        router.push('/'); // Redirect to home page after successful save
      }, 2000);
    } catch (error) {
      console.error('Error saving art:', error);
      setSaveError('Failed to save art. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewCreation = () => {
    setGeneratedArt(null);
    setCustomTitle('');
    setSaveSuccess(false);
    setGenerationError(null);
    setSaveError(null);
    setActiveTab('create');
    
    // Focus on the prompt input
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="auth-loading">
        <div className="loader-content">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }
  return (
    <>
      <Navbar />
      <div className="generate-container">
        <div className="generate-content">
          <div className="generate-header">
            <h1 className="generate-title">Create AI-Generated Art</h1>
            <p className="generate-subtitle">
              Transform your imagination into stunning visuals with the power of AI
            </p>
          </div>
          
          {/* Tab Navigation for Mobile */}
          <div className="tabs-navigation">
            <button 
              className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <PencilSquareIcon className="tab-icon" />
              Create
            </button>
            <button 
              className={`tab-button ${activeTab === 'preview' ? 'active' : ''} ${!generatedArt ? 'disabled' : ''}`}
              onClick={() => generatedArt && setActiveTab('preview')}
              disabled={!generatedArt}
            >
              <ArrowPathIcon className="tab-icon" />
              Preview
            </button>
          </div>
          
          <div className="generation-workflow">
            {/* Create Section */}
            <div className={`create-section ${activeTab === 'create' ? 'active' : ''}`}>
              <div className="prompt-container">
                <h2 className="prompt-heading">Enter your creative prompt</h2>
                <textarea
                  ref={promptInputRef}
                  className="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision in detail..."
                  rows={4}
                />
                
                {/* Example Prompts */}
                <div className="example-prompts">
                  <div className="example-header">
                    <LightBulbIcon className="example-icon" />
                    <span>Need inspiration? Try one of these:</span>
                  </div>
                  <div className="example-buttons">
                    {examplePrompts.map((examplePrompt, index) => (
                      <button 
                        key={index}
                        onClick={() => useExamplePrompt(examplePrompt)}
                        className="example-button"
                      >
                        {examplePrompt.length > 30 ? examplePrompt.substring(0, 30) + '...' : examplePrompt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="generate-button"
                >
                  {isGenerating ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Creating your masterpiece...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="button-icon" />
                      <span>Generate Artwork</span>
                    </>
                  )}
                </button>
                
                {generationError && (
                  <div className="error-message">
                    <ExclamationCircleIcon className="error-icon" />
                    {generationError}
                  </div>
                )}
                
                {generatedArt && (
                  <div className="quick-preview">
                    <div className="quick-preview-image">
                      <img src={generatedArt.imageUrl} alt="Preview" />
                    </div>
                    <button 
                      className="view-details-button"
                      onClick={() => setActiveTab('preview')}
                    >
                      <ArrowPathIcon className="button-icon" />
                      View & Save
                    </button>
                  </div>
                )}
              </div>
              
              <div className="creation-tips">
                <h3 className="tips-title">Tips for Great Results</h3>
                <ul className="tips-list">
                  <li>Be specific with details like colors, lighting, and style</li>
                  <li>Use descriptive adjectives (vibrant, ethereal, dramatic, etc.)</li>
                  <li>Mention artistic styles (surrealism, cyberpunk, impressionism)</li>
                  <li>Include setting details (underwater, space, forest, city)</li>
                </ul>
              </div>
            </div>
            
            {/* Preview Section */}
            <div className={`preview-section ${activeTab === 'preview' ? 'active' : ''}`}>
              {generatedArt ? (
                <div className="result-container">
                  <div className="art-preview">
                    <div className="preview-header">
                      <h3 className="preview-title">Your Creation</h3>
                      <button 
                        className="new-creation-button"
                        onClick={handleNewCreation}
                      >
                        <ArrowPathRoundedSquareIcon className="button-icon" />
                        New Creation
                      </button>
                    </div>
                    <div className="art-image">
                      <img src={generatedArt.imageUrl} alt={customTitle} />
                    </div>
                  </div>
                  
                  <div className="art-details">
                    <div className="details-header">
                      <h3 className="details-title">Artwork Details</h3>
                      <p className="details-subtitle">Customize your artwork before saving</p>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="title" className="form-label">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Prompt Used</label>
                      <div className="prompt-preview">{prompt}</div>
                    </div>
                    
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !customTitle.trim()}
                      className="save-button"
                    >
                      {isSaving ? (
                        <>
                          <div className="loading-spinner"></div>
                          Saving to Collection...
                        </>
                      ) : (
                        <>
                          <ArrowPathIcon className="button-icon" />
                          Save to My Collection
                        </>
                      )}
                    </button>
                    
                    {saveError && (
                      <div className="error-message">
                        <ExclamationCircleIcon className="error-icon" />
                        {saveError}
                      </div>
                    )}
                    
                    {saveSuccess && (
                      <div className="success-message">
                        <CheckCircleIcon className="success-icon" />
                        Artwork saved successfully! Redirecting...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-preview">
                  <div className="empty-message">
                    <SparklesIcon className="empty-icon" />
                    <h3>No Artwork Generated Yet</h3>
                    <p>Go to the Create tab and generate some amazing art!</p>
                    <button 
                      className="tab-button active"
                      onClick={() => setActiveTab('create')}
                    >
                      <PencilSquareIcon className="tab-icon" />
                      Start Creating
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}