import { useEffect, useLayoutEffect, useState } from 'react';

// Custom hook to safely use layout effects with SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Custom hook to handle viewport adjustments for mobile devices
 */
export const useViewport = (): void => {
  const [, setViewportHeight] = useState<number>(0);
  
  // Update viewport height variables for mobile browsers
  useIsomorphicLayoutEffect(() => {
    // Skip this effect during server-side rendering
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Function to update viewport height
    const updateViewportHeight = () => {
      // Get the window's inner height
      const vh = window.innerHeight;
      
      // Set the CSS variable for viewport height
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Update state to trigger re-render if needed
      setViewportHeight(vh);
    };
    
    // Initial update
    updateViewportHeight();
    
    // Update on resize events
    window.addEventListener('resize', updateViewportHeight);
    
    // Update on orientation change for mobile devices
    window.addEventListener('orientationchange', updateViewportHeight);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
};

// Helper to set the viewport meta tag
const setViewportMetaTag = (): void => {
  if (typeof document === 'undefined') return;
  
  let viewportMeta = document.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(viewportMeta);
  }
  viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
}; 