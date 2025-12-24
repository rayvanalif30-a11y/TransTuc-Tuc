# Source Code Aplikasi TucTuc Tel-U

Generated on 12/23/2025, 8:40:43 PM

## server.js

```js
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
app.use(cors());

// Parse JSON bodies
app.use(express.json());

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

```

## database.js

```js
/* ===================================
   TucTuc Tel-U - JSON File Database
   Simple file-based storage
   =================================== */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const DB_FILE = path.join(__dirname, 'data.json');

// Initialize database structure
const initDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            users: [
                {
                    id: 1,
                    nama: 'Admin TucTuc',
                    nim: 'ADMIN001',
                    password: bcrypt.hashSync('admin123', 10),
                    faculty: 'Administrator',
                    role: 'admin',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    nama: 'Demo User',
                    nim: '1234567890',
                    password: bcrypt.hashSync('password123', 10),
                    faculty: 'Fakultas Informatika',
                    role: 'mahasiswa',
                    created_at: new Date().toISOString()
                }
            ],
            schedules: [
                { id: 1, time: '06:00', period: 'AM', halte: 'Gedung Telkom', vehicle: 'TucTuc #01', status: 'available' },
                { id: 2, time: '06:15', period: 'AM', halte: 'Sukabirus', vehicle: 'TucTuc #02', status: 'available' },
                { id: 3, time: '06:30', period: 'AM', halte: 'Yogya Sukapura', vehicle: 'TucTuc #01', status: 'arriving' },
                { id: 4, time: '06:45', period: 'AM', halte: 'Gedung Telkom', vehicle: 'TucTuc #03', status: 'available' },
                { id: 5, time: '07:00', period: 'AM', halte: 'MB Tel-U', vehicle: 'TucTuc #01', status: 'full' },
                { id: 6, time: '07:15', period: 'AM', halte: 'Jalan Raya', vehicle: 'TucTuc #02', status: 'available' },
                { id: 7, time: '07:30', period: 'AM', halte: 'Sukapura', vehicle: 'TucTuc #03', status: 'available' },
                { id: 8, time: '07:45', period: 'AM', halte: 'Gedung Telkom', vehicle: 'TucTuc #01', status: 'arriving' },
                { id: 9, time: '08:00', period: 'AM', halte: 'Gerbang Tel-U', vehicle: 'TucTuc #02', status: 'available' },
                { id: 10, time: '08:15', period: 'AM', halte: 'Sukabirus', vehicle: 'TucTuc #01', status: 'available' }
            ],
            vehicles: [
                { id: 1, name: 'TucTuc #01', status: 'online', current_halte: 'Sukabirus', passengers: 8, lat: -6.9768, lng: 107.6265 },
                { id: 2, name: 'TucTuc #02', status: 'online', current_halte: 'Gedung Telkom', passengers: 12, lat: -6.9733, lng: 107.6307 },
                { id: 3, name: 'TucTuc #03', status: 'online', current_halte: 'Yogya Sukapura', passengers: 4, lat: -6.9772, lng: 107.6335 }
            ],
            trips: [
                { id: 1, user_id: 2, vehicle: 'TucTuc #02', halte_from: 'Gedung Telkom', halte_to: 'Sukabirus', trip_date: new Date().toISOString() },
                { id: 2, user_id: 2, vehicle: 'TucTuc #01', halte_from: 'Sukapura', halte_to: 'Gedung Telkom', trip_date: new Date().toISOString() },
                { id: 3, user_id: 2, vehicle: 'TucTuc #03', halte_from: 'MB Tel-U', halte_to: 'Yogya Sukapura', trip_date: new Date().toISOString() }
            ]
        };

        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Database initialized with sample data');
    }
};

// Read database
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        initDB();
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
};

// Write database
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Database helper functions
const dbHelpers = {
    // User functions
    findUserByNim: (nim) => {
        const db = readDB();
        return db.users.find(u => u.nim === nim);
    },

    createUser: (nama, nim, password, faculty = 'Fakultas Informatika') => {
        const db = readDB();
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = {
            id: db.users.length + 1,
            nama,
            nim,
            password: hashedPassword,
            faculty,
            role: 'mahasiswa',
            created_at: new Date().toISOString()
        };
        db.users.push(newUser);
        writeDB(db);
        return newUser.id;
    },

    verifyPassword: (password, hashedPassword) => {
        return bcrypt.compareSync(password, hashedPassword);
    },

    // Schedule functions
    getAllSchedules: () => {
        const db = readDB();
        return db.schedules;
    },

    getSchedulesByHalte: (halte) => {
        const db = readDB();
        return db.schedules.filter(s => s.halte === halte);
    },

    // Vehicle functions
    getAllVehicles: () => {
        const db = readDB();
        return db.vehicles;
    },

    updateVehiclePosition: (id, lat, lng, current_halte) => {
        const db = readDB();
        const vehicle = db.vehicles.find(v => v.id === parseInt(id));
        if (vehicle) {
            vehicle.lat = lat;
            vehicle.lng = lng;
            vehicle.current_halte = current_halte;
            writeDB(db);
        }
    },

    // Trip functions
    createTrip: (userId, vehicle, halteFrom, halteTo) => {
        const db = readDB();
        const newTrip = {
            id: db.trips.length + 1,
            user_id: userId,
            vehicle,
            halte_from: halteFrom,
            halte_to: halteTo,
            trip_date: new Date().toISOString()
        };
        db.trips.push(newTrip);
        writeDB(db);
        return newTrip.id;
    },

    getTripsByUser: (userId) => {
        const db = readDB();
        return db.trips.filter(t => t.user_id === parseInt(userId)).reverse();
    },

    // Admin stats
    getStats: () => {
        const db = readDB();
        return {
            totalUsers: db.users.filter(u => u.role === 'mahasiswa').length,
            totalTrips: db.trips.length,
            activeVehicles: db.vehicles.filter(v => v.status === 'online').length
        };
    }
};

// Initialize database on load
initDB();

module.exports = { dbHelpers };

```

## app.js

