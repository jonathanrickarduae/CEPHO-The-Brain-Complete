/**
 * iDeals Virtual Data Room Integration
 * 
 * Provides seamless document upload and management for investor datarooms.
 * API Documentation: https://gateway.idealsvdr.com/api-docs
 */

// Types
export interface IdealsConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface IdealsProject {
  id: string;
  name: string;
  status: 'Active' | 'Locked' | 'Archived' | 'Closed';
  createdAt: string;
  documentsCount?: number;
  participantsCount?: number;
}

export interface IdealsFolder {
  id: string;
  name: string;
  parentId: string | null;
  index: string;
  documentsCount?: number;
  subFoldersCount?: number;
}

export interface IdealsDocument {
  id: string;
  name: string;
  parentId: string;
  parentName: string;
  index: string;
  isFavorite: boolean;
  isAttachment: boolean;
  dataType: 'File' | 'Folder';
  createdAt: string;
  publicationStatus: 'Published' | 'Unpublished';
  size: number;
  fileExtensionType: string;
  permissions?: string;
}

export interface UploadProgress {
  documentId: string;
  fileName: string;
  totalSize: number;
  uploadedSize: number;
  chunksTotal: number;
  chunksUploaded: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface FolderMapping {
  brainFolderId: string;
  brainFolderName: string;
  idealsFolderId: string;
  idealsFolderName: string;
  projectId: string;
  autoSync: boolean;
}

// Constants
const DEFAULT_BASE_URL = 'https://gateway.idealsvdr.com/api/v1';
const CHUNK_SIZE = 20 * 1024 * 1024; // 20 MiB
const MAX_SINGLE_UPLOAD_SIZE = 20 * 1024 * 1024; // 20 MiB

// Helper to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * iDeals Dataroom Client
 */
export class IdealsClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: IdealsConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new IdealsError(
        error.message || `Request failed: ${response.status}`,
        response.status,
        error.code
      );
    }

    return response.json();
  }

  // ==================== Projects ====================

  /**
   * Get list of all accessible projects
   */
  async getProjects(): Promise<IdealsProject[]> {
    const response = await this.request<{ items: IdealsProject[] }>('/projects');
    return response.items;
  }

  /**
   * Get details of a specific project
   */
  async getProject(projectId: string): Promise<IdealsProject> {
    return this.request<IdealsProject>(`/projects/${projectId}`);
  }

  /**
   * Create a new project
   */
  async createProject(name: string): Promise<IdealsProject> {
    return this.request<IdealsProject>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // ==================== Folders ====================

  /**
   * Get list of folders in a project
   */
  async getFolders(projectId: string, parentId?: string): Promise<IdealsFolder[]> {
    const params = parentId ? `?parentId=${parentId}` : '';
    const response = await this.request<{ items: IdealsFolder[] }>(
      `/projects/${projectId}/folders${params}`
    );
    return response.items;
  }

  /**
   * Create a new folder
   */
  async createFolder(
    projectId: string,
    name: string,
    parentId?: string
  ): Promise<IdealsFolder> {
    return this.request<IdealsFolder>(`/projects/${projectId}/folders`, {
      method: 'POST',
      body: JSON.stringify({ name, parentId }),
    });
  }

  // ==================== Documents ====================

  /**
   * Get list of documents in a folder
   */
  async getDocuments(
    projectId: string,
    folderId?: string
  ): Promise<IdealsDocument[]> {
    const params = folderId ? `?folderId=${folderId}` : '';
    const response = await this.request<{ items: IdealsDocument[] }>(
      `/projects/${projectId}/documents${params}`
    );
    return response.items;
  }

  /**
   * Upload a document to the dataroom
   * Handles chunking for large files automatically
   */
  async uploadDocument(
    projectId: string,
    folderId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<IdealsDocument> {
    const documentId = generateUUID();
    const totalSize = file.size;
    const fileName = file.name;

    const progress: UploadProgress = {
      documentId,
      fileName,
      totalSize,
      uploadedSize: 0,
      chunksTotal: Math.ceil(totalSize / CHUNK_SIZE),
      chunksUploaded: 0,
      status: 'uploading',
    };

    onProgress?.(progress);

    try {
      // Single upload for small files
      if (totalSize <= MAX_SINGLE_UPLOAD_SIZE) {
        const buffer = await file.arrayBuffer();
        const result = await this.uploadChunk(
          projectId,
          folderId,
          documentId,
          fileName,
          new Uint8Array(buffer),
          1,
          totalSize
        );

        progress.uploadedSize = totalSize;
        progress.chunksUploaded = 1;
        progress.status = 'completed';
        onProgress?.(progress);

        return result;
      }

      // Chunked upload for large files
      let chunkNumber = 1;
      let offset = 0;
      let result: IdealsDocument | null = null;

      while (offset < totalSize) {
        const chunkEnd = Math.min(offset + CHUNK_SIZE, totalSize);
        const chunk = file.slice(offset, chunkEnd);
        const buffer = await chunk.arrayBuffer();

        result = await this.uploadChunk(
          projectId,
          folderId,
          documentId,
          fileName,
          new Uint8Array(buffer),
          chunkNumber,
          totalSize
        );

        offset = chunkEnd;
        chunkNumber++;

        progress.uploadedSize = offset;
        progress.chunksUploaded = chunkNumber - 1;
        onProgress?.(progress);
      }

      progress.status = 'completed';
      onProgress?.(progress);

      return result!;
    } catch (error) {
      progress.status = 'failed';
      progress.error = error instanceof Error ? error.message : 'Upload failed';
      onProgress?.(progress);
      throw error;
    }
  }

  private async uploadChunk(
    projectId: string,
    folderId: string,
    documentId: string,
    fileName: string,
    data: Uint8Array,
    chunkNumber: number,
    totalSize: number
  ): Promise<IdealsDocument> {
    const url = `${this.baseUrl}/projects/${projectId}/documents/upload`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/octet-stream',
        'Folder-Id': folderId,
        'Document-Name': fileName,
        'Document-Id': documentId,
        'Chunk-Number': chunkNumber.toString(),
        'Document-Size': totalSize.toString(),
      },
      body: new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer]),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new IdealsError(
        error.message || `Upload failed: ${response.status}`,
        response.status,
        error.code
      );
    }

    return response.json();
  }

  /**
   * Download a document
   */
  async downloadDocument(
    projectId: string,
    documentId: string
  ): Promise<Blob> {
    const url = `${this.baseUrl}/projects/${projectId}/documents/${documentId}/download`;

    const response = await fetch(url, {
      headers: {
        'Authorization': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new IdealsError(
        `Download failed: ${response.status}`,
        response.status
      );
    }

    return response.blob();
  }

  /**
   * Delete a document
   */
  async deleteDocument(
    projectId: string,
    documentId: string
  ): Promise<void> {
    await this.request(`/projects/${projectId}/documents`, {
      method: 'DELETE',
      body: JSON.stringify({ documentIds: [documentId] }),
    });
  }
}

/**
 * Custom error class for iDeals API errors
 */
export class IdealsError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'IdealsError';
  }
}

