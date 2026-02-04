'use strict'

const { Worker } = require('bullmq')
const { Pool } = require('pg')
const { config } = require('./lib/config')
const { PostgresProjectRepository } = require('./lib/repositories/postgresProjectRepository')
const { MockKnowledgeBase } = require('./lib/knowledge/mockKnowledgeBase')
const { MockAiProvider } = require('./lib/ai/mockAiProvider')
const { RagPipelineService } = require('./lib/rag/ragPipelineService')

const pool = new Pool({ connectionString: config.databaseUrl })
const projectRepository = new PostgresProjectRepository(pool)

async function start() {
  await projectRepository.init()

  const ragPipeline = new RagPipelineService({
    projectRepository,
    knowledgeBase: new MockKnowledgeBase(),
    aiProvider: new MockAiProvider(),
    logger: console
  })

  const worker = new Worker(
    config.queueName,
    async (job) => {
      const { projectId, briefVersion } = job.data
      return ragPipeline.run({ projectId, briefVersion })
    },
    {
      connection: config.redis,
      concurrency: 2
    }
  )

  worker.on('failed', async (job, err) => {
    if (!job) {
      return
    }

    const attempts = job.opts.attempts || 1
    if (job.attemptsMade >= attempts) {
      await projectRepository.markFailed(
        job.data.projectId,
        job.data.briefVersion,
        err?.message || 'Unknown error'
      )
    }
  })

  worker.on('completed', (job) => {
    if (job) {
      console.info(`Job completed: ${job.id}`)
    }
  })

  const shutdown = async () => {
    await worker.close()
    await pool.end()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