```js
/* ===================================
   TucTuc Tel-U - JavaScript Application
   =================================== */

// ===================================
// API Configuration
// ===================================

// Set to true when running with backend server
const USE_BACKEND = true;
const API_URL = 'http://localhost:3000/api';

// ===================================
// Configuration & Data
// ===================================

// Halte locations near Telkom University area (approximate coordinates)
const halteLocations = [
    {
        id: 'gedung-telkom',
        name: 'Gedung Telkom',
        description: 'Titik awal - Area utama kampus',
        lat: -6.9733,
        lng: 107.6307
    },
    {
        id: 'mb-telu',
        name: 'MB Tel-U',
        description: 'Gedung Manajemen Bisnis',
        lat: -6.9745,
        lng: 107.6285
    },
    {
        id: 'sukabirus',
        name: 'Sukabirus',
        description: 'Jl. Sukabirus - Area kost mahasiswa',
        lat: -6.9768,
        lng: 107.6265
    },
    {
        id: 'jalan-raya',
        name: 'Jalan Raya',
        description: 'Persimpangan jalan utama',
        lat: -6.9790,
        lng: 107.6295
    },
    {
        id: 'yogya-sukapura',
        name: 'Yogya Sukapura',
        description: 'Dekat Supermarket Yogya',
        lat: -6.9772,
        lng: 107.6335
    },
    {
        id: 'sukapura',
        name: 'Sukapura',
        description: 'Jl. Sukapura',
        lat: -6.9755,
        lng: 107.6355
    },
    {
        id: 'gerbang-telu',
        name: 'Gerbang Tel-U',
        description: 'Kembali ke kampus - Akhir rute',
        lat: -6.9738,
        lng: 107.6330
    }
];

// Route path (more detailed for smooth animation)
const routePath = [
    [-6.9733, 107.6307], // Gedung Telkom
    [-6.9738, 107.6295],
    [-6.9745, 107.6285], // MB Tel-U
    [-6.9755, 107.6270],
    [-6.9768, 107.6265], // Sukabirus
    [-6.9780, 107.6268],
    [-6.9790, 107.6280],
    [-6.9790, 107.6295], // Jalan Raya
    [-6.9785, 107.6310],
    [-6.9778, 107.6325],
    [-6.9772, 107.6335], // Yogya Sukapura
    [-6.9762, 107.6350],
    [-6.9755, 107.6355], // Sukapura
    [-6.9748, 107.6348],
    [-6.9742, 107.6338],
    [-6.9738, 107.6330], // Gerbang Tel-U
    [-6.9735, 107.6318],
    [-6.9733, 107.6307]  // Back to Gedung Telkom
];

// Schedule data
const scheduleData = [
    { time: '06:00', period: 'AM', halte: 'Gedung Telkom', vehicle: 'TucTuc #01', status: 'available' },
    { time: '06:15', period: 'AM', halte: 'Sukabirus', vehicle: 'TucTuc #02', status: 'available' },
    { time: '06:30', period: 'AM', halte: 'Yogya Sukapura', vehicle: 'TucTuc #01', status: 'arriving' },
    { time: '06:45', period: 'AM', halte: 'Gedung Telkom', vehicle: 'TucTuc #03', status: 'available' },
    { time: '07:00', period: 'AM', halte: 'MB Tel-U', vehicle: 'TucTuc #01', status: 'full' },
    { time: '07:15', period: 'AM', halte: 'Jalan Raya', vehicle: 'TucTuc #02', status: 'available' },
    { time: '07:30', period: 'AM', halte: 'Sukapura', vehicle: 'TucTuc #03', status: 'available' },
    { time: '07:45', period: 'AM', halte: 'Gedung Telkom', vehicle: 'TucTuc #01', status: 'arriving' },
    { time: '08:00', period: 'AM', halte: 'Gerbang Tel-U', vehicle: 'TucTuc #02', status: 'available' },
    { time: '08:15', period: 'AM', halte: 'Sukabirus', vehicle: 'TucTuc #01', status: 'available' }
];

// History data
const historyData = [
    { date: '21 Des 2024, 14:30', vehicle: 'TucTuc #02', from: 'Gedung Telkom', to: 'Sukabirus' },
    { date: '21 Des 2024, 08:15', vehicle: 'TucTuc #01', from: 'Sukapura', to: 'Gedung Telkom' },
    { date: '20 Des 2024, 16:45', vehicle: 'TucTuc #03', from: 'MB Tel-U', to: 'Yogya Sukapura' },
    { date: '20 Des 2024, 07:30', vehicle: 'TucTuc #01', from: 'Gerbang Tel-U', to: 'Gedung Telkom' },
    { date: '19 Des 2024, 13:00', vehicle: 'TucTuc #02', from: 'Sukabirus', to: 'Jalan Raya' }
];

// Passengers data (for admin)
const passengersData = [
    { name: 'Ahmad Rizky', nim: '1234567890', location: 'TucTuc #01 - Sukabirus' },
    { name: 'Siti Nurhaliza', nim: '1234567891', location: 'TucTuc #01 - Sukabirus' },
    { name: 'Budi Santoso', nim: '1234567892', location: 'TucTuc #02 - Gedung Telkom' },
    { name: 'Dewi Lestari', nim: '1234567893', location: 'TucTuc #02 - Gedung Telkom' },
    { name: 'Eko Prasetyo', nim: '1234567894', location: 'TucTuc #03 - Yogya Sukapura' }
];

// Admin schedules
const adminSchedules = [
    { timeRange: '06:00 - 09:00', halte: 'Semua Halte', status: 'Aktif' },
    { timeRange: '09:00 - 12:00', halte: 'Semua Halte', status: 'Aktif' },
    { timeRange: '12:00 - 15:00', halte: 'Semua Halte', status: 'Aktif' },
    { timeRange: '15:00 - 18:00', halte: 'Semua Halte', status: 'Aktif' },
    { timeRange: '18:00 - 21:00', halte: 'Semua Halte', status: 'Aktif' }
];

// ===================================
// State Management
// ===================================

let currentUser = null;
let isAdmin = false;
let map = null;
let tuctucMarker = null;
let currentRouteIndex = 0;
let animationInterval = null;

// ===================================
// Initialization
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Show splash screen for 2.5 seconds
    setTimeout(() => {
        document.getElementById('splash-screen').classList.remove('active');
        document.getElementById('login-screen').classList.add('active');
    }, 2500);

    // Setup auth forms
    document.getElementById('signin-form').addEventListener('submit', handleSignIn);
    document.getElementById('signup-form').addEventListener('submit', handleSignUp);

    // Generate schedule list
    generateScheduleList();
    generateHistoryList();
    generateAdminScheduleList();
    generatePassengersList();
});

// ===================================
// Authentication
// ===================================

// Switch between Sign In and Sign Up tabs
function switchAuthTab(tab) {
    const signinTab = document.getElementById('signin-tab');
    const signupTab = document.getElementById('signup-tab');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    if (tab === 'signin') {
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        signinForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        signupTab.classList.add('active');
        signinTab.classList.remove('active');
        signupForm.classList.add('active');
        signinForm.classList.remove('active');
    }
}

// Handle Sign In
async function handleSignIn(e) {
    e.preventDefault();

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (!email || !password) {
        showToast('Harap isi semua field!');
        return;
    }

    if (USE_BACKEND) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nim: email, password })
            });

            const data = await response.json();

            if (data.success) {
                currentUser = {
                    id: data.user.id,
                    name: data.user.nama,
                    nim: data.user.nim,
                    faculty: data.user.faculty,
                    role: data.user.role
                };
                loginSuccess();
            } else {
                showToast('Email atau password salah!');
            }
        } catch (error) {
            console.error('API Error:', error);
            showToast('Server tidak tersedia');
        }
    } else {
        // Local mode - allow any login
        currentUser = { name: email.split('@')[0], nim: email, faculty: 'Fakultas Informatika' };
        loginSuccess();
    }
}

// Handle Sign Up
async function handleSignUp(e) {
    e.preventDefault();

    const nama = document.getElementById('signup-nama').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (!nama || !email || !password || !confirm) {
        showToast('Harap isi semua field!');
        return;
    }

    if (password !== confirm) {
        showToast('Password tidak sama!');
        return;
    }

    if (password.length < 6) {
        showToast('Password minimal 6 karakter!');
        return;
    }

    if (USE_BACKEND) {
        try {
            // Check if account already exists
            const checkResponse = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nim: email, password })
            });

            const checkData = await checkResponse.json();

            if (checkData.success) {
                // Account exists - tell user to sign in
                showToast('Akun sudah terdaftar! Silakan Sign In.');
                switchAuthTab('signin');
                document.getElementById('signin-email').value = email;
                return;
            }

            // Register new account
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama, nim: email, password })
            });

            const data = await response.json();

            if (data.success) {
                currentUser = {
                    id: data.user.id,
                    name: nama,
                    nim: email,
                    faculty: data.user.faculty
                };
                showToast('Registrasi berhasil!');
                loginSuccess();
            } else {
                if (data.message && data.message.includes('terdaftar')) {
                    showToast('Email sudah terdaftar! Silakan Sign In.');
                    switchAuthTab('signin');
                    document.getElementById('signin-email').value = email;
                } else {
                    showToast(data.message || 'Registrasi gagal');
                }
            }
        } catch (error) {
            console.error('API Error:', error);
            showToast('Server tidak tersedia');
        }
    } else {
        // Local mode
        currentUser = { name: nama, nim: email, faculty: 'Fakultas Informatika' };
        showToast('Registrasi berhasil!');
        loginSuccess();
    }
}

function loginSuccess() {
    // Update UI with user info
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-nim').textContent = 'Email: ' + currentUser.nim;
    document.getElementById('card-name').textContent = currentUser.name;
    document.getElementById('card-nim').textContent = currentUser.nim;

    // Show main screen
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');

    // Initialize map after screen is visible
    setTimeout(() => {
        initMap();
        startTucTucAnimation();
    }, 300);

    // Load data from API if backend is enabled
    if (USE_BACKEND) {
        loadSchedulesFromAPI();
        loadHistoryFromAPI();
    }

    showToast('Selamat datang, ' + currentUser.name + '!');
}

function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function showAdminLogin() {
    isAdmin = true;
    currentUser = {
        name: 'Admin TucTuc',
        nim: 'ADMIN001',
        role: 'admin'
    };

    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('admin-screen').classList.add('active');

    showToast('Login sebagai Admin berhasil!');
}

function logout() {
    currentUser = null;
    isAdmin = false;

    // Stop animation
    if (animationInterval) {
        clearInterval(animationInterval);
    }

    // Hide all screens and pages
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show login screen
    document.getElementById('login-screen').classList.add('active');

    // Reset form
    document.getElementById('login-form').reset();

    showToast('Anda telah keluar');
}

function extractNameFromNIM(nim) {
    // For demo, generate a name based on input
    const names = ['Mahasiswa Tel-U', 'Ahmad Rizky', 'Siti Nurhaliza', 'Budi Santoso'];
    if (nim.toLowerCase().includes('admin')) {
        return 'Admin TucTuc';
    }
    return names[Math.floor(Math.random() * names.length)];
}

function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ===================================
// Map Functions
// ===================================

function initMap() {
    if (map) return; // Already initialized

    // Create map centered on Telkom University
    map = L.map('map', {
        center: [-6.9755, 107.6310],
        zoom: 16,
        zoomControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({
        position: 'bottomleft'
    }).addTo(map);

    // Draw route
    const routeLine = L.polyline(routePath, {
        color: '#e31837',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);

    // Add halte markers
    halteLocations.forEach(halte => {
        const halteIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="halte-marker">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
                </svg>
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        L.marker([halte.lat, halte.lng], { icon: halteIcon })
            .addTo(map)
            .bindPopup(`
                <div class="popup-title">${halte.name}</div>
                <div class="popup-subtitle">${halte.description}</div>
            `);
    });

    // Add TucTuc marker
    const tuctucIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="tuctuc-marker">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
            </svg>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    tuctucMarker = L.marker(routePath[0], { icon: tuctucIcon })
        .addTo(map)
        .bindPopup('<div class="popup-title">TucTuc #01</div><div class="popup-subtitle">8 Penumpang</div>');
}

function startTucTucAnimation() {
    if (animationInterval) return;

    animationInterval = setInterval(() => {
        currentRouteIndex = (currentRouteIndex + 1) % routePath.length;

        if (tuctucMarker) {
            tuctucMarker.setLatLng(routePath[currentRouteIndex]);
        }

        // Update ETA based on position
        updateETA();
    }, 2000); // Move every 2 seconds
}

function updateETA() {
    const etaMinutes = Math.floor(Math.random() * 5) + 1;
    document.getElementById('eta-time').textContent = etaMinutes + ' menit';

    // Find nearest halte
    const nearestHalte = halteLocations[currentRouteIndex % halteLocations.length];
    document.getElementById('nearest-halte').textContent = nearestHalte.name;
}

function centerMap() {
    if (map) {
        map.setView([-6.9755, 107.6310], 16);
    }
}

// ===================================
// Navigation
// ===================================

function navigateTo(page) {
    const pageElement = document.getElementById(page + '-page');
    if (pageElement) {
        pageElement.classList.add('active');
    }
}

function goBack() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
}

function switchTab(tab) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === tab) {
            item.classList.add('active');
        }
    });

    // Navigate to page if needed
    if (tab !== 'home') {
        navigateTo(tab);
    } else {
        goBack();
    }
}

// ===================================
// Schedule Functions
// ===================================

function generateScheduleList() {
    const container = document.getElementById('schedule-list');
    container.innerHTML = scheduleData.map(item => `
        <div class="schedule-item" data-halte="${item.halte.toLowerCase().replace(/\s+/g, '-')}">
            <div class="schedule-time">
                <span class="time">${item.time}</span>
                <span class="period">${item.period}</span>
            </div>
            <div class="schedule-divider"></div>
            <div class="schedule-info">
                <div class="halte-name">${item.halte}</div>
                <div class="vehicle-id">${item.vehicle}</div>
            </div>
            <span class="schedule-status ${item.status}">${getStatusText(item.status)}</span>
        </div>
    `).join('');
}

function getStatusText(status) {
    const texts = {
        'available': 'Tersedia',
        'full': 'Penuh',
        'arriving': 'Tiba'
    };
    return texts[status] || status;
}

function filterSchedule() {
    const filter = document.getElementById('halte-filter').value;
    const items = document.querySelectorAll('.schedule-item');

    items.forEach(item => {
        if (filter === 'all' || item.dataset.halte === filter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// ===================================
// History Functions
// ===================================

function generateHistoryList() {
    const container = document.getElementById('history-list');
    container.innerHTML = historyData.map(item => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-date">${item.date}</span>
                <span class="history-vehicle">${item.vehicle}</span>
            </div>
            <div class="history-route">
                <span class="from">${item.from}</span>
                <span class="arrow">→</span>
                <span class="to">${item.to}</span>
            </div>
        </div>
    `).join('');
}

