# 📁 Folder Analysis Dashboard - Quick Start Guide

## Installation & Startup (3 Simple Steps)

### Option 1: Using the Batch File (Easiest) ⭐

1. **Double-click `START.bat`** in the project folder
2. The script will automatically:
   - Install dependencies
   - Start the server
3. **Open browser**: http://localhost:5000
4. **Login with**: `demo` / `demo123`

### Option 2: Manual Startup

1. **Open Command Prompt/PowerShell** in the project folder

2. **Navigate to backend and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open browser**: http://localhost:5000

5. **Login** with credentials:
   - Username: `demo`
   - Password: `demo123`

---

## Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN PAGE                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Username: [input]                                      │ │
│  │  Password: [input]                                      │ │
│  │  [Login Button]                                         │ │
│  │                                                          │ │
│  │  Demo Credentials:                                      │ │
│  │  demo / demo123                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Authenticate)
┌─────────────────────────────────────────────────────────────┐
│                   DASHBOARD PAGE                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Enter Folder Path: [C:\Users\...\Documents]             │ │
│  │ [Analyze Button]                                        │ │
│  │                                                          │ │
│  │ [📄 Total Files] [📂 Total Folders] [🏷️ File Types]   │ │
│  │                                                          │ │
│  │ File Type Summary:                                      │ │
│  │ [.txt: 5] [.pdf: 3] [.jpg: 2]                          │ │
│  │                                                          │ │
│  │ Files in Main Folder:                                   │ │
│  │ ┌────────────────────────────────────────────────────┐ │ │
│  │ │ Name | Type | Size | Modified Date               │ │ │
│  │ ├────────────────────────────────────────────────────┤ │ │
│  │ │ report.pdf | pdf | 2.5 MB | 01/15/2024         │ │ │
│  │ │ data.txt | txt | 15 KB | 01/14/2024            │ │ │
│  │ └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │ Subfolders:                                             │ │
│  │ ▶ 📁 Subfolder1 (10 files, 2 folders)                 │ │
│  │ ▶ 📁 Subfolder2 (5 files, 0 folders)                  │ │
│  │                                                          │ │
│  │ [Logout]                                               │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Features Overview

### 🔐 Authentication
- Simple JWT-based authentication
- Secure session management
- Demo credentials provided

### 🔍 Folder Analysis
- Analyze any folder on your system
- Get file counts and statistics
- See file types and sizes
- View last modified dates

### 📊 Dashboard
- Clean, modern UI design
- Summary cards with key metrics
- Sortable file list with metadata
- Expandable subfolder details
- File type categorization

---

## File Structure

```
itss intern/
├── START.bat                  ← Double-click to run
├── README.md                  ← Full documentation
├── QUICK_START.md             ← This file
│
├── backend/
│   ├── package.json           ← Dependencies list
│   ├── server.js              ← Main server file
│   ├── middleware/
│   │   └── auth.js            ← Authentication logic
│   ├── routes/
│   │   ├── auth.js            ← Login endpoints
│   │   └── folders.js         ← Analysis endpoints
│   └── utils/
│       └── folderScanner.js   ← Folder scanning logic
│
└── frontend/
    ├── index.html             ← Login page
    ├── dashboard.html         ← Main dashboard
    ├── css/
    │   └── styles.css         ← All styling
    └── js/
        ├── auth.js            ← Login logic
        └── dashboard.js       ← Dashboard logic
```

---

## Allowed Directories

The application can analyze these directories by default:

- ✅ `C:\Users\keshav s\Desktop`
- ✅ `C:\Users\keshav s\Documents`
- ✅ `C:\Users\keshav s\Downloads`

**To add more:**
1. Open `backend/routes/folders.js`
2. Add your path to `ALLOWED_BASE_PATHS` array
3. Save and restart the server

---

## Example Usage

### Step 1: Login
```
Username: demo
Password: demo123
Click: Login
```

### Step 2: Analyze a Folder
```
Path: C:\Users\keshav s\Downloads
Click: Analyze
```

### Step 3: View Results
- See total files and folders
- Check file type distribution
- Browse detailed file list
- Expand subfolders to see nested contents

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change port or kill process on that port |
| "npm not found" | Install Node.js from nodejs.org |
| Path access denied | Ensure read permissions on folder |
| 404 errors | Make sure server is running on port 5000 |
| Token expired | Log out and log in again |

---

## Key Technologies

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **File System**: Native Node.js fs & path modules

---

## Performance Tips

✨ **Fast Analysis**: Typical folder with 1,000 files analyzes in < 2 seconds

⚠️ **Large Folders**: Very large folders (50k+ files) may take longer

---

## Next Steps

After getting familiar with the application:

1. Try analyzing different folders
2. Explore the expandable subfolders
3. Review the file metadata details
4. Check out the full README.md for advanced features
5. Inspect the source code to understand the implementation

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Make sure Node.js is installed correctly
3. Try restarting the server
4. Check browser console (F12) for errors
5. Check terminal for backend errors

---

**Happy analyzing! 📊**
