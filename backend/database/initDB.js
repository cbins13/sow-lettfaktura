import fastifyPlugin from 'fastify-plugin';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
});

async function dbConnector(fastify, options) {
  fastify.decorate('pgPool', pool);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
}

export default fastifyPlugin(dbConnector);