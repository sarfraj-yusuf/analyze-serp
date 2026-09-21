import mysql from 'mysql2/promise';

/**
 * Hostinger MySQL Connection Pool Configuration
 * Strictly capped to 10 connections to respect Hostinger shared hosting limits.
 */
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool | null {
  const rawHost = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = Number(process.env.MYSQL_PORT) || 3306;

  if (!rawHost || !user || !database) {
    // MySQL credentials not provided in environment, fallback gracefully
    return null;
  }

  // Force IPv4 127.0.0.1 if 'localhost' is passed to prevent 'user'@'::1' IPv6 Access Denied on Hostinger
  const host = rawHost === 'localhost' ? '127.0.0.1' : rawHost;

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

export interface DbUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  provider: string;
  provider_id: string;
  daily_ai_credits_used: number;
  daily_ai_credits_limit: number;
  last_credit_reset: string | Date;
  created_at: string | Date;
}

export interface DbUserAudit {
  id: number;
  user_email: string;
  url: string;
  title: string | null;
  score: number | null;
  word_count: number | null;
  status: string;
  created_at: string | Date;
}

export interface DbUserAiActivity {
  id: number;
  user_email: string;
  action_type: string;
  target_summary: string;
  result_summary: string;
  created_at: string | Date;
}

const memoryFeedbackStore: LocalFeedbackItem[] = [];
const memoryActivityStore: LocalActivityLog[] = [];
const memoryUserStore = new Map<string, DbUser>();
const memoryAuditHistory: DbUserAudit[] = [];
const memoryAiHistory: DbUserAiActivity[] = [];
let localFeedbackIdCounter = 1;
let localActivityIdCounter = 1;
let localAuditIdCounter = 1;
let localAiIdCounter = 1;

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
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          image VARCHAR(500) NULL,
          provider VARCHAR(50) NOT NULL,
          provider_id VARCHAR(255) NOT NULL,
          daily_ai_credits_used INT DEFAULT 0,
          daily_ai_credits_limit INT DEFAULT 5,
          last_credit_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_feedback (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_type VARCHAR(50) DEFAULT 'Guest',
          rating INT NOT NULL,
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

      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_audit_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          title VARCHAR(500) NULL,
          score INT NULL,
          word_count INT NULL,
          status VARCHAR(50) DEFAULT 'success',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_audit_email (user_email),
          INDEX idx_audit_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_ai_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          action_type VARCHAR(50) NOT NULL,
          target_summary VARCHAR(500) NOT NULL,
          result_summary TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_ai_email (user_email),
          INDEX idx_ai_created (created_at)
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

/**
 * Upserts user upon login (inserts if new, updates provider/image/name if existing)
 */
export async function upsertUser(user: {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  provider: string;
  provider_id: string;
}): Promise<DbUser> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO users (id, name, email, image, provider, provider_id, daily_ai_credits_used, daily_ai_credits_limit, last_credit_reset)
           VALUES (?, ?, ?, ?, ?, ?, 0, 5, NOW())
           ON DUPLICATE KEY UPDATE
             name = COALESCE(VALUES(name), name),
             image = COALESCE(VALUES(image), image),
             provider = VALUES(provider),
             provider_id = VALUES(provider_id)`,
          [user.id, user.name || null, user.email, user.image || null, user.provider, user.provider_id]
        );

        const [rows] = await connection.execute(
          `SELECT * FROM users WHERE email = ? LIMIT 1`,
          [user.email]
        );
        const users = rows as DbUser[];
        if (users.length > 0) {
          return users[0];
        }
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to upsert user in MySQL, using fallback:', error);
    }
  }

  // Memory fallback for local dev
  const existing = memoryUserStore.get(user.email);
  if (existing) {
    existing.name = user.name || existing.name;
    existing.image = user.image || existing.image;
    existing.provider = user.provider;
    existing.provider_id = user.provider_id;
    return existing;
  }

  const newUser: DbUser = {
    id: user.id,
    name: user.name || null,
    email: user.email,
    image: user.image || null,
    provider: user.provider,
    provider_id: user.provider_id,
    daily_ai_credits_used: 0,
    daily_ai_credits_limit: 5,
    last_credit_reset: new Date(),
    created_at: new Date(),
  };
  memoryUserStore.set(user.email, newUser);
  return newUser;
}

/**
 * Fetches user from DB by email
 */
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = await connection.execute(
          `SELECT * FROM users WHERE email = ? LIMIT 1`,
          [email]
        );
        const users = rows as DbUser[];
        if (users.length > 0) {
          return users[0];
        }
        return null;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch user by email from MySQL:', error);
    }
  }

  return memoryUserStore.get(email) || null;
}

/**
 * Updates user credit count and optional reset timestamp
 */
export async function updateUserCredits(
  email: string,
  creditsUsed: number,
  lastReset?: Date
): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        if (lastReset) {
          await connection.execute(
            `UPDATE users SET daily_ai_credits_used = ?, last_credit_reset = ? WHERE email = ?`,
            [creditsUsed, lastReset, email]
          );
        } else {
          await connection.execute(
            `UPDATE users SET daily_ai_credits_used = ? WHERE email = ?`,
            [creditsUsed, email]
          );
        }
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to update user credits in MySQL:', error);
    }
  }

  const user = memoryUserStore.get(email);
  if (user) {
    user.daily_ai_credits_used = creditsUsed;
    if (lastReset) {
      user.last_credit_reset = lastReset;
    }
    return true;
  }
  return false;
}

/**
 * Saves completed audit to user audit history
 */
export async function saveUserAudit(data: {
  user_email: string;
  url: string;
  title?: string | null;
  score?: number | null;
  word_count?: number | null;
  status?: string;
}): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO user_audit_history (user_email, url, title, score, word_count, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            data.user_email,
            data.url,
            data.title || null,
            data.score ?? null,
            data.word_count ?? null,
            data.status || 'success',
          ]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to save user audit to MySQL:', error);
    }
  }

  // In-memory fallback
  memoryAuditHistory.unshift({
    id: localAuditIdCounter++,
    user_email: data.user_email,
    url: data.url,
    title: data.title || null,
    score: data.score ?? null,
    word_count: data.word_count ?? null,
    status: data.status || 'success',
    created_at: new Date().toISOString(),
  });
  return true;
}

/**
 * Retrieves audit history for a specific user
 */
export async function getUserAudits(
  email: string,
  limit: number = 50
): Promise<DbUserAudit[]> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = await connection.execute(
          `SELECT * FROM user_audit_history WHERE user_email = ? ORDER BY created_at DESC LIMIT ?`,
          [email, String(limit)]
        );
        return rows as DbUserAudit[];
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch user audits from MySQL:', error);
    }
  }

  return memoryAuditHistory
    .filter((a) => a.user_email.toLowerCase() === email.toLowerCase())
    .slice(0, limit);
}

/**
 * Saves user AI generation activity
 */
export async function saveUserAiActivity(data: {
  user_email: string;
  action_type: string;
  target_summary: string;
  result_summary: string;
}): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO user_ai_history (user_email, action_type, target_summary, result_summary) VALUES (?, ?, ?, ?)`,
          [
            data.user_email,
            data.action_type,
            data.target_summary,
            data.result_summary.slice(0, 1000),
          ]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to save user AI activity to MySQL:', error);
    }
  }

  memoryAiHistory.unshift({
    id: localAiIdCounter++,
    user_email: data.user_email,
    action_type: data.action_type,
    target_summary: data.target_summary,
    result_summary: data.result_summary.slice(0, 1000),
    created_at: new Date().toISOString(),
  });
  return true;
}

