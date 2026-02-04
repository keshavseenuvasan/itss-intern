const fs = require('fs');
const path = require('path');

/**
 * Get file type (extension) from filename
 */
function getFileType(filename) {
  const ext = path.extname(filename);
  return ext ? ext.substring(1).toLowerCase() : 'unknown';
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
 * Format date to readable string
 */
function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Recursively scan a folder and return its structure with complete metadata
 */
function scanFolder(folderPath, allowedBasePath, isRoot = true, depth = 0) {
  try {
    // Security: Validate that the path is within the allowed base directory
    const resolvedPath = path.resolve(folderPath);
    const resolvedBasePath = path.resolve(allowedBasePath);

    if (!resolvedPath.startsWith(resolvedBasePath)) {
      throw new Error('Access denied: Path is outside allowed directory');
    }

    // Check if directory exists
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Directory not found: ${folderPath}`);
    }

    // Read directory contents
    const contents = fs.readdirSync(resolvedPath);

    let files = [];
    let folders = [];
    let fileTypeSummary = {};
    let totalSize = 0;
    let maxDepth = depth;

    // Process each item in the directory
    for (const item of contents) {
      try {
        const itemPath = path.join(resolvedPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          folders.push(item);
        } else if (stats.isFile()) {
          const fileType = getFileType(item);
          const fileSize = stats.size;
          const birthTime = stats.birthtime || stats.ctime;
          const lastModified = stats.mtime;

          files.push({
            name: item,
            size: fileSize,
            sizeFormatted: formatFileSize(fileSize),
            type: fileType,
            createdDate: formatDate(birthTime),
            createdTime: birthTime.toISOString(),
            modifiedDate: formatDate(lastModified),
            modifiedTime: lastModified.toISOString(),
            path: resolvedPath,
            relativePath: path.relative(resolvedBasePath, itemPath)
          });

          // Accumulate size and count file types
          totalSize += fileSize;
          fileTypeSummary[fileType] = (fileTypeSummary[fileType] || 0) + 1;
        }
      } catch (err) {
        console.error(`Error processing item ${item}:`, err.message);
      }
    }

    // Build result object
    const result = {
      path: resolvedPath,
      relativePath: path.relative(resolvedBasePath, resolvedPath),
      name: path.basename(resolvedPath),
      fileCount: files.length,
      folderCount: folders.length,
      totalSize: totalSize,
      totalSizeFormatted: formatFileSize(totalSize),
      depth: depth,
      files: files.sort((a, b) => a.name.localeCompare(b.name)),
      fileTypeSummary: fileTypeSummary,
      subfolders: []
    };

    // Recursively scan subfolders (including empty folders)
    for (const folder of folders.sort()) {
      try {
        const subfolderPath = path.join(resolvedPath, folder);
        const subfolderData = scanFolder(subfolderPath, resolvedBasePath, false, depth + 1);
        result.subfolders.push(subfolderData);
        maxDepth = Math.max(maxDepth, subfolderData.maxDepth);
      } catch (err) {
        console.error(`Error scanning subfolder ${folder}:`, err.message);
        // Still include the folder even if there's an error
        result.subfolders.push({
          path: path.join(resolvedPath, folder),
          relativePath: path.relative(resolvedBasePath, path.join(resolvedPath, folder)),
          name: folder,
          fileCount: 0,
          folderCount: 0,
          totalSize: 0,
          totalSizeFormatted: '0 Bytes',
          depth: depth + 1,
          files: [],
          fileTypeSummary: {},
          subfolders: [],
          error: err.message,
          maxDepth: depth + 1
        });
      }
    }

    result.maxDepth = maxDepth;
    return result;
  } catch (err) {
    throw new Error(`Error scanning folder: ${err.message}`);
  }
}

/**
 * Calculate total statistics across entire folder tree
 */
function calculateGlobalStats(folderData) {
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;
  let maxDepth = 0;
  let globalFileTypeSummary = {};

  function traverse(node) {
    totalFiles += node.fileCount;
    totalFolders += 1; // Count the folder itself
    totalSize += node.totalSize;
    maxDepth = Math.max(maxDepth, node.depth);

    // Merge file type summaries
    for (const [type, count] of Object.entries(node.fileTypeSummary)) {
      globalFileTypeSummary[type] = (globalFileTypeSummary[type] || 0) + count;
    }

    // Traverse subfolders
    for (const subfolder of node.subfolders) {
      if (!subfolder.error) {
        traverse(subfolder);
      }
    }
  }

  traverse(folderData);

  return {
    totalFiles,
    totalFolders,
    totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    maxDepth,
    globalFileTypeSummary
  };
}

module.exports = { scanFolder, calculateGlobalStats, formatFileSize, formatDate };
