const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { analyzeJarFile, calculateTotalStats } = require('../utils/jarAnalyzer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jar' || ext === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Only .jar and .zip files are allowed'), false);
    }
  }
});

/**
 * POST /api/jar/analyze
 * Upload and analyze a JAR/ZIP file
 */
router.post('/analyze', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  // Set a timeout of 5 minutes for large JAR files
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      // Clean up uploaded file on timeout
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting temp file:', err);
        });
      }
      res.status(408).json({
        success: false,
        error: 'JAR file analysis timed out. The file may be too large or complex.'
      });
    }
  }, 5 * 60 * 1000); // 5 minutes

  try {
    console.log(`\n=== Starting JAR Analysis ===`);
    console.log(`File: ${req.file.originalname} (${req.file.size} bytes)`);
    const filePath = req.file.path;
    
    // Force garbage collection before heavy operation if available
    if (global.gc) {
      global.gc();
      console.log('Garbage collection completed');
    }

    const analysis = analyzeJarFile(filePath);
    
    // Calculate total statistics
    const totalStats = calculateTotalStats(analysis);

    const response = {
      success: true,
      data: {
        fileName: analysis.fileName,
        filePath: analysis.filePath,
        fileSize: analysis.fileSize,
        fileSizeFormatted: analysis.fileSizeFormatted,
        totalFiles: totalStats.totalFiles,
        totalFolders: totalStats.totalFolders,
        totalSize: totalStats.totalSize,
        totalSizeFormatted: analysis.totalSizeFormatted || formatFileSize(totalStats.totalSize),
        fileTypeSummary: totalStats.fileTypeSummary,
        structure: {
          path: analysis.path,
          name: analysis.name,
          fileCount: analysis.fileCount,
          folderCount: analysis.folderCount,
          files: analysis.files,
          subfolders: analysis.subfolders,
          fileTypeSummary: totalStats.fileTypeSummary
        }
      }
    };

    console.log(`✓ Analysis complete: ${totalStats.totalFiles} files, ${totalStats.totalFolders} folders`);
    console.log(`=== JAR Analysis Finished ===\n`);

    // Clear timeout since response is being sent
    clearTimeout(timeoutId);

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    return res.json(response);
  } catch (err) {
    console.error(`✗ Error: ${err.message}`);
    console.log(`=== JAR Analysis Failed ===\n`);

    // Clear timeout
    clearTimeout(timeoutId);

    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }

    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * Helper function to format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

module.exports = router;

/**
 * POST /api/jar/analyze-multiple
 * Upload multiple JAR/ZIP files (e.g., from a folder upload) and analyze each
 */
router.post('/analyze-multiple', upload.array('files', 200), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  }

  // Set a generous timeout for processing multiple files
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      // cleanup uploaded files
      (req.files || []).forEach(f => {
        try { fs.unlinkSync(f.path); } catch (e) { }
      });
      res.status(408).json({ success: false, error: 'Processing timed out' });
    }
  }, 10 * 60 * 1000); // 10 minutes

  try {
    const results = [];
    const aggregatedFileTypes = {};
    let totalFiles = 0;
    let totalFolders = 0;
    let totalSize = 0;

    for (const file of req.files) {
      try {
        const analysis = analyzeJarFile(file.path);
        const totals = calculateTotalStats(analysis);

        results.push({
          fileName: analysis.fileName,
          filePath: analysis.filePath,
          fileSize: analysis.fileSize,
          fileSizeFormatted: analysis.fileSizeFormatted,
          totalFiles: totals.totalFiles,
          totalFolders: totals.totalFolders,
          fileTypeSummary: totals.fileTypeSummary
        });

        totalFiles += totals.totalFiles;
        totalFolders += totals.totalFolders;
        totalSize += analysis.fileSize || 0;

        Object.entries(totals.fileTypeSummary || {}).forEach(([t, c]) => {
          aggregatedFileTypes[t] = (aggregatedFileTypes[t] || 0) + c;
        });
      } catch (err) {
        results.push({ fileName: file.originalname, error: err.message });
      } finally {
        // cleanup uploaded file
        try { fs.unlinkSync(file.path); } catch (e) { }
      }
    }

    clearTimeout(timeoutId);

    return res.json({
      success: true,
      data: {
        files: results,
        summary: {
          uploadedCount: req.files.length,
          totalFiles,
          totalFolders,
          totalSize,
          totalSizeFormatted: formatFileSize(totalSize),
          aggregatedFileTypeSummary: aggregatedFileTypes
        }
      }
    });
  } catch (err) {
    clearTimeout(timeoutId);
    // cleanup uploaded files on error
    (req.files || []).forEach(f => { try { fs.unlinkSync(f.path); } catch (e) { } });
    return res.status(500).json({ success: false, error: err.message });
  }
});
