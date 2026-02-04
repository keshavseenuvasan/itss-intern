const express = require('express');
const path = require('path');
const { scanFolder, calculateGlobalStats } = require('../utils/folderScanner');

const router = express.Router();

// Allowed base directories for security
const ALLOWED_BASE_PATHS = [
  'C:\\Users\\keshav s\\Desktop',
  'C:\\Users\\keshav s\\Documents',
  'C:\\Users\\keshav s\\Downloads',
  // Add more allowed paths as needed
];

/**
 * Check if the given path is within an allowed base directory
 */
function isPathAllowed(requestedPath) {
  const resolvedPath = path.resolve(requestedPath);
  return ALLOWED_BASE_PATHS.some(basePath => {
    const resolvedBasePath = path.resolve(basePath);
    return resolvedPath.startsWith(resolvedBasePath);
  });
}

/**
 * POST /api/folders/analyze
 * Analyzes a folder and returns its structure with complete metadata
 */
router.post('/analyze', (req, res) => {
  const { folderPath } = req.body;

  // Validate input
  if (!folderPath || typeof folderPath !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid folder path provided'
    });
  }

  // Security: Check if path is allowed
  if (!isPathAllowed(folderPath)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: This directory is not allowed for analysis'
    });
  }

  try {
    // Find the appropriate base path
    const matchingBasePath = ALLOWED_BASE_PATHS.find(basePath => {
      const resolvedPath = path.resolve(folderPath);
      const resolvedBasePath = path.resolve(basePath);
      return resolvedPath.startsWith(resolvedBasePath);
    });

    // Scan the folder
    const folderData = scanFolder(folderPath, matchingBasePath);
    
    // Calculate global statistics
    const globalStats = calculateGlobalStats(folderData);

    return res.json({
      success: true,
      data: {
        structure: folderData,
        summary: globalStats
      }
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/folders/allowed-paths
 * Returns list of allowed base paths for the frontend
 */
router.get('/allowed-paths', (req, res) => {
  return res.json({
    success: true,
    paths: ALLOWED_BASE_PATHS
  });
});

module.exports = router;
