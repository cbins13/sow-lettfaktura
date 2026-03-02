import Fastify from 'fastify';
import routes from './routes/initRoutes.js';
import dbConnector from './database/initDB.js';
const fastify = Fastify({
    logger: true
});

fastify.register(dbConnector);
fastify.register(routes);

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})

