# JAR Analyzer - Troubleshooting & Testing Guide

## Issue Diagnosis

If you see "An error occurred. Please try again." when analyzing a JAR file, follow these troubleshooting steps:

### Step 1: Check the Server Logs

When you select a JAR file and click "Analyze JAR File", watch the terminal window where the server is running. You should see:

```
=== Starting JAR Analysis ===
File: hadoop-common-3.4.2.jar (###,### bytes)
[Processing messages...]
✓ Analysis complete: #### files, #### folders
=== JAR Analysis Finished ===
```

**If you see error messages in the server logs**, the problem is on the backend. Common issues:

1. **"Error analyzing JAR file: ..."** - JAR file might be corrupted
2. **"Failed to extract JAR file: ..."** - Extraction failed
3. **Timeout after 5 minutes** - File is too large or system is too slow

### Step 2: Check Browser Console

Open Developer Tools in your browser:
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- Go to the "Console" tab
- Try analyzing a JAR file and look for error messages

### Step 3: File Size Limitations

The analyzer supports files up to **500MB**. If your JAR file is larger:
- **Solution**: Split the JAR file or create a smaller test JAR

### Step 4: Large JAR File Handling

For JAR files **larger than 100MB**:
- The analyzer may take **1-5 minutes** to complete
- **DO NOT CLOSE THE BROWSER** while it's analyzing
- The loading spinner should be visible
- Wait patiently for the analysis to complete

## Solutions to Common Problems

### Problem 1: "An error occurred"

**Solution A**: Clear browser cache and reload
1. Press `Ctrl+Shift+Delete` (Windows) to open Clear Browsing Data
2. Clear all cached files
3. Refresh the page (`F5`)
4. Try again

**Solution B**: Check if file is valid
1. Try with a different JAR file
2. Verify the file is not corrupted
3. Try a smaller JAR file first

**Solution C**: Restart the server
```bash
# Kill any running Node processes
taskkill /F /IM node.exe

# Wait a moment
# Then restart:
cd backend
node server.js
```

### Problem 2: Analysis takes too long

**Cause**: Large JAR files (200MB+) take time to extract and analyze

**Solution**: 
- Be patient and wait (up to 5 minutes)
- Check server logs to confirm it's still processing
- If it's been stuck for 10+ minutes, restart the server

### Problem 3: Server crashes or runs out of memory

**Cause**: The system doesn't have enough RAM for the large file

**Solution**:
- Reduce other applications running
- Restart the server and try with a smaller file first
- Consider increasing system RAM

## Testing Checklist

✅ **Before Testing**:
- [ ] Server is running: `node server.js`
- [ ] Browser is at: `http://localhost:5000`
- [ ] Page loads without errors
- [ ] Upload button is visible

✅ **Test Steps**:
1. [ ] Click "Choose File" button
2. [ ] Select a JAR or ZIP file
3. [ ] Click "Analyze JAR File" button
4. [ ] Watch for loading spinner
5. [ ] Look for results section
6. [ ] Check browser console for errors (F12)
7. [ ] Check server terminal for log messages

✅ **Expected Results**:
- [ ] Loading spinner appears
- [ ] Results appear after processing
- [ ] File name is shown
- [ ] File size is displayed
- [ ] Summary cards show statistics
- [ ] File type badges appear
- [ ] Tree view shows folder structure
- [ ] Files list shows table of files
- [ ] Complete contents section shows all folders

## Advanced Debugging

### Enable Verbose Logging

Edit `backend/routes/jar.js` and uncomment/add these lines for more detailed logs:

```javascript
console.log('Starting extraction...');
console.log(`ZIP entries: ${zip.getEntries().length}`);
console.log('Analyzing directory structure...');
console.log(`Directory: ${dirPath}, Files: ${files.length}, Folders: ${folders.length}`);
```

### Check Disk Space

The analyzer needs temporary disk space equal to the extracted JAR size.

```bash
# Windows - Check disk space
fsutil volume diskfree C:

# Or use PowerShell
Get-Volume C: | Select-Object SizeRemaining
```

### Monitor Memory Usage

While analyzing, check if Node.js is consuming too much memory:

```bash
# Windows Task Manager
# Look for node.exe process
# Check Memory and CPU columns
```

## File Size Recommendations

| File Size | Expected Time | Difficulty |
|-----------|---------------|------------|
| < 1MB     | < 5 seconds   | Very Easy  |
| 1-10MB    | 5-30 seconds  | Easy       |
| 10-50MB   | 30 sec - 2 min| Medium     |
| 50-100MB  | 2-3 minutes   | Hard       |
| 100-500MB | 3-5 minutes   | Very Hard  |

## Test JAR Files

### Use System JAR Files

Look for these commonly available JAR files:
- **Java Installation**: `C:\Program Files\Java\jdk*/lib/*.jar`
- **Maven Repository**: `~/.m2/repository` (if you use Maven)
- **IDE Libraries**: Check your IDE's lib folder

### Create a Test JAR

If you want a small test file:

```bash
# Using PowerShell
$testDir = "C:\temp\test-jar"
New-Item -Type Directory $testDir -Force > $null
"test content" | Out-File "$testDir\test.txt"
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($testDir, "C:\temp\test.jar")
```

## Support Information

When reporting issues, include:

1. **JAR File Info**:
   - File name
   - File size (in MB)
   - File source

2. **System Info**:
   - Windows version
   - RAM available
   - Disk space free

3. **Error Message**:
   - Full text of error
   - Browser console errors (F12)
   - Server terminal output

4. **Steps to Reproduce**:
   - Exact sequence of actions
   - File used for testing
   - Expected vs actual result

## FAQ

**Q: Why does it take so long for large files?**
A: JAR extraction and recursive directory analysis are I/O intensive operations. Large files require many filesystem operations.

**Q: Can I analyze multiple JAR files at once?**
A: No, but you can analyze them one at a time. Each analysis replaces the previous results.

**Q: What's the maximum file size?**
A: 500MB limit is set, but practical limit is around 200-300MB depending on system RAM.

**Q: Does it analyze files inside nested JARs?**
A: No, it only analyzes the top-level JAR structure. Nested JARs are shown as `.jar` files in the list.

**Q: Can I download the analysis results?**
A: Currently, no. You can screenshot or copy the displayed results.

**Q: Will this work on a Mac/Linux?**
A: Yes! The backend is cross-platform. Just run `node server.js` in the backend directory.
