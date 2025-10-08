import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ContentItem {
  id?: string;
  source_url: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  duration: number;
  view_count: number;
  like_count: number;
  ai_score: number;
  status: string;
  processed_video_path?: string;
  uploaded_urls?: Record<string, string>;
  created_at?: string;
  processed_at?: string;
  uploaded_at?: string;
}

export interface PipelineRun {
  id?: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  items_processed: number;
  items_uploaded: number;
  error_message?: string;
}

export interface ApiKey {
  id?: string;
  service: string;
  key_data: Record<string, any>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Setting {
  id?: string;
  key: string;
  value: any;
  updated_at?: string;
}

export class SupabaseService {
  private client: SupabaseClient;
  private static instance: SupabaseService;

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async insertContentItem(item: ContentItem): Promise<ContentItem | null> {
    const { data, error } = await this.client
      .from('content_items')
      .insert(item)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error inserting content item:', error);
      return null;
    }

    return data;
  }

  async updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem | null> {
    const { data, error } = await this.client
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating content item:', error);
      return null;
    }

    return data;
  }

  async getContentItems(filters?: { status?: string; limit?: number }): Promise<ContentItem[]> {
    let query = this.client
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching content items:', error);
      return [];
    }

    return data || [];
  }

  async createPipelineRun(): Promise<PipelineRun | null> {
    const { data, error } = await this.client
      .from('pipeline_runs')
      .insert({ status: 'running', items_processed: 0, items_uploaded: 0 })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating pipeline run:', error);
      return null;
    }

    return data;
  }

  async updatePipelineRun(id: string, updates: Partial<PipelineRun>): Promise<PipelineRun | null> {
    const { data, error } = await this.client
      .from('pipeline_runs')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating pipeline run:', error);
      return null;
    }

    return data;
  }

  async saveApiKey(service: string, keyData: Record<string, any>): Promise<ApiKey | null> {
    const { data: existing } = await this.client
      .from('api_keys')
      .select('*')
      .eq('service', service)
      .maybeSingle();

    if (existing) {
      const { data, error } = await this.client
        .from('api_keys')
        .update({ key_data: keyData, updated_at: new Date().toISOString() })
        .eq('service', service)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating API key:', error);
        return null;
      }

      return data;
    } else {
      const { data, error } = await this.client
        .from('api_keys')
        .insert({ service, key_data: keyData, is_active: true })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving API key:', error);
        return null;
      }

      return data;
    }
  }

  async getApiKey(service: string): Promise<ApiKey | null> {
    const { data, error } = await this.client
      .from('api_keys')
      .select('*')
      .eq('service', service)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }

    return data;
  }

  async saveSetting(key: string, value: any): Promise<Setting | null> {
    const { data: existing } = await this.client
      .from('settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      const { data, error } = await this.client
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating setting:', error);
        return null;
      }

      return data;
    } else {
      const { data, error } = await this.client
        .from('settings')
        .insert({ key, value })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving setting:', error);
        return null;
      }

      return data;
    }
  }

  async getSetting(key: string): Promise<any> {
    const { data, error } = await this.client
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('Error fetching setting:', error);
      return null;
    }

    return data?.value;
  }

  subscribeToContentItems(callback: (items: ContentItem[]) => void) {
    return this.client
      .channel('content_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'content_items' },
        () => {
          this.getContentItems().then(callback);
        }
      )
      .subscribe();
  }
}
