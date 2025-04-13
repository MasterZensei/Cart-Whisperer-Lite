"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Pencil, Trash, Copy, CheckCircle, ArrowLeft, Sparkles, MessagesSquare, ArrowRight, Brain } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/useAuth2"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Interface for AI prompt template
interface AIPromptTemplate {
  id: string
  name: string
  description: string | null
  system_prompt: string
  user_prompt: string
  is_default: boolean
  created_at: string
  updated_at: string
  category?: string
}

// Sample template categories for organization
const PROMPT_CATEGORIES = [
  { id: "recovery", name: "Cart Recovery" },
  { id: "personalization", name: "Personalization" },
  { id: "urgency", name: "Urgency Creation" },
  { id: "product", name: "Product Focus" },
  { id: "discount", name: "Discount Offers" },
];

export default function AIPromptsPage() {
  const [promptTemplates, setPromptTemplates] = useState<AIPromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("my-prompts")
  const [editingTemplate, setEditingTemplate] = useState<AIPromptTemplate | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [activePromptId, setActivePromptId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showOutput, setShowOutput] = useState(false)
  const [aiOutput, setAiOutput] = useState("")
  const [generating, setGenerating] = useState(false)
  const [testPromptInput, setTestPromptInput] = useState("")
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    system_prompt: "",
    user_prompt: "",
    category: "recovery"
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
    async function loadPromptTemplates() {
      try {
        if (!user) return

        setLoading(true)
        // Mocked data for the redesign
        // In a real app, this would come from your API
        const mockedTemplates: AIPromptTemplate[] = [
          {
            id: "1",
            name: "Standard Recovery Prompt",
            description: "General purpose abandoned cart recovery",
            system_prompt: "You are an expert e-commerce marketing specialist focusing on cart recovery. Your goal is to create compelling email content that encourages customers to complete their purchase.",
            user_prompt: "Generate a friendly email to recover an abandoned cart with the following items: {{items}}. The customer's name is {{customer_name}} and their total cart value is {{cart_value}}. Offer a 10% discount code 'COMEBACK10' that expires in 24 hours.",
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: "recovery"
          },
          {
            id: "2",
            name: "Premium Product Focus",
            description: "Highlights quality and exclusivity for luxury items",
            system_prompt: "You are a luxury brand marketing specialist with expertise in premium product positioning and exclusivity messaging. Your tone is sophisticated and elegant.",
            user_prompt: "Create a compelling email for a customer who abandoned luxury items in their cart. Emphasize the craftsmanship, exclusivity, and premium quality of the products. The items are: {{items}}. The customer's name is {{customer_name}}. Do not focus on discounts but rather the unique value of these premium items.",
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: "product"
          },
          {
            id: "3",
            name: "Urgency Creator",
            description: "Creates FOMO and urgency to complete purchase",
            system_prompt: "You are a marketing expert specializing in creating urgency and FOMO (fear of missing out) in promotional content. Your goal is to create compelling content that motivates immediate action.",
            user_prompt: "Write an email that creates urgency for a customer to complete their abandoned purchase. Items in cart: {{items}}. Customer name: {{customer_name}}. Emphasize limited stock, high demand, and the risk of missing out. Include a clear call to action and mention that we're holding their items for only 24 more hours.",
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: "urgency"
          },
          {
            id: "4",
            name: "Personalization Engine",
            description: "Creates highly personalized recovery emails",
            system_prompt: "You are an AI specializing in hyper-personalized marketing. Your expertise is in creating content that feels individually crafted for each customer based on their preferences, past behavior, and current cart contents.",
            user_prompt: "Create a highly personalized email for {{customer_name}} who abandoned items: {{items}}. Their previous purchases include {{past_purchases}}. They typically shop in the {{category}} category and have opened our emails {{open_rate}} times in the past month. Make references to their preferences and behaviors to create a uniquely personal message.",
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            category: "personalization"
          },
        ];
        
        setPromptTemplates(mockedTemplates);
      } catch (error) {
        console.error("Error loading prompt templates:", error)
        toast({
          title: "Error",
          description: "Failed to load AI prompt templates",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPromptTemplates()
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

      if (!newTemplate.name || !newTemplate.system_prompt || !newTemplate.user_prompt) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      
      // Mock API call for demo purposes
      setTimeout(() => {
        const savedTemplate: AIPromptTemplate = {
          ...newTemplate,
          id: `template-${Date.now()}`,
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setPromptTemplates([...promptTemplates, savedTemplate]);
        setNewTemplate({
          name: "",
          description: "",
          system_prompt: "",
          user_prompt: "",
          category: "recovery"
        });
        setActiveTab("my-prompts");
        setLoading(false);
        
        toast({
          title: "Success",
          description: "AI prompt template saved successfully",
        });
      }, 1000);
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save AI prompt template",
        variant: "destructive",
      })
      setLoading(false);
    }
  }

  const handleUpdateTemplate = async () => {
    try {
      if (!editingTemplate) return
      
      setLoading(true)
      
      // Mock API call for demo purposes
      setTimeout(() => {
        const updatedTemplates = promptTemplates.map(template => 
          template.id === editingTemplate.id ? {
            ...editingTemplate,
            updated_at: new Date().toISOString()
          } : template
        );
        
        setPromptTemplates(updatedTemplates);
        setEditingTemplate(null);
        setLoading(false);
        
        toast({
          title: "Success",
          description: "AI prompt template updated successfully",
        });
      }, 1000);
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "Failed to update AI prompt template",
        variant: "destructive",
      })
      setLoading(false);
    }
  }

  const handleDeleteTemplate = async () => {
    try {
      if (!templateToDelete) return
      
      setLoading(true)
      
      // Mock API call for demo purposes
      setTimeout(() => {
        const filteredTemplates = promptTemplates.filter(template => template.id !== templateToDelete);
        setPromptTemplates(filteredTemplates);
        setTemplateToDelete(null);
        setDeleteConfirmOpen(false);
        setLoading(false);
        
        toast({
          title: "Success",
          description: "AI prompt template deleted successfully",
        });
      }, 1000);
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete AI prompt template",
        variant: "destructive",
      })
      setLoading(false);
    }
  }

  const duplicateTemplate = (template: AIPromptTemplate) => {
    setNewTemplate({
      name: `${template.name} (Copy)`,
      description: template.description || "",
      system_prompt: template.system_prompt,
      user_prompt: template.user_prompt,
      category: template.category || "recovery"
    });
    setActiveTab("create");
  }
  
  const handleTestPrompt = () => {
    if (!activePromptId) {
      toast({
        title: "No prompt selected",
        description: "Please select a prompt template to test",
        variant: "destructive",
      });
      return;
    }
    
    if (!testPromptInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter sample data to test with",
        variant: "destructive",
      });
      return;
    }
    
    setGenerating(true);
    setShowOutput(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const template = promptTemplates.find(t => t.id === activePromptId);
      setAiOutput(`
# AI-Generated Recovery Email Based on Your Prompt

## Subject: Complete Your Purchase and Save 10%

Dear Customer,

I noticed you left some great items in your shopping cart recently. Your selections show excellent taste!

**Your cart includes:**
- Organic cotton t-shirt - $29.99
- Premium denim jeans - $79.99
- Leather belt - $45.99

Total: $155.97

I'm reaching out because these items are still available, and we're holding them for you. To make it even better, I'd like to offer you a special **10% discount** with code **COMEBACK10** if you complete your purchase within the next 24 hours.

[Complete Your Purchase Now]

If you have any questions about these items or need help with your order, please don't hesitate to reply to this email.

Thank you for considering our products!

Best regards,
The Store Team
      `);
      setGenerating(false);
    }, 2000);
  };
  
  // Filter templates based on category and search term
  const filteredTemplates = promptTemplates.filter(template => {
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (template.description || "").toLowerCase().includes(searchTerm.toLowerCase());
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
        <h1 className="text-3xl font-bold">AI Prompt Manager</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-prompts">My Prompts</TabsTrigger>
          <TabsTrigger value="test-prompts">Test & Preview</TabsTrigger>
          <TabsTrigger value="create">Create Prompt</TabsTrigger>
        </TabsList>

        <TabsContent value="my-prompts">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-1 gap-4">
              <div className="w-full md:w-64">
                <Input
                  placeholder="Search prompts..."
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
                  {PROMPT_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setActiveTab("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Prompt
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
                  ? "No prompts match your search criteria."
                  : "You haven't created any prompt templates yet."}
              </p>
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Prompt
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className={`relative ${activePromptId === template.id ? 'ring-2 ring-primary' : ''}`}>
                  {template.is_default && (
                    <Badge className="absolute right-2 top-2 z-10">Default</Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {template.name}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-2 h-24 overflow-auto text-xs mb-2">
                      <p className="font-semibold mb-1">System Prompt:</p>
                      <p className="whitespace-pre-wrap">{template.system_prompt.substring(0, 100)}...</p>
                    </div>
                    <div className="border rounded-md p-2 h-24 overflow-auto text-xs">
                      <p className="font-semibold mb-1">User Prompt:</p>
                      <p className="whitespace-pre-wrap">{template.user_prompt.substring(0, 100)}...</p>
                    </div>
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        {PROMPT_CATEGORIES.find(c => c.id === template.category)?.name || "General"}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template);
                          setActiveTab("create");
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => duplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Button 
                      variant={activePromptId === template.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setActivePromptId(activePromptId === template.id ? null : template.id);
                        if (activePromptId !== template.id) {
                          setActiveTab("test-prompts");
                        }
                      }}
                    >
                      {activePromptId === template.id ? "Selected" : "Select"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete AI Prompt Template</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this prompt template? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="test-prompts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test AI Prompt</CardTitle>
                <CardDescription>
                  Test selected prompts with sample data to see how they generate content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activePromptId ? (
                  <>
                    <div className="rounded-md border p-3 bg-muted/20">
                      <p className="font-medium mb-1">Selected Prompt:</p>
                      <p className="text-sm">{promptTemplates.find(t => t.id === activePromptId)?.name}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="test-data">Test Data (Use {{customer_name}}, {{items}}, etc.)</Label>
                      <Textarea
                        id="test-data"
                        placeholder="customer_name: John Doe
items: Organic cotton t-shirt ($29.99), Premium denim jeans ($79.99), Leather belt ($45.99)
cart_value: $155.97"
                        className="h-40 font-mono text-sm"
                        value={testPromptInput}
                        onChange={(e) => setTestPromptInput(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 border rounded-md border-dashed">
                    <p className="text-muted-foreground mb-4">No prompt template selected</p>
                    <Button onClick={() => setActiveTab("my-prompts")}>
                      Select a Prompt Template
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={!activePromptId || generating}
                  onClick={handleTestPrompt}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Output</CardTitle>
                <CardDescription>
                  Preview the AI-generated content from your prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showOutput ? (
                  <div className="flex flex-col items-center justify-center border rounded-md p-10 h-[300px] border-dashed">
                    <Brain className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      Generated content will appear here
                    </p>
                  </div>
                ) : generating ? (
                  <div className="flex flex-col items-center justify-center border rounded-md p-10 h-[300px]">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                    <p className="text-muted-foreground">
                      Generating content...
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 h-[300px] overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: aiOutput.replace(/\n/g, '<br />') }} />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" disabled={!aiOutput || generating}>
                  Copy Output
                </Button>
                <Button disabled={!aiOutput || generating}>
                  Use in Template
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{editingTemplate ? "Edit AI Prompt Template" : "Create New AI Prompt Template"}</CardTitle>
              <CardDescription>
                {editingTemplate 
                  ? "Update your existing AI prompt template" 
                  : "Design a custom AI prompt template for generating recovery emails"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-name">Template Name</Label>
                  <Input
                    id="prompt-name"
                    placeholder="E.g., Premium Product Recovery"
                    value={editingTemplate?.name || newTemplate.name}
                    onChange={(e) => editingTemplate
                      ? setEditingTemplate({...editingTemplate, name: e.target.value})
                      : setNewTemplate({...newTemplate, name: e.target.value})
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt-category">Category</Label>
                  <Select 
                    value={editingTemplate?.category || newTemplate.category} 
                    onValueChange={(value) => editingTemplate
                      ? setEditingTemplate({...editingTemplate, category: value})
                      : setNewTemplate({...newTemplate, category: value})
                    }
                  >
                    <SelectTrigger id="prompt-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt-description">Description</Label>
                <Input
                  id="prompt-description"
                  placeholder="E.g., Creates compelling recovery emails for luxury products"
                  value={editingTemplate?.description || newTemplate.description}
                  onChange={(e) => editingTemplate
                    ? setEditingTemplate({...editingTemplate, description: e.target.value})
                    : setNewTemplate({...newTemplate, description: e.target.value})
                  }
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <span className="text-xs text-muted-foreground">
                    Sets the AI's role and behavior
                  </span>
                </div>
                <Textarea
                  id="system-prompt"
                  placeholder="E.g., You are an expert e-commerce marketing specialist focusing on abandoned cart recovery..."
                  className="h-32"
                  value={editingTemplate?.system_prompt || newTemplate.system_prompt}
                  onChange={(e) => editingTemplate
                    ? setEditingTemplate({...editingTemplate, system_prompt: e.target.value})
                    : setNewTemplate({...newTemplate, system_prompt: e.target.value})
                  }
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="user-prompt">User Prompt</Label>
                  <span className="text-xs text-muted-foreground">
                    The specific instructions for email generation
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-2">
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                    &lbrace;&lbrace;customer_name&rbrace;&rbrace;
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                    &lbrace;&lbrace;items&rbrace;&rbrace;
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                    &lbrace;&lbrace;cart_value&rbrace;&rbrace;
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-full">
                    &lbrace;&lbrace;recovery_url&rbrace;&rbrace;
                  </div>
                </div>
                <Textarea
                  id="user-prompt"
                  placeholder="E.g., Generate a friendly email to recover an abandoned cart with the following items: {{items}}..."
                  className="h-48"
                  value={editingTemplate?.user_prompt || newTemplate.user_prompt}
                  onChange={(e) => editingTemplate
                    ? setEditingTemplate({...editingTemplate, user_prompt: e.target.value})
                    : setNewTemplate({...newTemplate, user_prompt: e.target.value})
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingTemplate(null);
                  setActiveTab("my-prompts");
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingTemplate ? handleUpdateTemplate : handleSaveTemplate}>
                {editingTemplate ? "Update Template" : "Save Template"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 