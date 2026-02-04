# System Architecture & Data Flow

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend (HTML5 + CSS3 + Vanilla JavaScript)           │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Login Page (index.html)                           │ │   │
│  │  │  - Username/Password form                          │ │   │
│  │  │  - Form validation                                 │ │   │
│  │  │  - Token storage in localStorage                   │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Dashboard Page (dashboard.html)                   │ │   │
│  │  │  - Folder path input                               │ │   │
│  │  │  - Summary cards                                   │ │   │
│  │  │  - File type badges                                │ │   │
│  │  │  - File metadata table                             │ │   │
│  │  │  - Expandable subfolders                           │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Styling (styles.css)                              │ │   │
│  │  │  - CSS Grid & Flexbox                              │ │   │
│  │  │  - Responsive design                               │ │   │
│  │  │  - Gradients & animations                          │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  JavaScript Logic                                  │ │   │
│  │  │  - auth.js (Login logic, API calls)                │ │   │
│  │  │  - dashboard.js (Analysis, rendering)              │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (HTTP/HTTPS)
                         Fetch API Calls
┌─────────────────────────────────────────────────────────────────┐
│                  SERVER (Node.js + Express)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express Server (server.js - Port 5000)                 │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Middleware Stack                                  │ │   │
│  │  │  - CORS middleware                                 │ │   │
│  │  │  - Body parser middleware                          │ │   │
│  │  │  - JWT authentication middleware                   │ │   │
│  │  │  - Static file serving                             │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Routes & Controllers                              │ │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │
│  │  │  │  Authentication Routes (auth.js)             │ │ │   │
│  │  │  │  - POST /api/auth/login                       │ │ │   │
│  │  │  │  - POST /api/auth/verify                      │ │ │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │
│  │  │  │  Folder Routes (folders.js)                  │ │ │   │
│  │  │  │  - POST /api/folders/analyze (protected)     │ │ │   │
│  │  │  │  - GET /api/folders/allowed-paths (protected)│ │ │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Business Logic & Utilities                        │ │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │
│  │  │  │  Authentication (middleware/auth.js)         │ │ │   │
│  │  │  │  - JWT token generation                      │ │ │   │
│  │  │  │  - Token verification                        │ │ │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │
│  │  │  ┌──────────────────────────────────────────────┐ │ │   │
│  │  │  │  Folder Scanner (utils/folderScanner.js)     │ │ │   │
│  │  │  │  - Recursive directory scanning              │ │ │   │
│  │  │  │  - File metadata extraction                  │ │ │   │
│  │  │  │  - File type categorization                  │ │ │   │
│  │  │  │  - Path validation & sanitization            │ │ │   │
│  │  │  └──────────────────────────────────────────────┘ │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ (File System Access)
┌─────────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM (OS)                            │
│  - Allowed Base Directories                                      │
│  - Recursive folder scanning                                     │
│  - File metadata reading (size, date, etc.)                      │
│  - Permission validation                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

```
User Input:
  Username & Password
         ↓
   [Login Form]
         ↓
Fetch: POST /api/auth/login
  {username, password}
         ↓
Server: Validate credentials
         ↓
  (Valid?)
  /    \
Yes     No
 |       |
 ↓       ↓
JWT     Error
Gen.    Message
 |       |
 ↓       ↓
Token   Show Error
Return   (Retry)
 |
 ↓
Store in
localStorage
 |
 ↓
Redirect to
Dashboard
```

---

## 🔍 Folder Analysis Flow

