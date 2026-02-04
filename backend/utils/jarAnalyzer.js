const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Get file type (extension) from filename
 */
function getFileType(filename) {
  const ext = path.extname(filename);
  return ext ? ext.substring(1).toLowerCase() : 'no-extension';
}

/**
 * Get file size in human-readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract and analyze JAR/ZIP file
 */
function analyzeJarFile(jarFilePath) {
  let tempDir = null;
  try {
    // Validate file exists
    if (!fs.existsSync(jarFilePath)) {
      throw new Error(`JAR file not found: ${jarFilePath}`);
    }

    // Validate file is JAR or ZIP
    const ext = path.extname(jarFilePath).toLowerCase();
    if (ext !== '.jar' && ext !== '.zip') {
      throw new Error(`Invalid file type. Expected .jar or .zip, got ${ext}`);
    }

    const fileStats = fs.statSync(jarFilePath);
    console.log(`Starting extraction of ${path.basename(jarFilePath)} (${formatFileSize(fileStats.size)})`);

    // Extract ZIP/JAR file to temporary directory
    tempDir = path.join(os.tmpdir(), `jar-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      const zip = new AdmZip(jarFilePath);
      console.log(`ZIP entries found: ${zip.getEntries().length}`);
      zip.extractAllTo(tempDir, true);
    } catch (zipErr) {
      throw new Error(`Failed to extract JAR file: ${zipErr.message}`);
    }

    console.log(`Extraction complete. Analyzing directory structure...`);

    // Analyze extracted contents
    const analysis = analyzeDirectory(tempDir, tempDir);
    analysis.fileName = path.basename(jarFilePath);
    analysis.filePath = jarFilePath;
    analysis.fileSize = fileStats.size;
    analysis.fileSizeFormatted = formatFileSize(analysis.fileSize);

    console.log(`Analysis complete. Found ${analysis.fileCount} files at root level.`);

    return analysis;
  } catch (err) {
    throw new Error(`Error analyzing JAR file: ${err.message}`);
  } finally {
    // Cleanup temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`Cleaned up temp directory: ${tempDir}`);
      } catch (cleanupErr) {
        console.error(`Error cleaning up temp directory: ${cleanupErr.message}`);
      }
    }
  }
}

/**
 * Recursively analyze directory structure
 * @param {string} dirPath - Path to directory
 * @param {string} rootPath - Root path for relative path calculation
 * @param {number} maxDepth - Maximum recursion depth (default: 50)
 * @param {number} currentDepth - Current recursion depth
 */
function analyzeDirectory(dirPath, rootPath, maxDepth = 50, currentDepth = 0) {
  let files = [];
  let folders = [];
  let fileTypeSummary = {};
  let totalSize = 0;

  try {
    const contents = fs.readdirSync(dirPath);

    // Process each item
    for (const item of contents) {
      try {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          folders.push(item);
        } else if (stats.isFile()) {
          const fileType = getFileType(item);
          const fileSize = stats.size;
          const lastModified = stats.mtime.toISOString();

          files.push({
            name: item,
            size: fileSize,
            sizeFormatted: formatFileSize(fileSize),
            type: fileType,
            lastModified: lastModified,
            lastModifiedDate: new Date(lastModified).toLocaleDateString(),
            relativePath: path.relative(rootPath, itemPath).replace(/\\/g, '/')
          });

          fileTypeSummary[fileType] = (fileTypeSummary[fileType] || 0) + 1;
          totalSize += fileSize;
        }
      } catch (err) {
        console.error(`Error processing item ${item} in ${dirPath}:`, err.message);
        // Continue processing other items
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err.message);
  }

  const result = {
    path: dirPath,
    name: path.basename(dirPath) || 'root',
    fileCount: files.length,
    folderCount: folders.length,
    totalSize: totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    files: files.sort((a, b) => a.name.localeCompare(b.name)),
    fileTypeSummary: fileTypeSummary,
    subfolders: []
  };

  // Recursively analyze subfolders (with depth limit)
  if (currentDepth < maxDepth) {
    for (const folder of folders) {
      try {
        const subfolderPath = path.join(dirPath, folder);
        const subfolderData = analyzeDirectory(subfolderPath, rootPath, maxDepth, currentDepth + 1);
        result.subfolders.push(subfolderData);
      } catch (err) {
        console.error(`Error analyzing subfolder ${folder}:`, err.message);
        result.subfolders.push({
          path: path.join(dirPath, folder),
          name: folder,
          error: err.message
        });
      }
    }
  } else if (folders.length > 0) {
    console.warn(`Max recursion depth (${maxDepth}) reached at ${dirPath}`);
  }

  return result;
}

/**
 * Calculate total statistics recursively
 */
function calculateTotalStats(data) {
  let totalFiles = data.fileCount;
  let totalFolders = data.folderCount;
  let totalSize = data.totalSize;
  let allFileTypes = { ...data.fileTypeSummary };

  if (data.subfolders) {
    data.subfolders.forEach(subfolder => {
      if (!subfolder.error) {
        const stats = calculateTotalStats(subfolder);
        totalFiles += stats.totalFiles;
        totalFolders += stats.totalFolders;
        totalSize += stats.totalSize;

        // Merge file types
        Object.entries(stats.fileTypeSummary).forEach(([type, count]) => {
          allFileTypes[type] = (allFileTypes[type] || 0) + count;
        });
      }
    });
  }

  return {
    totalFiles,
    totalFolders,
    totalSize,
    fileTypeSummary: allFileTypes
  };
}

module.exports = { analyzeJarFile, calculateTotalStats };
