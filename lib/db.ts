import mysql, { type QueryResult, type FieldPacket } from "mysql2/promise"

// Type for query parameters that mysql2 accepts
type QueryParams = (string | number | boolean | null | Buffer | Date)[]

// Database connection pool for MySQL on VPS
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "rush_healthcare",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

export async function query<T = unknown>(
  sql: string,
  params?: QueryParams
): Promise<T[]> {
  const [rows]: [QueryResult, FieldPacket[]] = await pool.execute(sql, params)
  return rows as T[]
}

export async function queryOne<T = unknown>(
  sql: string,
  params?: QueryParams
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] || null
}

export async function execute(
  sql: string,
  params?: QueryParams
): Promise<{ insertId: number; affectedRows: number }> {
  const [result]: [QueryResult, FieldPacket[]] = await pool.execute(sql, params)
  const resultSet = result as { insertId: number; affectedRows: number }
  return {
    insertId: resultSet.insertId,
    affectedRows: resultSet.affectedRows,
  }
}

export async function transaction<T>(
  callback: (connection: mysql.Connection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const result = await callback(connection as unknown as mysql.Connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default pool
