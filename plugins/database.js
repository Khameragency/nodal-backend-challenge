'use strict'

const fp = require('fastify-plugin')
const { Pool } = require('pg')
const { config } = require('../lib/config')

module.exports = fp(async function (fastify) {
  const pool = new Pool({ connectionString: config.databaseUrl })

  fastify.decorate('db', pool)

  fastify.addHook('onClose', async () => {
    await pool.end()
  })
}, { name: 'database' })