// ===================================
// Tap Card Functions
// ===================================



// ===================================
// Admin Functions
// ===================================

function switchAdminTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(t => {
        t.classList.remove('active');
        if (t.dataset.tab === tab) {
            t.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(c => {
        c.classList.remove('active');
    });
    document.getElementById(tab + '-tab').classList.add('active');
}

function generateAdminScheduleList() {
    const container = document.getElementById('admin-schedule-list');
    container.innerHTML = adminSchedules.map(item => `
        <div class="admin-schedule-item">
            <div class="schedule-details">
                <span class="time-range">${item.timeRange}</span>
                <span class="halte">${item.halte}</span>
            </div>
            <span class="schedule-status available">${item.status}</span>
        </div>
    `).join('');
}

function generatePassengersList() {
    const container = document.getElementById('passengers-list');
    container.innerHTML = passengersData.map(item => `
        <div class="passenger-item">
            <div class="passenger-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <div class="passenger-info">
                <span class="name">${item.name}</span>
                <span class="nim">NIM: ${item.nim}</span>
            </div>
            <span class="passenger-location">${item.location}</span>
        </div>
    `).join('');
}

function trackVehicle(id) {
    showToast('Melacak TucTuc #0' + id + '...');
}

function addSchedule() {
    showToast('Fitur tambah jadwal (demo)');
}

// ===================================
// Notification Functions
// ===================================

function showNotifications() {
    document.getElementById('notification-panel').classList.add('active');
}

function closeNotifications() {
    document.getElementById('notification-panel').classList.remove('active');
}

// ===================================
// Toast Notification
// ===================================

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// API Data Loading Functions
// ===================================

async function loadSchedulesFromAPI() {
    try {
        const response = await fetch(`${API_URL}/schedules`);
        const data = await response.json();

        if (data.success && data.data) {
            // Update schedule list with API data
            const container = document.getElementById('schedule-list');
            container.innerHTML = data.data.map(item => `
                <div class="schedule-item" data-halte="${item.halte.toLowerCase().replace(/\s+/g, '-')}">
                    <div class="schedule-time">
                        <span class="time">${item.time}</span>
                        <span class="period">${item.period}</span>
                    </div>
                    <div class="schedule-divider"></div>
                    <div class="schedule-info">
                        <div class="halte-name">${item.halte}</div>
                        <div class="vehicle-id">${item.vehicle}</div>
                    </div>
                    <span class="schedule-status ${item.status}">${getStatusText(item.status)}</span>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Failed to load schedules from API:', error);
    }
}

async function loadHistoryFromAPI() {
    if (!currentUser || !currentUser.id) return;

    try {
        const response = await fetch(`${API_URL}/trips/${currentUser.id}`);
        const data = await response.json();

        if (data.success && data.data) {
            const container = document.getElementById('history-list');
            if (data.data.length > 0) {
                container.innerHTML = data.data.map(item => `
                    <div class="history-item">
                        <div class="history-header">
                            <span class="history-date">${new Date(item.trip_date).toLocaleString('id-ID')}</span>
                            <span class="history-vehicle">${item.vehicle}</span>
                        </div>
                        <div class="history-route">
                            <span class="from">${item.halte_from || 'N/A'}</span>
                            <span class="arrow">→</span>
                            <span class="to">${item.halte_to || 'N/A'}</span>
                        </div>
                    </div>
                `).join('');
            }

            // Update trip count
            document.getElementById('trip-count').textContent = data.data.length;
        }
    } catch (error) {
        console.error('Failed to load history from API:', error);
    }
}

async function recordTrip(vehicle, halteFrom, halteTo) {
    if (!USE_BACKEND || !currentUser || !currentUser.id) return;

    try {
        const response = await fetch(`${API_URL}/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                vehicle: vehicle,
                halteFrom: halteFrom,
                halteTo: halteTo
            })
        });

        const data = await response.json();
        if (data.success) {
            console.log('Trip recorded successfully');
            loadHistoryFromAPI(); // Refresh history
        }
    } catch (error) {
        console.error('Failed to record trip:', error);
    }
}

async function loadAdminStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`);
        const data = await response.json();

        if (data.success && data.data) {
            document.getElementById('admin-active-users').textContent = data.data.totalUsers;
            document.getElementById('admin-today-trips').textContent = data.data.totalTrips;
            document.getElementById('admin-active-vehicles').textContent = data.data.activeVehicles;
        }
    } catch (error) {
        console.error('Failed to load admin stats:', error);
    }
}

// ===================================
// Utility Functions
// ===================================

// Update stats for admin (use API if available)
setInterval(() => {
    if (document.getElementById('admin-screen').classList.contains('active')) {
        if (USE_BACKEND) {
            loadAdminStats();
        } else {
            document.getElementById('admin-active-users').textContent = Math.floor(Math.random() * 20) + 15;
            document.getElementById('admin-today-trips').textContent = Math.floor(Math.random() * 50) + 140;
        }
    }
}, 5000);

// Keep updating time-based elements
setInterval(() => {
    const tripCount = document.getElementById('trip-count');
    if (tripCount && !USE_BACKEND) {
        // Only random update in offline mode
        if (Math.random() > 0.9) {
            tripCount.textContent = parseInt(tripCount.textContent) + 1;
        }
    }
}, 10000);

```

## styles.css