/**
 * Retrieves AI generation history for a specific user
 */
export async function getUserAiActivities(
  email: string,
  limit: number = 50
): Promise<DbUserAiActivity[]> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = await connection.execute(
          `SELECT * FROM user_ai_history WHERE user_email = ? ORDER BY created_at DESC LIMIT ?`,
          [email, String(limit)]
        );
        return rows as DbUserAiActivity[];
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch user AI history from MySQL:', error);
    }
  }

  return memoryAiHistory
    .filter((a) => a.user_email.toLowerCase() === email.toLowerCase())
    .slice(0, limit);
}

/**
 * Aggregates dashboard statistics for a user
 */
export async function getUserDashboardStats(email: string): Promise<{
  totalAudits: number;
  totalAiGenerations: number;
  avgScore: number;
}> {
  const audits = await getUserAudits(email, 200);
  const aiActivities = await getUserAiActivities(email, 200);

  const scoredAudits = audits.filter((a) => typeof a.score === 'number' && a.score > 0);
  const avgScore = scoredAudits.length > 0
    ? Math.round(scoredAudits.reduce((acc, curr) => acc + (curr.score || 0), 0) / scoredAudits.length)
    : 0;

  return {
    totalAudits: audits.length,
    totalAiGenerations: aiActivities.length,
    avgScore,
  };
}
