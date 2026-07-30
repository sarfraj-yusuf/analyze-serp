import mysql from 'mysql2/promise';

/**
 * Hostinger MySQL Connection Pool Configuration
 * Strictly capped to 10 connections to respect Hostinger shared hosting limits.
 */
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool | null {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = Number(process.env.MYSQL_PORT) || 3306;

  if (!host || !user || !database) {
    // MySQL credentials not provided in environment, fallback gracefully
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      connectionLimit: 10, // Strict connection limit for Hostinger
      waitForConnections: true,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      idleTimeout: 60000,
    });
  }

  return pool;
}

// In-Memory Fallback Stores for local dev before Hostinger DB is connected
export interface LocalFeedbackItem {
  id: number;
  user_type: string;
  rating: number;
  category: string;
  message: string;
  email: string | null;
  ip_address: string;
  created_at: string;
}

export interface LocalActivityLog {
  id: number;
  session_id: string;
  ip_address: string;
  tool_name: string;
  target_url: string | null;
  used_at: string;
}

const memoryFeedbackStore: LocalFeedbackItem[] = [];
const memoryActivityStore: LocalActivityLog[] = [];
let localFeedbackIdCounter = 1;
let localActivityIdCounter = 1;

/**
 * Ensures required DB tables exist on Hostinger MySQL
 */
export async function initDatabaseTables(): Promise<void> {
  const db = getPool();
  if (!db) return;

  try {
    const connection = await db.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_type VARCHAR(50) DEFAULT 'Guest',
          rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
          category VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          email VARCHAR(255) NULL,
          ip_address VARCHAR(45) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_activity_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          session_id VARCHAR(64) NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          tool_name VARCHAR(100) NOT NULL,
          target_url VARCHAR(500) NULL,
          used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_session (session_id),
          INDEX idx_tool (tool_name),
          INDEX idx_ip (ip_address)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[DB Init Warning] Failed to initialize MySQL tables:', error);
  }
}

/**
 * Inserts user feedback into DB (or memory fallback)
 */
export async function saveUserFeedback(data: {
  user_type?: string;
  rating: number;
  category: string;
  message: string;
  email?: string | null;
  ip_address: string;
}): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO user_feedback (user_type, rating, category, message, email, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            data.user_type || 'Guest',
            data.rating,
            data.category,
            data.message,
            data.email || null,
            data.ip_address,
          ]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to save feedback to MySQL, using fallback:', error);
    }
  }

  // Fallback memory insertion
  memoryFeedbackStore.unshift({
    id: localFeedbackIdCounter++,
    user_type: data.user_type || 'Guest',
    rating: data.rating,
    category: data.category,
    message: data.message,
    email: data.email || null,
    ip_address: data.ip_address,
    created_at: new Date().toISOString(),
  });
  return true;
}

/**
 * Logs tool usage activity into DB (or memory fallback)
 */
export async function saveActivityLog(data: {
  session_id: string;
  ip_address: string;
  tool_name: string;
  target_url?: string | null;
}): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO user_activity_logs (session_id, ip_address, tool_name, target_url) VALUES (?, ?, ?, ?)`,
          [data.session_id, data.ip_address, data.tool_name, data.target_url || null]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to save activity log to MySQL, using fallback:', error);
    }
  }

  // Fallback memory insertion
  memoryActivityStore.unshift({
    id: localActivityIdCounter++,
    session_id: data.session_id,
    ip_address: data.ip_address,
    tool_name: data.tool_name,
    target_url: data.target_url || null,
    used_at: new Date().toISOString(),
  });
  return true;
}

/**
 * Fetches all feedback entries for Admin Panel
 */
export async function getAllFeedback(): Promise<LocalFeedbackItem[]> {
  const db = getPool();

  if (db) {
    try {
      const connection = await db.getConnection();
      try {
        const [rows] = await connection.query(`SELECT * FROM user_feedback ORDER BY created_at DESC LIMIT 200`);
        return rows as LocalFeedbackItem[];
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch feedback from MySQL:', error);
    }
  }

  return memoryFeedbackStore;
}

/**
 * Fetches activity logs for Admin Panel
 */
export async function getActivityLogs(): Promise<LocalActivityLog[]> {
  const db = getPool();

  if (db) {
    try {
      const connection = await db.getConnection();
      try {
        const [rows] = await connection.query(`SELECT * FROM user_activity_logs ORDER BY used_at DESC LIMIT 500`);
        return rows as LocalActivityLog[];
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch activity logs from MySQL:', error);
    }
  }

  return memoryActivityStore;
}
