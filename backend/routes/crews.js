const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all crew members
router.get('/', async (req, res) => {
    try {
        const result = await db.executeQuery(`
            SELECT c.*, p.LICENSE_NO, p.FLIGHT_HOURS
            FROM CREW c
            LEFT JOIN PILOT p ON c.EMPLOYEE_ID = p.PILOT_ID
            ORDER BY c.EMPLOYEE_ID
        `);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching crew:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single crew member
router.get('/:id', async (req, res) => {
    try {
        const result = await db.executeQuery('SELECT * FROM CREW WHERE EMPLOYEE_ID = :id', { id: req.params.id });
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Crew member not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create crew member
router.post('/', async (req, res) => {
    const { employee_id, name, role, contact, crew_type, license_no, flight_hours } = req.body;
    try {
        await db.executeQuery(
            `INSERT INTO CREW (EMPLOYEE_ID, NAME, ROLE, CONTACT, CREW_TYPE, HIRE_DATE) 
             VALUES (:employee_id, :name, :role, :contact, :crew_type, SYSDATE)`,
            { employee_id, name, role, contact, crew_type }
        );
        
        if (crew_type === 'Pilot' && license_no) {
            await db.executeQuery(
                `INSERT INTO PILOT (PILOT_ID, LICENSE_NO, FLIGHT_HOURS) 
                 VALUES (:employee_id, :license_no, :flight_hours)`,
                { employee_id, license_no, flight_hours: flight_hours || 0 }
            );
        }
        
        res.json({ success: true, message: 'Crew member added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE crew member
router.delete('/:id', async (req, res) => {
    try {
        await db.executeQuery('DELETE FROM CREW WHERE EMPLOYEE_ID = :id', { id: req.params.id });
        res.json({ success: true, message: 'Crew member deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;