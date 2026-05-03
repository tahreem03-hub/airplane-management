const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all gates with terminal info
router.get('/', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT g.*, t.TERMINAL_NAME, ap.NAME AS AIRPORT_NAME
            FROM GATE g
            JOIN TERMINAL t ON g.TERMINAL_ID = t.TERMINAL_ID
            JOIN AIRPORT ap ON t.AIRPORT_ID = ap.AIRPORT_ID
            ORDER BY g.GATE_ID
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching gates:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single gate
router.get('/:id', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM GATE WHERE GATE_ID = :id', { id: req.params.id });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Gate not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create gate
router.post('/', async (req, res) => {
    const { gate_id, gate_type, status, terminal_id } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO GATE (GATE_ID, GATE_TYPE, STATUS, TERMINAL_ID) 
             VALUES (:gate_id, :gate_type, :status, :terminal_id)`,
            { gate_id, gate_type, status, terminal_id }
        );
        res.json({ success: true, message: 'Gate created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update gate status
router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.executeQuery('UPDATE GATE SET STATUS = :status WHERE GATE_ID = :id', { id: req.params.id, status });
        res.json({ success: true, message: 'Gate status updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE gate
router.delete('/:id', async (req, res) => {
    try {
        const checkFlights = await db.executeQuery('SELECT COUNT(*) AS CNT FROM FLIGHT WHERE GATE_ID = :id', { id: req.params.id });
        if (checkFlights.rows[0].CNT > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete gate assigned to flights' });
        }
        await db.executeQuery('DELETE FROM GATE WHERE GATE_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Gate deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;