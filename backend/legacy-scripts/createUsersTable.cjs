const pg = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

async function ensureUsersTable() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();

    const result = await client.query(
      "SELECT to_regclass('public.users') AS exists;"
    );

    if (!result.rows[0].exists) {
      console.log('Users table not found. Creating table...');

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY NOT NULL,
          created_at DATE NOT NULL DEFAULT CURRENT_DATE,
          firstname TEXT NOT NULL,
          lastname TEXT NOT NULL,
          password TEXT NOT NULL
        );
      `);

      console.log('Users table created successfully.');
    } else {
      console.log('Users table already exists. Ensuring columns match...');
    }

    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS created_at DATE NOT NULL DEFAULT CURRENT_DATE,
        ADD COLUMN IF NOT EXISTS firstname TEXT NOT NULL,
        ADD COLUMN IF NOT EXISTS lastname TEXT NOT NULL,
        ADD COLUMN IF NOT EXISTS password TEXT NOT NULL;
    `);

    console.log('Users table columns ensured.');

    const countResult = await client.query(
      'SELECT COUNT(*) AS count FROM users;'
    );

    const existingCount = Number(countResult.rows[0].count || 0);

    if (existingCount > 0) {
      console.log('Users table already has data. Skipping admin seed.');
      return;
    }

    const adminPasswordPlain =
      process.env.ADMIN_PASSWORD || 'admin123';
    const saltRounds = process.env.SALT_ROUNDS || 10;

    const hashedPassword = await bcrypt.hash(
      adminPasswordPlain,
      saltRounds
    );

    await client.query(
      `INSERT INTO users (created_at, firstname, lastname, password)
       VALUES (CURRENT_DATE, $1, $2, $3);`,
      ['Admin', 'User', hashedPassword]
    );

    console.log('Admin user seeded into users table.');
  } catch (err) {
    console.error('Error ensuring users table:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

ensureUsersTable();

