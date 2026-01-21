import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export type ChartType = 'bar' | 'pie' | 'radial';

interface ChartPreferences {
  defaultChartType: ChartType;
}

const DEFAULT_PREFERENCES: ChartPreferences = {
  defaultChartType: 'radial',
};

export function useChartPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ChartPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        const stored = localStorage.getItem(`chart_prefs_${user.id}`);
        if (stored) {
          setPreferences(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading chart preferences:', error);
      }
    }
    setIsLoading(false);
  }, [user?.id]);

  const updatePreferences = useCallback((updates: Partial<ChartPreferences>) => {
    if (!user?.id) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    try {
      localStorage.setItem(`chart_prefs_${user.id}`, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Error saving chart preferences:', error);
    }
  }, [user?.id, preferences]);

  const setChartType = useCallback((chartType: ChartType) => {
    updatePreferences({ defaultChartType: chartType });
  }, [updatePreferences]);

  return {
    preferences,
    chartType: preferences.defaultChartType,
    setChartType,
    isLoading,
  };
}

export default useChartPreferences;
