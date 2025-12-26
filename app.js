/* ===================================
   TucTuc Tel-U - JavaScript Application
   =================================== */

// ===================================
// API Configuration
// ===================================

// Set to true when running with backend server
const USE_BACKEND = true;
const API_URL = '/api';

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
            showToast('Error: ' + error.message);
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
                    name: data.user.nama,
                    nim: data.user.nim,
                    faculty: data.user.faculty,
                    role: data.user.role // Simpan role dari server
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
            showToast('Error: ' + error.message);
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
    // document.getElementById('card-name').textContent = currentUser.name;
    // document.getElementById('card-nim').textContent = currentUser.nim;

    // Show main or admin screen based on role
    document.getElementById('login-screen').classList.remove('active');

    if (currentUser.role === 'admin') {
        isAdmin = true;
        document.getElementById('admin-screen').classList.add('active');
        initAdminDashboard();
    } else {
        isAdmin = false;
        document.getElementById('main-screen').classList.add('active');
        // Initialize map after screen is visible
        setTimeout(() => {
            initMap();
            startTucTucAnimation();
        }, 300);
    }

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
    showToast('Silakan login menggunakan akun Developer untuk akses Admin.');
    switchAuthTab('signin');
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
