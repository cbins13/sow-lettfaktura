import fastifyPlugin from 'fastify-plugin';
import postgres from '@fastify/postgres';
import dotenv from 'dotenv';
dotenv.config();

async function dbConnector(fastify, options) {
    fastify.register(postgres, {
        connectionString: process.env.CONNECTION_STRING
    });
}

export default fastifyPlugin(dbConnector);