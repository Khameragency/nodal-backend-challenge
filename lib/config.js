const config = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nodal',
  queueName: process.env.QUEUE_NAME || 'market-report',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number.parseInt(process.env.REDIS_DB || '0', 10)
  },
  jobs: {
    attempts: Number.parseInt(process.env.JOB_ATTEMPTS || '8', 10),
    backoffMs: Number.parseInt(process.env.JOB_BACKOFF_MS || '3000', 10)
  },
  mockAi: {
    latencyMs: Number.parseInt(process.env.MOCK_AI_LATENCY_MS || '3000', 10),
    failureRate: Number.parseFloat(process.env.MOCK_AI_FAILURE_RATE || '0.1')
  },
  mockRetrieval: {
    latencyMs: Number.parseInt(process.env.MOCK_RETRIEVAL_LATENCY_MS || '300', 10)
  }
}

module.exports = { config }