```css
/* ===================================
   TucTuc Tel-U - CSS Styles
   =================================== */

/* CSS Variables */
:root {
    /* Colors */
    --primary: #e31837;
    --primary-dark: #b01030;
    --primary-light: #ff4d6a;
    --secondary: #1a1a2e;
    --accent: #ffd700;

    /* Neutrals */
    --white: #ffffff;
    --gray-50: #f8f9fa;
    --gray-100: #f1f3f5;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #868e96;
    --gray-700: #495057;
    --gray-800: #343a40;
    --gray-900: #212529;
    --black: #000000;

    /* Semantic */
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    --info: #3b82f6;

    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
    --space-2xl: 48px;

    /* Border Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.15);

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;

    /* Font */
    --font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Reset */
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
}

body {
    font-family: var(--font-family);
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-md);
    overflow-x: hidden;
}

/* App Container - Mobile Simulation */
.app-container {
    width: 100%;
    max-width: 430px;
    height: 100vh;
    max-height: 932px;
    background: var(--gray-50);
    border-radius: var(--radius-xl);
    overflow: hidden;
    position: relative;
    box-shadow: var(--shadow-xl), 0 0 60px rgba(227, 24, 55, 0.2);
}

@media (max-width: 480px) {
    body {
        padding: 0;
    }

    .app-container {
        max-width: 100%;
        height: 100vh;
        max-height: none;
        border-radius: 0;
    }
}

/* Screens */
.screen {
    display: none;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: var(--gray-50);
    overflow-y: auto;
}

.screen.active {
    display: flex;
    flex-direction: column;
}

/* Pages (sub-pages) */
.page {
    display: none;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: var(--gray-50);
    z-index: 100;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
}

.page.active {
    display: flex;
    flex-direction: column;
    transform: translateX(0);
}

/* ===================================
   Splash Screen
   =================================== */
#splash-screen {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    justify-content: center;
    align-items: center;
}

.splash-content {
    text-align: center;
    animation: fadeInUp 0.8s ease;
}

.logo-container {
    margin-bottom: var(--space-xl);
}

.logo-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto var(--space-lg);
    animation: pulse 2s infinite;
}

.logo-icon svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.3));
}

.app-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--white);
    letter-spacing: -0.5px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.app-tagline {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.85);
    margin-top: var(--space-sm);
    font-weight: 400;
}

.splash-loader {
    width: 200px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    margin: var(--space-xl) auto 0;
    overflow: hidden;
}

.loader-bar {
    width: 0%;
    height: 100%;
    background: var(--white);
    border-radius: var(--radius-full);
    animation: loading 2s ease forwards;
}

/* ===================================
   Login Screen
   =================================== */
#login-screen {
    padding: var(--space-xl);
    justify-content: center;
    background: linear-gradient(180deg, var(--white) 0%, var(--gray-100) 100%);
}

.login-header {
    text-align: center;
    margin-bottom: var(--space-xl);
}

.login-logo {
    width: 80px;
    height: 80px;
    margin: 0 auto var(--space-lg);
}

.login-logo svg {
    width: 100%;
    height: 100%;
}

.login-header h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: var(--space-xs);
}

.login-header p {
    color: var(--gray-600);
    font-size: 0.9rem;
}

/* Auth Tabs */
.auth-tabs {
    display: flex;
    background: var(--gray-200);
    border-radius: var(--radius-md);
    padding: 4px;
    margin-bottom: var(--space-lg);
}

.auth-tab {
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-weight: 500;
    font-family: var(--font-family);
    color: var(--gray-600);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.auth-tab.active {
    background: var(--white);
    color: var(--primary);
    box-shadow: var(--shadow-sm);
}

.auth-tab:hover:not(.active) {
    color: var(--gray-800);
}

/* Auth Forms */
.auth-form {
    display: none;
}

.auth-form.active {
    display: block;
}

.login-form {
    width: 100%;
}

.input-group {
    margin-bottom: var(--space-lg);
}

.input-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--gray-700);
    margin-bottom: var(--space-sm);
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: var(--space-md);
    width: 20px;
    height: 20px;
    color: var(--gray-400);
    pointer-events: none;
}

.input-wrapper input {
    width: 100%;
    padding: var(--space-md);
    padding-left: 48px;
    font-size: 1rem;
    font-family: var(--font-family);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    background: var(--white);
    transition: all var(--transition-fast);
}

.input-wrapper input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(227, 24, 55, 0.1);
}

.input-wrapper input::placeholder {
    color: var(--gray-400);
}

.toggle-password {
    position: absolute;
    right: var(--space-md);
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs);
}

.toggle-password svg {
    width: 20px;
    height: 20px;
    color: var(--gray-400);
}

.remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--gray-600);
}

.checkbox-wrapper input {
    display: none;
}

.checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid var(--gray-300);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.checkbox-wrapper input:checked+.checkmark {
    background: var(--primary);
    border-color: var(--primary);
}

.checkbox-wrapper input:checked+.checkmark::after {
    content: '✓';
    color: var(--white);
    font-size: 12px;
    font-weight: 600;
}

.forgot-link {
    color: var(--primary);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
}

.btn-primary {
    width: 100%;
    padding: var(--space-md);
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: var(--white);
    border: none;
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 600;
    font-family: var(--font-family);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    transition: all var(--transition-fast);
    box-shadow: 0 4px 15px rgba(227, 24, 55, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(227, 24, 55, 0.4);
}

.btn-primary:active {
    transform: translateY(0);
}

.btn-primary svg {
    width: 20px;
    height: 20px;
}

.login-footer {
    text-align: center;
    margin-top: var(--space-xl);
}

.login-footer p {
    font-size: 0.8rem;
    color: var(--gray-500);
    margin-bottom: var(--space-xs);
}

.login-footer a {
    color: var(--primary);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: 500;
}

.admin-login-link {
    text-align: center;
    margin-top: var(--space-md);
}

.btn-text {
    background: none;
    border: none;
    color: var(--gray-500);
    font-size: 0.85rem;
    font-family: var(--font-family);
    cursor: pointer;
    text-decoration: underline;
}

.btn-text:hover {
    color: var(--primary);
}

/* ===================================
   Main Screen
   =================================== */
#main-screen {
    background: var(--gray-100);
    padding-bottom: 80px;
}

.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    background: var(--white);
    border-bottom: 1px solid var(--gray-200);
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.user-avatar {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform var(--transition-fast);
}

.user-avatar:hover {
    transform: scale(1.05);
}

.user-avatar svg {
    width: 24px;
    height: 24px;
    color: var(--white);
}

.header-greeting {
    display: flex;
    flex-direction: column;
}

.greeting-text {
    font-size: 0.75rem;
    color: var(--gray-500);
}

.user-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-900);
}

.header-right {
    display: flex;
    align-items: center;
}

.notification-btn {
    width: 44px;
    height: 44px;
    background: var(--gray-100);
    border: none;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all var(--transition-fast);
}

.notification-btn:hover {
    background: var(--gray-200);
}

.notification-btn svg {
    width: 22px;
    height: 22px;
    color: var(--gray-700);
}

.notification-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
    background: var(--primary);
    color: var(--white);
    font-size: 0.65rem;
    font-weight: 600;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Status Card */
.status-card {
    margin: var(--space-md) var(--space-lg);
    padding: var(--space-md);
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: var(--radius-lg);
    color: var(--white);
    box-shadow: var(--shadow-lg);
}

.status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
}

.tuctuc-status {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: 0.85rem;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--gray-400);
}

.status-dot.active {
    background: #4ade80;
    box-shadow: 0 0 10px #4ade80;
    animation: pulse-dot 2s infinite;
}

.next-arrival {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.next-arrival .label {
    font-size: 0.75rem;
    opacity: 0.8;
}

.next-arrival .time {
    font-size: 1rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
}

.status-route {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding-top: var(--space-sm);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.route-label {
    font-size: 0.75rem;
    opacity: 0.8;
}

.route-name {
    font-weight: 600;
}

/* Map Section */
.map-section {
    position: relative;
    margin: 0 var(--space-lg);
    height: 280px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
}

#map {
    width: 100%;
    height: 100%;
    z-index: 1;
}

.map-overlay {
    position: absolute;
    bottom: var(--space-md);
    right: var(--space-md);
    z-index: 10;
}

.locate-btn {
    width: 44px;
    height: 44px;
    background: var(--white);
    border: none;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-fast);
}

.locate-btn:hover {
    background: var(--gray-100);
    transform: scale(1.05);
}

.locate-btn svg {
    width: 22px;
    height: 22px;
    color: var(--primary);
}

.map-legend {
    position: absolute;
    top: var(--space-md);
    left: var(--space-md);
    background: var(--white);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-sm);
    display: flex;
    gap: var(--space-md);
    font-size: 0.75rem;
    box-shadow: var(--shadow-sm);
    z-index: 10;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.legend-icon {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
}

.legend-icon.halte {
    background: var(--info);
}

.legend-icon.tuctuc {
    background: var(--primary);
}

/* Quick Actions */
.quick-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-md);
    padding: var(--space-lg);
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    background: var(--white);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.action-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(227, 24, 55, 0.1) 0%, rgba(227, 24, 55, 0.05) 100%);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-icon svg {
    width: 22px;
    height: 22px;
    color: var(--primary);
}

.action-btn span {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--gray-700);
}

/* Bottom Navigation */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: var(--white);
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: var(--space-sm) 0;
    padding-bottom: max(var(--space-sm), env(safe-area-inset-bottom));
    border-top: 1px solid var(--gray-200);
    z-index: 50;
}

@media (max-width: 480px) {
    .bottom-nav {
        max-width: 100%;
    }
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--space-sm);
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.nav-item svg {
    width: 24px;
    height: 24px;
    color: var(--gray-400);
    transition: color var(--transition-fast);
}

.nav-item span {
    font-size: 0.65rem;
    color: var(--gray-400);
    font-family: var(--font-family);
    transition: color var(--transition-fast);
}

.nav-item.active svg,
.nav-item.active span {
    color: var(--primary);
}

.nav-item.tap-btn {
    position: relative;
    bottom: 10px;
}

.tap-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(227, 24, 55, 0.4);
}

.tap-icon svg {
    width: 26px;
    height: 26px;
    color: var(--white);
}

/* ===================================
   Page Headers
   =================================== */
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    background: var(--white);
    border-bottom: 1px solid var(--gray-200);
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-btn {
    width: 40px;
    height: 40px;
    background: var(--gray-100);
    border: none;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.back-btn:hover {
    background: var(--gray-200);
}

.back-btn svg {
    width: 20px;
    height: 20px;
    color: var(--gray-700);
}

.page-header h1 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--gray-900);
}

.header-spacer {
    width: 40px;
}

.page-content {
    flex: 1;
    padding: var(--space-lg);
    overflow-y: auto;
}

/* ===================================
   Schedule Page
   =================================== */
.schedule-filter {
    margin-bottom: var(--space-lg);
}

.schedule-filter select {
    width: 100%;
    padding: var(--space-md);
    font-size: 1rem;
    font-family: var(--font-family);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    background: var(--white);
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
}

.schedule-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.schedule-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.schedule-time {
    text-align: center;
    min-width: 60px;
}

.schedule-time .time {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
}

.schedule-time .period {
    font-size: 0.7rem;
    color: var(--gray-500);
    text-transform: uppercase;
}

.schedule-divider {
    width: 2px;
    height: 40px;
    background: var(--gray-200);
}

.schedule-info {
    flex: 1;
}

.schedule-info .halte-name {
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 2px;
}

.schedule-info .vehicle-id {
    font-size: 0.8rem;
    color: var(--gray-500);
}

.schedule-status {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-full);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
}

.schedule-status.available {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success);
}

.schedule-status.full {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error);
}

.schedule-status.arriving {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);
}

/* ===================================
   Tap Card Page
   =================================== */
.tap-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.card-animation {
    margin-bottom: var(--space-xl);
}

.student-card {
    width: 280px;
    height: 170px;
    background: linear-gradient(135deg, var(--secondary) 0%, #0f3460 100%);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    position: relative;
    box-shadow: var(--shadow-xl);
    animation: float 3s ease-in-out infinite;
}

.card-header-design {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}

.card-logo {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--primary);
}

.card-type {
    font-size: 0.6rem;
    color: var(--gray-400);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.card-body-design {
    display: flex;
    gap: var(--space-md);
    align-items: center;
}

.card-photo {
    width: 60px;
    height: 70px;
    background: var(--gray-700);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-photo svg {
    width: 32px;
    height: 32px;
    color: var(--gray-400);
}

.card-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
}

.card-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--white);
}

.card-nim {
    font-size: 0.8rem;
    color: var(--gray-400);
    font-family: monospace;
}

.card-faculty {
    font-size: 0.7rem;
    color: var(--gray-500);
}

.card-chip {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 30px;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border-radius: 6px;
}

.tap-zone {
    margin-top: var(--space-xl);
    text-align: center;
}

.tap-circle {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, rgba(227, 24, 55, 0.1) 0%, rgba(227, 24, 55, 0.05) 100%);
    border: 3px dashed var(--primary);
    border-radius: var(--radius-full);
    margin: 0 auto var(--space-md);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
}

.tap-circle svg {
    width: 40px;
    height: 40px;
    color: var(--primary);
}

.tap-zone p {
    font-size: 0.9rem;
    color: var(--gray-600);
}

.tap-simulate {
    margin-top: var(--space-xl);
}

.tap-result {
    margin-top: var(--space-lg);
    width: 100%;
}

.tap-success {
    padding: var(--space-lg);
    background: rgba(16, 185, 129, 0.1);
    border: 2px solid var(--success);
    border-radius: var(--radius-md);
    text-align: center;
    animation: fadeInUp 0.3s ease;
}

.tap-success .icon {
    width: 60px;
    height: 60px;
    background: var(--success);
    border-radius: var(--radius-full);
    margin: 0 auto var(--space-md);
    display: flex;
    align-items: center;
    justify-content: center;
}

.tap-success .icon svg {
    width: 30px;
    height: 30px;
    color: var(--white);
}

.tap-success h3 {
    color: var(--success);
    margin-bottom: var(--space-xs);
}

.tap-success p {
    color: var(--gray-600);
    font-size: 0.9rem;
}

/* ===================================
   Route Page
   =================================== */
.route-info-card {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    color: var(--white);
    margin-bottom: var(--space-xl);
}

.route-info-card h3 {
    font-size: 1.25rem;
    margin-bottom: var(--space-xs);
}

.route-info-card p {
    font-size: 0.85rem;
    opacity: 0.9;
}

.route-timeline {
    position: relative;
    padding-left: var(--space-xl);
    margin-bottom: var(--space-xl);
}

.route-timeline::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--gray-200);
}

.timeline-item {
    position: relative;
    padding-bottom: var(--space-lg);
}

.timeline-item:last-child {
    padding-bottom: 0;
}

.timeline-marker {
    position: absolute;
    left: -24px;
    top: 0;
    width: 18px;
    height: 18px;
    background: var(--white);
    border: 3px solid var(--gray-300);
    border-radius: var(--radius-full);
    z-index: 1;
}

.timeline-marker.start {
    border-color: var(--success);
    background: var(--success);
}

.timeline-marker.end {
    border-color: var(--primary);
    background: var(--primary);
}

.timeline-content h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 2px;
}

.timeline-content p {
    font-size: 0.85rem;
    color: var(--gray-500);
}

.route-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
    background: var(--white);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
}

.stat-item {
    text-align: center;
}

.stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--gray-500);
}

/* ===================================
   Profile Page
   =================================== */
.profile-header {
    text-align: center;
    margin-bottom: var(--space-xl);
}

.profile-avatar {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: var(--radius-full);
    margin: 0 auto var(--space-md);
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-avatar svg {
    width: 50px;
    height: 50px;
    color: var(--white);
}

.profile-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: var(--space-xs);
}

.profile-header p {
    color: var(--gray-500);
}

.profile-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
}

.stat-card {
    background: var(--white);
    padding: var(--space-lg);
    border-radius: var(--radius-md);
    text-align: center;
    box-shadow: var(--shadow-sm);
}

.stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
}

.stat-name {
    font-size: 0.8rem;
    color: var(--gray-500);
}

.profile-menu {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--white);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    width: 100%;
}

.menu-item:hover {
    background: var(--gray-100);
}

.menu-item svg {
    width: 22px;
    height: 22px;
    color: var(--gray-600);
}

.menu-item span {
    flex: 1;
    font-size: 0.95rem;
    font-family: var(--font-family);
    color: var(--gray-700);
}

.menu-item .chevron {
    width: 18px;
    height: 18px;
    color: var(--gray-400);
}

.menu-item.logout {
    margin-top: var(--space-md);
}

.menu-item.logout svg,
.menu-item.logout span {
    color: var(--error);
}

/* ===================================
   History Page
   =================================== */
.history-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.history-item {
    background: var(--white);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
}

.history-date {
    font-size: 0.75rem;
    color: var(--gray-500);
}

.history-vehicle {
    font-size: 0.75rem;
    color: var(--primary);
    font-weight: 500;
}

.history-route {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.history-route .from,
.history-route .to {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--gray-800);
}

.history-route .arrow {
    color: var(--gray-400);
}

/* ===================================
   Admin Dashboard
   =================================== */
#admin-screen {
    background: var(--gray-100);
}

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg);
    background: linear-gradient(135deg, var(--secondary) 0%, #0f3460 100%);
    color: var(--white);
}

.admin-title h1 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 2px;
}

.admin-title p {
    font-size: 0.75rem;
    opacity: 0.7;
}

.logout-btn {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.logout-btn svg {
    width: 20px;
    height: 20px;
    color: var(--white);
}

.admin-content {
    padding: var(--space-lg);
}

.admin-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
}

.admin-stat-card {
    background: var(--white);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    box-shadow: var(--shadow-sm);
}

.stat-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-icon.users {
    background: rgba(59, 130, 246, 0.1);
}

.stat-icon.users svg {
    color: var(--info);
}

.stat-icon.vehicles {
    background: rgba(16, 185, 129, 0.1);
}

.stat-icon.vehicles svg {
    color: var(--success);
}

.stat-icon.trips {
    background: rgba(227, 24, 55, 0.1);
}

.stat-icon.trips svg {
    color: var(--primary);
}

.stat-icon svg {
    width: 20px;
    height: 20px;
}

.stat-details {
    display: flex;
    flex-direction: column;
}

.stat-details .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--gray-900);
}

.stat-details .stat-label {
    font-size: 0.65rem;
    color: var(--gray-500);
}

.admin-tabs {
    display: flex;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.admin-tab {
    padding: var(--space-sm) var(--space-md);
    background: var(--white);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-full);
    font-size: 0.85rem;
    font-family: var(--font-family);
    font-weight: 500;
    color: var(--gray-600);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.admin-tab:hover {
    border-color: var(--gray-300);
}

.admin-tab.active {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--white);
}

.admin-tab-content {
    display: none;
}

.admin-tab-content.active {
    display: block;
}

.vehicle-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.vehicle-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.vehicle-status {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
}

.vehicle-status.online {
    background: var(--success);
    box-shadow: 0 0 10px var(--success);
}

.vehicle-status.offline {
    background: var(--gray-400);
}

.vehicle-info {
    flex: 1;
}

.vehicle-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: 2px;
}

.vehicle-info p {
    font-size: 0.8rem;
    color: var(--gray-500);
    margin-bottom: 4px;
}

.vehicle-passengers {
    font-size: 0.75rem;
    color: var(--info);
    font-weight: 500;
}

.btn-small {
    padding: var(--space-xs) var(--space-md);
    background: var(--gray-100);
    border: none;
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    font-family: var(--font-family);
    font-weight: 500;
    color: var(--gray-700);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.btn-small:hover {
    background: var(--gray-200);
}

.btn-small.primary {
    background: var(--primary);
    color: var(--white);
}

.btn-small.primary:hover {
    background: var(--primary-dark);
}

.schedule-management .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
}

.schedule-management .schedule-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-900);
}

.admin-schedule-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.admin-schedule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md);
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.admin-schedule-item .schedule-details {
    display: flex;
    gap: var(--space-lg);
    align-items: center;
}

.admin-schedule-item .time-range {
    font-weight: 600;
    color: var(--gray-900);
}

.admin-schedule-item .halte {
    font-size: 0.85rem;
    color: var(--gray-600);
}

.passengers-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.passenger-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

.passenger-avatar {
    width: 40px;
    height: 40px;
    background: var(--gray-200);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
}

.passenger-avatar svg {
    width: 20px;
    height: 20px;
    color: var(--gray-500);
}

.passenger-info {
    flex: 1;
}

.passenger-info .name {
    font-weight: 600;
    color: var(--gray-900);
    font-size: 0.9rem;
}

.passenger-info .nim {
    font-size: 0.75rem;
    color: var(--gray-500);
}

.passenger-location {
    font-size: 0.75rem;
    color: var(--info);
    text-align: right;
}

/* ===================================
   Notification Panel
   =================================== */
.notification-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: var(--white);
    z-index: 200;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
}

.notification-panel.active {
    transform: translateX(0);
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--gray-200);
}

.notification-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--gray-900);
}

.close-btn {
    width: 36px;
    height: 36px;
    background: var(--gray-100);
    border: none;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.close-btn svg {
    width: 18px;
    height: 18px;
    color: var(--gray-600);
}

.notification-list {
    padding: var(--space-md);
}

.notification-item {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
    transition: background var(--transition-fast);
}

.notification-item:hover {
    background: var(--gray-50);
}

.notification-item.unread {
    background: rgba(227, 24, 55, 0.05);
}

.notification-icon {
    width: 40px;
    height: 40px;
    background: var(--gray-100);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notification-icon svg {
    width: 20px;
    height: 20px;
    color: var(--gray-600);
}

.notification-content {
    flex: 1;
}

.notification-content p {
    font-size: 0.9rem;
    color: var(--gray-800);
    margin-bottom: var(--space-xs);
    line-height: 1.4;
}

.notification-time {
    font-size: 0.75rem;
    color: var(--gray-500);
}

/* ===================================
   Toast
   =================================== */
.toast {
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--gray-900);
    color: var(--white);
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-full);
    font-size: 0.9rem;
    opacity: 0;
    transition: all var(--transition-normal);
    z-index: 500;
}

.toast.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}

/* ===================================
   Animations
   =================================== */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes loading {
    0% {
        width: 0%;
    }

    100% {
        width: 100%;
    }
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

@keyframes pulse-dot {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

/* Leaflet Custom Styles */
.leaflet-container {
    font-family: var(--font-family);
}

.custom-marker {
    background: none;
    border: none;
}

.halte-marker {
    width: 30px;
    height: 30px;
    background: var(--info);
    border: 3px solid var(--white);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-md);
}

.halte-marker svg {
    width: 16px;
    height: 16px;
    color: var(--white);
}

.tuctuc-marker {
    width: 40px;
    height: 40px;
    background: var(--primary);
    border: 3px solid var(--white);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(227, 24, 55, 0.5);
    animation: pulse 1.5s infinite;
}

.tuctuc-marker svg {
    width: 22px;
    height: 22px;
    color: var(--white);
}

.leaflet-popup-content-wrapper {
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
}

.leaflet-popup-content {
    margin: var(--space-md);
    font-size: 0.9rem;
}

.popup-title {
    font-weight: 600;
    color: var(--gray-900);
    margin-bottom: var(--space-xs);
}

.popup-subtitle {
    color: var(--gray-500);
    font-size: 0.8rem;
}

/* Responsive adjustments */
@media (max-height: 700px) {
    .map-section {
        height: 220px;
    }

    .quick-actions {
        padding: var(--space-md);
        gap: var(--space-sm);
    }

    .action-icon {
        width: 36px;
        height: 36px;
    }

    .action-icon svg {
        width: 18px;
        height: 18px;
    }
}
```

