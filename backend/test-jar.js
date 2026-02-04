// Direct test of JAR analyzer - run this to debug

const { analyzeJarFile, calculateTotalStats } = require('./utils/jarAnalyzer');
const path = require('path');

async function test() {
  console.log('\n=== JAR Analyzer Direct Test ===\n');

  // Get the JAR file path from command line or use default
  const jarPath = process.argv[2];
  
  if (!jarPath) {
    console.log('Usage: node test-jar.js <path-to-jar-file>');
    console.log('Example: node test-jar.js C:/path/to/file.jar');
    process.exit(1);
  }

  try {
    console.log(`Testing with file: ${jarPath}`);
    console.log(`File exists: ${require('fs').existsSync(jarPath)}`);
    
    const stats = require('fs').statSync(jarPath);
    console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('\nStarting analysis...\n');

    const startTime = Date.now();
    const analysis = analyzeJarFile(jarPath);
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✓ Extraction and initial analysis completed in ${elapsedTime}s`);
    console.log(`Root level: ${analysis.fileCount} files, ${analysis.folderCount} folders\n`);

    console.log('Calculating total statistics...\n');
    const totalStats = calculateTotalStats(analysis);

    console.log('=== RESULTS ===');
    console.log(`Total Files: ${totalStats.totalFiles}`);
    console.log(`Total Folders: ${totalStats.totalFolders}`);
    console.log(`Total Size: ${analysis.fileSizeFormatted}`);
    console.log(`File Types: ${Object.keys(totalStats.fileTypeSummary).length}`);
    console.log(`\nTop 10 File Types:`);
    
    Object.entries(totalStats.fileTypeSummary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([type, count]) => {
        console.log(`  .${type}: ${count} files`);
      });

    console.log('\n✓ Test completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Error occurred:');
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    process.exit(1);
  }
}

test();
