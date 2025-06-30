import { useState, useCallback } from 'react';

/**
 * Hook for managing mathematical discoveries in educational components
 * @returns {Object} - discoveries array and addDiscovery function
 */
export function useDiscoveries() {
  const [discoveries, setDiscoveries] = useState([]);

  const addDiscovery = useCallback((discovery) => {
    setDiscoveries(prev => {
      // Check if discovery already exists
      const exists = prev.some(d => d.title === discovery.title);
      if (exists) return prev;
      
      // Add new discovery with default values
      return [...prev, {
        id: discovery.id || discovery.title.toLowerCase().replace(/\s+/g, '-'),
        discovered: true,
        ...discovery
      }];
    });
  }, []);

  return { discoveries, addDiscovery };
}