## index.html

```html
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>TucTuc Tel-U - Transportasi Kampus</title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">

    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

    <!-- Custom CSS -->
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <div class="app-container">

        <!-- Splash Screen -->
        <div id="splash-screen" class="screen active">
            <div class="splash-content">
                <div class="logo-container">
                    <div class="logo-icon">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" fill="url(#gradient1)" />
                            <path d="M30 55 L40 35 L60 35 L70 55 L65 60 L35 60 Z" fill="white" />
                            <circle cx="38" cy="62" r="6" fill="#333" />
                            <circle cx="62" cy="62" r="6" fill="#333" />
                            <rect x="42" y="40" width="16" height="10" rx="2" fill="rgba(255,255,255,0.3)" />
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#e31837" />
                                    <stop offset="100%" style="stop-color:#b01030" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 class="app-title">TucTuc Tel-U</h1>
                    <p class="app-tagline">Transportasi Kampus Telkom University</p>
                </div>
                <div class="splash-loader">
                    <div class="loader-bar"></div>
                </div>
            </div>
        </div>

        <!-- Login Screen -->
        <div id="login-screen" class="screen">
            <div class="login-header">
                <div class="login-logo">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" fill="url(#gradient2)" />
                        <path d="M30 55 L40 35 L60 35 L70 55 L65 60 L35 60 Z" fill="white" />
                        <circle cx="38" cy="62" r="6" fill="#333" />
                        <circle cx="62" cy="62" r="6" fill="#333" />
                        <defs>
                            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#e31837" />
                                <stop offset="100%" style="stop-color:#b01030" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <h2>Selamat Datang</h2>
                <p>Akses layanan TucTuc Tel-U</p>
            </div>

            <!-- Auth Tabs -->
            <div class="auth-tabs">
                <button class="auth-tab active" id="signin-tab" onclick="switchAuthTab('signin')">Sign In</button>
                <button class="auth-tab" id="signup-tab" onclick="switchAuthTab('signup')">Sign Up</button>
            </div>

            <!-- Sign In Form -->
            <form id="signin-form" class="login-form auth-form active">
                <div class="input-group">
                    <label for="signin-email">Email</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input type="email" id="signin-email" placeholder="Masukkan Email" required>
                    </div>
                </div>

                <div class="input-group">
                    <label for="signin-password">Password</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input type="password" id="signin-password" placeholder="Masukkan Password" required>
                        <button type="button" class="toggle-password" onclick="togglePassword('signin-password')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="remember-forgot">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" id="remember">
                        <span class="checkmark"></span>
                        <span>Ingat saya</span>
                    </label>
                    <a href="#" class="forgot-link">Lupa Password?</a>
                </div>

                <button type="submit" class="btn-primary">
                    <span>Sign In</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </button>
            </form>

            <!-- Sign Up Form -->
            <form id="signup-form" class="login-form auth-form">
                <div class="input-group">
                    <label for="signup-nama">Nama Lengkap</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input type="text" id="signup-nama" placeholder="Masukkan Nama Lengkap" required>
                    </div>
                </div>

                <div class="input-group">
                    <label for="signup-email">Email</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input type="email" id="signup-email" placeholder="Masukkan Email" required>
                    </div>
                </div>

                <div class="input-group">
                    <label for="signup-password">Password</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input type="password" id="signup-password" placeholder="Buat Password" required>
                        <button type="button" class="toggle-password" onclick="togglePassword('signup-password')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="input-group">
                    <label for="signup-confirm">Konfirmasi Password</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input type="password" id="signup-confirm" placeholder="Ulangi Password" required>
                    </div>
                </div>

                <button type="submit" class="btn-primary">
                    <span>Sign Up</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                </button>
            </form>

            <div class="login-footer">
                <p>Dengan login, Anda menyetujui</p>
                <a href="#">Syarat & Ketentuan</a>
            </div>

            <div class="admin-login-link">
                <button type="button" onclick="showAdminLogin()" class="btn-text">
                    Login sebagai Admin
                </button>
            </div>
        </div>

        <!-- Main App Screen -->
        <div id="main-screen" class="screen">
            <!-- Header -->
            <header class="main-header">
                <div class="header-left">
                    <div class="user-avatar" onclick="navigateTo('profile')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <div class="header-greeting">
                        <span class="greeting-text">Selamat Datang,</span>
                        <span class="user-name" id="user-name">Mahasiswa</span>
                    </div>
                </div>
                <div class="header-right">
                    <button class="notification-btn" onclick="showNotifications()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span class="notification-badge">2</span>
                    </button>
                </div>
            </header>

            <!-- Status Card -->
            <div class="status-card">
                <div class="status-info">
                    <div class="tuctuc-status">
                        <span class="status-dot active"></span>
                        <span>TucTuc sedang beroperasi</span>
                    </div>
                    <div class="next-arrival">
                        <span class="label">TucTuc terdekat:</span>
                        <span class="time" id="eta-time">3 menit</span>
                    </div>
                </div>
                <div class="status-route">
                    <span class="route-label">Halte terdekat:</span>
                    <span class="route-name" id="nearest-halte">Gedung Telkom</span>
                </div>
            </div>

            <!-- Map Container -->
            <div class="map-section">
                <div id="map"></div>
                <div class="map-overlay">
                    <button class="locate-btn" onclick="centerMap()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                        </svg>
                    </button>
                </div>
                <div class="map-legend">
                    <div class="legend-item">
                        <span class="legend-icon halte"></span>
                        <span>Halte</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon tuctuc"></span>
                        <span>TucTuc</span>
                    </div>
                </div>
            </div>



            <!-- Bottom Navigation -->
            <nav class="bottom-nav">
                <button class="nav-item active" data-page="home" onclick="switchTab('home')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <span>Beranda</span>
                </button>
                <button class="nav-item" data-page="schedule" onclick="switchTab('schedule')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Jadwal</span>
                </button>

                <button class="nav-item" data-page="route" onclick="switchTab('route')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                    </svg>
                    <span>Rute</span>
                </button>
                <button class="nav-item" data-page="profile" onclick="switchTab('profile')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Profil</span>
                </button>
            </nav>
        </div>

        <!-- Schedule Page -->
        <div id="schedule-page" class="page">
            <header class="page-header">
                <button class="back-btn" onclick="goBack()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1>Jadwal Keberangkatan</h1>
                <div class="header-spacer"></div>
            </header>

            <div class="page-content">
                <div class="schedule-filter">
                    <select id="halte-filter" onchange="filterSchedule()">
                        <option value="all">Semua Halte</option>
                        <option value="gedung-telkom">Gedung Telkom</option>
                        <option value="mb-telu">MB Tel-U</option>
                        <option value="sukabirus">Sukabirus</option>
                        <option value="jalan-raya">Jalan Raya</option>
                        <option value="yogya-sukapura">Yogya Sukapura</option>
                        <option value="sukapura">Sukapura</option>
                        <option value="gerbang-telu">Gerbang Tel-U</option>
                    </select>
                </div>

                <div class="schedule-list" id="schedule-list">
                    <!-- Schedule items will be generated by JS -->
                </div>
            </div>
        </div>



        <!-- Route Page -->
        <div id="route-page" class="page">
            <header class="page-header">
                <button class="back-btn" onclick="goBack()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1>Informasi Rute</h1>
                <div class="header-spacer"></div>
            </header>

            <div class="page-content">
                <div class="route-info-card">
                    <h3>Rute TucTuc Tel-U</h3>
                    <p>Jalur melingkar yang menghubungkan area kampus dengan sekitarnya</p>
                </div>

                <div class="route-timeline">
                    <div class="timeline-item">
                        <div class="timeline-marker start"></div>
                        <div class="timeline-content">
                            <h4>Gedung Telkom</h4>
                            <p>Titik awal - Area utama kampus</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>MB Tel-U</h4>
                            <p>Gedung Manajemen Bisnis</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>Sukabirus</h4>
                            <p>Jl. Sukabirus - Area kost mahasiswa</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>Jalan Raya</h4>
                            <p>Persimpangan jalan utama</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>Yogya Sukapura</h4>
                            <p>Dekat Supermarket Yogya</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>Sukapura</h4>
                            <p>Jl. Sukapura</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-marker end"></div>
                        <div class="timeline-content">
                            <h4>Gerbang Tel-U</h4>
                            <p>Kembali ke kampus - Akhir rute</p>
                        </div>
                    </div>
                </div>

                <div class="route-stats">
                    <div class="stat-item">
                        <span class="stat-value">7</span>
                        <span class="stat-label">Halte</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">~15</span>
                        <span class="stat-label">Menit/Putaran</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">~3</span>
                        <span class="stat-label">km</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Page -->
        <div id="profile-page" class="page">
            <header class="page-header">
                <button class="back-btn" onclick="goBack()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1>Profil Saya</h1>
                <div class="header-spacer"></div>
            </header>

            <div class="page-content">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                    <h2 id="profile-name">Nama Mahasiswa</h2>
                    <p id="profile-nim">NIM: 1234567890</p>
                </div>

                <div class="profile-stats">
                    <div class="stat-card">
                        <span class="stat-number" id="trip-count">12</span>
                        <span class="stat-name">Perjalanan</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="halte-visited">5</span>
                        <span class="stat-name">Halte Dikunjungi</span>
                    </div>
                </div>

                <div class="profile-menu">
                    <button class="menu-item" onclick="navigateTo('history')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Riwayat Perjalanan</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                    <button class="menu-item" onclick="navigateTo('settings')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3" />
                            <path
                                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Pengaturan</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                    <button class="menu-item" onclick="navigateTo('help')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Bantuan</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                    <button class="menu-item logout" onclick="logout()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Keluar</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- History Page -->
        <div id="history-page" class="page">
            <header class="page-header">
                <button class="back-btn" onclick="goBack()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1>Riwayat Perjalanan</h1>
                <div class="header-spacer"></div>
            </header>

            <div class="page-content">
                <div class="history-list" id="history-list">
                    <!-- History items will be generated by JS -->
                </div>
            </div>
        </div>

        <!-- Admin Dashboard -->
        <div id="admin-screen" class="screen">
            <header class="admin-header">
                <div class="admin-title">
                    <h1>Dashboard Admin</h1>
                    <p>TucTuc Tel-U Management</p>
                </div>
                <button class="logout-btn" onclick="logout()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                </button>
            </header>

            <div class="admin-content">
                <!-- Stats Overview -->
                <div class="admin-stats">
                    <div class="admin-stat-card">
                        <div class="stat-icon users">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div class="stat-details">
                            <span class="stat-value" id="admin-active-users">24</span>
                            <span class="stat-label">Penumpang Aktif</span>
                        </div>
                    </div>
                    <div class="admin-stat-card">
                        <div class="stat-icon vehicles">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path
                                    d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
                                <circle cx="7" cy="17" r="2" />
                                <circle cx="17" cy="17" r="2" />
                            </svg>
                        </div>
                        <div class="stat-details">
                            <span class="stat-value" id="admin-active-vehicles">3</span>
                            <span class="stat-label">TucTuc Aktif</span>
                        </div>
                    </div>
                    <div class="admin-stat-card">
                        <div class="stat-icon trips">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <div class="stat-details">
                            <span class="stat-value" id="admin-today-trips">156</span>
                            <span class="stat-label">Perjalanan Hari Ini</span>
                        </div>
                    </div>
                </div>

                <!-- Admin Tabs -->
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="vehicles"
                        onclick="switchAdminTab('vehicles')">Kendaraan</button>
                    <button class="admin-tab" data-tab="schedules" onclick="switchAdminTab('schedules')">Jadwal</button>
                    <button class="admin-tab" data-tab="passengers"
                        onclick="switchAdminTab('passengers')">Penumpang</button>
                </div>

                <!-- Vehicles Tab -->
                <div class="admin-tab-content active" id="vehicles-tab">
                    <div class="vehicle-list">
                        <div class="vehicle-card">
                            <div class="vehicle-status online"></div>
                            <div class="vehicle-info">
                                <h4>TucTuc #01</h4>
                                <p>Lokasi: Halte Sukabirus</p>
                                <span class="vehicle-passengers">8 penumpang</span>
                            </div>
                            <div class="vehicle-actions">
                                <button class="btn-small" onclick="trackVehicle(1)">Track</button>
                            </div>
                        </div>
                        <div class="vehicle-card">
                            <div class="vehicle-status online"></div>
                            <div class="vehicle-info">
                                <h4>TucTuc #02</h4>
                                <p>Lokasi: Halte Gedung Telkom</p>
                                <span class="vehicle-passengers">12 penumpang</span>
                            </div>
                            <div class="vehicle-actions">
                                <button class="btn-small" onclick="trackVehicle(2)">Track</button>
                            </div>
                        </div>
                        <div class="vehicle-card">
                            <div class="vehicle-status online"></div>
                            <div class="vehicle-info">
                                <h4>TucTuc #03</h4>
                                <p>Lokasi: Halte Yogya Sukapura</p>
                                <span class="vehicle-passengers">4 penumpang</span>
                            </div>
                            <div class="vehicle-actions">
                                <button class="btn-small" onclick="trackVehicle(3)">Track</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Schedules Tab -->
                <div class="admin-tab-content" id="schedules-tab">
                    <div class="schedule-management">
                        <div class="schedule-header">
                            <h3>Jadwal Operasional</h3>
                            <button class="btn-small primary" onclick="addSchedule()">+ Tambah</button>
                        </div>
                        <div class="admin-schedule-list" id="admin-schedule-list">
                            <!-- Schedules will be generated by JS -->
                        </div>
                    </div>
                </div>

                <!-- Passengers Tab -->
                <div class="admin-tab-content" id="passengers-tab">
                    <div class="passengers-list" id="passengers-list">
                        <!-- Passengers will be generated by JS -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Notification Panel -->
        <div id="notification-panel" class="notification-panel">
            <div class="notification-header">
                <h3>Notifikasi</h3>
                <button class="close-btn" onclick="closeNotifications()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
            <div class="notification-list">
                <div class="notification-item unread">
                    <div class="notification-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <div class="notification-content">
                        <p>TucTuc #02 akan tiba di Halte Gedung Telkom dalam 2 menit</p>
                        <span class="notification-time">5 menit lalu</span>
                    </div>
                </div>
                <div class="notification-item unread">
                    <div class="notification-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div class="notification-content">
                        <p>Perjalanan Anda berhasil tercatat. Terima kasih telah menggunakan TucTuc Tel-U!</p>
                        <span class="notification-time">1 jam lalu</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div class="notification-content">
                        <p>Layanan TucTuc beroperasi normal hari ini pukul 06:00 - 21:00</p>
                        <span class="notification-time">Kemarin</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <div id="toast" class="toast">
            <span id="toast-message"></span>
        </div>

    </div>

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <!-- App JS -->
    <script src="app.js"></script>
</body>

</html>
```

