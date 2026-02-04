# Folder Analysis Dashboard - Full Stack Application

A professional full-stack web application for analyzing folder structures with authentication, built with Node.js Express backend and vanilla JavaScript frontend.

## Features

✨ **Authentication System**
- JWT-based authentication
- Secure login page
- Session-based access control
- Demo credentials included

🔍 **Folder Analysis**
- Recursive folder scanning
- File and folder counting
- File metadata extraction (name, size, type, date modified)
- File type categorization
- Hierarchical subfolder analysis

📊 **Dashboard UI**
- Modern, responsive design
- Summary cards for quick statistics
- File type badges with counts
- Expandable accordion for subfolders
- Organized file listing with metadata
- Professional styling

🔒 **Security**
- Path validation and sanitization
- Restricted to allowed base directories
- No system path exposure
- Token-based authentication

## Project Structure

```
folder-analysis-project/
├── backend/
│   ├── server.js                 # Express server main file
│   ├── package.json              # Backend dependencies
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Authentication routes (login, verify)
│   │   └── folders.js            # Folder analysis routes
│   └── utils/
│       └── folderScanner.js      # Recursive folder scanning logic
└── frontend/
    ├── index.html                # Login page
    ├── dashboard.html            # Dashboard page
    ├── css/
    │   └── styles.css            # Professional styling
    └── js/
        ├── auth.js               # Login page logic
        └── dashboard.js          # Dashboard logic and API calls
```

## Getting Started

### Prerequisites

- **Node.js** (v14.0.0 or higher)
- **npm** (comes with Node.js)
- **Windows OS** (or update allowed paths in backend/routes/folders.js for other OS)

### Installation

1. **Clone or Download the Project**
   ```bash
   cd "c:\Users\keshav s\Desktop\itss intern"
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend** (No installation needed - uses vanilla JavaScript)

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   
   You should see:
   ```
   Server running on http://localhost:5000
   Login with user: demo | password: demo123
   ```

2. **Open the Application**
   - Open your browser and go to: `http://localhost:5000`
   - Login with credentials:
     - **Username:** `demo`
     - **Password:** `demo123`

### Demo Credentials

Two users are configured for testing:

| Username | Password   | Purpose |
|----------|-----------|---------|
| demo     | demo123   | Main demo account |
| user     | password123 | Alternative account |

## How to Use

### 1. Login Page
- Enter username and password
- Click "Login" to authenticate
- Demo credentials are provided on the page

### 2. Dashboard Page
After successful login:

1. **Enter a Folder Path**
   - Type the full path to analyze (e.g., `C:\Users\YourName\Documents\MyFolder`)
   - Or click on suggested paths in the list

2. **Click "Analyze"**
   - The application will scan the folder recursively
   - A loading spinner will appear during analysis

3. **View Results**
   - **Summary Cards**: Quick statistics (total files, folders, file types)
   - **File Type Summary**: Badges showing file counts by extension
   - **Files List**: Detailed table with file metadata
   - **Subfolders**: Expandable accordion showing nested folder analysis

### Navigation
- Click on folder names to expand/collapse subfolder details
- Click on suggested paths to quickly populate the path field
- Click "Logout" to return to login page

## Allowed Base Directories

For security, the application only allows analysis of these directories:

- `C:\Users\keshav s\Desktop`
- `C:\Users\keshav s\Documents`
- `C:\Users\keshav s\Downloads`

**To add more directories:**
1. Open `backend/routes/folders.js`
2. Add your path to the `ALLOWED_BASE_PATHS` array
3. Restart the backend server

## API Endpoints

### Authentication Endpoints

**POST `/api/auth/login`**
- Request body: `{ username: string, password: string }`
- Response: JWT token and user info

**POST `/api/auth/verify`**
- Header: `Authorization: Bearer <token>`
- Response: Token validity status

### Folder Analysis Endpoints

**POST `/api/folders/analyze`**
- Header: `Authorization: Bearer <token>`
- Request body: `{ folderPath: string }`
- Response: Hierarchical folder structure with metadata