```
User Input:
  Folder Path
       ↓
Validate Path
  (Not empty)
       ↓
GET /api/folders/analyze
  {folderPath}
  Header: Authorization: Bearer {token}
       ↓
Server Validation:
  1. Verify JWT token
  2. Validate path format
  3. Check if path is allowed
  4. Check if path exists
       ↓
   (All valid?)
   /    \
 Yes     No
  |      |
  ↓      ↓
Scan   Error
Folder Response
  |
  ↓
Recursive Analysis:
  - Count files
  - Extract metadata
  - Categorize types
  - Scan subfolders
  |
  ↓
Build Hierarchy:
  {
    path: ...,
    fileCount: ...,
    files: [...],
    fileTypeSummary: {...},
    subfolders: [
      {same structure}
    ]
  }
  |
  ↓
Return JSON Response
  |
  ↓
Display Results:
  - Summary cards
  - File type badges
  - File table
  - Subfolders
```

---

## 📊 Data Flow: Request-Response

### Authentication Request
```
CLIENT                          SERVER                    FILE SYSTEM
  |                              |                           |
  |-- POST /api/auth/login ---→  |                           |
  |   {username, password}        |                           |
  |                              |-- Check credentials --→ (hardcoded)
  |                              |-- Generate JWT token      |
  |                          ←-- JSON Response --            |
  |← {success, token}            |                           |
  |                              |                           |
  Store token in                 |                           |
  localStorage                   |                           |
```

### Folder Analysis Request
```
CLIENT                          SERVER                    FILE SYSTEM
  |                              |                           |
  |-- POST /api/folders/analyze-→|                           |
  |   {folderPath}               |                           |
  |   Headers: {token}           |                           |
  |                              |                           |
  |                          Verify JWT                      |
  |                          Validate path                   |
  |                          Check whitelist                 |
  |                              |                           |
  |                              |-- fs.readdirSync -----→   |
  |                              |← [files, dirs]            |
  |                              |                           |
  |                              |-- fs.statSync (each)--→   |
  |                              |← stats (size, time)       |
  |                              |                           |
  |                          Recursive scan                  |
  |                          Build hierarchy                 |
  |                              |                           |
  |                          ←-- JSON Response --            |
  |← {success, data: {}}         |                           |
  |                              |                           |
  Render results in UI           |                           |
  Show cards, tables, etc.       |                           |
```

---

## 🔐 Security & Validation Layers

```
Request → CORS Check
            ↓
        Body Parser
            ↓
        Route Handler
            ↓
        JWT Verification (for protected routes)
            ↓
        Input Validation
            ↓
        Path Sanitization
            ↓
        Whitelist Check
            ↓
        File System Operation
            ↓
        Response Generation
            ↓
        Client
```

---

## 📦 Module Dependencies

```
server.js
  ├── express (Web framework)
  ├── cors (Cross-origin)
  ├── body-parser (Request parsing)
  ├── routes/auth.js
  │   └── jsonwebtoken (JWT)
  ├── routes/folders.js
  │   ├── middleware/auth.js
  │   └── utils/folderScanner.js
  │       ├── fs (File system)
  │       └── path (Path utilities)
  └── middleware/auth.js
      └── jsonwebtoken

frontend/
  ├── index.html
  │   └── js/auth.js
  │       └── Fetch API
  ├── dashboard.html
  │   ├── js/dashboard.js
  │   │   └── Fetch API
  │   └── css/styles.css
  └── css/styles.css
```

---

## 🗂️ Database-Ready Architecture

Current: In-memory (demo users)
```
User Credentials
  ↓
VALID_USERS object
  ↓
Hardcoded values
```

Future: Database Integration
```
User Credentials
  ↓
POST /api/auth/login
  ↓
Query Database (users table)
  ↓
Hash comparison
  ↓
JWT Generation
  ↓
Response
```

---

## 🚀 Deployment Architecture

```
Development:
  localhost:5000
  ├── Frontend (http://localhost:5000)
  └── Backend (http://localhost:5000/api/*)

Production:
  ├── Frontend (CDN or static hosting)
  ├── Backend API (https://api.example.com)
  └── Database (if added)

Security in Production:
  ✅ HTTPS/TLS encryption
  ✅ Environment variables
  ✅ Helmet.js headers
  ✅ Rate limiting
  ✅ Logging/Monitoring
  ✅ Database integration
```

