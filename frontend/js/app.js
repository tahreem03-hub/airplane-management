// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentPage = 'dashboard';
let currentData = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadPage('dashboard');
});

// Navigation setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            loadPage(page);
        });
    });
}

// Load page content
async function loadPage(page) {
    currentPage = page;
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    switch(page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'flights':
            await loadFlights();
            break;
        case 'passengers':
            await loadPassengers();
            break;
        case 'airlines':
            await loadAirlines();
            break;
        case 'aircraft':
            await loadAircraft();
            break;
        case 'gates':
            await loadGates();
            break;
        case 'crews':
            await loadCrews();
            break;
        case 'bookings':
            await loadBookings();
            break;
        case 'security':
            await loadSecurity();
            break;
        default:
            await loadDashboard();
    }
}

// =====================================================
// DASHBOARD
// =====================================================
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats/dashboard`);
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            const html = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <i class="fas fa-plane"></i>
                        <h3>Total Flights</h3>
                        <div class="stat-number">${stats.totalFlights || 0}</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-play-circle"></i>
                        <h3>Active Flights</h3>
                        <div class="stat-number">${stats.activeFlights || 0}</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <h3>Total Passengers</h3>
                        <div class="stat-number">${stats.totalPassengers || 0}</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-building"></i>
                        <h3>Total Airlines</h3>
                        <div class="stat-number">${stats.totalAirlines || 0}</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-fan"></i>
                        <h3>Total Aircraft</h3>
                        <div class="stat-number">${stats.totalAircraft || 0}</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-ticket-alt"></i>
                        <h3>Total Bookings</h3>
                        <div class="stat-number">${stats.totalBookings || 0}</div>
                    </div>
                </div>
                <div class="data-table-container">
                    <div class="table-header">
                        <h3>Recent Flights</h3>
                    </div>
                    <div id="recentFlightsTable"></div>
                </div>
            `;
            document.getElementById('contentArea').innerHTML = html;
            await loadRecentFlights();
        }
    } catch (error) {
        showToast('Error loading dashboard: ' + error.message, 'error');
    }
}

async function loadRecentFlights() {
    try {
        const response = await fetch(`${API_BASE_URL}/flights`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const flights = result.data.slice(0, 5);
            let tableHtml = '<table><thead><tr>';
            tableHtml += '<th>Flight ID</th><th>Destination</th><th>Departure</th><th>Status</th>';
            tableHtml += '</tr></thead><tbody>';
            
            flights.forEach(flight => {
                tableHtml += `<tr>
                    <td>${flight.FLIGHT_ID}</td>
                    <td>${flight.DESTINATION}</td>
                    <td>${flight.DEPARTURE_TIME || 'N/A'}</td>
                    <td>${flight.STATUS}</td>
                </tr>`;
            });
            
            tableHtml += '</tbody></table>';
            document.getElementById('recentFlightsTable').innerHTML = tableHtml;
        }
    } catch (error) {
        console.error('Error loading recent flights:', error);
    }
}

// =====================================================
// FLIGHTS
// =====================================================
async function loadFlights() {
    try {
        const response = await fetch(`${API_BASE_URL}/flights`);
        const result = await response.json();
        
        if (result.success) {
            currentData = result.data || [];
            renderFlightsTable(currentData);
        }
    } catch (error) {
        showToast('Error loading flights: ' + error.message, 'error');
    }
}

function renderFlightsTable(flights) {
    const html = `
        <div class="data-table-container">
            <div class="table-header">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Search flights..." onkeyup="searchFlights()">
                </div>
                <button class="btn-add" onclick="showAddFlightModal()">
                    <i class="fas fa-plus"></i> Add Flight
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Flight ID</th><th>Destination</th><th>Departure</th><th>Arrival</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${flights.map(flight => `
                        <tr>
                            <td>${flight.FLIGHT_ID}</td>
                            <td>${flight.DESTINATION}</td>
                            <td>${flight.DEPARTURE_TIME || 'N/A'}</td>
                            <td>${flight.ARRIVAL_TIME || 'N/A'}</td>
                            <td>${flight.STATUS}</td>
                            <td class="action-buttons">
                                <button class="btn-edit" onclick="editFlight(${flight.FLIGHT_ID})"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="deleteFlight(${flight.FLIGHT_ID})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = html;
}

