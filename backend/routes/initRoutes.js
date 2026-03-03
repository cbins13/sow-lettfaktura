async function routes (fastify, options) {
  fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
  });

  fastify.get('/user/:id', async (request, reply) => {
    try {
      const { rows } = await fastify.pgPool.query(
        'SELECT * FROM users WHERE id = $1',
        [request.params.id]
      );

      if (rows.length === 0) {
        return reply.code(404).send({ message: 'User not found' });
      }

      return reply.send(rows[0]);
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ message: 'Internal server error' });
    }
  });
}

export default routes;