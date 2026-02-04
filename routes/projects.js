'use strict'

const { config } = require('../lib/config')

module.exports = async function (fastify) {
  fastify.patch('/projects/:id/brief', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', minLength: 1 } }
      },
      body: {
        type: 'object',
        required: ['brief'],
        properties: { brief: { type: 'string', minLength: 1 } }
      },
      response: {
        202: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            briefVersion: { type: 'number' }
          }
        }
      }
    }
  }, async function (request, reply) {
    const { id } = request.params
    const { brief } = request.body

    const project = await fastify.projectRepository.upsertBrief(id, brief)

    await fastify.queue.add(
      'regenerate-market-report',
      { projectId: id, briefVersion: project.briefVersion },
      {
        jobId: `project:${id}:v${project.briefVersion}`,
        attempts: config.jobs.attempts,
        backoff: { type: 'exponential', delay: config.jobs.backoffMs },
        removeOnComplete: true,
        removeOnFail: false
      }
    )

    reply.code(202).send({ status: 'PROCESSING', briefVersion: project.briefVersion })
  })

  fastify.get('/projects/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', minLength: 1 } }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            status: { type: 'string' },
            result: { type: ['string', 'null'] },
            error: { type: ['string', 'null'] }
          }
        }
      }
    }
  }, async function (request, reply) {
    const { id } = request.params
    const project = await fastify.projectRepository.getById(id)

    if (!project) {
      return reply.notFound()
    }

    return {
      id: project.id,
      status: project.status,
      result: project.result ?? null,
      error: project.error ?? null
    }
  })
}
