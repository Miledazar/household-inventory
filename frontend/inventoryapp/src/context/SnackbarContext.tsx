import { createContext, useContext } from 'react';

export interface SnackbarContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error('useSnackbar must be used within SnackbarProvider');
  return context;
}