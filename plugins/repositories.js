'use strict'

const fp = require('fastify-plugin')
const { PostgresProjectRepository } = require('../lib/repositories/postgresProjectRepository')

module.exports = fp(async function (fastify) {
  const projectRepository = new PostgresProjectRepository(fastify.db)
  await projectRepository.init()

  fastify.decorate('projectRepository', projectRepository)
}, { name: 'repositories', dependencies: ['database'] })
