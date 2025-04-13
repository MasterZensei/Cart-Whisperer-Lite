"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth2"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, EyeIcon, EyeOffIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, loading, error, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const emailInputRef = useRef<HTMLInputElement>(null)
  
  // Focus email input on initial load
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [])
  
  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const success = await signIn(email, password)
      
      if (success) {
        toast({
          title: "Logged in successfully",
          description: "Redirecting you to the dashboard...",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error("Error during login:", err)
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }
  
  // Handle keyboard navigation for the show/hide password button
  const handleTogglePasswordVisibility = (e: React.KeyboardEvent | React.MouseEvent) => {
    // If it's a keyboard event, only proceed if it's Enter or Space
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    
    // If it's a keyboard event with Space, prevent page scrolling
    if ('key' in e && e.key === ' ') {
      e.preventDefault();
    }
    
    setShowPassword(!showPassword);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Enter your email and password to access your dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" id="email-label">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-labelledby="email-label"
                aria-required="true"
                ref={emailInputRef}
                required
                className="transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" id="password-label">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 rounded-sm"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-labelledby="password-label"
                  aria-required="true"
                  required
                  className="pr-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={handleTogglePasswordVisibility}
                  onKeyDown={handleTogglePasswordVisibility}
                  tabIndex={0}
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full transition-all bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
              disabled={loading || isSubmitting}
              aria-busy={isSubmitting}
              aria-live="polite"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
            
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 rounded-sm"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 