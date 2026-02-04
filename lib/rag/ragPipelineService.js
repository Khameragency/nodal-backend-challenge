class RagPipelineService {
  constructor({ projectRepository, knowledgeBase, aiProvider, logger }) {
    this.projectRepository = projectRepository
    this.knowledgeBase = knowledgeBase
    this.aiProvider = aiProvider
    this.logger = logger
  }

  async run({ projectId, briefVersion }) {
    const project = await this.projectRepository.getById(projectId)
    if (!project || project.briefVersion !== briefVersion) {
      return { skipped: true, reason: 'stale-or-missing' }
    }

    const context = await this.knowledgeBase.retrieveContext(project.brief)
    const report = await this.aiProvider.generateMarketReport(project.brief, context)

    const updated = await this.projectRepository.updateResult(
      projectId,
      briefVersion,
      report
    )

    if (!updated) {
      return { skipped: true, reason: 'stale-on-write' }
    }

    return { completed: true }
  }
}

module.exports = { RagPipelineService }
