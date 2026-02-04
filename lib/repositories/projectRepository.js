class ProjectRepository {
  async init() {
    throw new Error('Not implemented')
  }

  async getById(id) {
    throw new Error('Not implemented')
  }

  async upsertBrief(id, brief) {
    throw new Error('Not implemented')
  }

  async updateResult(id, briefVersion, result) {
    throw new Error('Not implemented')
  }

  async markFailed(id, briefVersion, reason) {
    throw new Error('Not implemented')
  }
}

module.exports = { ProjectRepository }
