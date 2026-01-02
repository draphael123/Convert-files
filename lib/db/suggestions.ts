import { getDbPool } from './client'

export interface Suggestion {
  id: string
  name: string | null
  email: string | null
  suggestion: string
  category: string | null
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected'
  createdAt: Date
}

export async function createSuggestion(data: {
  id: string
  name?: string | null
  email?: string | null
  suggestion: string
  category?: string | null
}): Promise<Suggestion> {
  const pool = getDbPool()
  const result = await pool.query(
    `INSERT INTO suggestions (id, name, email, suggestion, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.id, data.name || null, data.email || null, data.suggestion, data.category || null]
  )
  return mapRowToSuggestion(result.rows[0])
}

export async function getSuggestions(limit: number = 100, offset: number = 0): Promise<Suggestion[]> {
  const pool = getDbPool()
  const result = await pool.query(
    'SELECT * FROM suggestions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  )
  return result.rows.map(mapRowToSuggestion)
}

function mapRowToSuggestion(row: any): Suggestion {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    suggestion: row.suggestion,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
  }
}



