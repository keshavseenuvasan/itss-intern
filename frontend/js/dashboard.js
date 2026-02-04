// Dashboard Logic

const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
let currentAnalysisType = 'folder'; // Track which analysis type is active

/**
 * Redirect to login if not authenticated
 */
window.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = '/';
  } else {
    document.getElementById('userInfo').textContent = `Logged in as: ${username}`;
    initializeTabSwitching();
  }
});

/**
 * Initialize tab switching between folder and JAR analysis
 */
function initializeTabSwitching() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      currentAnalysisType = tabName;

      // Update active button
      tabBtns.forEach(b => b.classList.remove('tab-active'));
      btn.classList.add('tab-active');

      // Update active content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });
}

/**
 * Logout handler
 */
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = '/';
});

/**
 * Load allowed paths on page load
 */
async function loadAllowedPaths() {
  try {
    const response = await fetch('/api/folders/allowed-paths', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      displayPathSuggestions(data.paths);
    }
  } catch (err) {
    console.error('Error loading allowed paths:', err);
  }
}

/**
 * Display path suggestions
 */
function displayPathSuggestions(paths) {
  const suggestionsDiv = document.getElementById('pathSuggestions');
  suggestionsDiv.innerHTML = '<p class="suggestions-label">Allowed paths:</p>';

  paths.forEach(path => {
    const suggestion = document.createElement('button');
    suggestion.type = 'button';
    suggestion.className = 'suggestion-btn';
    suggestion.textContent = path;
    suggestion.addEventListener('click', () => {
      document.getElementById('folderPath').value = path;
    });
    suggestionsDiv.appendChild(suggestion);
  });
}

/**
 * Analyze folder
 */
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const folderPath = document.getElementById('folderPath').value.trim();
  const errorDiv = document.getElementById('analysisError');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultsSection = document.getElementById('resultsSection');

  errorDiv.style.display = 'none';

  if (!folderPath) {
    errorDiv.textContent = 'Please enter a folder path';
    errorDiv.style.display = 'block';
    return;
  }

  loadingSpinner.style.display = 'block';
  resultsSection.style.display = 'none';

  try {
    const response = await fetch('/api/folders/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ folderPath })
    });

    const data = await response.json();

    loadingSpinner.style.display = 'none';

    if (data.success) {
      displayResults(data.data);
      resultsSection.style.display = 'block';
    } else {
      errorDiv.textContent = data.error || 'Analysis failed';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    loadingSpinner.style.display = 'none';
    errorDiv.textContent = 'An error occurred. Please try again.';
    errorDiv.style.display = 'block';
    console.error('Analysis error:', err);
  }
});

/**
 * Display analysis results (ENHANCED VERSION with tree view and global stats)
 */
function displayResults(responseData) {
  // Handle both old format (direct folderData) and new format (structure + summary)
  const folderData = responseData.structure || responseData;
  const globalStats = responseData.summary || null;

  // Calculate counts if no global stats available
  const totalFiles = globalStats ? globalStats.totalFiles : countAllFiles(folderData);
  const totalFolders = globalStats ? globalStats.totalFolders : countAllFolders(folderData);
  const totalSize = globalStats ? globalStats.totalSizeFormatted : 'N/A';
  const fileTypeSummary = globalStats ? globalStats.globalFileTypeSummary : folderData.fileTypeSummary;
  const maxDepth = globalStats ? globalStats.maxDepth : folderData.maxDepth || '0';

  // Update summary cards
  document.getElementById('totalFiles').textContent = totalFiles;
  document.getElementById('totalFolders').textContent = totalFolders;
  document.getElementById('totalSize').textContent = totalSize;
  document.getElementById('totalTypes').textContent = Object.keys(fileTypeSummary).length;

  // Display global statistics
  const maxDepthEl = document.getElementById('maxDepth');
  const globalFoldersEl = document.getElementById('globalTotalFolders');
  const globalFilesEl = document.getElementById('globalTotalFiles');
  const globalSizeEl = document.getElementById('globalTotalSize');

  if (maxDepthEl) maxDepthEl.textContent = maxDepth || '0';
  if (globalFoldersEl) globalFoldersEl.textContent = totalFolders || '0';
  if (globalFilesEl) globalFilesEl.textContent = totalFiles || '0';
  if (globalSizeEl) globalSizeEl.textContent = totalSize || 'N/A';

  // Display file type summary
  displayFileTypeSummary(fileTypeSummary);

  // Display tree view (check if element exists)
  const treeViewEl = document.getElementById('treeView');
  if (treeViewEl) {
    displayTreeView(folderData);
  }

  // Display files in main location
  displayFilesList(folderData.files);

  // Display subfolders with expanded accordion
  displaySubfolders(folderData.subfolders);
}

