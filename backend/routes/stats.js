const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        let result = await db.executeQuery('SELECT COUNT(*) AS COUNT FROM FLIGHT');
        const totalFlights = result.rows[0].COUNT;
        
        result = await db.executeQuery("SELECT COUNT(*) AS COUNT FROM FLIGHT WHERE STATUS IN ('Scheduled', 'Boarding')");
        const activeFlights = result.rows[0].COUNT;
        
        result = await db.executeQuery('SELECT COUNT(*) AS COUNT FROM PASSENGER');
        const totalPassengers = result.rows[0].COUNT;
        
        result = await db.executeQuery('SELECT COUNT(*) AS COUNT FROM AIRLINE');
        const totalAirlines = result.rows[0].COUNT;
        
        result = await db.executeQuery('SELECT COUNT(*) AS COUNT FROM AIRCRAFT');
        const totalAircraft = result.rows[0].COUNT;
        
        result = await db.executeQuery('SELECT COUNT(*) AS COUNT FROM FLIGHT_PASSENGER');
        const totalBookings = result.rows[0].COUNT;
        
        result = await db.executeQuery(`
            SELECT 
                COUNT(CASE WHEN STATUS = 'Occupied' THEN 1 END) AS OCCUPIED_GATES,
                COUNT(*) AS TOTAL_GATES
            FROM GATE
        `);
        const gateUtilization = result.rows[0];
        
        res.json({ 
            success: true, 
            data: {
                totalFlights,
                activeFlights,
                totalPassengers,
                totalAirlines,
                totalAircraft,
                totalBookings,
                gateUtilization
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Flights by status
router.get('/flights-by-status', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT STATUS, COUNT(*) AS COUNT 
            FROM FLIGHT 
            GROUP BY STATUS 
            ORDER BY COUNT DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Top destinations
router.get('/top-destinations', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT DESTINATION, COUNT(*) AS FLIGHT_COUNT 
            FROM FLIGHT 
            GROUP BY DESTINATION 
            ORDER BY FLIGHT_COUNT DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;