const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all aircraft
router.get('/', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM AIRCRAFT ORDER BY AIRCRAFT_ID');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching aircraft:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single aircraft
router.get('/:id', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM AIRCRAFT WHERE AIRCRAFT_ID = :id', { id: req.params.id });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Aircraft not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create aircraft
router.post('/', async (req, res) => {
    const { aircraft_id, model, capacity, registration_no, status } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO AIRCRAFT (AIRCRAFT_ID, MODEL, CAPACITY, REGISTRATION_NO, STATUS) 
             VALUES (:aircraft_id, :model, :capacity, :registration_no, :status)`,
            { aircraft_id, model, capacity, registration_no, status }
        );
        res.json({ success: true, message: 'Aircraft created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update aircraft
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await db.executeQuery('UPDATE AIRCRAFT SET STATUS = :status WHERE AIRCRAFT_ID = :id', { id: req.params.id, status });
        res.json({ success: true, message: 'Aircraft updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE aircraft
router.delete('/:id', async (req, res) => {
    try {
        const checkFlights = await db.executeQuery('SELECT COUNT(*) AS CNT FROM FLIGHT WHERE AIRCRAFT_ID = :id', { id: req.params.id });
        if (checkFlights.rows[0].CNT > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete aircraft assigned to flights' });
        }
        await db.executeQuery('DELETE FROM AIRCRAFT WHERE AIRCRAFT_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Aircraft deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;