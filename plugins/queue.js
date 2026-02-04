'use strict'

const fp = require('fastify-plugin')
const { Queue } = require('bullmq')
const { config } = require('../lib/config')

module.exports = fp(async function (fastify) {
  const queue = new Queue(config.queueName, {
    connection: config.redis
  })

  fastify.decorate('queue', queue)

  fastify.addHook('onClose', async () => {
    await queue.close()
  })
}, { name: 'queue' })
