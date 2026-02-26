/**
 * API Analytics Router
 * 
 * Provides endpoints for viewing API usage analytics and metrics.
 * 
 * @module routers/analytics
 */

import { Router } from 'express';
import { apiAnalytics } from '../services/monitoring/api-analytics.service';

const router = Router();

/**
 * GET /api/analytics
 * 
 * Returns comprehensive API usage analytics.
 * 
 * @route GET /api/analytics
 * @returns {ApiAnalytics} API analytics data
 * 
 * @example
 * ```
 * GET /api/analytics
 * 
 * Response:
 * {
 *   "totalRequests": 1234,
 *   "uniqueEndpoints": 45,
 *   "successRate": 98.5,
 *   "errorRate": 1.5,
 *   "avgResponseTime": 125.3,
 *   "topEndpoints": [...],
 *   "slowestEndpoints": [...],
 *   "errorProneEndpoints": [...]
 * }
 * ```
 */
router.get('/', (req, res) => {
  try {
    const analytics = apiAnalytics.getAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/analytics/endpoint
 * 
 * Returns analytics for a specific endpoint.
 * 
 * @route GET /api/analytics/endpoint
 * @queryparam {string} path - The endpoint path
 * @queryparam {string} [method] - The HTTP method (optional)
 * @returns {EndpointStats} Endpoint statistics
 * 
 * @example
 * ```
 * GET /api/analytics/endpoint?path=/api/users&method=GET
 * 
 * Response:
 * {
 *   "endpoint": "/api/users",
 *   "method": "GET",
 *   "requestCount": 456,
 *   "successCount": 450,
 *   "avgResponseTime": 89.2,
 *   ...
 * }
 * ```
 */
router.get('/endpoint', (req, res) => {
  try {
    const { path, method } = req.query;
    
    if (!path || typeof path !== 'string') {
      return res.status(400).json({
        error: 'Missing required parameter: path'
      });
    }
    
    const stats = apiAnalytics.getEndpointAnalytics(
      path,
      method as string | undefined
    );
    
    if (!stats) {
      return res.status(404).json({
        error: 'Endpoint not found',
        path,
        method
      });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve endpoint analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/analytics/export
 * 
 * Exports all analytics data as JSON.
 * 
 * @route GET /api/analytics/export
 * @returns {string} JSON string of analytics data
 * 
 * @example
 * ```
 * GET /api/analytics/export
 * 
 * Response: (JSON file download)
 * ```
 */
router.get('/export', (req, res) => {
  try {
    const json = apiAnalytics.export();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="api-analytics.json"');
    res.send(json);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to export analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/analytics/reset
 * 
 * Resets all analytics data.
 * 
 * @route POST /api/analytics/reset
 * @returns {object} Success message
 * 
 * @example
 * ```
 * POST /api/analytics/reset
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Analytics data reset successfully"
 * }
 * ```
 */
router.post('/reset', (req, res) => {
  try {
    apiAnalytics.reset();
    
    res.json({
      success: true,
      message: 'Analytics data reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to reset analytics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
