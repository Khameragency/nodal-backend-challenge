const { KnowledgeBase } = require('./knowledgeBase')
const { config } = require('../config')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

class MockKnowledgeBase extends KnowledgeBase {
  async retrieveContext(brief) {
    await sleep(config.mockRetrieval.latencyMs)
    const token = brief.split(' ').slice(0, 4).join(' ')
    return [
      `Tendencias relacionadas con: ${token}`,
      'Crecimiento orgánico en nichos especializados',
      'Optimización de canales digitales con IA'
    ]
  }
}

module.exports = { MockKnowledgeBase }
