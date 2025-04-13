"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Pencil, Trash, Copy, CheckCircle } from "lucide-react"
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
}

export default function AIPromptsPage() {
  const [promptTemplates, setPromptTemplates] = useState<AIPromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("my-prompts")
  const [editingTemplate, setEditingTemplate] = useState<AIPromptTemplate | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    system_prompt: "",
    user_prompt: "",
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
        const response = await fetch("/api/ai-prompts")
        
        if (!response.ok) {
          throw new Error("Failed to load prompt templates")
        }
        
        const data = await response.json()
        setPromptTemplates(data.templates)
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
      
      const response = await fetch("/api/ai-prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTemplate),
      })
      
      if (!response.ok) {
        throw new Error("Failed to save template")
      }
      
      const data = await response.json()
      
      setPromptTemplates([...promptTemplates, data.template])
      setNewTemplate({
        name: "",
        description: "",
        system_prompt: "",
        user_prompt: "",
      })
      setActiveTab("my-prompts")

      toast({
        title: "Success",
        description: "AI prompt template saved successfully",
      })
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save AI prompt template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTemplate = async () => {
    try {
      if (!editingTemplate) return
      
      setLoading(true)
      
      const response = await fetch(`/api/ai-prompts/${editingTemplate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingTemplate),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update template")
      }
      
      const data = await response.json()
      
      // Update the templates list
      setPromptTemplates(promptTemplates.map(template => 
        template.id === editingTemplate.id ? data.template : template
      ))
      
      setEditingTemplate(null)
      
      toast({
        title: "Success",
        description: "AI prompt template updated successfully",
      })
    } catch (error) {
      console.error("Error updating template:", error)
      toast({
        title: "Error",
        description: "Failed to update AI prompt template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTemplate = async () => {
    try {
      if (!templateToDelete) return
      
      setLoading(true)
      
      const response = await fetch(`/api/ai-prompts/${templateToDelete}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to delete template")
      }
      
      // Remove the template from the list
      setPromptTemplates(promptTemplates.filter(template => template.id !== templateToDelete))
      
      setTemplateToDelete(null)
      setDeleteConfirmOpen(false)
      
      toast({
        title: "Success",
        description: "AI prompt template deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete AI prompt template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const duplicateTemplate = (template: AIPromptTemplate) => {
    setNewTemplate({
      name: `${template.name} (copy)`,
      description: template.description || "",
      system_prompt: template.system_prompt,
      user_prompt: template.user_prompt,
    })
    setActiveTab("create")
    
    toast({
      title: "Template duplicated",
      description: "Edit and save your new template",
    })
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">AI Prompt Templates</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-prompts">My Templates</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
          <TabsTrigger value="defaults">System Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-prompts">
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : promptTemplates.filter(t => !t.is_default).length === 0 ? (
            <div className="text-center p-10 border rounded-md">
              <p className="text-muted-foreground mb-4">You haven't created any AI prompt templates yet.</p>
              <Button onClick={() => setActiveTab("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {promptTemplates
                .filter(template => !template.is_default)
                .map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>System Prompt</Label>
                        <div className="border rounded-md p-2 h-24 overflow-auto text-xs bg-muted">
                          <pre className="whitespace-pre-wrap font-mono">{template.system_prompt.substring(0, 150)}...</pre>
                        </div>
                        
                        <Label>User Prompt</Label>
                        <div className="border rounded-md p-2 h-24 overflow-auto text-xs bg-muted">
                          <pre className="whitespace-pre-wrap font-mono">{template.user_prompt.substring(0, 150)}...</pre>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setTemplateToDelete(template.id)
                          setDeleteConfirmOpen(true)
                        }}
                      >
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
              <CardTitle>Create AI Prompt Template</CardTitle>
              <CardDescription>
                Design your own custom AI prompt template. Use variables like {'{{'} customerName {'}}'}, {'{{'} itemsList {'}}'}, 
                {'{{'} cartTotal {'}}'}, {'{{'} recoveryUrl {'}}'}, and {'{{'} storeName {'}}'} in your user prompt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="E.g., Friendly Recovery Email"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Input
                    id="template-description"
                    placeholder="E.g., A friendly approach to cart recovery"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  className="h-40"
                  placeholder="Instructions for the AI, e.g.: You are an expert email marketer specializing in abandoned cart recovery..."
                  value={newTemplate.system_prompt}
                  onChange={(e) => setNewTemplate({...newTemplate, system_prompt: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  The system prompt sets the AI's role and behavior. Be specific about tone, style, and format.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-prompt">User Prompt</Label>
                <Textarea
                  id="user-prompt"
                  className="h-40"
                  placeholder="The prompt template with variables, e.g.: Generate a recovery email for a customer with these details: Name: {{customerName}}..."
                  value={newTemplate.user_prompt}
                  onChange={(e) => setNewTemplate({...newTemplate, user_prompt: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  The user prompt contains the specific request and customer data variables. 
                  Available variables: {'{{'} customerName {'}}'}, {'{{'} customerEmail {'}}'}, {'{{'} totalItems {'}}'}, 
                  {'{{'} cartTotal {'}}'}, {'{{'} itemsList {'}}'}, {'{{'} storeName {'}}'}, {'{{'} recoveryUrl {'}}'}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTemplate} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Save Template
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="defaults">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promptTemplates
              .filter(template => template.is_default)
              .map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {template.name}
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> System
                      </span>
                    </CardTitle>
                    <CardDescription>{template.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>System Prompt</Label>
                      <div className="border rounded-md p-2 h-24 overflow-auto text-xs bg-muted">
                        <pre className="whitespace-pre-wrap font-mono">{template.system_prompt.substring(0, 150)}...</pre>
                      </div>
                      
                      <Label>User Prompt</Label>
                      <div className="border rounded-md p-2 h-24 overflow-auto text-xs bg-muted">
                        <pre className="whitespace-pre-wrap font-mono">{template.user_prompt.substring(0, 150)}...</pre>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => duplicateTemplate(template)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate & Edit
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit AI Prompt Template</DialogTitle>
            <DialogDescription>
              Modify your AI prompt template. Changes will be saved when you click Update.
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input
                    id="edit-name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingTemplate.description || ""}
                    onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-system-prompt">System Prompt</Label>
                <Textarea
                  id="edit-system-prompt"
                  className="h-40"
                  value={editingTemplate.system_prompt}
                  onChange={(e) => setEditingTemplate({...editingTemplate, system_prompt: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-user-prompt">User Prompt</Label>
                <Textarea
                  id="edit-user-prompt"
                  className="h-40"
                  value={editingTemplate.user_prompt}
                  onChange={(e) => setEditingTemplate({...editingTemplate, user_prompt: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: {'{{'} customerName {'}}'}, {'{{'} customerEmail {'}}'}, {'{{'} totalItems {'}}'}, 
                  {'{{'} cartTotal {'}}'}, {'{{'} itemsList {'}}'}, {'{{'} storeName {'}}'}, {'{{'} recoveryUrl {'}}'}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
            <Button onClick={handleUpdateTemplate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this AI prompt template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTemplate} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 