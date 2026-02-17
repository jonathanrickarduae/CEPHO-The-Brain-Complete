/**
 * Supabase Storage Integration
 * Replaces Manus Forge storage with Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

// Initialize Supabase client for storage operations
function getSupabaseClient() {
  const supabaseUrl = ENV.supabaseUrl;
  const supabaseServiceKey = ENV.supabaseServiceKey;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase credentials missing: set SUPABASE_URL and SUPABASE_SERVICE_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Upload file to Supabase Storage
 * @param relKey - Relative path/key for the file (e.g., "users/123/documents/file.pdf")
 * @param data - File data as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and public URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const bucket = 'documents'; // Default bucket name
  
  // Normalize the key (remove leading slashes)
  const key = relKey.replace(/^\/+/, '');
  
  // Convert data to Buffer if it's a string
  const fileData = typeof data === 'string' 
    ? Buffer.from(data, 'utf-8') 
    : data;
  
  // Upload to Supabase Storage
  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(key, fileData, {
      contentType,
      upsert: true, // Overwrite if file exists
    });
  
  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(key);
  
  return {
    key,
    url: urlData.publicUrl,
  };
}

/**
 * Get download URL for a file from Supabase Storage
 * @param relKey - Relative path/key for the file
 * @returns Object with key and public URL
 */
export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();
  const bucket = 'documents';
  
  const key = relKey.replace(/^\/+/, '');
  
  // Get public URL (no need to generate signed URL for public bucket)
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(key);
  
  return {
    key,
    url: urlData.publicUrl,
  };
}

/**
 * Delete file from Supabase Storage
 * @param relKey - Relative path/key for the file
 */
export async function storageDelete(relKey: string): Promise<void> {
  const supabase = getSupabaseClient();
  const bucket = 'documents';
  
  const key = relKey.replace(/^\/+/, '');
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([key]);
  
  if (error) {
    throw new Error(`Supabase storage delete failed: ${error.message}`);
  }
}

/**
 * List files in a directory
 * @param prefix - Directory prefix (e.g., "users/123/")
 */
export async function storageList(prefix: string): Promise<Array<{
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}>> {
  const supabase = getSupabaseClient();
  const bucket = 'documents';
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix);
  
  if (error) {
    throw new Error(`Supabase storage list failed: ${error.message}`);
  }
  
  return data || [];
}
