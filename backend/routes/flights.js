const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all flights
router.get('/', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT f.*, a.NAME AS AIRLINE_NAME, ac.MODEL AS AIRCRAFT_MODEL, g.GATE_ID
            FROM FLIGHT f
            JOIN AIRLINE a ON f.AIRLINE_ID = a.AIRLINE_ID
            JOIN AIRCRAFT ac ON f.AIRCRAFT_ID = ac.AIRCRAFT_ID
            JOIN GATE g ON f.GATE_ID = g.GATE_ID
            ORDER BY f.DEPARTURE_TIME
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single flight
router.get('/:id', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM FLIGHT WHERE FLIGHT_ID = :id', { id: req.params.id });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Flight not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create flight
router.post('/', async (req, res) => {
    const { flight_id, destination, departure_time, arrival_time, airline_id, aircraft_id, gate_id, status } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO FLIGHT (FLIGHT_ID, STATUS, DESTINATION, DEPARTURE_TIME, ARRIVAL_TIME, AIRLINE_ID, AIRCRAFT_ID, GATE_ID) 
             VALUES (:flight_id, :status, :destination, TO_DATE(:departure_time, 'YYYY-MM-DD'), TO_DATE(:arrival_time, 'YYYY-MM-DD'), :airline_id, :aircraft_id, :gate_id)`,
            { flight_id, status: status || 'Scheduled', destination, departure_time, arrival_time, airline_id, aircraft_id, gate_id }
        );
        res.json({ success: true, message: 'Flight created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update flight
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await db.executeQuery('UPDATE FLIGHT SET STATUS = :status WHERE FLIGHT_ID = :id', { id: req.params.id, status });
        res.json({ success: true, message: 'Flight updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE flight
router.delete('/:id', async (req, res) => {
    try {
        const checkBookings = await db.executeQuery('SELECT COUNT(*) AS CNT FROM FLIGHT_PASSENGER WHERE FLIGHT_ID = :id', { id: req.params.id });
        if (checkBookings.rows[0].CNT > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete flight with existing bookings' });
        }
        await db.executeQuery('DELETE FROM FLIGHT WHERE FLIGHT_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Flight deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;