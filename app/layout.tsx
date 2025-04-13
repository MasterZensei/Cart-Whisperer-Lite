import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth2'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Cart Whisperer - AI-Powered Abandoned Cart Recovery',
  description: 'Recover abandoned carts with AI-generated personalized emails',
  generator: 'v0.dev',
}

// Loading component to display during navigation
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading Cart Whisperer...</p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        {/* Simple inline loading indicator that doesn't depend on React */}
        <style dangerouslySetInnerHTML={{ __html: `
          .page-loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #f9fafb;
            z-index: 9999;
            transition: opacity 0.3s ease-out;
            gap: 1rem;
          }
          .page-loader.dark {
            background-color: #1f2937;
          }
          .page-loader .spinner {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            border: 0.25rem solid rgba(59, 130, 246, 0.2);
            border-top-color: rgba(59, 130, 246, 1);
            animation: spin 1s infinite linear;
          }
          .page-loader .text {
            font-family: system-ui, -apple-system, sans-serif;
            color: #6b7280;
            font-size: 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .page-loader.fade-out {
            opacity: 0;
            pointer-events: none;
          }
        `}} />
        <script dangerouslySetInnerHTML={{ __html: `
          // Create loading overlay
          function createLoader() {
            const loader = document.createElement('div');
            loader.className = 'page-loader';
            
            // Check for dark mode preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              loader.classList.add('dark');
            }
            
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            
            const text = document.createElement('div');
            text.className = 'text';
            text.textContent = 'Loading Cart Whisperer...';
            
            loader.appendChild(spinner);
            loader.appendChild(text);
            document.body.appendChild(loader);
            
            return loader;
          }
          
          // Initialize loader reference
          let loader;
          let isNavigating = false;
          
          // Handle page load
          window.addEventListener('load', () => {
            const existingLoader = document.querySelector('.page-loader');
            
            if (existingLoader) {
              loader = existingLoader;
              fadeOutLoader();
            }
          });
          
          // Function to fade out and remove loader
          function fadeOutLoader() {
            if (loader && loader.parentNode) {
              loader.classList.add('fade-out');
              setTimeout(() => {
                if (loader && loader.parentNode) {
                  loader.parentNode.removeChild(loader);
                  loader = null;
                }
              }, 300);
            }
          }
          
          // Handle navigation events
          document.addEventListener('before-reactnavigation', () => {
            if (!isNavigating && !document.querySelector('.page-loader')) {
              isNavigating = true;
              loader = createLoader();
            }
          });
          
          // Add event listener for Next.js router events
          window.addEventListener('next-route-changed', fadeOutLoader);
          document.addEventListener('nextjs:router:done', () => {
            isNavigating = false;
            fadeOutLoader();
          });
          
          // Backup to clear loader if navigation completes but events aren't fired
          document.addEventListener('DOMContentLoaded', () => {
            setTimeout(fadeOutLoader, 1000);
          });
          
          // Create initial loader for first page load
          if (document.readyState === 'loading') {
            loader = createLoader();
          }
        `}} />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
