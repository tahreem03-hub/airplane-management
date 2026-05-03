const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all airlines
router.get('/', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM AIRLINE ORDER BY AIRLINE_ID');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching airlines:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single airline
router.get('/:id', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM AIRLINE WHERE AIRLINE_ID = :id', { id: req.params.id });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Airline not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create airline
router.post('/', async (req, res) => {
    const { airline_id, name, iata_code, status, airline_type } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO AIRLINE (AIRLINE_ID, NAME, IATA_CODE, STATUS, AIRLINE_TYPE) 
             VALUES (:airline_id, :name, :iata_code, :status, :airline_type)`,
            { airline_id, name, iata_code, status, airline_type }
        );
        res.json({ success: true, message: 'Airline created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update airline
router.put('/:id', async (req, res) => {
    const { name, status } = req.body;
    try {
        await db.executeQuery(
            'UPDATE AIRLINE SET NAME = :name, STATUS = :status WHERE AIRLINE_ID = :id',
            { id: req.params.id, name, status }
        );
        res.json({ success: true, message: 'Airline updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE airline
router.delete('/:id', async (req, res) => {
    try {
        const checkFlights = await db.executeQuery('SELECT COUNT(*) AS CNT FROM FLIGHT WHERE AIRLINE_ID = :id', { id: req.params.id });
        if (checkFlights.rows[0].CNT > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete airline with existing flights' });
        }
        await db.executeQuery('DELETE FROM AIRLINE WHERE AIRLINE_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Airline deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;