import { supabase } from '@/lib/supabase'

export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  user_prompt: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Default AI settings
const DEFAULT_AI_SETTINGS: AISettings = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000
}

/**
 * Get user's AI settings from the database
 * @param userId The user's ID
 * @returns The user's AI settings
 */
export async function getUserAISettings(userId: string): Promise<AISettings> {
  try {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error || !data) {
      console.log('No custom AI settings found, using defaults')
      return DEFAULT_AI_SETTINGS
    }
    
    return {
      model: data.model,
      temperature: data.temperature,
      maxTokens: data.max_tokens
    }
  } catch (error) {
    console.error('Error getting AI settings:', error)
    return DEFAULT_AI_SETTINGS
  }
}

/**
 * Get a prompt template by ID
 * @param promptId The prompt template ID
 * @returns The prompt template or null if not found
 */
export async function getPromptTemplate(promptId: string): Promise<AIPromptTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('id', promptId)
      .single()
    
    if (error || !data) {
      console.log('Prompt template not found:', promptId)
      return null
    }
    
    return data as AIPromptTemplate
  } catch (error) {
    console.error('Error getting prompt template:', error)
    return null
  }
}

/**
 * Get all default prompt templates
 * @returns Array of default prompt templates
 */
export async function getDefaultPromptTemplates(): Promise<AIPromptTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .eq('is_default', true)
    
    if (error || !data) {
      console.log('No default prompt templates found')
      return []
    }
    
    return data as AIPromptTemplate[]
  } catch (error) {
    console.error('Error getting default prompt templates:', error)
    return []
  }
}

/**
 * Get all prompt templates for a user
 * @param userId The user's ID
 * @returns Array of prompt templates (user's custom templates and default templates)
 */
export async function getUserPromptTemplates(userId: string): Promise<AIPromptTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .order('created_at', { ascending: false })
    
    if (error || !data) {
      console.log('No prompt templates found')
      return []
    }
    
    return data as AIPromptTemplate[]
  } catch (error) {
    console.error('Error getting user prompt templates:', error)
    return []
  }
} 