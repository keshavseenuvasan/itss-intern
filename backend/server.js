const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const jarRoutes = require('./routes/jar');
const folderRoutes = require('./routes/folders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
// JAR analysis does not require authentication
app.use('/api/jar', jarRoutes);
// Folder analysis routes
app.use('/api/folders', folderRoutes);

// Default route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('JAR File Analyzer - Ready to analyze JAR files');
});