---

## 📈 Scalability Considerations

### Current Limitations:
- Single-server architecture
- Synchronous file operations
- In-memory authentication
- No database persistence

### Scaling Path:
1. **Horizontal**: Load balancer + multiple servers
2. **Database**: MySQL/MongoDB for user data
3. **Async Operations**: Queue system for large folder scans
4. **Caching**: Redis for frequently accessed data
5. **Microservices**: Separate file analysis service
6. **CDN**: Static file distribution

---

## 🧪 Testing Architecture

```
Unit Tests:
  ├── Authentication (JWT generation/validation)
  ├── Folder scanner (recursion, validation)
  └── Path sanitization

Integration Tests:
  ├── Auth flow (login → dashboard)
  ├── Analysis flow (input → output)
  └── Error handling

E2E Tests:
  ├── Full user journey
  ├── UI interaction
  └── API endpoints

Performance Tests:
  ├── Folder scanning time
  ├── Response times
  └── Memory usage
```

---

## 🎯 Component Interaction Diagram

```
Login Page
    ↓
    ├→ auth.js (form handling)
    ├→ Fetch: POST /login
    └→ localStorage.setItem('token')
       ↓
    Dashboard Page
       ↓
       ├→ Check token (redirect if missing)
       ├→ Display path suggestions
       ├→ Path input + Analyze button
       │
       ├→ dashboard.js (form handling)
       ├→ Fetch: POST /analyze
       │
       ├→ Server: Verify token
       ├→ Server: Validate path
       ├→ folderScanner.js (recursive scan)
       │  └→ fs module operations
       │
       ├→ Response: Hierarchical data
       │
       └→ dashboard.js (rendering)
          ├→ Update summary cards
          ├→ Render file type badges
          ├→ Render file table
          └→ Render accordion (subfolders)
```

---

## 🔄 State Management Flow

```
Client-Side State:
┌──────────────────────────┐
│   localStorage           │
├──────────────────────────┤
│ token: "eyJ..."          │
│ username: "demo"         │
└──────────────────────────┘
    ↓
┌──────────────────────────┐
│   DOM State              │
├──────────────────────────┤
│ Form inputs              │
│ Display sections         │
│ Accordion states         │
└──────────────────────────┘

Server-Side State:
┌──────────────────────────┐
│   Request Context        │
├──────────────────────────┤
│ req.user (from JWT)      │
│ req.body (input)         │
│ Authorization header     │
└──────────────────────────┘
    ↓
┌──────────────────────────┐
│   File System            │
├──────────────────────────┤
│ Folders & files          │
│ File metadata            │
│ Directory structure      │
└──────────────────────────┘
```

---

## 📊 Performance Optimization Paths

```
Current (Synchronous):
  Scan folder → Wait → Results → Display
  ├─ Fast for small folders (< 1000 files)
  └─ Slow for large folders (> 10k files)

Optimized (Async):
  Scan folder → Queue in background
  ├─ Progress updates via WebSocket
  ├─ Cancel operations
  └─ Background processing

Advanced (Distributed):
  ├─ Worker pool for parallel scanning
  ├─ Caching layer (Redis)
  ├─ Database for historical data
  └─ Message queue (Bull, RabbitMQ)
```

---

## 🎓 Architecture Highlights

✅ **Modular Design**: Separated concerns (routing, middleware, utilities)
✅ **RESTful API**: Standard HTTP methods and status codes
✅ **Middleware Pattern**: Clean, composable request processing
✅ **Error Handling**: Comprehensive error responses
✅ **Scalable Structure**: Ready for growth and new features
✅ **Security Layers**: Multiple validation checkpoints
✅ **Client-Server Separation**: Clear boundaries and contracts

---

**Version:** 1.0
**Last Updated:** February 2026
**Diagram Status:** Complete ✅