/**
 * Count all files recursively
 */
function countAllFiles(folderData, count = 0) {
  count += folderData.fileCount;
  if (folderData.subfolders) {
    folderData.subfolders.forEach(subfolder => {
      if (!subfolder.error) {
        count = countAllFiles(subfolder, count);
      }
    });
  }
  return count;
}

/**
 * Count all folders recursively
 */
function countAllFolders(folderData, count = 0) {
  count += folderData.folderCount;
  if (folderData.subfolders) {
    count += folderData.subfolders.length;
    folderData.subfolders.forEach(subfolder => {
      if (!subfolder.error) {
        count = countAllFolders(subfolder, count);
      }
    });
  }
  return count;
}

/**
 * Display file type summary
 */
function displayFileTypeSummary(fileTypeSummary) {
  const container = document.getElementById('fileTypeSummary');
  container.innerHTML = '';

  const sortedTypes = Object.entries(fileTypeSummary)
    .sort((a, b) => b[1] - a[1]);

  if (sortedTypes.length === 0) {
    container.innerHTML = '<p>No files found</p>';
    return;
  }

  sortedTypes.forEach(([type, count]) => {
    const badge = document.createElement('div');
    badge.className = 'file-type-badge';
    badge.innerHTML = `
      <span class="file-type-name">.${type}</span>
      <span class="file-type-count">${count}</span>
    `;
    container.appendChild(badge);
  });
}

/**
 * Display files list as table with complete metadata
 */
