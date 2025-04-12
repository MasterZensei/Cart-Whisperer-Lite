"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Pencil, Trash, Check } from "lucide-react"
import { EmailTemplate } from "@/lib/supabase"
import { getEmailTemplates, saveEmailTemplate } from "@/lib/db-service"
import { useAuth } from "@/hooks/useAuth2"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("templates")
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    html_content: "",
    is_default: false,
  })
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Load templates from database
  useEffect(() => {
    async function loadTemplates() {
      try {
        if (!user) return

        setLoading(true)
        const storeId = user.id || "demo-store"
        const loadedTemplates = await getEmailTemplates(storeId)
        setTemplates(loadedTemplates)
      } catch (error) {
        console.error("Error loading templates:", error)
        toast({
          title: "Error",
          description: "Failed to load email templates",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [user, toast])

  const handleSaveTemplate = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save templates",
          variant: "destructive",
        })
        return
      }

      if (!newTemplate.name || !newTemplate.subject || !newTemplate.html_content) {
        toast({
          title: "Validation Error",
          description: "Please fill in all template fields",
          variant: "destructive",
        })
        return
      }

      const storeId = user.id || "demo-store"
      const savedTemplate = await saveEmailTemplate(storeId, newTemplate)

      setTemplates([...templates, savedTemplate])
      setNewTemplate({
        name: "",
        subject: "",
        html_content: "",
        is_default: false,
      })

      toast({
        title: "Success",
        description: "Email template saved successfully",
      })
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      })
    }
  }

  const handleTemplateEditorChange = (field: string, value: string | boolean) => {
    setNewTemplate({
      ...newTemplate,
      [field]: value,
    })
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Email Templates</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">My Templates</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
          <TabsTrigger value="defaults">Default Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center p-10 border rounded-md">
              <p className="text-muted-foreground mb-4">You haven't created any templates yet.</p>
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {template.name}
                      {template.is_default && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                          <Check className="h-3 w-3 mr-1" /> Default
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>Subject: {template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-2 h-32 overflow-auto text-xs">
                      <pre className="whitespace-pre-wrap font-mono">{template.html_content.substring(0, 200)}...</pre>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Email Template</CardTitle>
              <CardDescription>
                Design your own custom email template with HTML. Use placeholders like {"{customerName}"}, {"{items}"},
                {"{totalPrice}"}, {"{recoveryUrl}"}, and {"{storeName}"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="E.g., Summer Sale Template"
                    value={newTemplate.name}
                    onChange={(e) => handleTemplateEditorChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-subject">Email Subject</Label>
                  <Input
                    id="template-subject"
                    placeholder="E.g., Don't miss out on your cart!"
                    value={newTemplate.subject}
                    onChange={(e) => handleTemplateEditorChange("subject", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">HTML Content</Label>
                <Textarea
                  id="template-content"
                  className="font-mono h-96"
                  placeholder="<html><body><h1>Hello {customerName}!</h1>...</body></html>"
                  value={newTemplate.html_content}
                  onChange={(e) => handleTemplateEditorChange("html_content", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTemplate}>Save Template</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="defaults">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Standard Template</CardTitle>
                <CardDescription>Basic abandoned cart recovery email</CardDescription>
              </CardHeader>
              <CardContent>
                <img src="/placeholder.svg?height=100&width=200" alt="Standard template preview" className="rounded-md border" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/preview?template=standard")}>
                  Preview
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Template</CardTitle>
                <CardDescription>Offer a discount to incentivize purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <img src="/placeholder.svg?height=100&width=200" alt="Discount template preview" className="rounded-md border" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/preview?template=discount")}>
                  Preview
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FOMO Template</CardTitle>
                <CardDescription>Create urgency with fear of missing out</CardDescription>
              </CardHeader>
              <CardContent>
                <img src="/placeholder.svg?height=100&width=200" alt="FOMO template preview" className="rounded-md border" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/preview?template=fomo")}>
                  Preview
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 