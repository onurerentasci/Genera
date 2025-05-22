"use client";

import { useState } from 'react';
import axios from 'axios';

export default function PromptInput({ onGenerate }: { onGenerate: (imageUrl: string, prompt: string) => void }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/art/generate`, { prompt }, { withCredentials: true });
      onGenerate(response.data.imageUrl, prompt);
    } catch (error) {
      console.error('Error generating art:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="border rounded-lg p-2 w-full max-w-md"
      />
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Art'}
      </button>
    </div>
  );
}