## data.json

```json
{
  "users": [
    {
      "id": 1,
      "nama": "Admin TucTuc",
      "nim": "ADMIN001",
      "password": "$2a$10$1XBMW8lPKALz4k5SmP.2J.7l9bu6u7HYn3qHOEY6.Vn55cDeM28sW",
      "faculty": "Administrator",
      "role": "admin",
      "created_at": "2025-12-22T06:52:43.587Z"
    },
    {
      "id": 2,
      "nama": "Demo User",
      "nim": "1234567890",
      "password": "$2a$10$XouaUAqDn7QD687Kh45BU.4ABI2UHa6uM.2fc6gyZLZDEiW.MG77a",
      "faculty": "Fakultas Informatika",
      "role": "mahasiswa",
      "created_at": "2025-12-22T06:52:43.723Z"
    },
    {
      "id": 3,
      "nama": "rayvan",
      "nim": "1010",
      "password": "$2a$10$B64L/PfbdX7fW5sV/xlui.7ws8Wv9aMxyN0aYDEyRyToI16W0ZEMi",
      "faculty": "Fakultas Informatika",
      "role": "mahasiswa",
      "created_at": "2025-12-22T06:53:17.106Z"
    },
    {
      "id": 4,
      "nama": "Rayvan Alifarlo Mahesworo",
      "nim": "rayvanalifarlo@student.telkomuniversity.ac.id",
      "password": "$2a$10$2LcLPn5fnwwhvpVWXyfjvuYhmEVlow8/Vge25lx14GOH66hENUeIC",
      "faculty": "Fakultas Informatika",
      "role": "mahasiswa",
      "created_at": "2025-12-22T10:15:27.720Z"
    }
  ],
  "schedules": [
    {
      "id": 1,
      "time": "06:00",
      "period": "AM",
      "halte": "Gedung Telkom",
      "vehicle": "TucTuc #01",
      "status": "available"
    },
    {
      "id": 2,
      "time": "06:15",
      "period": "AM",
      "halte": "Sukabirus",
      "vehicle": "TucTuc #02",
      "status": "available"
    },
    {
      "id": 3,
      "time": "06:30",
      "period": "AM",
      "halte": "Yogya Sukapura",
      "vehicle": "TucTuc #01",
      "status": "arriving"
    },
    {
      "id": 4,
      "time": "06:45",
      "period": "AM",
      "halte": "Gedung Telkom",
      "vehicle": "TucTuc #03",
      "status": "available"
    },
    {
      "id": 5,
      "time": "07:00",
      "period": "AM",
      "halte": "MB Tel-U",
      "vehicle": "TucTuc #01",
      "status": "full"
    },
    {
      "id": 6,
      "time": "07:15",
      "period": "AM",
      "halte": "Jalan Raya",
      "vehicle": "TucTuc #02",
      "status": "available"
    },
    {
      "id": 7,
      "time": "07:30",
      "period": "AM",
      "halte": "Sukapura",
      "vehicle": "TucTuc #03",
      "status": "available"
    },
    {
      "id": 8,
      "time": "07:45",
      "period": "AM",
      "halte": "Gedung Telkom",
      "vehicle": "TucTuc #01",
      "status": "arriving"
    },
    {
      "id": 9,
      "time": "08:00",
      "period": "AM",
      "halte": "Gerbang Tel-U",
      "vehicle": "TucTuc #02",
      "status": "available"
    },
    {
      "id": 10,
      "time": "08:15",
      "period": "AM",
      "halte": "Sukabirus",
      "vehicle": "TucTuc #01",
      "status": "available"
    }
  ],
  "vehicles": [
    {
      "id": 1,
      "name": "TucTuc #01",
      "status": "online",
      "current_halte": "Sukabirus",
      "passengers": 8,
      "lat": -6.9768,
      "lng": 107.6265
    },
    {
      "id": 2,
      "name": "TucTuc #02",
      "status": "online",
      "current_halte": "Gedung Telkom",
      "passengers": 12,
      "lat": -6.9733,
      "lng": 107.6307
    },
    {
      "id": 3,
      "name": "TucTuc #03",
      "status": "online",
      "current_halte": "Yogya Sukapura",
      "passengers": 4,
      "lat": -6.9772,
      "lng": 107.6335
    }
  ],
  "trips": [
    {
      "id": 1,
      "user_id": 2,
      "vehicle": "TucTuc #02",
      "halte_from": "Gedung Telkom",
      "halte_to": "Sukabirus",
      "trip_date": "2025-12-22T06:52:43.723Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "vehicle": "TucTuc #01",
      "halte_from": "Sukapura",
      "halte_to": "Gedung Telkom",
      "trip_date": "2025-12-22T06:52:43.723Z"
    },
    {
      "id": 3,
      "user_id": 2,
      "vehicle": "TucTuc #03",
      "halte_from": "MB Tel-U",
      "halte_to": "Yogya Sukapura",
      "trip_date": "2025-12-22T06:52:43.723Z"
    },
    {
      "id": 4,
      "user_id": 4,
      "vehicle": "TucTuc #01",
      "halte_from": "Yogya Sukapura",
      "halte_to": "Gedung Telkom",
      "trip_date": "2025-12-22T10:27:13.373Z"
    }
  ]
}
```

## package.json

```json
{
  "name": "tuctuc-telu-backend",
  "version": "1.0.0",
  "description": "Backend server untuk aplikasi TucTuc Tel-U",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3"
  },
  "keywords": [
    "tuctuc",
    "telkom",
    "transportation"
  ],
  "author": "Mahasiswa Tel-U",
  "license": "MIT"
}
```

