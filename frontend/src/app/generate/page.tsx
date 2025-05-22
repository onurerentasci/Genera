"use client";

import { useState, useEffect } from 'react';
import PromptInput from '@/components/PromptInput';
import ArtCard from '@/components/ArtCard';

export default function GeneratePage() {
  const [generatedArt, setGeneratedArt] = useState<{ imageUrl: string; title: string } | null>(null);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    // Ensure prompt and generatedArt are reset on initial render to avoid hydration mismatch
    setGeneratedArt(null);
    setPrompt('');
  }, []);

  const handleGenerate = (imageUrl: string, userPrompt: string) => {
    console.log('Generated Art URL:', imageUrl);
    setGeneratedArt({ imageUrl, title: 'Generated Art' });
    setPrompt(userPrompt);
  };

  const handleSave = async () => {
    if (!generatedArt || !prompt) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/art/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: generatedArt.title,
          prompt: prompt,
          imageUrl: generatedArt.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save art');
      }

      alert('Art saved successfully!');
    } catch (error) {
      console.error('Error saving art:', error);
      alert('Failed to save art');
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Generate AI Art</h1>
      <PromptInput onGenerate={(imageUrl, userPrompt) => handleGenerate(imageUrl, userPrompt)} />
      {generatedArt && (
        <div className="flex flex-col items-center gap-4">
          <ArtCard imageUrl={generatedArt.imageUrl} title={generatedArt.title} />
          <button
            onClick={handleSave}
            disabled={!generatedArt || !prompt}
            className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Save Art
          </button>
        </div>
      )}
    </div>
  );
}