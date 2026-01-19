/**
 * S3 Storage Service
 * Handles file uploads to S3 for Vault and document storage
 */

import { storagePut, storageGet } from '../storage';

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export interface FileMetadata {
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  category?: string;
  encrypted?: boolean;
}

/**
 * Upload file to S3
 */
export async function uploadFile(
  userId: string,
  filename: string,
  data: Buffer | string,
  options?: {
    mimeType?: string;
    category?: string;
    encrypt?: boolean;
  }
): Promise<UploadResult> {
  try {
    const key = `users/${userId}/${options?.category || 'files'}/${Date.now()}_${filename}`;
    const contentType = options?.mimeType || 'application/octet-stream';
    
    const result = await storagePut(key, data, contentType);
    
    return {
      success: true,
      key: result.key,
      url: result.url,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get presigned URL for file download
 */
export async function getFileUrl(
  key: string
): Promise<{ url: string } | null> {
  try {
    const result = await storageGet(key);
    return { url: result.url };
  } catch (error) {
    console.error('S3 get URL error:', error);
    return null;
  }
}

/**
 * Upload document for training
 */
export async function uploadTrainingDocument(
  userId: string,
  filename: string,
  content: string,
  mimeType: string
): Promise<UploadResult> {
  return uploadFile(userId, filename, content, {
    mimeType,
    category: 'training',
  });
}

/**
 * Upload to Vault (encrypted storage)
 */
export async function uploadToVault(
  userId: string,
  filename: string,
  data: Buffer | string,
  mimeType: string
): Promise<UploadResult> {
  return uploadFile(userId, filename, data, {
    mimeType,
    category: 'vault',
    encrypt: true,
  });
}

/**
 * Upload project document
 */
export async function uploadProjectDocument(
  userId: string,
  projectId: string,
  filename: string,
  data: Buffer | string,
  mimeType: string
): Promise<UploadResult> {
  try {
    const key = `users/${userId}/projects/${projectId}/${Date.now()}_${filename}`;
    const result = await storagePut(key, data, mimeType);
    
    return {
      success: true,
      key: result.key,
      url: result.url,
    };
  } catch (error) {
    console.error('Project document upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get storage usage for user
 */
export async function getStorageUsage(userId: string): Promise<{
  totalBytes: number;
  fileCount: number;
  byCategory: Record<string, number>;
}> {
  // This would query S3 or a database tracking file metadata
  // For now, return placeholder
  return {
    totalBytes: 0,
    fileCount: 0,
    byCategory: {
      training: 0,
      vault: 0,
      projects: 0,
    },
  };
}
