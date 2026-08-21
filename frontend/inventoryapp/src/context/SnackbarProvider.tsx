import { useState, type ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { SnackbarContext } from './SnackBarContext';

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setSeverity('success');
    setOpen(true);
  };

  const showError = (msg: string) => {
    setMessage(msg);
    setSeverity('error');
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={severity} onClose={() => setOpen(false)}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}