**GET `/api/folders/allowed-paths`**
- Header: `Authorization: Bearer <token>`
- Response: List of allowed base directories

## Response Format

### Folder Analysis Response
```json
{
  "success": true,
  "data": {
    "path": "C:\\Users\\keshav s\\Desktop\\Project",
    "name": "Project",
    "fileCount": 5,
    "folderCount": 2,
    "files": [
      {
        "name": "readme.txt",
        "size": 1024,
        "sizeFormatted": "1 KB",
        "type": "txt",
        "lastModified": "2024-01-15T10:30:00.000Z",
        "lastModifiedDate": "01/15/2024"
      }
    ],
    "fileTypeSummary": {
      "txt": 2,
      "pdf": 1,
      "jpg": 3
    },
    "subfolders": [
      {
        "path": "C:\\Users\\keshav s\\Desktop\\Project\\subfolder",
        "name": "subfolder",
        "fileCount": 3,
        "folderCount": 0,
        "files": [...],
        "fileTypeSummary": {...},
        "subfolders": []
      }
    ]
  }
}
```

## Technical Stack

**Backend:**
- Node.js
- Express.js
- JWT (jsonwebtoken)
- CORS

**Frontend:**
- HTML5
- CSS3 (Modern Grid & Flexbox)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

## Features Implemented

### Backend Features ✅
- [x] Express server setup with CORS
- [x] JWT authentication and middleware
- [x] Recursive folder scanning with fs/path modules
- [x] File metadata extraction (name, size, date, type)
- [x] File type categorization
- [x] Input validation and path sanitization
- [x] Security restrictions for allowed directories
- [x] Clean JSON response structure
- [x] Error handling with meaningful messages

### Frontend Features ✅
- [x] Login page with form validation
- [x] Dashboard with folder analysis interface
- [x] Real-time path suggestions
- [x] Summary cards for statistics
- [x] File type badges and counts
- [x] Detailed file metadata table
- [x] Expandable accordion for subfolders
- [x] Responsive design (mobile, tablet, desktop)
- [x] Modern UI with gradient colors
- [x] Loading states and error messages
- [x] Token-based session management

## Code Quality

- ✅ Modular structure with separated concerns
- ✅ Comprehensive comments and documentation
- ✅ Error handling and validation
- ✅ Security best practices
- ✅ Responsive and accessible UI
- ✅ Professional styling with CSS variables
- ✅ Clean, readable code
- ✅ No external UI frameworks (except Express)

## Security Considerations

1. **Path Validation**: All paths are validated against allowed base directories
2. **JWT Tokens**: Secure token-based authentication with expiration
3. **Input Sanitization**: All user inputs are validated
4. **CORS**: Properly configured to prevent unauthorized requests
5. **No Public Exposure**: No system paths or file downloads exposed
6. **Error Messages**: Generic error messages to avoid information leakage

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```bash
cd backend
PORT=8000 npm start
```
Then access: `http://localhost:8000`

### Permission Denied Error
- Ensure you have read permissions on the folders you're analyzing
- Try analyzing a common directory first (like Downloads or Documents)

### Token Expired
- Simply log out and log in again
- Tokens expire after 24 hours

### "Access Denied" Error
- The path you entered is not in the allowed directories list
- Check the allowed paths and use one of them
- Or contact administrator to add your path to the whitelist

## Performance Notes

- Large folder structures (100k+ files) may take several seconds to scan
- The application runs all processing synchronously for simplicity
- For production, consider implementing progress tracking and async processing
- File system caching depends on OS

## Future Enhancements

- [ ] Async folder scanning for better performance
- [ ] Export analysis results as CSV/JSON
- [ ] Search and filter functionality
- [ ] File preview capability
- [ ] Folder comparison
- [ ] Real-time progress tracking
- [ ] Role-based access control
- [ ] Database integration
- [ ] Advanced analytics and charts
- [ ] Scheduling recurring scans

## License

This project is open source and available for educational and internship purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API endpoint documentation
3. Check browser console for frontend errors
4. Check terminal for backend errors

---

**Created for:** Internship Project
**Date:** February 2026
**Version:** 1.0.0
