import React from 'react';
import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider } from 'next-themes';
import { apolloClient } from '@/lib/apollo';
import '@/styles/globals.css';

// UI components
import { Toaster } from '@/components/ui/toaster';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default MyApp;