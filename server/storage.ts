// Storage module - now using Supabase Storage instead of Manus Forge
// This module provides a consistent interface for file storage operations

export { storagePut, storageGet, storageDelete, storageList } from './supabase-storage';
