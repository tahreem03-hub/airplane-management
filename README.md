# Airport Operations Management System

## Project Overview

Airport Operations Management System is a full-stack database application for managing airport operations including flights, passengers, airlines, aircraft, gates, crew members, bookings, baggage, and security checks.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Database | Oracle 11g/12c/18c/19c/21c |
| Backend | Node.js + Express.js |
| Database Driver | node-oracledb 5.5.0 |
| Frontend | HTML5, CSS3, JavaScript |
| Icons | Font Awesome 6.4.0 |

## Project Structure
```
airport-management/
│
├── backend/
│ ├── config/
│ │ └── database.js
│ ├── routes/
│ │ ├── flights.js
│ │ ├── passengers.js
│ │ ├── airlines.js
│ │ ├── aircraft.js
│ │ ├── gates.js
│ │ ├── crews.js
│ │ ├── bookings.js
│ │ ├── security.js
│ │ └── stats.js
│ ├── server.js
│ ├── package.json
│ └── .env
│
├── frontend/
│ ├── index.html
│ ├── css/
│ │ └── style.css
│ └── js/
│ └── app.js
│
├── database/
│ └── airport_schema.sql
│
└── README.md
```

## Database Schema (17 Tables)

| Table Name | Description |
|------------|-------------|
| AIRPORT | Airport information |
| TERMINAL | Terminal details |
| GATE | Gate information |
| AIRLINE | Airline companies |
| AIRCRAFT | Aircraft fleet |
| FLIGHT | Flight schedules |
| PASSENGER | Passenger details |
| FLIGHT_PASSENGER | Booking records |
| BOARDING_PASS | Boarding passes |
| BAGGAGE | Baggage tracking |
| SECURITY_CHECKPOINT | Security locations |
| SECURITY_CHECK | Security records |
| CREW | Crew members |
| PILOT | Pilot subclass |
| FLIGHT_CREW | Crew assignments |
| FREQUENT_FLYER | Frequent flyer subclass |
| TRANSFER_PASSENGER | Transfer passenger subclass |

## Features Implemented

- Primary Keys on all tables
- Foreign Keys for relationships
- JOIN queries (minimum 2)
- Subqueries (minimum 1)
- Views (minimum 1)
- Triggers (minimum 1)
- Stored Procedures (minimum 2)
- Complete CRUD operations
- Sample data in all tables

## Installation Guide

### Prerequisites

1. Oracle Database (11g or higher)
2. Node.js (v16 or higher)
3. SQL Developer or similar Oracle client

### Step 1: Set Up Oracle Database

1. Open SQL Developer
2. Connect to your Oracle database
3. Open the file: `database/airport_schema.sql`
4. Press F5 to run the entire script
5. Verify tables created

### Step 2: Configure Backend
Open terminal in the backend folder:

```
bash
cd backend
npm install
```

Create .env file:

```
env
DB_USER=SYSTEM
DB_PASSWORD=your_password_here
DB_CONNECTION=localhost:1521/xe
PORT=5000
```

Step 3: Start the Server
```
bash
node server.js
```

## 👥 Project Team



| **Tahreem Noor** |
| **Tayyaba Farooq** |
