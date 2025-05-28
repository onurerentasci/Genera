'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface HeadProps {
  params: { id: string };
}

interface News {
  _id: string;
  title: string;
  content: string;
}

export default function Head({ params }: HeadProps) {
  const { id } = params;
  const [news, setNews] = useState<News | null>(null);
  
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const response = await axios.get(`/api/news/${id}`);
        if (response.data.success) {
          setNews(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching news for meta tags:", error);
      }
    };
    
    fetchNewsData();
  }, [id]);
  
  // Create a short description from content
  const getDescription = (content: string) => {
    // Remove HTML and limit to 160 characters for meta description
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.substring(0, 157) + '...';
  };

  return (
    <>
      <title>{news ? `${news.title} - Genera News` : 'News Article - Genera'}</title>
      <meta name="description" content={news ? getDescription(news.content) : 'Read the latest news and announcements from Genera'} />
      {/* Open Graph tags for better social sharing */}
      <meta property="og:title" content={news ? news.title : 'News Article - Genera'} />
      <meta property="og:description" content={news ? getDescription(news.content) : 'Read the latest news and announcements from Genera'} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/news/${id}`} />
    </>
  );
}
