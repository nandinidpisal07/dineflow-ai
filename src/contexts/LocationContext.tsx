import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface LocationContextType {
  location: string;
  setLocation: (loc: string) => void;
  requestGPSLocation: () => Promise<boolean>;
  isPromptOpen: boolean;
  setIsPromptOpen: (open: boolean) => void;
}

const LOCAL_LOCATION_KEY = 'dineflow_user_location';
const DEFAULT_CITY_LOCATION = 'Satara, Maharashtra';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [location, setLocationState] = useState<string>(() => {
    return user?.location || localStorage.getItem(LOCAL_LOCATION_KEY) || DEFAULT_CITY_LOCATION;
  });
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  useEffect(() => {
    if (user?.location && user.location !== location) {
      setLocationState(user.location);
    }
  }, [user?.location]);

  const setLocation = (newLoc: string) => {
    const finalLoc = newLoc.trim() || DEFAULT_CITY_LOCATION;
    setLocationState(finalLoc);
    localStorage.setItem(LOCAL_LOCATION_KEY, finalLoc);
    if (user) {
      updateProfile({ location: finalLoc }).catch(() => {});
    }
  };

  const requestGPSLocation = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const gpsLoc = `Satara GPS (${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°)`;
            setLocation(gpsLoc);
            setIsPromptOpen(false);
            resolve(true);
          },
          (error) => {
            console.warn('Geolocation permission denied or failed:', error.message);
            setLocation(DEFAULT_CITY_LOCATION);
            setIsPromptOpen(false);
            resolve(false);
          },
          { timeout: 8000 }
        );
      } else {
        setLocation(DEFAULT_CITY_LOCATION);
        setIsPromptOpen(false);
        resolve(false);
      }
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location: location || DEFAULT_CITY_LOCATION,
        setLocation,
        requestGPSLocation,
        isPromptOpen,
        setIsPromptOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
