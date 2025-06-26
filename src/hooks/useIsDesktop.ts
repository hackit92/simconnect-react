import { useState, useEffect } from 'react';

export const useIsDesktop = (breakpoint: number = 768): boolean => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
    
    // Set initial value
    setIsDesktop(mediaQuery.matches);
    
    // Create event listener
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [breakpoint]);

  return isDesktop;
};