function displayFilesList(files) {
  const container = document.getElementById('filesList');
  container.innerHTML = '';

  if (files.length === 0) {
    container.innerHTML = '<p>No files in main folder</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'files-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>File Name</th>
        <th>Type</th>
        <th>Size</th>
        <th>Created Date</th>
        <th>Modified Date</th>
      </tr>
    </thead>
    <tbody>
      ${files.map(file => {
        const createdDate = file.createdDate || file.lastModifiedDate || 'N/A';
        const modifiedDate = file.modifiedDate || file.lastModifiedDate || 'N/A';
        return `
        <tr>
          <td class="file-name" title="${file.name}">📄 ${file.name}</td>
          <td class="file-type">.${file.type}</td>
          <td class="file-size">${file.sizeFormatted}</td>
          <td class="file-date">${createdDate}</td>
          <td class="file-date">${modifiedDate}</td>
        </tr>
      `}).join('')}
    </tbody>
  `;

  container.appendChild(table);
}

/**
 * Display subfolders recursively
 */
function displaySubfolders(subfolders) {
  const container = document.getElementById('subfoldersList');
  container.innerHTML = '';

  if (subfolders.length === 0) {
    container.innerHTML = '<p>No subfolders found</p>';
    return;
  }

  subfolders.forEach((subfolder, index) => {
    const accordion = document.createElement('div');
    accordion.className = 'accordion-item';

    if (subfolder.error) {
      accordion.innerHTML = `
        <div class="accordion-header">
          <span>❌ ${subfolder.name}</span>
          <span class="error-text">Error: ${subfolder.error}</span>
        </div>
      `;
    } else {
      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.innerHTML = `
        <span class="folder-toggle">▶</span>
        <span>📁 ${subfolder.name}</span>
        <span class="folder-stats">${subfolder.fileCount} files, ${subfolder.folderCount} folders</span>
      `;

      const content = document.createElement('div');
      content.className = 'accordion-content';
      content.style.display = 'none';
      content.innerHTML = buildSubfolderContent(subfolder);

      header.addEventListener('click', () => {
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        header.querySelector('.folder-toggle').textContent = isOpen ? '▶' : '▼';
      });

      accordion.appendChild(header);
      accordion.appendChild(content);
    }

    container.appendChild(accordion);
  });
}

/**
 * Build subfolder content HTML
 */
function buildSubfolderContent(subfolder) {
  let html = '<div class="subfolder-content">';

  // File type summary
  if (Object.keys(subfolder.fileTypeSummary).length > 0) {
    html += '<div class="subfolder-section">';
    html += '<h4>File Types</h4>';
    html += '<div class="file-type-grid">';
    Object.entries(subfolder.fileTypeSummary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        html += `
          <div class="file-type-badge">
            <span class="file-type-name">.${type}</span>
            <span class="file-type-count">${count}</span>
          </div>
        `;
      });
    html += '</div></div>';
  }

  // Files list
  if (subfolder.files.length > 0) {
    html += '<div class="subfolder-section">';
    html += '<h4>Files</h4>';
    html += '<table class="files-table-small">';
    html += '<thead><tr><th>Name</th><th>Type</th><th>Size</th></tr></thead>';
    html += '<tbody>';
    subfolder.files.forEach(file => {
      html += `
        <tr>
          <td>${file.name}</td>
          <td>.${file.type}</td>
          <td>${file.sizeFormatted}</td>
        </tr>
      `;
    });
    html += '</tbody></table></div>';
  }

  // Subfolders
  if (subfolder.subfolders.length > 0) {
    html += '<div class="subfolder-section">';
    html += '<h4>Subfolders</h4>';
    subfolder.subfolders.forEach(sub => {
      if (sub.error) {
        html += `<p class="error-text">❌ ${sub.name}: ${sub.error}</p>`;
      } else {
        html += `<p>📁 ${sub.name} (${sub.fileCount} files, ${sub.folderCount} folders)</p>`;
      }
    });
    html += '</div>';
  }

  html += '</div>';
  return html;
}

/**
 * Display folder structure as hierarchical tree view
 */
function displayTreeView(folderData) {
  const container = document.getElementById('treeView');
  container.innerHTML = '';

  const tree = document.createElement('div');
  tree.className = 'tree-container';

  function buildTreeNode(node, depth = 0, isLast = true) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    nodeDiv.style.marginLeft = depth * 20 + 'px';

    const nodeContent = document.createElement('div');
    nodeContent.className = 'tree-node-content';

    // Branch indicators
    const branch = document.createElement('span');
    branch.className = 'tree-branch';
    branch.textContent = isLast ? '└── ' : '├── ';

    // Folder icon and name
    const folderInfo = document.createElement('span');
    folderInfo.className = 'tree-folder-info';
    folderInfo.innerHTML = `
      <span class="tree-folder-name">📁 ${node.name}</span>
      <span class="tree-folder-stats">(${node.fileCount} files, ${node.folderCount} folders, ${node.totalSizeFormatted || '0 Bytes'})</span>
    `;

    // Toggle button for subfolders
    let toggle = null;
    if (node.subfolders && node.subfolders.length > 0) {
      toggle = document.createElement('button');
      toggle.className = 'tree-toggle';
      toggle.textContent = '▼';
      toggle.style.marginRight = '8px';
      toggle.onclick = (e) => {
        e.stopPropagation();
        subFoldersDiv.style.display = subFoldersDiv.style.display === 'none' ? 'block' : 'none';
        toggle.textContent = subFoldersDiv.style.display === 'none' ? '▶' : '▼';
      };
    }

    nodeContent.appendChild(branch);
    if (toggle) nodeContent.appendChild(toggle);
    nodeContent.appendChild(folderInfo);

    nodeDiv.appendChild(nodeContent);

    // Subfolders
    if (node.subfolders && node.subfolders.length > 0) {
      const subFoldersDiv = document.createElement('div');
      subFoldersDiv.className = 'tree-subfolders';

      node.subfolders.forEach((subfolder, idx) => {
        const isLastChild = idx === node.subfolders.length - 1;
        if (!subfolder.error) {
          const childNode = buildTreeNode(subfolder, depth + 1, isLastChild);
          subFoldersDiv.appendChild(childNode);
        } else {
          const errorNode = document.createElement('div');
          errorNode.className = 'tree-node tree-error';
          errorNode.style.marginLeft = (depth + 1) * 20 + 'px';
          errorNode.innerHTML = `<span class="tree-branch">${isLastChild ? '└── ' : '├── '}</span><span class="tree-error-text">❌ ${subfolder.name}: ${subfolder.error}</span>`;
          subFoldersDiv.appendChild(errorNode);
        }
      });

      nodeDiv.appendChild(subFoldersDiv);
    }

    return nodeDiv;
  }

  const rootNode = buildTreeNode(folderData, 0, true);
  tree.appendChild(rootNode);
  container.appendChild(tree);
}

/**
document.getElementById('analyzeJarBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('jarFile');
  const jarError = document.getElementById('jarError');
  const jarLoadingSpinner = document.getElementById('jarLoadingSpinner');
  const resultsSection = document.getElementById('resultsSection');

  jarError.style.display = 'none';

  if (!fileInput.files.length) {
    jarError.textContent = 'Please select a JAR or ZIP file';
    jarError.style.display = 'block';
    return;
  }

  const file = fileInput.files[0];

  // Validate file size (500MB)
  if (file.size > 500 * 1024 * 1024) {
    jarError.textContent = 'File size exceeds 500MB limit';
    jarError.style.display = 'block';
    return;
  }

  // Validate file type
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.jar') && !fileName.endsWith('.zip')) {
    jarError.textContent = 'Please select a valid JAR or ZIP file';
    jarError.style.display = 'block';
    return;
  }

  jarLoadingSpinner.style.display = 'block';
  resultsSection.style.display = 'none';

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/jar/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    jarLoadingSpinner.style.display = 'none';

    const data = await response.json();

    if (data.success) {
      displayJarResults(data.data);
      resultsSection.style.display = 'block';
      document.getElementById('jarResultsHeader').style.display = 'block';
      fileInput.value = ''; // Clear file input
    } else {
      jarError.textContent = data.error || 'Analysis failed';
      jarError.style.display = 'block';
    }
  } catch (err) {
    jarLoadingSpinner.style.display = 'none';
    jarError.textContent = 'An error occurred. Please try again.';
    jarError.style.display = 'block';
    console.error('JAR analysis error:', err);
  }
});

/**
 * Display JAR analysis results
 */
function displayJarResults(jarData) {
  // Display file info
  document.getElementById('jarFileName').textContent = jarData.fileName;
  document.getElementById('jarFileSize').textContent = jarData.fileSizeFormatted;

  // Update summary
  document.getElementById('totalFiles').textContent = jarData.totalFiles;
  document.getElementById('totalFolders').textContent = jarData.totalFolders;
  document.getElementById('totalSize').textContent = jarData.totalSizeFormatted;
  document.getElementById('totalTypes').textContent = Object.keys(jarData.fileTypeSummary).length;

  // Display file type summary
  displayFileTypeSummary(jarData.fileTypeSummary);

  // Display files
  displayFilesList(jarData.structure.files);

  // Display subfolders
  displaySubfolders(jarData.structure.subfolders);
}

// Load allowed paths on page load
loadAllowedPaths();
