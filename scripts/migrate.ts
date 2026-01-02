import { readFileSync } from 'fs'
import { join } from 'path'
import { getDbPool, closeDbPool } from '../lib/db/client'

async function migrate() {
  const pool = getDbPool()
  
  try {
    const schema = readFileSync(join(__dirname, '../lib/db/schema.sql'), 'utf-8')
    await pool.query(schema)
    console.log('✅ Database migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await closeDbPool()
  }
}

migrate()



