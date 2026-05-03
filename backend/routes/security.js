const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all security checks
router.get('/checks', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT sc.*, p.NAME AS PASSENGER_NAME, sp.CHECKPOINT_NAME, sp.LOCATION
            FROM SECURITY_CHECK sc
            JOIN PASSENGER p ON sc.PASSENGER_ID = p.PASSENGER_ID
            JOIN SECURITY_CHECKPOINT sp ON sc.CHECKPOINT_ID = sp.CHECKPOINT_ID
            ORDER BY sc.CHECK_TIME DESC
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching security checks:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET all checkpoints
router.get('/checkpoints', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM SECURITY_CHECKPOINT ORDER BY CHECKPOINT_ID');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create security check
router.post('/checks', async (req, res) => {
    const { check_id, check_type, passenger_id, checkpoint_id, result } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO SECURITY_CHECK (CHECK_ID, CHECK_TYPE, PASSENGER_ID, CHECKPOINT_ID, RESULT, CHECK_TIME) 
             VALUES (:check_id, :check_type, :passenger_id, :checkpoint_id, :result, SYSDATE)`,
            { check_id, check_type, passenger_id, checkpoint_id, result }
        );
        res.json({ success: true, message: 'Security check added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE security check
router.delete('/checks/:id', async (req, res) => {
    try {
        await db.executeQuery('DELETE FROM SECURITY_CHECK WHERE CHECK_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Security check deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;