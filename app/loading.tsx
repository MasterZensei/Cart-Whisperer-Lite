export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background opacity-0 animate-in fade-in duration-300">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading your content...</p>
      </div>
    </div>
  )
} 