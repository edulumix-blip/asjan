'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        {children}
        <Toaster 
          position="top-right" 
          reverseOrder={false} 
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 4500,
            },
          }}
        />
      </AuthProvider>
    </NextThemesProvider>
  );
}
