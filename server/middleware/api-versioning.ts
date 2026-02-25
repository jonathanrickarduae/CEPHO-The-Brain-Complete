/**
 * API Versioning Middleware
 * 
 * Provides version-aware routing for the API.
 * Supports:
 * - URL-based versioning: /api/v1/resource
 * - Header-based versioning: API-Version: 1
 * - Default version fallback
 * 
 * Priority 2 - API-01: API Versioning
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const log = logger.module('API-Versioning');

export interface ApiVersionConfig {
  defaultVersion: string;
  supportedVersions: string[];
  deprecatedVersions: Record<string, string>; // version -> sunset date
}

const config: ApiVersionConfig = {
  defaultVersion: 'v1',
  supportedVersions: ['v1'],
  deprecatedVersions: {
    // Example: 'v0': '2026-06-01'
  }
};

/**
 * Extract API version from request
 * Priority: URL path > Header > Default
 */
export function extractApiVersion(req: Request): string {
  // 1. Check URL path: /api/v1/resource
  const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    return pathMatch[1];
  }

  // 2. Check API-Version header
  const headerVersion = req.headers['api-version'] as string;
  if (headerVersion) {
    return headerVersion.startsWith('v') ? headerVersion : `v${headerVersion}`;
  }

  // 3. Use default version
  return config.defaultVersion;
}

/**
 * Validate API version
 */
export function isVersionSupported(version: string): boolean {
  return config.supportedVersions.includes(version);
}

/**
 * Check if version is deprecated
 */
export function isVersionDeprecated(version: string): boolean {
  return version in config.deprecatedVersions;
}

/**
 * Get deprecation info
 */
export function getDeprecationInfo(version: string): string | null {
  return config.deprecatedVersions[version] || null;
}

/**
 * API Versioning Middleware
 * 
 * Attaches version information to request and validates version
 */
export function apiVersioning() {
  return (req: Request, res: Response, next: NextFunction) => {
    const version = extractApiVersion(req);
    
    // Attach version to request for downstream use
    (req as any).apiVersion = version;

    // Validate version
    if (!isVersionSupported(version)) {
      log.warn(`Unsupported API version requested: ${version}`, {
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return res.status(400).json({
        error: 'Unsupported API version',
        version: version,
        supportedVersions: config.supportedVersions,
        message: `API version ${version} is not supported. Please use one of: ${config.supportedVersions.join(', ')}`
      });
    }

    // Add version header to response
    res.setHeader('API-Version', version);

    // Check if deprecated
    if (isVersionDeprecated(version)) {
      const sunsetDate = getDeprecationInfo(version);
      res.setHeader('Deprecation', 'true');
      if (sunsetDate) {
        res.setHeader('Sunset', sunsetDate);
      }
      res.setHeader('Link', `</api/${config.defaultVersion}>; rel="successor-version"`);
      
      log.warn(`Deprecated API version used: ${version}`, {
        path: req.path,
        sunsetDate,
        ip: req.ip
      });
    }

    next();
  };
}

/**
 * Version-specific router wrapper
 * 
 * Usage:
 * const v1Router = versionedRouter('v1');
 * v1Router.get('/users', handler);
 */
export function versionedRouter(version: string) {
  const express = require('express');
  const router = express.Router();
  
  // Add version validation middleware
  router.use((req: Request, res: Response, next: NextFunction) => {
    const requestVersion = (req as any).apiVersion || extractApiVersion(req);
    
    if (requestVersion !== version) {
      return next('route'); // Skip this router, try next one
    }
    
    next();
  });
  
  return router;
}

/**
 * Get API version from request
 * Helper for use in route handlers
 */
export function getApiVersion(req: Request): string {
  return (req as any).apiVersion || extractApiVersion(req);
}

/**
 * Version compatibility checker
 * Use in route handlers to check if client version is compatible
 */
export function requireMinVersion(minVersion: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const currentVersion = getApiVersion(req);
    const current = parseInt(currentVersion.replace('v', ''));
    const min = parseInt(minVersion.replace('v', ''));
    
    if (current < min) {
      return res.status(426).json({
        error: 'Upgrade Required',
        currentVersion,
        minVersion,
        message: `This endpoint requires API version ${minVersion} or higher. You are using ${currentVersion}.`
      });
    }
    
    next();
  };
}

/**
 * Update API version configuration
 */
export function updateVersionConfig(newConfig: Partial<ApiVersionConfig>) {
  Object.assign(config, newConfig);
  log.info('API version configuration updated', config);
}

/**
 * Get current API version configuration
 */
export function getVersionConfig(): ApiVersionConfig {
  return { ...config };
}

export default {
  apiVersioning,
  versionedRouter,
  extractApiVersion,
  isVersionSupported,
  isVersionDeprecated,
  getDeprecationInfo,
  getApiVersion,
  requireMinVersion,
  updateVersionConfig,
  getVersionConfig
};
