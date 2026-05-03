const oracledb = require('oracledb');
require('dotenv').config();

// FOR ORACLE 11g - Use your existing Oracle bin directory
const oraclePath = 'C:\\oraclexe\\app\\oracle\\product\\11.2.0\\server\\bin';

try {
    oracledb.initOracleClient({ libDir: oraclePath });
    console.log('✅ Oracle Client loaded from:', oraclePath);
} catch (err) {
    console.log('⚠️ Could not load Oracle client:', err.message);
}

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

async function initializePool() {
    try {
        pool = await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION,
            poolMin: 1,
            poolMax: 3
        });
        console.log('✅ Oracle 11g Connected Successfully!');
        return true;
    } catch (err) {
        console.error('❌ Oracle Connection Failed:', err.message);
        return false;
    }
}

async function executeQuery(sql, binds = {}) {
    let conn;
    try {
        if (!pool) {
            const connected = await initializePool();
            if (!connected) {
                throw new Error('Database not connected');
            }
        }
        conn = await pool.getConnection();
        const result = await conn.execute(sql, binds);
        return result;
    } finally {
        if (conn) await conn.close();
    }
}

module.exports = { initializePool, executeQuery };