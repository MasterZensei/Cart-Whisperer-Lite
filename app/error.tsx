'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The application encountered an unexpected error.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="p-3 overflow-auto text-sm bg-gray-100 dark:bg-gray-700 rounded">
            <p className="font-mono text-red-600 dark:text-red-400">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex justify-center">
          <Button 
            onClick={reset}
            className="w-full"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
} 