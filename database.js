/* ===================================
   TucTuc Tel-U - JSON File Database
   Simple file-based storage
   =================================== */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
// Database file path
const DB_FILE = path.join(__dirname, 'data.json');

// Default admin accounts to ensure exist
const DEFAULT_ADMINS = [
    {
        nama: 'Rayvan Alifarlo',
        nim: 'rayvanalifarlo@student.telkomuniversity.ac.id',
        password: 'admin123'
    },
    {
        nama: 'Muhammad Fiqri Habibi',
        nim: 'muhammadfiqrihabibi@student.telkomuniversity.ac.id',
        password: 'admin123'
    }
];

// Initialize database structure
const initDB = () => {
    let db;
    if (!fs.existsSync(DB_FILE)) {
        db = {
            users: [],
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
            trips: []
        };
    } else {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        db = JSON.parse(data);
    }

    // Ensure Default Admins exist
    DEFAULT_ADMINS.forEach(adminInfo => {
        const existingIdx = db.users.findIndex(u => u.nim === adminInfo.nim);
        if (existingIdx === -1) {
            // Add new admin
            db.users.push({
                id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
                nama: adminInfo.nama,
                nim: adminInfo.nim,
                password: bcrypt.hashSync(adminInfo.password, 10),
                faculty: 'Administrator',
                role: 'admin',
                created_at: new Date().toISOString()
            });
        } else {
            // Force update existing account to Admin role and password
            db.users[existingIdx].role = 'admin';
            db.users[existingIdx].password = bcrypt.hashSync(adminInfo.password, 10);
            db.users[existingIdx].nama = adminInfo.nama;
        }
    });

    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
        console.log('✅ Database synchronized with Admin accounts');
    } catch (e) {
        // Fallback for Read-Only
        inMemoryDB = db;
    }
};

// In-memory cache for the database to support serverless environments (Vercel)
let inMemoryDB = null;

// Read database
const readDB = () => {
    // Return in-memory data if available (updated in current session)
    if (inMemoryDB) return inMemoryDB;

    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            inMemoryDB = JSON.parse(data);
            return inMemoryDB;
        }
    } catch (error) {
        console.error('Read DB error:', error);
    }

    // Fallback/Initialize if file read fails
    initDB();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    inMemoryDB = JSON.parse(data);
    return inMemoryDB;
};

// Write database
const writeDB = (data) => {
    // Always update in-memory cache
    inMemoryDB = data;

    try {
        // Attempt to write to disk (will fail on Vercel, but that's okay)
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        // Silently fail on read-only filesystem
        console.warn('⚠️ Gagal menulis ke disk (Mungkin sistem Read-Only). Data hanya tersimpan di memori sementara.');
    }
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
