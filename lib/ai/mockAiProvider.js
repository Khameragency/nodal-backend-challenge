const { AiProvider } = require('./aiProvider')
const { config } = require('../config')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

class MockAiProvider extends AiProvider {
  async generateMarketReport(brief, context) {
    await sleep(config.mockAi.latencyMs)
    if (Math.random() < config.mockAi.failureRate) {
      throw new Error('Mock AI provider failure')
    }

    const contextSnippet = context.length > 0 ? context.join(' | ') : 'sin contexto'
    return [
      'Informe de Mercado (Simulado)',
      `Brief: ${brief}`,
      `Contexto: ${contextSnippet}`,
      `Conclusión: Tendencias alineadas con ${brief.slice(0, 40)}...`
    ].join('\n')
  }
}

module.exports = { MockAiProvider }
