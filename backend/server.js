const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import database
const db = require('./config/database');

// Import routes
const flightsRoutes = require('./routes/flights');
const passengersRoutes = require('./routes/passengers');
const airlinesRoutes = require('./routes/airlines');
const aircraftRoutes = require('./routes/aircraft');
const gatesRoutes = require('./routes/gates');
const crewsRoutes = require('./routes/crews');
const bookingsRoutes = require('./routes/bookings');
const securityRoutes = require('./routes/security');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend - FIXED: Check if folder exists
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes - All routes must be defined AFTER middleware
app.use('/api/flights', flightsRoutes);
app.use('/api/passengers', passengersRoutes);
app.use('/api/airlines', airlinesRoutes);
app.use('/api/aircraft', aircraftRoutes);
app.use('/api/gates', gatesRoutes);
app.use('/api/crews', crewsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/stats', statsRoutes);

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
async function startServer() {
    try {
        // Initialize database pool
        await db.initializePool();
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📊 API available at http://localhost:${PORT}/api`);
            console.log(`🎨 Frontend available at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await db.closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing server...');
    await db.closePool();
    process.exit(0);
});

startServer();