// =====================================================
// PASSENGERS
// =====================================================
async function loadPassengers() {
    try {
        const response = await fetch(`${API_BASE_URL}/passengers`);
        const result = await response.json();
        
        if (result.success) {
            currentData = result.data || [];
            renderPassengersTable(currentData);
        }
    } catch (error) {
        showToast('Error loading passengers: ' + error.message, 'error');
    }
}

function renderPassengersTable(passengers) {
    const html = `
        <div class="data-table-container">
            <div class="table-header">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="searchInput" placeholder="Search passengers..." onkeyup="searchPassengers()">
                </div>
                <button class="btn-add" onclick="showAddPassengerModal()">
                    <i class="fas fa-plus"></i> Add Passenger
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th><th>Passport</th><th>Nationality</th><th>Contact</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${passengers.map(p => `
                        <tr>
                            <td>${p.PASSENGER_ID}</td>
                            <td>${p.NAME}</td>
                            <td>${p.PASSPORT_NO}</td>
                            <td>${p.NATIONALITY}</td>
                            <td>${p.CONTACT_NUMBER || '-'}</td>
                            <td class="action-buttons">
                                <button class="btn-edit" onclick="editPassenger(${p.PASSENGER_ID})"><i class="fas fa-edit"></i></button>
                                <button class="btn-delete" onclick="deletePassenger(${p.PASSENGER_ID})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = html;
}

// =====================================================
// AIRLINES
// =====================================================
async function loadAirlines() {
    try {
        const response = await fetch(`${API_BASE_URL}/airlines`);
        const result = await response.json();
        
        if (result.success) {
            const airlines = result.data || [];
            const html = `
                <div class="data-table-container">
                    <div class="table-header">
                        <button class="btn-add" onclick="showAddAirlineModal()">
                            <i class="fas fa-plus"></i> Add Airline
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Name</th><th>IATA Code</th><th>Type</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${airlines.map(airline => `
                                <tr>
                                    <td>${airline.AIRLINE_ID}</td>
                                    <td>${airline.NAME}</td>
                                    <td>${airline.IATA_CODE}</td>
                                    <td>${airline.AIRLINE_TYPE}</td>
                                    <td>${airline.STATUS}</td>
                                    <td class="action-buttons">
                                        <button class="btn-delete" onclick="deleteAirline(${airline.AIRLINE_ID})"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('contentArea').innerHTML = html;
        }
    } catch (error) {
        showToast('Error loading airlines: ' + error.message, 'error');
    }
}

// =====================================================
// AIRCRAFT
// =====================================================
async function loadAircraft() {
    try {
        const response = await fetch(`${API_BASE_URL}/aircraft`);
        const result = await response.json();
        
        if (result.success) {
            const aircraft = result.data || [];
            const html = `
                <div class="data-table-container">
                    <div class="table-header">
                        <button class="btn-add" onclick="showAddAircraftModal()">
                            <i class="fas fa-plus"></i> Add Aircraft
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Model</th><th>Capacity</th><th>Registration</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${aircraft.map(a => `
                                <tr>
                                    <td>${a.AIRCRAFT_ID}</td>
                                    <td>${a.MODEL}</td>
                                    <td>${a.CAPACITY}</td>
                                    <td>${a.REGISTRATION_NO}</td>
                                    <td>${a.STATUS}</td>
                                    <td class="action-buttons">
                                        <button class="btn-delete" onclick="deleteAircraft(${a.AIRCRAFT_ID})"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('contentArea').innerHTML = html;
        }
    } catch (error) {
        showToast('Error loading aircraft: ' + error.message, 'error');
    }
}

