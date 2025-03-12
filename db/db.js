import pkg from "pg";
const { Pool } = pkg;
import 'dotenv/config'; // Loads the .env file automatically

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432 // The default port
})

// Enable query logging
pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export {pool};