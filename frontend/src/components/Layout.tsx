import React from 'react';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { MoonIcon, SunIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import Head from 'next/head';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
}

// Theme toggle button component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full hover:bg-primary/10"
    >
      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Todo AI - Smart Task Management</title>
        <meta name="description" content="AI-powered todo list application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={`min-h-screen bg-background ${inter.className}`}>
        <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/40">
          <div className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Todo AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto py-8 px-4 md:px-6">
          {children}
        </main>
        
        <footer className="border-t border-border/40 py-6 mt-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Todo AI - Powered by FastAPI, Next.js, and OpenAI API. Developed by Victor Wang
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;