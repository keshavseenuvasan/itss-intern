# Testing Guide - Folder Analysis Dashboard

## Pre-Deployment Testing Checklist

### 1. Installation & Setup ✅

- [ ] Node.js is installed (check: `node -v`)
- [ ] npm is installed (check: `npm -v`)
- [ ] Navigate to backend folder
- [ ] Run `npm install` successfully
- [ ] No installation errors or warnings

### 2. Server Startup ✅

- [ ] Run `npm start` from backend folder
- [ ] Server starts without errors
- [ ] Console shows: "Server running on http://localhost:5000"
- [ ] Console shows login credentials

### 3. Frontend Access ✅

- [ ] Open browser to http://localhost:5000
- [ ] Login page loads successfully
- [ ] All form fields are visible
- [ ] Demo credentials are displayed
- [ ] Page styling looks professional

---

## Authentication Testing

### Valid Login ✅
```
Steps:
1. Enter username: demo
2. Enter password: demo123
3. Click Login

Expected:
✓ Login form disappears
✓ Redirects to dashboard page
✓ User greeting shows "Logged in as: demo"
✓ No error messages appear
```

### Invalid Credentials ✅
```
Steps:
1. Enter username: demo
2. Enter password: wrongpassword
3. Click Login

Expected:
✓ Error message appears: "Invalid username or password"
✓ Stay on login page
✓ Form is not cleared
✓ User can retry
```

### Empty Form ✅
```
Steps:
1. Leave username empty
2. Leave password empty
3. Click Login

Expected:
✓ Form validation prevents submission (browser default)
✓ Or backend returns error
✓ Error message is clear
```

### Token Persistence ✅
```
Steps:
1. Login successfully
2. Close browser tab
3. Reopen http://localhost:5000
4. Refresh page

Expected:
✓ If token exists, go directly to dashboard
✓ User is still logged in (check browser dev tools: localStorage)
✓ No need to login again
```

### Logout ✅
```
Steps:
1. Login successfully
2. Click "Logout" button
3. Check browser state

Expected:
✓ Redirects to login page
✓ localStorage token is cleared
✓ Must login again to access dashboard
```

---

## Folder Analysis Testing

### Basic Analysis ✅
```
Steps:
1. Enter path: C:\Users\keshav s\Downloads
2. Click Analyze
3. Wait for results

Expected:
✓ Loading spinner appears during analysis
✓ Results load within 3-5 seconds
✓ Summary cards show counts
✓ File list displays
✓ File types are categorized
```

### Summary Cards ✅
```
Verify:
✓ Total Files: Shows correct count
✓ Total Folders: Shows correct count
✓ File Types: Shows unique extension count
✓ Cards have icons and styling
✓ Cards are hover-interactive
```

### File Type Badges ✅
```
Verify:
✓ All file types are displayed
✓ Counts are accurate
✓ Sorted by frequency (most first)
✓ Badges have gradient styling
✓ Badges are clickable/hoverable
```

### File Metadata Table ✅
```
Verify:
✓ All files in main folder are listed
✓ File name is displayed with icon
✓ File type (.ext) is shown
✓ File size is formatted (KB, MB, etc.)
✓ Last modified date is correct
✓ Table is scrollable on small screens
✓ Rows alternate colors for readability
```

### Subfolder Analysis ✅
```
Steps:
1. Analyze a folder with subfolders
2. Scroll to "Subfolders Analysis" section
3. Click on a subfolder to expand

Expected:
✓ Accordion expands smoothly
✓ Shows file count and folder count
✓ Toggle arrow changes direction (▶→▼)
✓ Subfolder content includes:
  - File type summary
  - File list with metadata
  - Nested subfolders (if any)
✓ Can expand/collapse multiple times
```

### Path Validation ✅
```
Test Valid Paths:
✓ C:\Users\keshav s\Desktop
✓ C:\Users\keshav s\Documents
✓ C:\Users\keshav s\Downloads
✓ C:\Users\keshav s\Desktop\[any subfolder]

All should work.
```

```
Test Invalid Paths:
✓ C:\Windows (should fail - not whitelisted)
✓ C:\Program Files (should fail)
✓ Z:\NonExistent (should fail)
✓ /invalid/path (should fail)

All should show error: "Access denied" or "Directory not found"
```

### Error Handling ✅
```
Test Non-existent Path:
- Enter: C:\Users\NonExistent\Folder
- Expected: Error message "Directory not found"

Test Inaccessible Folder:
- Try a restricted folder
- Expected: Permission or access error

Test Empty Path:
- Leave path empty
- Click Analyze
- Expected: Error message "Please enter a folder path"
```

---

## UI/UX Testing

### Responsive Design ✅

**Desktop (1920x1080):**
- [ ] Layout is horizontal and spacious
- [ ] All cards display in grid
- [ ] Table is full width
- [ ] No horizontal scroll needed

**Tablet (768x1024):**
- [ ] Summary cards stack nicely
- [ ] Buttons are still clickable
- [ ] Text is readable
- [ ] No layout breaking

**Mobile (375x667):**
- [ ] Single column layout
- [ ] Cards stack vertically
- [ ] Buttons are full width
- [ ] Touch-friendly interaction (48px+ targets)
- [ ] Text is readable without zoom

