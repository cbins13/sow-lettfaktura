const pg = require('pg')
const Postgrator = require('postgrator').default;
const path = require('node:path')
require('dotenv').config();

async function migrate() {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();

    const postgrator = new Postgrator({
      migrationPattern: path.join(__dirname, '..', '*.sql'),
      driver: 'pg',
      database: process.env.DB_NAME,
      schemaTable: 'migrations',
      currentSchema: 'public', // Postgres and MS SQL Server only
      execQuery: (query) => client.query(query),
    });

    const result = await postgrator.migrate()

    if (result.length === 0) {
      console.log(
        'No migrations run for schema "public". Already at the latest one.'
      )
    }

    console.log('Migration done.')

    process.exitCode = 0
  } catch(err) {
    console.error(err)
    process.exitCode = 1
  }

  await client.end()
}

migrate()