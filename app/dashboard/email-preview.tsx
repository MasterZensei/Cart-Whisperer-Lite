"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import type { MockCart } from "@/lib/mock-data"
import { toast } from "@/hooks/use-toast"

interface EmailPreviewProps {
  cart: MockCart | null
  onClose: () => void
}

export function EmailPreview({ cart, onClose }: EmailPreviewProps) {
  const [emailContent, setEmailContent] = useState<string | null>(null)
  const [subject, setSubject] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("preview")

  async function generateEmail() {
    if (!cart) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: cart.customerName || "Valued Customer",
            email: cart.customerEmail,
          },
          cart: {
            id: cart.id,
            items: cart.items,
            total: cart.totalPrice,
            recoveryUrl: cart.recoveryUrl,
          },
          store: {
            name: "Your Store",
            id: "demo-store",
          },
        }),
      })

      // Check if the response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          // If it's JSON, parse it
          const errorData = await response.json()
          throw new Error(errorData.error || `Server error: ${response.status}`)
        } else {
          // If it's not JSON, get the text
          const errorText = await response.text()
          throw new Error(`Server error: ${errorText.substring(0, 100)}...`)
        }
      }

      const data = await response.json()
      setEmailContent(data.emailContent)
      setSubject(data.subject)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function sendEmail() {
    if (!cart || !emailContent) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: cart.customerName || "Valued Customer",
            email: cart.customerEmail,
          },
          cart: {
            id: cart.id,
            items: cart.items,
            total: cart.totalPrice,
            recoveryUrl: cart.recoveryUrl,
          },
          store: {
            name: "Your Store",
            id: "demo-store",
          },
          sendEmail: true,
        }),
      })

      // Check if the response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          // If it's JSON, parse it
          const errorData = await response.json()
          throw new Error(errorData.error || `Server error: ${response.status}`)
        } else {
          // If it's not JSON, get the text
          const errorText = await response.text()
          throw new Error(`Server error: ${errorText.substring(0, 100)}...`)
        }
      }

      const data = await response.json()
      setSent(true)
      toast({
        title: "Success",
        description: `Recovery email sent to ${cart.customerEmail}`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send email"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!cart} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recovery Email for {cart?.customerEmail}</DialogTitle>
          <DialogDescription>
            Preview and send AI-generated recovery emails to abandoned cart customers
          </DialogDescription>
        </DialogHeader>

        {!emailContent && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="mb-4 text-center">
              Generate an AI-powered recovery email for {cart?.customerName || cart?.customerEmail || "this customer"}
            </p>
            <Button onClick={generateEmail} disabled={loading}>
              Generate Email
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Generating email content...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => setError(null)}>
              Try Again
            </Button>
          </div>
        )}

        {emailContent && (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="border rounded-md p-4">
                <p className="font-semibold mb-2">Subject: {subject}</p>
                <div className="border-t pt-2">
                  <div dangerouslySetInnerHTML={{ __html: emailContent }} />
                </div>
              </TabsContent>

              <TabsContent value="html">
                <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">{emailContent}</pre>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              {sent ? (
                <p className="text-green-500">Email sent successfully!</p>
              ) : (
                <Button onClick={sendEmail} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    `Send Email to ${cart?.customerEmail}`
                  )}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
