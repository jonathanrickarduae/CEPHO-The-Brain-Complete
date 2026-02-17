/**
import { logger } from "../utils/logger";
const log = logger.module("LibraryRouter");
 * Library Router
 * Handles all library-related operations: categories, items, uploads, downloads
 */

import { Router } from 'express';
import { getDb } from '../db';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'library');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

/**
 * GET /api/library/categories
 * Get all library categories
 */
router.get('/categories', async (req, res) => {
  try {
    const db = await getDb();
    
    const categories = await db`
      SELECT * FROM library_categories
      ORDER BY name ASC
    `;
    
    res.json(categories);
  } catch (error) {
    log.error('[Library] Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/library/items
 * Get library items with optional filters
 */
router.get('/items', async (req, res) => {
  try {
    const db = await getDb();
    const { categoryId, type, projectId, search, userId } = req.query;
    
    let query = db`
      SELECT 
        li.*,
        lc.name as "categoryName",
        u.name as "userName",
        (SELECT COUNT(*) FROM library_favorites WHERE "itemId" = li.id) as "favoriteCount"
      FROM library_items li
      LEFT JOIN library_categories lc ON li."categoryId" = lc.id
      LEFT JOIN users u ON li."userId" = u.id
      WHERE 1=1
    `;
    
    // Apply filters
    if (categoryId) {
      query = db`${query} AND li."categoryId" = ${categoryId}`;
    }
    
    if (type) {
      query = db`${query} AND li.type = ${type}`;
    }
    
    if (projectId) {
      query = db`${query} AND li."projectId" = ${projectId}`;
    }
    
    if (userId) {
      query = db`${query} AND li."userId" = ${userId}`;
    }
    
    if (search) {
      query = db`${query} AND (
        li.title ILIKE ${'%' + search + '%'} OR 
        li.description ILIKE ${'%' + search + '%'} OR
        ${'%' + search + '%'} = ANY(li.tags)
      )`;
    }
    
    query = db`${query} ORDER BY li."createdAt" DESC`;
    
    const items = await query;
    
    res.json(items);
  } catch (error) {
    log.error('[Library] Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * GET /api/library/items/:id
 * Get a single library item by ID
 */
router.get('/items/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    
    const items = await db`
      SELECT 
        li.*,
        lc.name as "categoryName",
        u.name as "userName"
      FROM library_items li
      LEFT JOIN library_categories lc ON li."categoryId" = lc.id
      LEFT JOIN users u ON li."userId" = u.id
      WHERE li.id = ${id}
    `;
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Increment view count
    await db`
      UPDATE library_items 
      SET "viewCount" = "viewCount" + 1
      WHERE id = ${id}
    `;
    
    res.json(items[0]);
  } catch (error) {
    log.error('[Library] Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * POST /api/library/items
 * Create a new library item
 */
router.post('/items', async (req, res) => {
  try {
    const db = await getDb();
    const {
      categoryId,
      userId,
      projectId,
      title,
      description,
      type,
      fileType,
      filePath,
      fileUrl,
      fileSize,
      tags,
      metadata,
      isPublic
    } = req.body;
    
    const result = await db`
      INSERT INTO library_items (
        "categoryId", "userId", "projectId", title, description, type,
        "fileType", "filePath", "fileUrl", "fileSize", tags, metadata, "isPublic"
      )
      VALUES (
        ${categoryId || null}, ${userId}, ${projectId || null}, ${title}, ${description || null}, ${type},
        ${fileType || null}, ${filePath || null}, ${fileUrl || null}, ${fileSize || null}, 
        ${tags || []}, ${JSON.stringify(metadata || {})}, ${isPublic || false}
      )
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error) {
    log.error('[Library] Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/**
 * PUT /api/library/items/:id
 * Update a library item
 */
router.put('/items/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const {
      categoryId,
      title,
      description,
      type,
      fileType,
      filePath,
      fileUrl,
      fileSize,
      tags,
      metadata,
      isPublic
    } = req.body;
    
    const result = await db`
      UPDATE library_items
      SET
        "categoryId" = COALESCE(${categoryId}, "categoryId"),
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        type = COALESCE(${type}, type),
        "fileType" = COALESCE(${fileType}, "fileType"),
        "filePath" = COALESCE(${filePath}, "filePath"),
        "fileUrl" = COALESCE(${fileUrl}, "fileUrl"),
        "fileSize" = COALESCE(${fileSize}, "fileSize"),
        tags = COALESCE(${tags}, tags),
        metadata = COALESCE(${metadata ? JSON.stringify(metadata) : null}, metadata),
        "isPublic" = COALESCE(${isPublic}, "isPublic"),
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    log.error('[Library] Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

/**
 * DELETE /api/library/items/:id
 * Delete a library item
 */
router.delete('/items/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    
    // Get item to delete file
    const items = await db`
      SELECT * FROM library_items WHERE id = ${id}
    `;
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Delete file if exists
    if (items[0].filePath) {
      try {
        await fs.unlink(items[0].filePath);
      } catch (error) {
        log.error('[Library] Error deleting file:', error);
      }
    }
    
    // Delete from database
    await db`
      DELETE FROM library_items WHERE id = ${id}
    `;
    
    res.json({ success: true });
  } catch (error) {
    log.error('[Library] Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

/**
 * POST /api/library/upload
 * Upload a file to the library
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const db = await getDb();
    const { categoryId, userId, projectId, title, description, type, tags, metadata, isPublic } = req.body;
    
    // Create library item
    const result = await db`
      INSERT INTO library_items (
        "categoryId", "userId", "projectId", title, description, type,
        "fileType", "filePath", "fileSize", tags, metadata, "isPublic"
      )
      VALUES (
        ${categoryId || null}, ${userId}, ${projectId || null}, 
        ${title || req.file.originalname}, ${description || null}, ${type || 'document'},
        ${path.extname(req.file.originalname).substring(1)}, ${req.file.path}, ${req.file.size},
        ${tags ? JSON.parse(tags) : []}, ${metadata ? JSON.parse(metadata) : {}}, ${isPublic === 'true'}
      )
      RETURNING *
    `;
    
    res.json(result[0]);
  } catch (error) {
    log.error('[Library] Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

/**
 * GET /api/library/download/:id
 * Download a library item file
 */
router.get('/download/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    
    const items = await db`
      SELECT * FROM library_items WHERE id = ${id}
    `;
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const item = items[0];
    
    if (!item.filePath) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Increment download count
    await db`
      UPDATE library_items 
      SET "downloadCount" = "downloadCount" + 1
      WHERE id = ${id}
    `;
    
    // Send file
    res.download(item.filePath, item.title);
  } catch (error) {
    log.error('[Library] Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

/**
 * POST /api/library/favorites/:id
 * Add item to favorites
 */
router.post('/favorites/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { userId } = req.body;
    
    await db`
      INSERT INTO library_favorites ("userId", "itemId")
      VALUES (${userId}, ${id})
      ON CONFLICT ("userId", "itemId") DO NOTHING
    `;
    
    res.json({ success: true });
  } catch (error) {
    log.error('[Library] Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

/**
 * DELETE /api/library/favorites/:id
 * Remove item from favorites
 */
router.delete('/favorites/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { userId } = req.query;
    
    await db`
      DELETE FROM library_favorites 
      WHERE "userId" = ${userId} AND "itemId" = ${id}
    `;
    
    res.json({ success: true });
  } catch (error) {
    log.error('[Library] Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

/**
 * GET /api/library/favorites
 * Get user's favorite items
 */
router.get('/favorites', async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.query;
    
    const favorites = await db`
      SELECT 
        li.*,
        lc.name as "categoryName",
        u.name as "userName"
      FROM library_favorites lf
      JOIN library_items li ON lf."itemId" = li.id
      LEFT JOIN library_categories lc ON li."categoryId" = lc.id
      LEFT JOIN users u ON li."userId" = u.id
      WHERE lf."userId" = ${userId}
      ORDER BY lf."createdAt" DESC
    `;
    
    res.json(favorites);
  } catch (error) {
    log.error('[Library] Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

export default router;