// ==================== Folder Mapping Service ====================

/**
 * Service to manage folder mappings between The Brain and iDeals
 */
export class FolderMappingService {
  private mappings: Map<string, FolderMapping> = new Map();
  private storageKey = 'ideals_folder_mappings';

  constructor() {
    this.loadMappings();
  }

  private loadMappings(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored) as FolderMapping[];
        data.forEach(m => this.mappings.set(m.brainFolderId, m));
      }
    } catch (e) {
      console.error('Failed to load folder mappings:', e);
    }
  }

  private saveMappings(): void {
    try {
      const data = Array.from(this.mappings.values());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save folder mappings:', e);
    }
  }

  addMapping(mapping: FolderMapping): void {
    this.mappings.set(mapping.brainFolderId, mapping);
    this.saveMappings();
  }

  removeMapping(brainFolderId: string): void {
    this.mappings.delete(brainFolderId);
    this.saveMappings();
  }

  getMapping(brainFolderId: string): FolderMapping | undefined {
    return this.mappings.get(brainFolderId);
  }

  getAllMappings(): FolderMapping[] {
    return Array.from(this.mappings.values());
  }

  getMappingsForProject(projectId: string): FolderMapping[] {
    return Array.from(this.mappings.values()).filter(
      m => m.projectId === projectId
    );
  }
}

// ==================== Document Sync Service ====================

export interface SyncResult {
  success: boolean;
  documentsUploaded: number;
  documentsFailed: number;
  errors: string[];
}

/**
 * Service to sync documents between The Brain Library and iDeals
 */
export class DocumentSyncService {
  private client: IdealsClient;
  private mappingService: FolderMappingService;

  constructor(apiKey: string) {
    this.client = new IdealsClient({ apiKey });
    this.mappingService = new FolderMappingService();
  }

  /**
   * Sync a single document to iDeals
   */
  async syncDocument(
    brainFolderId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<IdealsDocument | null> {
    const mapping = this.mappingService.getMapping(brainFolderId);
    if (!mapping) {
      throw new Error(`No iDeals mapping found for folder: ${brainFolderId}`);
    }

    return this.client.uploadDocument(
      mapping.projectId,
      mapping.idealsFolderId,
      file,
      onProgress
    );
  }

  /**
   * Sync multiple documents to iDeals
   */
  async syncDocuments(
    brainFolderId: string,
    files: File[],
    onProgress?: (fileName: string, progress: UploadProgress) => void
  ): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      documentsUploaded: 0,
      documentsFailed: 0,
      errors: [],
    };

