import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_URL,
    database: process.env.DATABASE_NAME,
    port: parseInt(process.env.DATABASE_PORT, 10),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('❌ MSSQL connection error:', err);
        process.exit(1);
    });

export { sql, poolPromise };
