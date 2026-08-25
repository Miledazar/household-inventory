import  { createContext, useContext} from 'react'

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
}