    for (const file of files) {
      try {
        await this.syncDocument(
          brainFolderId,
          file,
          (progress) => onProgress?.(file.name, progress)
        );
        result.documentsUploaded++;
      } catch (error) {
        result.documentsFailed++;
        result.errors.push(
          `${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    result.success = result.documentsFailed === 0;
    return result;
  }

  /**
   * Get the iDeals client for direct API access
   */
  getClient(): IdealsClient {
    return this.client;
  }

  /**
   * Get the folder mapping service
   */
  getMappingService(): FolderMappingService {
    return this.mappingService;
  }
}

// ==================== React Hook ====================

import { useState, useCallback, useEffect } from 'react';

export interface UseIdealsDataroomOptions {
  apiKey?: string;
}

export interface UseIdealsDataroomReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  projects: IdealsProject[];
  selectedProject: IdealsProject | null;
  folders: IdealsFolder[];
  documents: IdealsDocument[];
  uploadProgress: UploadProgress | null;
  
  // Actions
  connect: (apiKey: string) => Promise<void>;
  disconnect: () => void;
  selectProject: (projectId: string) => Promise<void>;
  loadFolders: (parentId?: string) => Promise<void>;
  loadDocuments: (folderId?: string) => Promise<void>;
  uploadDocument: (folderId: string, file: File) => Promise<IdealsDocument>;
  createFolder: (name: string, parentId?: string) => Promise<IdealsFolder>;
  
  // Mapping
  mappings: FolderMapping[];
  addMapping: (mapping: Omit<FolderMapping, 'projectId'>) => void;
  removeMapping: (brainFolderId: string) => void;
}

export function useIdealsDataroom(
  options: UseIdealsDataroomOptions = {}
): UseIdealsDataroomReturn {
  const [client, setClient] = useState<IdealsClient | null>(null);
  const [mappingService] = useState(() => new FolderMappingService());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<IdealsProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<IdealsProject | null>(null);
  const [folders, setFolders] = useState<IdealsFolder[]>([]);
  const [documents, setDocuments] = useState<IdealsDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [mappings, setMappings] = useState<FolderMapping[]>([]);

  // Initialize with stored API key
  useEffect(() => {
    const storedKey = localStorage.getItem('ideals_api_key');
    if (storedKey || options.apiKey) {
      connect(storedKey || options.apiKey!).catch(console.error);
    }
    setMappings(mappingService.getAllMappings());
  }, []);

  const connect = useCallback(async (apiKey: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newClient = new IdealsClient({ apiKey });
      const projectList = await newClient.getProjects();
      
      setClient(newClient);
      setProjects(projectList);
      localStorage.setItem('ideals_api_key', apiKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setClient(null);
    setProjects([]);
    setSelectedProject(null);
    setFolders([]);
    setDocuments([]);
    localStorage.removeItem('ideals_api_key');
  }, []);

  const selectProject = useCallback(async (projectId: string) => {
    if (!client) return;
    
    setIsLoading(true);
    try {
      const project = await client.getProject(projectId);
      setSelectedProject(project);
      
      const folderList = await client.getFolders(projectId);
      setFolders(folderList);
      
      const docList = await client.getDocuments(projectId);
      setDocuments(docList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const loadFolders = useCallback(async (parentId?: string) => {
    if (!client || !selectedProject) return;
    
    setIsLoading(true);
    try {
      const folderList = await client.getFolders(selectedProject.id, parentId);
      setFolders(folderList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  }, [client, selectedProject]);

  const loadDocuments = useCallback(async (folderId?: string) => {
    if (!client || !selectedProject) return;
    
    setIsLoading(true);
    try {
      const docList = await client.getDocuments(selectedProject.id, folderId);
      setDocuments(docList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [client, selectedProject]);

  const uploadDocument = useCallback(async (
    folderId: string,
    file: File
  ): Promise<IdealsDocument> => {
    if (!client || !selectedProject) {
      throw new Error('Not connected to iDeals');
    }

    return client.uploadDocument(
      selectedProject.id,
      folderId,
      file,
      setUploadProgress
    );
  }, [client, selectedProject]);

  const createFolder = useCallback(async (
    name: string,
    parentId?: string
  ): Promise<IdealsFolder> => {
    if (!client || !selectedProject) {
      throw new Error('Not connected to iDeals');
    }

    const folder = await client.createFolder(selectedProject.id, name, parentId);
    await loadFolders(parentId);
    return folder;
  }, [client, selectedProject, loadFolders]);

  const addMapping = useCallback((mapping: Omit<FolderMapping, 'projectId'>) => {
    if (!selectedProject) return;
    
    const fullMapping: FolderMapping = {
      ...mapping,
      projectId: selectedProject.id,
    };
    
    mappingService.addMapping(fullMapping);
    setMappings(mappingService.getAllMappings());
  }, [selectedProject, mappingService]);

  const removeMapping = useCallback((brainFolderId: string) => {
    mappingService.removeMapping(brainFolderId);
    setMappings(mappingService.getAllMappings());
  }, [mappingService]);

  return {
    isConnected: client !== null,
    isLoading,
    error,
    projects,
    selectedProject,
    folders,
    documents,
    uploadProgress,
    
    connect,
    disconnect,
    selectProject,
    loadFolders,
    loadDocuments,
    uploadDocument,
    createFolder,
    
    mappings,
    addMapping,
    removeMapping,
  };
}

export default IdealsClient;
