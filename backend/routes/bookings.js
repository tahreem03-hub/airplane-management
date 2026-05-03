const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all bookings
router.get('/', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT fp.*, p.NAME AS PASSENGER_NAME, f.DESTINATION, f.DEPARTURE_TIME
            FROM FLIGHT_PASSENGER fp
            JOIN PASSENGER p ON fp.PASSENGER_ID = p.PASSENGER_ID
            JOIN FLIGHT f ON fp.FLIGHT_ID = f.FLIGHT_ID
            ORDER BY fp.BOOKING_DATE DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single booking
router.get('/:id', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM FLIGHT_PASSENGER WHERE BOOKING_ID = :id', { id: req.params.id });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create booking
router.post('/', async (req, res) => {
    const { booking_id, flight_id, passenger_id, seat_number } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO FLIGHT_PASSENGER (BOOKING_ID, FLIGHT_ID, PASSENGER_ID, SEAT_NUMBER, BOOKING_DATE, STATUS) 
             VALUES (:booking_id, :flight_id, :passenger_id, :seat_number, SYSDATE, 'Confirmed')`,
            { booking_id, flight_id, passenger_id, seat_number }
        );
        res.json({ success: true, message: 'Booking created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update booking status
router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.executeQuery('UPDATE FLIGHT_PASSENGER SET STATUS = :status WHERE BOOKING_ID = :id', { id: req.params.id, status });
        res.json({ success: true, message: 'Booking status updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
    try {
        await db.executeQuery('DELETE FROM FLIGHT_PASSENGER WHERE BOOKING_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;