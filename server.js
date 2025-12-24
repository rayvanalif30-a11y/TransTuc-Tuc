/* ===================================
   TucTuc Tel-U - Express Server
   Backend API for the application
   =================================== */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbHelpers } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// Middleware
// ===================================

// Enable CORS for frontend
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Root route - Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===================================
// Authentication Routes
// ===================================

// Register new user
app.post('/api/auth/register', (req, res) => {
    try {
        const { nama, nim, password, faculty } = req.body;

        // Validation
        if (!nama || !nim || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, NIM, dan password wajib diisi'
            });
        }

        // Check if user already exists
        const existingUser = dbHelpers.findUserByNim(nim);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'NIM sudah terdaftar'
            });
        }

        // Create user
        const userId = dbHelpers.createUser(nama, nim, password, faculty);

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            user: {
                id: userId,
                nama,
                nim,
                faculty: faculty || 'Fakultas Informatika'
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// Login user
app.post('/api/auth/login', (req, res) => {
    try {
        const { nim, password } = req.body;

        // Validation
        if (!nim || !password) {
            return res.status(400).json({
                success: false,
                message: 'NIM dan password wajib diisi'
            });
        }

        // Find user
        const user = dbHelpers.findUserByNim(nim);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'NIM tidak ditemukan'
            });
        }

        // Verify password
        const isValidPassword = dbHelpers.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Password salah'
            });
        }

        // Success - return user data (without password)
        res.json({
            success: true,
            message: 'Login berhasil',
            user: {
                id: user.id,
                nama: user.nama,
                nim: user.nim,
                faculty: user.faculty,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// ===================================
// Schedule Routes
// ===================================

// Get all schedules
app.get('/api/schedules', (req, res) => {
    try {
        const { halte } = req.query;

        let schedules;
        if (halte && halte !== 'all') {
            schedules = dbHelpers.getSchedulesByHalte(halte);
        } else {
            schedules = dbHelpers.getAllSchedules();
        }

        res.json({
            success: true,
            data: schedules
        });

    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// ===================================
// Vehicle Routes
// ===================================

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
    try {
        const vehicles = dbHelpers.getAllVehicles();

        res.json({
            success: true,
            data: vehicles
        });

    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// Update vehicle position (for simulation/admin)
app.put('/api/vehicles/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { lat, lng, current_halte } = req.body;

        dbHelpers.updateVehiclePosition(id, lat, lng, current_halte);

        res.json({
            success: true,
            message: 'Posisi kendaraan diperbarui'
        });

    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// ===================================
// Trip Routes
// ===================================

// Record a new trip
app.post('/api/trips', (req, res) => {
    try {
        const { userId, vehicle, halteFrom, halteTo } = req.body;

        // Validation
        if (!userId || !vehicle) {
            return res.status(400).json({
                success: false,
                message: 'Data tidak lengkap'
            });
        }

        const tripId = dbHelpers.createTrip(userId, vehicle, halteFrom, halteTo);

        res.status(201).json({
            success: true,
            message: 'Perjalanan tercatat',
            tripId
        });

    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// Get user's trip history
app.get('/api/trips/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const trips = dbHelpers.getTripsByUser(userId);

        res.json({
            success: true,
            data: trips
        });

    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// ===================================
// Admin Routes
// ===================================

// Get admin statistics
app.get('/api/admin/stats', (req, res) => {
    try {
        const stats = dbHelpers.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// ===================================
// Halte Routes
// ===================================

// Get all halte locations
app.get('/api/halte', (req, res) => {
    const halteLocations = [
        { id: 'gedung-telkom', name: 'Gedung Telkom', description: 'Titik awal - Area utama kampus', lat: -6.9733, lng: 107.6307 },
        { id: 'mb-telu', name: 'MB Tel-U', description: 'Gedung Manajemen Bisnis', lat: -6.9745, lng: 107.6285 },
        { id: 'sukabirus', name: 'Sukabirus', description: 'Jl. Sukabirus - Area kost mahasiswa', lat: -6.9768, lng: 107.6265 },
        { id: 'jalan-raya', name: 'Jalan Raya', description: 'Persimpangan jalan utama', lat: -6.9790, lng: 107.6295 },
        { id: 'yogya-sukapura', name: 'Yogya Sukapura', description: 'Dekat Supermarket Yogya', lat: -6.9772, lng: 107.6335 },
        { id: 'sukapura', name: 'Sukapura', description: 'Jl. Sukapura', lat: -6.9755, lng: 107.6355 },
        { id: 'gerbang-telu', name: 'Gerbang Tel-U', description: 'Kembali ke kampus - Akhir rute', lat: -6.9738, lng: 107.6330 }
    ];

    res.json({
        success: true,
        data: halteLocations
    });
});

// ===================================
// Error Handling
// ===================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server'
    });
});

// ===================================
// Start Server
// ===================================

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     🚌 TucTuc Tel-U Backend Server 🚌      ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  Server running on: http://localhost:${PORT}   ║`);
    console.log('║  Press Ctrl+C to stop                      ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
    console.log('📋 Available API Endpoints:');
    console.log('   POST /api/auth/register - Register user');
    console.log('   POST /api/auth/login    - Login user');
    console.log('   GET  /api/schedules     - Get schedules');
    console.log('   GET  /api/vehicles      - Get vehicles');
    console.log('   POST /api/trips         - Record trip');
    console.log('   GET  /api/trips/:userId - Get user trips');
    console.log('   GET  /api/admin/stats   - Get admin stats');
    console.log('   GET  /api/halte         - Get halte locations');
    console.log('');
});

module.exports = app;
