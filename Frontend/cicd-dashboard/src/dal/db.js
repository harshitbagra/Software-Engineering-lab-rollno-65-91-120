// ── In-memory simulation (for frontend-only academic demo) ────────────────
import {
  pipelines,
  builds,
  failures,
  recoveryActions,
} from '../data/mockData.js';

/**
 * Simulated database store — mirrors the PostgreSQL tables defined in schema.sql.
 * In real deployment this would be the actual PostgreSQL database on AWS RDS.
 */
export const db = {
  pipelines,
  builds,
  failures,
  recoveryActions,
  testResults:    [],
  logEntries:     [],
  recoveryConfig: [{ id: 1, max_retries: 3, retry_delay_sec: 30, fallback_action: 'rollback', is_active: true }],
  reports:        [],
  users:          [
    { id: 1, username: 'admin',     role: 'admin',     email: 'admin@cicd.com',     is_active: true },
    { id: 2, username: 'developer', role: 'developer', email: 'dev@cicd.com',       is_active: true },
  ],
};

/**
 * Simulated query function — mimics pg Pool.query() interface.
 * In real deployment: replaced with actual PostgreSQL client query.
 *
 * @param {string} table - table name to operate on
 * @param {string} operation - 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
 * @param {object} params - query parameters
 * @returns {object} { rows, rowCount }
 */
export function query(table, operation, params = {}) {
  const data = db[table];
  if (!data) return { rows: [], rowCount: 0 };

  switch (operation) {
    case 'SELECT': {
      let rows = [...data];
      if (params.where) {
        rows = rows.filter(row =>
          Object.entries(params.where).every(([k, v]) => row[k] === v)
        );
      }
      if (params.limit) rows = rows.slice(0, params.limit);
      return { rows, rowCount: rows.length };
    }
    case 'INSERT': {
      const newRow = { id: data.length + 1, ...params.values, created_at: new Date().toISOString() };
      data.push(newRow);
      return { rows: [newRow], rowCount: 1 };
    }
    case 'UPDATE': {
      let updated = 0;
      data.forEach((row, i) => {
        if (Object.entries(params.where || {}).every(([k, v]) => row[k] === v)) {
          Object.assign(data[i], params.values);
          updated++;
        }
      });
      return { rows: [], rowCount: updated };
    }
    case 'DELETE': {
      const before = data.length;
      const remaining = data.filter(row =>
        !Object.entries(params.where || {}).every(([k, v]) => row[k] === v)
      );
      db[table] = remaining;
      return { rows: [], rowCount: before - remaining.length };
    }
    default:
      return { rows: [], rowCount: 0 };
  }
}