// =====================================================
// GATES
// =====================================================
async function loadGates() {
    try {
        const response = await fetch(`${API_BASE_URL}/gates`);
        const result = await response.json();
        
        if (result.success) {
            const gates = result.data || [];
            const html = `
                <div class="data-table-container">
                    <div class="table-header">
                        <button class="btn-add" onclick="showAddGateModal()">
                            <i class="fas fa-plus"></i> Add Gate
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Type</th><th>Status</th><th>Terminal</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gates.map(gate => `
                                <tr>
                                    <td>${gate.GATE_ID}</td>
                                    <td>${gate.GATE_TYPE}</td>
                                    <td>${gate.STATUS}</td>
                                    <td>${gate.TERMINAL_NAME || gate.TERMINAL_ID}</td>
                                    <td class="action-buttons">
                                        <button class="btn-edit" onclick="editGateStatus(${gate.GATE_ID})"><i class="fas fa-edit"></i></button>
                                        <button class="btn-delete" onclick="deleteGate(${gate.GATE_ID})"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('contentArea').innerHTML = html;
        }
    } catch (error) {
        showToast('Error loading gates: ' + error.message, 'error');
    }
}

// =====================================================
// CREWS
// =====================================================
async function loadCrews() {
    try {
        const response = await fetch(`${API_BASE_URL}/crews`);
        const result = await response.json();
        
        if (result.success) {
            const crews = result.data || [];
            const html = `
                <div class="data-table-container">
                    <div class="table-header">
                        <button class="btn-add" onclick="showAddCrewModal()">
                            <i class="fas fa-plus"></i> Add Crew
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Name</th><th>Role</th><th>Type</th><th>Contact</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${crews.map(crew => `
                                <tr>
                                    <td>${crew.EMPLOYEE_ID}</td>
                                    <td>${crew.NAME}</td>
                                    <td>${crew.ROLE}</td>
                                    <td>${crew.CREW_TYPE}</td>
                                    <td>${crew.CONTACT}</td>
                                    <td class="action-buttons">
                                        <button class="btn-delete" onclick="deleteCrew(${crew.EMPLOYEE_ID})"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('contentArea').innerHTML = html;
        }
    } catch (error) {
        showToast('Error loading crews: ' + error.message, 'error');
    }
}

// =====================================================
// BOOKINGS
// =====================================================
async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const result = await response.json();
        
        if (result.success) {
            const bookings = result.data || [];
            const html = `
                <div class="data-table-container">
                    <div class="table-header">
                        <button class="btn-add" onclick="showAddBookingModal()">
                            <i class="fas fa-plus"></i> Add Booking
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Booking ID</th><th>Flight ID</th><th>Passenger</th><th>Seat</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(booking => `
                                <tr>
                                    <td>${booking.BOOKING_ID}</td>
                                    <td>${booking.FLIGHT_ID}</td>
                                    <td>${booking.PASSENGER_NAME || booking.PASSENGER_ID}</td>
                                    <td>${booking.SEAT_NUMBER || '-'}</td>
                                    <td>${booking.STATUS}</td>
                                    <td class="action-buttons">
                                        <button class="btn-edit" onclick="updateBookingStatus(${booking.BOOKING_ID})"><i class="fas fa-edit"></i></button>
                                        <button class="btn-delete" onclick="deleteBooking(${booking.BOOKING_ID})"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('contentArea').innerHTML = html;
        }
    } catch (error) {
        showToast('Error loading bookings: ' + error.message, 'error');
    }
}

// =====================================================
// SECURITY
// =====================================================
async function loadSecurity() {
    try {
        const response = await fetch(`${API_BASE_URL}/security/checks`);
        const result = await response.json();
        
        if (result.success) {
            const checks = result.data || [];
            const html = `
                <div class="data-table-container">
                    <div class="table-header">
                        <button class="btn-add" onclick="showAddSecurityCheckModal()">
                            <i class="fas fa-plus"></i> Add Security Check
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Check ID</th><th>Passenger</th><th>Type</th><th>Time</th><th>Result</th><th>Checkpoint</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${checks.map(check => `
                                <tr>
                                    <td>${check.CHECK_ID}</td>
                                    <td>${check.PASSENGER_NAME || check.PASSENGER_ID}</td>
                                    <td>${check.CHECK_TYPE}</td>
                                    <td>${check.CHECK_TIME || 'N/A'}</td>
                                    <td>${check.RESULT}</td>
                                    <td>${check.CHECKPOINT_NAME || '-'}</td>
                                    <td class="action-buttons">
                                        <button class="btn-delete" onclick="deleteSecurityCheck(${check.CHECK_ID})"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            document.getElementById('contentArea').innerHTML = html;
        }
    } catch (error) {
        showToast('Error loading security checks: ' + error.message, 'error');
    }
}

