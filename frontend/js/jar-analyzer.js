// JAR Analyzer - No Authentication Required

/**
 * Analyze JAR file on button click
 */
document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('jarFile');
  const errorDiv = document.getElementById('analysisError');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultsSection = document.getElementById('resultsSection');

  errorDiv.style.display = 'none';

  if (!fileInput.files.length) {
    errorDiv.textContent = 'Please select a JAR or ZIP file';
    errorDiv.style.display = 'block';
    return;
  }

  const file = fileInput.files[0];

  // Validate file size (500MB)
  if (file.size > 500 * 1024 * 1024) {
    errorDiv.textContent = 'File size exceeds 500MB limit';
    errorDiv.style.display = 'block';
    return;
  }

  // Validate file type
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.jar') && !fileName.endsWith('.zip')) {
    errorDiv.textContent = 'Please select a valid JAR or ZIP file';
    errorDiv.style.display = 'block';
    return;
  }

  loadingSpinner.style.display = 'block';
  resultsSection.style.display = 'none';

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/jar/analyze', {
      method: 'POST',
      body: formData
    });

    loadingSpinner.style.display = 'none';

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Analysis failed');
    }

    if (data.success) {
      displayJarResults(data.data);
      resultsSection.style.display = 'block';
      fileInput.value = ''; // Clear file input
    } else {
      throw new Error(data.error || 'Analysis failed');
    }
  } catch (err) {
    loadingSpinner.style.display = 'none';
    errorDiv.textContent = `Error: ${err.message || 'Analysis failed. Please check the file and try again.'}`;
    errorDiv.style.display = 'block';
    console.error('JAR analysis error:', err);
  }
});

/**
 * Display JAR analysis results
 */
function displayJarResults(jarData) {
  // Extract structure data
  const structure = jarData.structure || jarData;
  
  // Display file info
  document.getElementById('jarFileName').textContent = jarData.fileName || 'Unknown';
  document.getElementById('jarFileSize').textContent = jarData.fileSizeFormatted || '0 Bytes';

  // Count all files and folders recursively
  const totalFiles = countAllFiles(structure);
  const totalFolders = countAllFolders(structure);

  // Update summary
  document.getElementById('totalFiles').textContent = totalFiles;
  document.getElementById('totalFolders').textContent = totalFolders;
  document.getElementById('totalSize').textContent = jarData.fileSizeFormatted || '0 Bytes';
  document.getElementById('totalTypes').textContent = Object.keys(jarData.fileTypeSummary || {}).length;

  // Display file type summary
  displayFileTypeSummary(jarData.fileTypeSummary || {});

  // Display tree view
  displayTreeView(structure);

  // Display files
  displayFilesList(structure.files || []);

  // Display all contents
  displayAllContents(structure);
}

/**
 * Count all files recursively
 */
function countAllFiles(folderData, count = 0) {
  count += folderData.fileCount || 0;
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
  count += 1; // Count current folder
  if (folderData.subfolders) {
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

  const sortedTypes = Object.entries(fileTypeSummary).sort((a, b) => b[1] - a[1]);

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
 * Display hierarchical tree view
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
      <span class="tree-folder-stats">(${node.fileCount} files, ${node.folderCount} folders)</span>
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
 * Display files list as table
 */
function displayFilesList(files) {
  const container = document.getElementById('filesList');
  container.innerHTML = '';

  if (files.length === 0) {
    container.innerHTML = '<p>No files in root location</p>';
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
        <th>Modified Date</th>
      </tr>
    </thead>
    <tbody>
      ${files.map(file => `
        <tr>
          <td class="file-name">📄 ${file.name}</td>
          <td class="file-type">.${file.type}</td>
          <td class="file-size">${file.sizeFormatted}</td>
          <td class="file-date">${file.lastModifiedDate || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.appendChild(table);
}

/**
 * Display all contents organized by folder
 */
function displayAllContents(folderData) {
  const container = document.getElementById('allContents');
  container.innerHTML = '';

  function buildFolderContent(folder, path = '') {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder-content';

    const folderPath = path ? path + '/' + folder.name : folder.name;
    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header-content';
    folderHeader.innerHTML = `
      <h3>📁 ${folderPath}</h3>
      <p class="folder-stats">${folder.fileCount} files, ${folder.folderCount} subfolders</p>
    `;
    folderDiv.appendChild(folderHeader);

    // Files in this folder
    if (folder.files && folder.files.length > 0) {
      const filesDiv = document.createElement('div');
      filesDiv.className = 'folder-files';
      filesDiv.innerHTML = '<h4>Files:</h4>';

      const filesList = document.createElement('ul');
      folder.files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'file-item';
        li.innerHTML = `
          <span class="file-item-name">📄 ${file.name}</span>
          <span class="file-item-type">.${file.type}</span>
          <span class="file-item-size">${file.sizeFormatted}</span>
          <span class="file-item-date">${file.lastModifiedDate || 'N/A'}</span>
        `;
        filesList.appendChild(li);
      });
      filesDiv.appendChild(filesList);
      folderDiv.appendChild(filesDiv);
    }

    // Subfolders
    if (folder.subfolders && folder.subfolders.length > 0) {
      const subfoldersDiv = document.createElement('div');
      subfoldersDiv.className = 'folder-subfolders';

      folder.subfolders.forEach(subfolder => {
        if (!subfolder.error) {
          subfoldersDiv.appendChild(buildFolderContent(subfolder, folderPath));
        }
      });
      folderDiv.appendChild(subfoldersDiv);
    }

    return folderDiv;
  }

  container.appendChild(buildFolderContent(folderData));
}
