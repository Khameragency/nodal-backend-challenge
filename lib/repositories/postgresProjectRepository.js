const { ProjectRepository } = require('./projectRepository')

class PostgresProjectRepository extends ProjectRepository {
  constructor(pool) {
    super()
    this.pool = pool
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        brief TEXT NOT NULL,
        brief_version INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        result TEXT,
        error TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
  }

  async getById(id) {
    const { rows } = await this.pool.query(
      'SELECT id, brief, brief_version, status, result, error, updated_at FROM projects WHERE id = $1',
      [id]
    )
    return rows[0] ? this.#mapRow(rows[0]) : null
  }

  async upsertBrief(id, brief) {
    const { rows } = await this.pool.query(
      `
      INSERT INTO projects (id, brief, brief_version, status, result, error, updated_at)
      VALUES ($1, $2, 1, 'PROCESSING', NULL, NULL, NOW())
      ON CONFLICT (id) DO UPDATE
      SET brief = EXCLUDED.brief,
          brief_version = projects.brief_version + 1,
          status = 'PROCESSING',
          result = NULL,
          error = NULL,
          updated_at = NOW()
      RETURNING id, brief, brief_version, status, result, error, updated_at;
      `,
      [id, brief]
    )
    return this.#mapRow(rows[0])
  }

  async updateResult(id, briefVersion, result) {
    const { rowCount } = await this.pool.query(
      `
      UPDATE projects
      SET result = $1,
          status = 'COMPLETED',
          error = NULL,
          updated_at = NOW()
      WHERE id = $2 AND brief_version = $3;
      `,
      [result, id, briefVersion]
    )
    return rowCount > 0
  }

  async markFailed(id, briefVersion, reason) {
    const { rowCount } = await this.pool.query(
      `
      UPDATE projects
      SET status = 'FAILED',
          error = $1,
          updated_at = NOW()
      WHERE id = $2 AND brief_version = $3;
      `,
      [reason, id, briefVersion]
    )
    return rowCount > 0
  }

  #mapRow(row) {
    return {
      id: row.id,
      brief: row.brief,
      briefVersion: row.brief_version,
      status: row.status,
      result: row.result,
      error: row.error,
      updatedAt: row.updated_at
    }
  }
}

module.exports = { PostgresProjectRepository }