// =====================================================
// MODAL FUNCTIONS
// =====================================================
function showModal(title, formHtml, onSubmit) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = title;
    modalBody.innerHTML = formHtml;
    modal.style.display = 'block';
    
    const form = document.getElementById('addForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            await onSubmit(formData);
        });
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// =====================================================
// ADD MODALS
// =====================================================
function showAddFlightModal() {
    showModal('Add Flight', `
        <form id="addForm">
            <div class="form-group"><label>Flight ID:</label><input type="number" name="flight_id" required></div>
            <div class="form-group"><label>Destination:</label><input type="text" name="destination" required></div>
            <div class="form-group"><label>Departure Time (YYYY-MM-DD):</label><input type="date" name="departure_time" required></div>
            <div class="form-group"><label>Arrival Time (YYYY-MM-DD):</label><input type="date" name="arrival_time" required></div>
            <div class="form-group"><label>Airline ID:</label><input type="number" name="airline_id" required></div>
            <div class="form-group"><label>Aircraft ID:</label><input type="number" name="aircraft_id" required></div>
            <div class="form-group"><label>Gate ID:</label><input type="number" name="gate_id" required></div>
            <div class="form-group"><label>Status:</label>
                <select name="status">
                    <option>Scheduled</option><option>Boarding</option><option>Departed</option><option>Arrived</option>
                </select>
            </div>
            <button type="submit" class="btn-submit">Add Flight</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/flights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Flight added successfully!', 'success');
            closeModal();
            loadFlights();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

function showAddPassengerModal() {
    showModal('Add Passenger', `
        <form id="addForm">
            <div class="form-group"><label>Passenger ID:</label><input type="number" name="passenger_id" required></div>
            <div class="form-group"><label>Name:</label><input type="text" name="name" required></div>
            <div class="form-group"><label>Passport No:</label><input type="text" name="passport_no" required></div>
            <div class="form-group"><label>Nationality:</label><input type="text" name="nationality" required></div>
            <div class="form-group"><label>DOB (YYYY-MM-DD):</label><input type="date" name="dob" required></div>
            <div class="form-group"><label>Contact Number:</label><input type="text" name="contact_number"></div>
            <div class="form-group"><label>Email:</label><input type="email" name="email"></div>
            <button type="submit" class="btn-submit">Add Passenger</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/passengers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Passenger added successfully!', 'success');
            closeModal();
            loadPassengers();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

function showAddAirlineModal() {
    showModal('Add Airline', `
        <form id="addForm">
            <div class="form-group"><label>Airline ID:</label><input type="number" name="airline_id" required></div>
            <div class="form-group"><label>Name:</label><input type="text" name="name" required></div>
            <div class="form-group"><label>IATA Code (3 letters):</label><input type="text" name="iata_code" maxlength="3" required></div>
            <div class="form-group"><label>Type:</label><select name="airline_type"><option>Domestic</option><option>International</option></select></div>
            <div class="form-group"><label>Status:</label><select name="status"><option>Active</option><option>Inactive</option></select></div>
            <button type="submit" class="btn-submit">Add Airline</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/airlines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Airline added successfully!', 'success');
            closeModal();
            loadAirlines();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

function showAddAircraftModal() {
    showModal('Add Aircraft', `
        <form id="addForm">
            <div class="form-group"><label>Aircraft ID:</label><input type="number" name="aircraft_id" required></div>
            <div class="form-group"><label>Model:</label><input type="text" name="model" required></div>
            <div class="form-group"><label>Capacity:</label><input type="number" name="capacity" required></div>
            <div class="form-group"><label>Registration No:</label><input type="text" name="registration_no" required></div>
            <div class="form-group"><label>Status:</label><select name="status"><option>Active</option><option>Maintenance</option></select></div>
            <button type="submit" class="btn-submit">Add Aircraft</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/aircraft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Aircraft added successfully!', 'success');
            closeModal();
            loadAircraft();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

function showAddGateModal() {
    showModal('Add Gate', `
        <form id="addForm">
            <div class="form-group"><label>Gate ID:</label><input type="number" name="gate_id" required></div>
            <div class="form-group"><label>Gate Type:</label><select name="gate_type"><option>International</option><option>Domestic</option><option>Cargo</option></select></div>
            <div class="form-group"><label>Terminal ID:</label><input type="number" name="terminal_id" required></div>
            <div class="form-group"><label>Status:</label><select name="status"><option>Available</option><option>Occupied</option><option>Maintenance</option></select></div>
            <button type="submit" class="btn-submit">Add Gate</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/gates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Gate added successfully!', 'success');
            closeModal();
            loadGates();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

function showAddCrewModal() {
    showModal('Add Crew Member', `
        <form id="addForm">
            <div class="form-group"><label>Employee ID:</label><input type="number" name="employee_id" required></div>
            <div class="form-group"><label>Name:</label><input type="text" name="name" required></div>
            <div class="form-group"><label>Role:</label><input type="text" name="role" required></div>
            <div class="form-group"><label>Crew Type:</label><select name="crew_type"><option>Pilot</option><option>Cabin Crew</option><option>Ground Crew</option></select></div>
            <div class="form-group"><label>Contact:</label><input type="text" name="contact"></div>
            <button type="submit" class="btn-submit">Add Crew</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/crews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Crew member added successfully!', 'success');
            closeModal();
            loadCrews();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

function showAddBookingModal() {
    showModal('Add Booking', `
        <form id="addForm">
            <div class="form-group"><label>Booking ID:</label><input type="number" name="booking_id" required></div>
            <div class="form-group"><label>Flight ID:</label><input type="number" name="flight_id" required></div>
            <div class="form-group"><label>Passenger ID:</label><input type="number" name="passenger_id" required></div>
            <div class="form-group"><label>Seat Number:</label><input type="text" name="seat_number"></div>
            <button type="submit" class="btn-submit">Add Booking</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Booking added successfully!', 'success');
            closeModal();
            loadBookings();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

function showAddSecurityCheckModal() {
    showModal('Add Security Check', `
        <form id="addForm">
            <div class="form-group"><label>Check ID:</label><input type="number" name="check_id" required></div>
            <div class="form-group"><label>Check Type:</label><select name="check_type"><option>Standard</option><option>Enhanced</option></select></div>
            <div class="form-group"><label>Passenger ID:</label><input type="number" name="passenger_id" required></div>
            <div class="form-group"><label>Checkpoint ID:</label><input type="number" name="checkpoint_id" required></div>
            <div class="form-group"><label>Result:</label><select name="result"><option>Pass</option><option>Fail</option><option>Review</option></select></div>
            <button type="submit" class="btn-submit">Add Security Check</button>
        </form>
    `, async (formData) => {
        const data = Object.fromEntries(formData);
        const response = await fetch(`${API_BASE_URL}/security/checks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            showToast('Security check added successfully!', 'success');
            closeModal();
            loadSecurity();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    });
}

// =====================================================
// DELETE FUNCTIONS
// =====================================================
async function deleteFlight(id) {
    if (confirm('Delete this flight?')) {
        const response = await fetch(`${API_BASE_URL}/flights/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Flight deleted!', 'success');
            loadFlights();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

async function deletePassenger(id) {
    if (confirm('Delete this passenger?')) {
        const response = await fetch(`${API_BASE_URL}/passengers/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Passenger deleted!', 'success');
            loadPassengers();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

async function deleteAirline(id) {
    if (confirm('Delete this airline?')) {
        const response = await fetch(`${API_BASE_URL}/airlines/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Airline deleted!', 'success');
            loadAirlines();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

async function deleteAircraft(id) {
    if (confirm('Delete this aircraft?')) {
        const response = await fetch(`${API_BASE_URL}/aircraft/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Aircraft deleted!', 'success');
            loadAircraft();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

async function deleteGate(id) {
    if (confirm('Delete this gate?')) {
        const response = await fetch(`${API_BASE_URL}/gates/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Gate deleted!', 'success');
            loadGates();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

async function deleteCrew(id) {
    if (confirm('Delete this crew member?')) {
        const response = await fetch(`${API_BASE_URL}/crews/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Crew member deleted!', 'success');
            loadCrews();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

async function deleteBooking(id) {
    if (confirm('Cancel this booking?')) {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Booking cancelled!', 'success');
            loadBookings();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

async function deleteSecurityCheck(id) {
    if (confirm('Delete this security check?')) {
        const response = await fetch(`${API_BASE_URL}/security/checks/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
            showToast('Security check deleted!', 'success');
            loadSecurity();
        } else {
            showToast('Error: ' + result.message, 'error');
        }
    }
}

// =====================================================
// SEARCH FUNCTIONS
// =====================================================
function searchFlights() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filtered = currentData.filter(flight => 
        flight.FLIGHT_ID?.toString().includes(searchTerm) ||
        flight.DESTINATION?.toLowerCase().includes(searchTerm)
    );
    renderFlightsTable(filtered);
}

function searchPassengers() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filtered = currentData.filter(p => 
        p.NAME?.toLowerCase().includes(searchTerm) ||
        p.PASSPORT_NO?.toLowerCase().includes(searchTerm)
    );
    renderPassengersTable(filtered);
}

// =====================================================
// EDIT FUNCTIONS (Placeholders)
// =====================================================
function editFlight(id) {
    showToast('Edit feature coming soon', 'info');
}

function editPassenger(id) {
    showToast('Edit feature coming soon', 'info');
}

function editGateStatus(id) {
    const newStatus = prompt('Enter new status (Available/Occupied/Maintenance):');
    if (newStatus) {
        fetch(`${API_BASE_URL}/gates/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        }).then(() => {
            showToast('Gate status updated!', 'success');
            loadGates();
        }).catch(() => showToast('Error updating gate', 'error'));
    }
}

function updateBookingStatus(id) {
    const newStatus = prompt('Enter new status (Confirmed/Checked-In/Cancelled/Boarded):');
    if (newStatus) {
        fetch(`${API_BASE_URL}/bookings/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        }).then(() => {
            showToast('Booking status updated!', 'success');
            loadBookings();
        }).catch(() => showToast('Error updating booking', 'error'));
    }
}

// =====================================================
// CLOSE MODAL ON OUTSIDE CLICK
// =====================================================
window.onclick = (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) closeModal();
};

document.querySelector('.close')?.addEventListener('click', closeModal);

// Make functions global for HTML onclick
window.searchFlights = searchFlights;
window.searchPassengers = searchPassengers;
window.showAddFlightModal = showAddFlightModal;
window.showAddPassengerModal = showAddPassengerModal;
window.showAddAirlineModal = showAddAirlineModal;
window.showAddAircraftModal = showAddAircraftModal;
window.showAddGateModal = showAddGateModal;
window.showAddCrewModal = showAddCrewModal;
window.showAddBookingModal = showAddBookingModal;
window.showAddSecurityCheckModal = showAddSecurityCheckModal;
window.editFlight = editFlight;
window.editPassenger = editPassenger;
window.editGateStatus = editGateStatus;
window.updateBookingStatus = updateBookingStatus;
window.deleteFlight = deleteFlight;
window.deletePassenger = deletePassenger;
window.deleteAirline = deleteAirline;
window.deleteAircraft = deleteAircraft;
window.deleteGate = deleteGate;
window.deleteCrew = deleteCrew;
window.deleteBooking = deleteBooking;
window.deleteSecurityCheck = deleteSecurityCheck;