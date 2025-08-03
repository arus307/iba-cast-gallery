"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getFavoritePostIdsAction } from '../actions';
import { useSession } from 'next-auth/react';

interface FavoritePostIdsContextType {
  favoritePostIds: string[];
  addFavorite: (postId: string) => void;
  removeFavorite: (postId: string) => void;
  isLoading: boolean;
}

const FavoritePostIdsContext = createContext<FavoritePostIdsContextType | undefined>(undefined);

export const useFavoritePostIds = () => {
  const context = useContext(FavoritePostIdsContext);
  if (!context) {
    throw new Error('useFavoritePostIds must be used within a FavoritePostIdsProvider');
  }
  return context;
};

export const FavoritePostIdsProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const [favoritePostIds, setFavoritePostIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoading(true);
      getFavoritePostIdsAction().then(ids => {
        if (ids instanceof Error) {
          console.error(ids.message);
          setFavoritePostIds([]);
        } else {
          setFavoritePostIds(ids);
        }
        setIsLoading(false);
      });
    } else if (status === 'unauthenticated') {
      setFavoritePostIds([]);
      setIsLoading(false);
    }
  }, [status]);

  const addFavorite = (postId: string) => {
    setFavoritePostIds(prev => [...prev, postId]);
  };

  const removeFavorite = (postId: string) => {
    setFavoritePostIds(prev => prev.filter(id => id !== postId));
  };

  return (
    <FavoritePostIdsContext.Provider value={{ favoritePostIds, addFavorite, removeFavorite, isLoading }}>
      {children}
    </FavoritePostIdsContext.Provider>
  );
};
