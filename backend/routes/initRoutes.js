async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
        return { hello: 'world' }
    });

    fastify.get('/user/:id', function(req, reply){
        fastify.pg.query('SELECT * FROM users WHERE id = $1', [req.params.id], function(err, result){
            if(err){
                reply.status(500).send(err);
            }else{
                reply.send(result.rows);
            }
        });
    })
}

export default routes;