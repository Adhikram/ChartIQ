import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import styles from './ChartAnalysis.module.css';
import ChatService from '../services/chatService';
import type { ChatMessage } from '../types/chatService';

interface ChartAnalysisProps {
  symbol: string;
  chartUrls: string[];
}

export default function ChartAnalysis({ symbol, chartUrls }: ChartAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const chatService = useRef<ChatService>(ChatService.getInstance());

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      setAnalysis('');
      
      try {
        const response = await chatService.current.sendMessage(symbol);
        
        if (response.error) {
          setError(response.error);
          return;
        }

        // The last message should be the AI's response
        const aiMessage = response.messages[response.messages.length - 1];
        if (aiMessage && !aiMessage.isUser) {
          setAnalysis(aiMessage.content);
          if (aiMessage.chartUrl) {
            setImages(prev => [...prev, aiMessage.chartUrl]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (chartUrls.length > 0) {
      fetchAnalysis();
    }

    // Cleanup
    return () => {
      chatService.current.clearMessages();
    };
  }, [chartUrls, symbol]);

  // Effect to handle scrolling when content updates
  useEffect(() => {
    if (analysisRef.current && analysis) {
      analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
    }
  }, [analysis]);

  return (
    <div className={styles.container}>
      <div className={styles.imageGallery}>
        {images.map((url, index) => (
          <div key={url} className={styles.imageWrapper}>
            <div className={styles.imageContainer}>
              <Image
                src={url}
                alt={`${symbol} ${index === 0 ? '1H' : index === 1 ? '4H' : '1D'} Chart`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={true}
                className={styles.image}
              />
            </div>
            <div className={styles.timeframe}>
              {index === 0 ? '1H' : index === 1 ? '4H' : '1D'}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.analysisContainer}>
        <h2 className={styles.title}>Technical Analysis for {symbol}</h2>
        <div className={styles.analysis} ref={analysisRef}>
          {loading && !analysis && (
            <div className={styles.loader}>
              <div className={styles.spinner}></div>
              <p>Analyzing charts...</p>
            </div>
          )}
          {error && (
            <div className={styles.error}>
              Error: {error}
            </div>
          )}
          <div className={styles.markdownContent}>
            <ReactMarkdown>{analysis || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
} 