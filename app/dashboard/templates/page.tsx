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
import { Loader2, Plus, Pencil, Trash, Check, Copy, ArrowLeft, Sparkles, Brain, MessageSquare, Eye } from "lucide-react"
import { EmailTemplate } from "@/lib/supabase"
import { getEmailTemplates, saveEmailTemplate } from "@/lib/db-service"
import { useAuth } from "@/hooks/useAuth2"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Sample template categories for organization
const TEMPLATE_CATEGORIES = [
  { id: "promotional", name: "Promotional" },
  { id: "reminder", name: "Reminder" },
  { id: "personalized", name: "Personalized" },
  { id: "seasonal", name: "Seasonal" },
  { id: "product-specific", name: "Product-Specific" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("templates")
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    html_content: "",
    is_default: false,
    category: "promotional"
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
        category: "promotional"
      })
      setActiveTab("templates")

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

  const handleGenerateAITemplate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe what kind of template you need",
        variant: "destructive",
      })
      return
    }

    setAiGenerating(true)
    
    try {
      // Simulate AI generation for now
      // In a real implementation, this would call your AI service
      setTimeout(() => {
        const generatedTemplate = {
          name: "AI Generated Template",
          subject: `Special offer: Complete your purchase!`,
          html_content: `<!DOCTYPE html>
<html>
<head>
  <title>Complete Your Purchase</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { padding: 20px 0; }
    .cta-button { display: inline-block; padding: 12px 24px; background-color: #4A90E2; color: white; text-decoration: none; border-radius: 4px; }
    .footer { text-align: center; font-size: 12px; color: #777; padding: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Don't Miss Out!</h1>
    </div>
    <div class="content">
      <p>Hello {{customerName}},</p>
      <p>We noticed you left some amazing items in your cart!</p>
      <p>Your items are still waiting for you:</p>
      <ul>
        {{items}}
      </ul>
      <p>Total: ${{totalPrice}}</p>
      <p>To make it even better, we're offering a <strong>10% discount</strong> if you complete your purchase within the next 24 hours!</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{recoveryUrl}}" class="cta-button">Complete Your Purchase Now</a>
      </p>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Best regards,<br>The {{storeName}} Team</p>
    </div>
    <div class="footer">
      <p>© 2023 {{storeName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
          category: "promotional",
          is_default: false,
        };
        
        setNewTemplate(generatedTemplate as any);
        setActiveTab("create");
        
        toast({
          title: "Template Generated",
          description: "AI has created a template based on your description",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate the template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiGenerating(false);
    }
  };
  
  // Filter templates based on category and search term
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = categoryFilter === "all" || (template as any).category === categoryFilter;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push("/dashboard")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Email Templates</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">My Templates</TabsTrigger>
          <TabsTrigger value="ai-assist">AI Assistant</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-1 gap-4">
              <div className="w-full md:w-64">
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEMPLATE_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center p-10 border rounded-md">
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== "all" 
                  ? "No templates match your search criteria."
                  : "You haven't created any templates yet."}
              </p>
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group relative">
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
                    <div className="mt-2">
                      <span className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        {(template as any)?.category || "General"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{template.name}</DialogTitle>
                          <DialogDescription>Subject: {template.subject}</DialogDescription>
                        </DialogHeader>
                        <div className="border rounded p-4 mt-4 bg-white">
                          <div dangerouslySetInnerHTML={{ __html: template.html_content }} />
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setNewTemplate({
                            ...template,
                            name: `${template.name} (Copy)`,
                            category: (template as any)?.category || "promotional"
                          } as any);
                          setActiveTab("create");
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button variant="default" size="sm">
                        <span>Use</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="ai-assist">
          <Card>
            <CardHeader>
              <CardTitle>AI Template Assistant</CardTitle>
              <CardDescription>
                Let AI help you create the perfect recovery email template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">How to use the AI assistant</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Describe what kind of email template you need, and the AI will generate it for you. Be specific about:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 mb-3">
                      <li>The purpose of the email (recovery, upsell, etc.)</li>
                      <li>The tone you want to use (friendly, professional, urgent)</li>
                      <li>Any specific offers or incentives to include</li>
                      <li>Target audience or product category</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">Example: "Create a friendly reminder email for customers who abandoned luxury skincare products, offering a 15% discount and free shipping."</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <Textarea
                  placeholder="Describe what kind of template you need..."
                  className="min-h-[120px]"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <Button 
                  className="w-full md:w-auto md:self-end"
                  onClick={handleGenerateAITemplate}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Template
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Template Ideas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setAiPrompt("Create a friendly reminder email for abandoned carts that offers free shipping on the order if completed within 24 hours")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Free Shipping Reminder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Friendly reminder with free shipping incentive</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setAiPrompt("Generate an email for luxury product customers with a 10% discount emphasizing the exclusivity and premium quality")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Luxury Product Recovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Elegant reminder for high-end products</p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setAiPrompt("Create an urgent limited-time offer email for abandoned carts with 20% off if they purchase within 12 hours")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Flash Sale Reminder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Urgent notification with time-limited discount</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Email Template</CardTitle>
              <CardDescription>
                Design your own custom email template with HTML. Use placeholders like {"{{customerName}}"}, {"{{items}}"},
                {"{{totalPrice}}"}, {"{{recoveryUrl}}"}, and {"{{storeName}}"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="template-category">Category</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value) => handleTemplateEditorChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              
              <div className="flex flex-wrap gap-2 text-xs mb-2">
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {"{{customerName}}"}
                </div>
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {"{{items}}"}
                </div>
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {"{{totalPrice}}"}
                </div>
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {"{{recoveryUrl}}"}
                </div>
                <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {"{{storeName}}"}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-content">HTML Content</Label>
                <Textarea
                  id="template-content"
                  placeholder="Enter your HTML email template here..."
                  className="font-mono h-96"
                  value={newTemplate.html_content}
                  onChange={(e) => handleTemplateEditorChange("html_content", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Preview Template</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>{newTemplate.name || "Template Preview"}</DialogTitle>
                    <DialogDescription>Subject: {newTemplate.subject}</DialogDescription>
                  </DialogHeader>
                  <div className="border rounded p-4 mt-4 bg-white">
                    <div dangerouslySetInnerHTML={{ __html: newTemplate.html_content }} />
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleSaveTemplate}>Save Template</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 