### Visual Design ✅
- [ ] Color scheme is professional
- [ ] Gradients are smooth
- [ ] Shadows add depth
- [ ] Icons are clear
- [ ] Typography is readable
- [ ] Spacing is consistent
- [ ] Animations are smooth (no janky)
- [ ] No visual glitches

### User Experience ✅
- [ ] Forms are intuitive
- [ ] Buttons have clear labels
- [ ] Loading states are visible
- [ ] Error messages are helpful
- [ ] Success states are obvious
- [ ] Navigation is clear
- [ ] Logout is easily accessible

---

## Performance Testing

### Load Time ✅
```
Login Page:
- First load: < 1 second
- Check: Browser DevTools Network tab

Dashboard Page:
- Initial load: < 2 seconds
- Check: Browser DevTools Network tab
```

### Analysis Performance ✅
```
Small Folder (< 100 files):
- Expected time: < 1 second

Medium Folder (100-1000 files):
- Expected time: 1-3 seconds

Large Folder (1000+ files):
- Expected time: 3-10 seconds
```

### Responsive Performance ✅
- [ ] UI updates smoothly
- [ ] No lag when expanding subfolders
- [ ] No lag when scrolling tables
- [ ] Animations are 60fps (smooth)

---

## Security Testing

### Path Traversal Prevention ✅
```
Try these paths (all should fail):
✗ C:\Users\keshav s\..\Windows
✗ ../../Windows
✗ C:\Users\keshav s\../../Windows
✗ C:\Windows
✗ C:\ (unless whitelisted)

All should return: "Access denied"
```

### Token Security ✅
- [ ] Tokens are stored in localStorage
- [ ] Tokens expire after 24 hours
- [ ] Expired tokens show error on API call
- [ ] User must login again for new token
- [ ] Token is sent in Authorization header

### Input Validation ✅
- [ ] Special characters in username handled
- [ ] Long paths don't crash server
- [ ] Empty inputs are rejected
- [ ] Null/undefined values handled

### CORS ✅
- [ ] Cross-origin requests are handled
- [ ] Frontend can communicate with backend
- [ ] No CORS errors in console

---

## Browser Compatibility Testing

Test on these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if on Mac)

Expected:
- ✓ All features work
- ✓ Layout looks correct
- ✓ CSS is applied properly
- ✓ JavaScript runs without errors

---

## Console Testing

### Browser Console (F12)
- [ ] No console errors
- [ ] No console warnings
- [ ] No 404 errors for assets
- [ ] No XSS warnings

### Server Console
- [ ] Request logs appear
- [ ] No unhandled errors
- [ ] Response codes shown (200, 404, etc.)
- [ ] No security warnings

---

## API Testing (Advanced)

### Using Postman or curl:

**Login Endpoint:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "demo",
  "password": "demo123"
}

Expected Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

**Analyze Endpoint:**
```bash
POST http://localhost:5000/api/folders/analyze
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "folderPath": "C:\\Users\\keshav s\\Downloads"
}

Expected Response:
{
  "success": true,
  "data": {
    "path": "C:\\Users\\keshav s\\Downloads",
    "fileCount": 25,
    "folderCount": 5,
    "files": [...],
    "fileTypeSummary": {...},
    "subfolders": [...]
  }
}
```

---

## Final Verification Checklist

### Before Submission:

**Code Quality:**
- [ ] No console.log() debugging left in code
- [ ] Comments are helpful and clear
- [ ] Code is properly indented
- [ ] No unused variables
- [ ] No TODO comments without context

**Documentation:**
- [ ] README.md is comprehensive
- [ ] QUICK_START.md is clear
- [ ] FEATURES.md is complete
- [ ] Code comments are present
- [ ] API endpoints are documented

**Functionality:**
- [ ] All requirements are met
- [ ] All features work as described
- [ ] Error handling is robust
- [ ] No crashes or exceptions
- [ ] Performance is acceptable

**Security:**
- [ ] Path validation works
- [ ] JWT tokens are properly used
- [ ] No credentials exposed
- [ ] CORS is configured
- [ ] Inputs are validated

**UI/UX:**
- [ ] Design is professional
- [ ] Responsive on all sizes
- [ ] All interactive elements work
- [ ] Loading states are visible
- [ ] Error messages are helpful

---

## Known Limitations & Workarounds

### Synchronous File Scanning
**Limitation:** Large folders (50k+ files) may take time
**Workaround:** Analyze subfolder by subfolder

### Path Restrictions
**Limitation:** Only allowed directories can be analyzed
**Workaround:** Add more paths to ALLOWED_BASE_PATHS in backend

### Token Storage
**Limitation:** Token in localStorage (not secure for high-security apps)
**Workaround:** Use HttpOnly cookies in production

---

## Testing Timeline

**Total Testing Time: ~30 minutes**

1. Authentication (5 min)
2. Folder Analysis (8 min)
3. UI/UX (5 min)
4. Error Handling (5 min)
5. Performance (3 min)
6. Security (3 min)
7. Browser Testing (3 min)

---

**Testing Status:** Ready for Production ✅

All tests should pass before final submission to client or instructor.
