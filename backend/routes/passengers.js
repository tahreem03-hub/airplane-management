const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all passengers
router.get('/', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT p.*, ff.TIER_LEVEL, ff.MILES_EARNED
            FROM PASSENGER p
            LEFT JOIN FREQUENT_FLYER ff ON p.PASSENGER_ID = ff.PASSENGER_ID
            ORDER BY p.NAME
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching passengers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single passenger
router.get('/:id', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM PASSENGER WHERE PASSENGER_ID = :id', { id: req.params.id });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Passenger not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create passenger
router.post('/', async (req, res) => {
    const { passenger_id, name, passport_no, nationality, dob, contact_number, email } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO PASSENGER (PASSENGER_ID, NAME, PASSPORT_NO, NATIONALITY, DOB, CONTACT_NUMBER, EMAIL) 
             VALUES (:passenger_id, :name, :passport_no, :nationality, TO_DATE(:dob, 'YYYY-MM-DD'), :contact_number, :email)`,
            { passenger_id, name, passport_no, nationality, dob, contact_number, email }
        );
        res.json({ success: true, message: 'Passenger created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update passenger
router.put('/:id', async (req, res) => {
    const { name, nationality, contact_number, email } = req.body;
    try {
        await db.executeQuery(
            `UPDATE PASSENGER SET NAME = :name, NATIONALITY = :nationality, CONTACT_NUMBER = :contact_number, EMAIL = :email 
             WHERE PASSENGER_ID = :id`,
            { id: req.params.id, name, nationality, contact_number, email }
        );
        res.json({ success: true, message: 'Passenger updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE passenger
router.delete('/:id', async (req, res) => {
    try {
        const checkBookings = await db.executeQuery('SELECT COUNT(*) AS CNT FROM FLIGHT_PASSENGER WHERE PASSENGER_ID = :id', { id: req.params.id });
        if (checkBookings.rows[0].CNT > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete passenger with existing bookings' });
        }
        await db.executeQuery('DELETE FROM PASSENGER WHERE PASSENGER_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Passenger deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;