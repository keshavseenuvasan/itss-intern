const express = require('express');
const path = require('path');
const { scanFolder, calculateGlobalStats } = require('../utils/folderScanner');
const { analyzeJarFile, calculateTotalStats } = require('../utils/jarAnalyzer');

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
 * POST /api/folders/analyze-with-jars
 * Scans a folder (recursively), returns folder structure and analyzes any .jar/.zip files found
 */
router.post('/analyze-with-jars', (req, res) => {
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

    // Scan the folder structure first
    const folderData = scanFolder(folderPath, matchingBasePath);

    // Collect all jar/zip file absolute paths from the scanned structure
    const jarFiles = [];

    function collectJars(node) {
      if (!node) return;
      (node.files || []).forEach(f => {
        const ext = path.extname(f.name).toLowerCase();
        if (ext === '.jar' || ext === '.zip') {
          // Absolute path: join the directory path with the filename
          const absolutePath = path.join(node.path, f.name);
          jarFiles.push({ name: f.name, path: absolutePath, size: f.size });
        }
      });
      (node.subfolders || []).forEach(sub => collectJars(sub));
    }

    collectJars(folderData);

    // Analyze each jar file and aggregate type counts
    const jarAnalyses = [];
    const aggregatedFileTypes = {};

    for (const jf of jarFiles) {
      try {
        const analysis = analyzeJarFile(jf.path);
        const totals = calculateTotalStats(analysis);

        jarAnalyses.push({
          name: jf.name,
          path: jf.path,
          size: analysis.fileSize || jf.size || 0,
          totalFiles: totals.totalFiles,
          totalFolders: totals.totalFolders,
          fileTypeSummary: totals.fileTypeSummary
        });

        // Merge into aggregatedFileTypes
        Object.entries(totals.fileTypeSummary || {}).forEach(([type, count]) => {
          aggregatedFileTypes[type] = (aggregatedFileTypes[type] || 0) + count;
        });
      } catch (err) {
        // If a particular jar fails to analyze, include error info but continue
        jarAnalyses.push({
          name: jf.name,
          path: jf.path,
          size: jf.size || 0,
          error: err.message
        });
      }
    }

    const response = {
      success: true,
      data: {
        structure: folderData,
        jars: jarAnalyses,
        jarSummary: {
          jarCount: jarFiles.length,
          aggregatedFileTypeSummary: aggregatedFileTypes
        },
        summary: calculateGlobalStats(folderData)
      }
    };

    return res.json(response);
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
