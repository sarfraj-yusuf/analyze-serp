import mysql from 'mysql2/promise';

/**
 * Hostinger MySQL Connection Pool Configuration
 * Strictly capped to 10 connections to respect Hostinger shared hosting limits.
 * Global singleton pattern ensures zero connection pool multiplication across Next.js reloads.
 */
const globalForDb = globalThis as unknown as {
  analyzeSerpPool?: mysql.Pool | null;
  analyzeSerpTablesInitPromise?: Promise<void> | null;
  analyzeSerpTablesInitialized?: boolean;
};

let pool: mysql.Pool | null = globalForDb.analyzeSerpPool || null;
let isTablesInitialized: boolean = globalForDb.analyzeSerpTablesInitialized || false;
let tablesInitPromise: Promise<void> | null = globalForDb.analyzeSerpTablesInitPromise || null;

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
    globalForDb.analyzeSerpPool = pool;
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
  role?: 'user' | 'pro' | 'admin';
  status?: 'active' | 'suspended';
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

export interface DbUserAuditSnapshot {
  id: number;
  user_email: string;
  url: string;
  label: string;
  score: number;
  target_keyword: string | null;
  snapshot_json: string;
  created_at: string | Date;
}

const memoryFeedbackStore: LocalFeedbackItem[] = [];
const memoryActivityStore: LocalActivityLog[] = [];
const memoryUserStore = new Map<string, DbUser>();
const memoryAuditHistory: DbUserAudit[] = [];
const memoryAiHistory: DbUserAiActivity[] = [];
const memorySnapshotHistory: DbUserAuditSnapshot[] = [];
let localFeedbackIdCounter = 1;
let localActivityIdCounter = 1;
let localAuditIdCounter = 1;
let localAiIdCounter = 1;
let localSnapshotIdCounter = 1;

/**
 * Ensures required DB tables exist on Hostinger MySQL
 */
export async function initDatabaseTables(): Promise<void> {
  if (isTablesInitialized || globalForDb.analyzeSerpTablesInitialized) {
    return;
  }
  if (tablesInitPromise) {
    return tablesInitPromise;
  }

  const db = getPool();
  if (!db) return;

  tablesInitPromise = (async () => {
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
          role VARCHAR(20) DEFAULT 'user',
          status VARCHAR(20) DEFAULT 'active',
          last_credit_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Safe non-destructive column additions for existing production tables
      try {
        const [roleCol] = (await connection.query(`
          SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
        `)) as any;
        if (roleCol && roleCol[0] && Number(roleCol[0].cnt) === 0) {
          await connection.query(`ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'`);
        }
      } catch (colErr) {
        console.error('[DB Migration Error] role check:', colErr);
      }

      try {
        const [statusCol] = (await connection.query(`
          SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
        `)) as any;
        if (statusCol && statusCol[0] && Number(statusCol[0].cnt) === 0) {
          await connection.query(`ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active'`);
        }
      } catch (colErr) {
        console.error('[DB Migration Error] status check:', colErr);
      }

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

      await connection.query(`
        CREATE TABLE IF NOT EXISTS user_audit_snapshots (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          url VARCHAR(500) NOT NULL,
          label VARCHAR(255) NOT NULL,
          score INT NOT NULL,
          target_keyword VARCHAR(255) NULL,
          snapshot_json MEDIUMTEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_snap_email (user_email),
          INDEX idx_snap_url (url),
          INDEX idx_snap_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS security_incident_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          incident_type VARCHAR(50) NOT NULL,
          severity VARCHAR(20) NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          target_endpoint VARCHAR(255) NULL,
          details TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_incident_ip (ip_address),
          INDEX idx_incident_type (incident_type),
          INDEX idx_incident_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS ip_blacklist (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ip_address VARCHAR(45) UNIQUE NOT NULL,
          reason VARCHAR(255) NOT NULL,
          banned_by VARCHAR(100) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_banned_ip (ip_address)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS site_configurations (
          config_key VARCHAR(100) PRIMARY KEY,
          config_value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } finally {
      connection.release();
    }
    isTablesInitialized = true;
    globalForDb.analyzeSerpTablesInitialized = true;
  } catch (error) {
    console.error('[DB Init Warning] Failed to initialize MySQL tables:', error);
    tablesInitPromise = null;
    globalForDb.analyzeSerpTablesInitPromise = null;
  }
})();

  globalForDb.analyzeSerpTablesInitPromise = tablesInitPromise;
  return tablesInitPromise;
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
  const siteConfig = await getSiteConfigurations();
  const defaultDailyLimit = siteConfig?.credits?.freeUserDailyCredits || 5;
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO users (id, name, email, image, provider, provider_id, daily_ai_credits_used, daily_ai_credits_limit, last_credit_reset)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?, NOW())
           ON DUPLICATE KEY UPDATE
             name = COALESCE(VALUES(name), name),
             image = COALESCE(VALUES(image), image),
             provider = VALUES(provider),
             provider_id = VALUES(provider_id)`,
          [user.id, user.name || null, user.email, user.image || null, user.provider, user.provider_id, defaultDailyLimit]
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
    daily_ai_credits_limit: defaultDailyLimit,
    role: 'user',
    status: 'active',
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
 * Fetches all registered users for the Admin Console
 */
export async function getAllUsers(): Promise<DbUser[]> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = await connection.execute(
          `SELECT id, name, email, image, provider, provider_id, daily_ai_credits_used, daily_ai_credits_limit, role, status, last_credit_reset, created_at FROM users ORDER BY created_at DESC`
        );
        return rows as DbUser[];
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch all users from MySQL:', error);
    }
  }

  // Fallback to in-memory store
  return Array.from(memoryUserStore.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Admin action to adjust user credits, role, or status
 */
export async function adminUpdateUser(
  email: string,
  updates: {
    daily_ai_credits_limit?: number;
    daily_ai_credits_used?: number;
    role?: 'user' | 'pro' | 'admin';
    status?: 'active' | 'suspended';
  }
): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const setClauses: string[] = [];
        const values: any[] = [];

        if (updates.daily_ai_credits_limit !== undefined) {
          setClauses.push('daily_ai_credits_limit = ?');
          values.push(updates.daily_ai_credits_limit);
        }
        if (updates.daily_ai_credits_used !== undefined) {
          setClauses.push('daily_ai_credits_used = ?');
          values.push(updates.daily_ai_credits_used);
        }
        if (updates.role !== undefined) {
          setClauses.push('role = ?');
          values.push(updates.role);
        }
        if (updates.status !== undefined) {
          setClauses.push('status = ?');
          values.push(updates.status);
        }

        if (setClauses.length > 0) {
          values.push(email);
          await connection.execute(
            `UPDATE users SET ${setClauses.join(', ')} WHERE email = ?`,
            values
          );
        }
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to adminUpdateUser in MySQL:', error);
    }
  }

  // In-memory fallback
  const user = memoryUserStore.get(email);
  if (user) {
    if (updates.daily_ai_credits_limit !== undefined) user.daily_ai_credits_limit = updates.daily_ai_credits_limit;
    if (updates.daily_ai_credits_used !== undefined) user.daily_ai_credits_used = updates.daily_ai_credits_used;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.status !== undefined) user.status = updates.status;
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
 * Deletes an audit entry by ID for an authenticated user
 */
export async function deleteUserAudit(
  email: string,
  auditId: number
): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `DELETE FROM user_audit_history WHERE id = ? AND user_email = ?`,
          [auditId, email]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to delete user audit from MySQL:', error);
    }
  }

  const idx = memoryAuditHistory.findIndex(
    (a) => a.id === auditId && a.user_email.toLowerCase() === email.toLowerCase()
  );
  if (idx !== -1) {
    memoryAuditHistory.splice(idx, 1);
    return true;
  }
  return false;
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

/**
 * Saves an audit snapshot to MySQL or in-memory fallback
 */
export async function saveUserAuditSnapshot(data: {
  user_email: string;
  url: string;
  label: string;
  score: number;
  target_keyword?: string | null;
  snapshot_json: string;
}): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO user_audit_snapshots (user_email, url, label, score, target_keyword, snapshot_json) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            data.user_email,
            data.url,
            data.label,
            data.score,
            data.target_keyword ?? null,
            data.snapshot_json,
          ]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to save user audit snapshot to MySQL:', error);
    }
  }

  // In-memory fallback
  memorySnapshotHistory.unshift({
    id: localSnapshotIdCounter++,
    user_email: data.user_email,
    url: data.url,
    label: data.label,
    score: data.score,
    target_keyword: data.target_keyword ?? null,
    snapshot_json: data.snapshot_json,
    created_at: new Date().toISOString(),
  });
  return true;
}

/**
 * Retrieves audit snapshots for a specific user, optionally filtered by URL
 */
export async function getUserAuditSnapshots(
  email: string,
  url?: string,
  limit: number = 20
): Promise<DbUserAuditSnapshot[]> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        if (url) {
          const [rows] = await connection.execute(
            `SELECT * FROM user_audit_snapshots WHERE user_email = ? AND url = ? ORDER BY created_at DESC LIMIT ?`,
            [email, url, String(limit)]
          );
          return rows as DbUserAuditSnapshot[];
        } else {
          const [rows] = await connection.execute(
            `SELECT * FROM user_audit_snapshots WHERE user_email = ? ORDER BY created_at DESC LIMIT ?`,
            [email, String(limit)]
          );
          return rows as DbUserAuditSnapshot[];
        }
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch user audit snapshots from MySQL:', error);
    }
  }

  return memorySnapshotHistory
    .filter(
      (s) =>
        s.user_email.toLowerCase() === email.toLowerCase() &&
        (!url || s.url.toLowerCase() === url.toLowerCase())
    )
    .slice(0, limit);
}

/**
 * Retrieves a single audit snapshot by ID for an authenticated user
 */
export async function getUserAuditSnapshotById(
  email: string,
  snapshotId: number
): Promise<DbUserAuditSnapshot | null> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = await connection.execute(
          `SELECT * FROM user_audit_snapshots WHERE id = ? AND user_email = ? LIMIT 1`,
          [snapshotId, email]
        );
        const snapshots = rows as DbUserAuditSnapshot[];
        if (snapshots.length > 0) {
          return snapshots[0];
        }
        return null;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to fetch user audit snapshot by ID from MySQL:', error);
    }
  }

  return (
    memorySnapshotHistory.find(
      (s) => s.id === snapshotId && s.user_email.toLowerCase() === email.toLowerCase()
    ) || null
  );
}

/**
 * Deletes a snapshot by ID for an authenticated user
 */
export async function deleteUserAuditSnapshot(
  email: string,
  snapshotId: number
): Promise<boolean> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `DELETE FROM user_audit_snapshots WHERE id = ? AND user_email = ?`,
          [snapshotId, email]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to delete user audit snapshot from MySQL:', error);
    }
  }

  const idx = memorySnapshotHistory.findIndex(
    (s) => s.id === snapshotId && s.user_email.toLowerCase() === email.toLowerCase()
  );
  if (idx !== -1) {
    memorySnapshotHistory.splice(idx, 1);
    return true;
  }
  return false;
}

export interface MarketIntelligenceData {
  topDomains: { domain: string; count: number; percentage: number; lastAuditedAt: string }[];
  topKeywords: { keyword: string; count: number; avgScore: number; lastUsedAt: string }[];
  scoreDistribution: { range: string; label: string; count: number; percentage: number; color: string }[];
  recentSnapshots: Omit<DbUserAuditSnapshot, 'snapshot_json'>[];
  uniqueDomainsCount: number;
  uniqueKeywordsCount: number;
  platformAvgScore: number;
}

function extractDomainHelper(rawUrl: string): string {
  try {
    let normalized = rawUrl.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return rawUrl.split('/')[0].replace(/^www\./, '').toLowerCase();
  }
}

/**
 * Aggregates competitor domains, focus keywords, score brackets, and recent snapshots
 */
export async function getCompetitorMarketIntelligence(): Promise<MarketIntelligenceData> {
  const db = getPool();

  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [activityUrlRows] = (await connection.execute(
          `SELECT target_url, used_at FROM user_activity_logs WHERE target_url IS NOT NULL AND target_url != '' ORDER BY used_at DESC LIMIT 500`
        )) as any;

        const [snapshotRows] = (await connection.execute(
          `SELECT id, user_email, url, label, score, target_keyword, created_at FROM user_audit_snapshots ORDER BY created_at DESC LIMIT 200`
        )) as any;

        // Process Domains
        const domainMap: Record<string, { count: number; lastAuditedAt: string }> = {};
        const allUrls: { url: string; date: string }[] = [];

        (activityUrlRows || []).forEach((row: any) => {
          if (row.target_url) allUrls.push({ url: row.target_url, date: row.used_at });
        });

        (snapshotRows || []).forEach((row: any) => {
          if (row.url) allUrls.push({ url: row.url, date: row.created_at });
        });

        allUrls.forEach(({ url, date }) => {
          const domain = extractDomainHelper(url);
          if (!domain || domain === 'localhost' || domain.length < 3) return;
          if (!domainMap[domain]) {
            domainMap[domain] = { count: 0, lastAuditedAt: date };
          }
          domainMap[domain].count += 1;
          if (new Date(date) > new Date(domainMap[domain].lastAuditedAt)) {
            domainMap[domain].lastAuditedAt = date;
          }
        });

        const totalDomainAudits = Math.max(1, Object.values(domainMap).reduce((sum, d) => sum + d.count, 0));
        const topDomains = Object.entries(domainMap)
          .map(([domain, data]) => ({
            domain,
            count: data.count,
            percentage: Math.round((data.count / totalDomainAudits) * 100),
            lastAuditedAt: data.lastAuditedAt,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Process Keywords
        const keywordMap: Record<string, { count: number; totalScore: number; lastUsedAt: string }> = {};
        (snapshotRows || []).forEach((row: any) => {
          if (row.target_keyword && row.target_keyword.trim()) {
            const kw = row.target_keyword.trim().toLowerCase();
            if (!keywordMap[kw]) {
              keywordMap[kw] = { count: 0, totalScore: 0, lastUsedAt: row.created_at };
            }
            keywordMap[kw].count += 1;
            keywordMap[kw].totalScore += row.score || 0;
            if (new Date(row.created_at) > new Date(keywordMap[kw].lastUsedAt)) {
              keywordMap[kw].lastUsedAt = row.created_at;
            }
          }
        });

        const topKeywords = Object.entries(keywordMap)
          .map(([keyword, data]) => ({
            keyword,
            count: data.count,
            avgScore: Math.round(data.totalScore / data.count),
            lastUsedAt: data.lastUsedAt,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Process Score Distribution
        const scoreBrackets = {
          critical: 0,
          needsWork: 0,
          good: 0,
          elite: 0,
        };
        let totalScoreSum = 0;
        let scoredItemsCount = 0;

        (snapshotRows || []).forEach((row: any) => {
          const s = row.score;
          if (typeof s === 'number') {
            totalScoreSum += s;
            scoredItemsCount += 1;
            if (s < 50) scoreBrackets.critical += 1;
            else if (s < 70) scoreBrackets.needsWork += 1;
            else if (s < 85) scoreBrackets.good += 1;
            else scoreBrackets.elite += 1;
          }
        });

        const totalScored = Math.max(1, scoredItemsCount);
        const scoreDistribution = [
          { range: '< 50', label: 'Critical', count: scoreBrackets.critical, percentage: Math.round((scoreBrackets.critical / totalScored) * 100), color: '#f43f5e' },
          { range: '50 - 69', label: 'Needs Work', count: scoreBrackets.needsWork, percentage: Math.round((scoreBrackets.needsWork / totalScored) * 100), color: '#f59e0b' },
          { range: '70 - 84', label: 'Good Parity', count: scoreBrackets.good, percentage: Math.round((scoreBrackets.good / totalScored) * 100), color: '#06b6d4' },
          { range: '85 - 100', label: 'Elite Benchmarks', count: scoreBrackets.elite, percentage: Math.round((scoreBrackets.elite / totalScored) * 100), color: '#10b981' },
        ];

        const platformAvgScore = scoredItemsCount > 0 ? Math.round(totalScoreSum / scoredItemsCount) : 74;

        const recentSnapshots = (snapshotRows || []).slice(0, 25);

        return {
          topDomains,
          topKeywords,
          scoreDistribution,
          recentSnapshots,
          uniqueDomainsCount: Object.keys(domainMap).length,
          uniqueKeywordsCount: Object.keys(keywordMap).length,
          platformAvgScore,
        };
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('[DB Error] Failed to aggregate market intelligence in MySQL:', error);
    }
  }

  // In-Memory Fallback
  const domainMap: Record<string, { count: number; lastAuditedAt: string }> = {};
  memoryActivityStore.forEach((log) => {
    if (log.target_url) {
      const d = extractDomainHelper(log.target_url);
      if (!domainMap[d]) domainMap[d] = { count: 0, lastAuditedAt: log.used_at };
      domainMap[d].count += 1;
    }
  });
  memorySnapshotHistory.forEach((snap) => {
    if (snap.url) {
      const d = extractDomainHelper(snap.url);
      if (!domainMap[d]) domainMap[d] = { count: 0, lastAuditedAt: String(snap.created_at) };
      domainMap[d].count += 1;
    }
  });

  const totalDomainAudits = Math.max(1, Object.values(domainMap).reduce((sum, d) => sum + d.count, 0));
  const topDomains = Object.entries(domainMap)
    .map(([domain, data]) => ({
      domain,
      count: data.count,
      percentage: Math.round((data.count / totalDomainAudits) * 100),
      lastAuditedAt: data.lastAuditedAt,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const keywordMap: Record<string, { count: number; totalScore: number; lastUsedAt: string }> = {};
  memorySnapshotHistory.forEach((snap) => {
    if (snap.target_keyword) {
      const kw = snap.target_keyword.trim().toLowerCase();
      if (!keywordMap[kw]) keywordMap[kw] = { count: 0, totalScore: 0, lastUsedAt: String(snap.created_at) };
      keywordMap[kw].count += 1;
      keywordMap[kw].totalScore += snap.score;
    }
  });

  const topKeywords = Object.entries(keywordMap)
    .map(([keyword, data]) => ({
      keyword,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
      lastUsedAt: data.lastUsedAt,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const recentSnapshots = memorySnapshotHistory.slice(0, 25).map((s) => ({
    id: s.id,
    user_email: s.user_email,
    url: s.url,
    label: s.label,
    score: s.score,
    target_keyword: s.target_keyword,
    created_at: s.created_at,
  }));

  return {
    topDomains,
    topKeywords,
    scoreDistribution: [
      { range: '< 50', label: 'Critical', count: 0, percentage: 0, color: '#f43f5e' },
      { range: '50 - 69', label: 'Needs Work', count: 1, percentage: 25, color: '#f59e0b' },
      { range: '70 - 84', label: 'Good Parity', count: 2, percentage: 50, color: '#06b6d4' },
      { range: '85 - 100', label: 'Elite Benchmarks', count: 1, percentage: 25, color: '#10b981' },
    ],
    recentSnapshots: recentSnapshots as any,
    uniqueDomainsCount: Object.keys(domainMap).length,
    uniqueKeywordsCount: Object.keys(keywordMap).length,
    platformAvgScore: 78,
  };
}

export interface DbSecurityIncident {
  id: number;
  incident_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  target_endpoint: string | null;
  details: string | null;
  created_at: string | Date;
}

export interface DbBannedIp {
  id: number;
  ip_address: string;
  reason: string;
  banned_by: string;
  created_at: string | Date;
}

export interface SystemHealthData {
  status: 'healthy' | 'degraded';
  dbConnected: boolean;
  dbPingMs: number;
  uptimeSeconds: number;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  services: {
    geminiConfigured: boolean;
    geminiLive?: boolean;
    geminiPingMs?: number;
    pagespeedConfigured: boolean;
    pagespeedLive?: boolean;
    pagespeedPingMs?: number;
    authConfigured: boolean;
    adminKeyConfigured: boolean;
  };
  bannedIpsCount: number;
  incidents24hCount: number;
}

const memoryIncidentLogs: DbSecurityIncident[] = [];
let localIncidentIdCounter = 1;

const memoryBannedIps: DbBannedIp[] = [];
let localBannedIpIdCounter = 1;

// Fast in-memory Set cache for instant O(1) sync check
const bannedIpsFastSet = new Set<string>();

export function isIpBannedFast(ip: string): boolean {
  if (!ip) return false;
  return bannedIpsFastSet.has(ip.trim());
}

export async function isIpBanned(ip: string): Promise<boolean> {
  if (!ip) return false;
  const cleanIp = ip.trim();
  if (bannedIpsFastSet.has(cleanIp)) return true;

  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = (await connection.execute(
          `SELECT id FROM ip_blacklist WHERE ip_address = ? LIMIT 1`,
          [cleanIp]
        )) as any;
        if (rows && rows.length > 0) {
          bannedIpsFastSet.add(cleanIp);
          return true;
        }
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to check ip_blacklist:', err);
    }
  }

  return memoryBannedIps.some((b) => b.ip_address === cleanIp);
}

export async function banIp(
  ip: string,
  reason: string,
  bannedBy: string = 'admin'
): Promise<boolean> {
  if (!ip || !ip.trim()) return false;
  const cleanIp = ip.trim();
  bannedIpsFastSet.add(cleanIp);

  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO ip_blacklist (ip_address, reason, banned_by) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE reason = VALUES(reason), banned_by = VALUES(banned_by)`,
          [cleanIp, reason || 'Manual Admin Ban', bannedBy]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to insert into ip_blacklist:', err);
    }
  }

  const existingIdx = memoryBannedIps.findIndex((b) => b.ip_address === cleanIp);
  if (existingIdx >= 0) {
    memoryBannedIps[existingIdx].reason = reason;
  } else {
    memoryBannedIps.unshift({
      id: localBannedIpIdCounter++,
      ip_address: cleanIp,
      reason: reason || 'Manual Admin Ban',
      banned_by: bannedBy,
      created_at: new Date().toISOString(),
    });
  }
  return true;
}

export async function unbanIp(ip: string): Promise<boolean> {
  if (!ip || !ip.trim()) return false;
  const cleanIp = ip.trim();
  bannedIpsFastSet.delete(cleanIp);

  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(`DELETE FROM ip_blacklist WHERE ip_address = ?`, [cleanIp]);
        return true;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to delete from ip_blacklist:', err);
    }
  }

  const idx = memoryBannedIps.findIndex((b) => b.ip_address === cleanIp);
  if (idx >= 0) {
    memoryBannedIps.splice(idx, 1);
  }
  return true;
}

export async function getBannedIps(): Promise<DbBannedIp[]> {
  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = (await connection.execute(
          `SELECT * FROM ip_blacklist ORDER BY created_at DESC LIMIT 100`
        )) as any;
        const list = rows as DbBannedIp[];
        list.forEach((b) => bannedIpsFastSet.add(b.ip_address));
        return list;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to fetch banned IPs:', err);
    }
  }

  return memoryBannedIps;
}

export async function logSecurityIncident(incident: {
  incident_type: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  target_endpoint?: string | null;
  details?: string | null;
}): Promise<boolean> {
  const severity = incident.severity || 'medium';
  const cleanIp = (incident.ip_address || '127.0.0.1').trim();
  const endpoint = incident.target_endpoint || null;
  const details = incident.details || null;

  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        await connection.execute(
          `INSERT INTO security_incident_logs (incident_type, severity, ip_address, target_endpoint, details) VALUES (?, ?, ?, ?, ?)`,
          [incident.incident_type, severity, cleanIp, endpoint, details]
        );
        return true;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to log security incident to MySQL:', err);
    }
  }

  memoryIncidentLogs.unshift({
    id: localIncidentIdCounter++,
    incident_type: incident.incident_type,
    severity,
    ip_address: cleanIp,
    target_endpoint: endpoint,
    details,
    created_at: new Date().toISOString(),
  });
  if (memoryIncidentLogs.length > 200) {
    memoryIncidentLogs.pop();
  }
  return true;
}

export async function getSecurityIncidents(limit: number = 50): Promise<DbSecurityIncident[]> {
  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = (await connection.execute(
          `SELECT * FROM security_incident_logs ORDER BY created_at DESC LIMIT ?`,
          [String(limit)]
        )) as any;
        return rows as DbSecurityIncident[];
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to fetch security incidents from MySQL:', err);
    }
  }

  return memoryIncidentLogs.slice(0, limit);
}

// In-memory 45s health cache to avoid spamming external Google APIs on repeated admin tab clicks
let cachedLiveHealth: {
  timestamp: number;
  gemini: { live: boolean; pingMs: number };
  pagespeed: { live: boolean; pingMs: number };
} | null = null;

async function checkLiveGeminiHealth(apiKey: string): Promise<{ live: boolean; pingMs: number }> {
  try {
    const start = Date.now();
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${apiKey}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    const pingMs = Math.round(Date.now() - start);
    return {
      live: res.ok,
      pingMs: res.ok ? pingMs : -1,
    };
  } catch {
    return { live: false, pingMs: -1 };
  }
}

async function checkLivePageSpeedHealth(apiKey: string): Promise<{ live: boolean; pingMs: number }> {
  try {
    const start = Date.now();
    const url = apiKey
      ? `https://www.googleapis.com/discovery/v1/apis/pagespeedonline/v5/rest?key=${apiKey}`
      : `https://www.googleapis.com/discovery/v1/apis/pagespeedonline/v5/rest`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    const pingMs = Math.round(Date.now() - start);
    return {
      live: res.ok,
      pingMs: res.ok ? pingMs : -1,
    };
  } catch {
    return { live: false, pingMs: -1 };
  }
}

export async function getSystemHealthTelemetry(): Promise<SystemHealthData> {
  let dbConnected = false;
  let dbPingMs = 0;

  const db = getPool();
  if (db) {
    try {
      const start = Date.now();
      const conn = await db.getConnection();
      try {
        await conn.query('SELECT 1');
        dbPingMs = Date.now() - start;
        dbConnected = true;
      } finally {
        conn.release();
      }
    } catch {
      dbConnected = false;
      dbPingMs = -1;
    }
  }

  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const bannedIps = await getBannedIps();
  const incidents = await getSecurityIncidents(100);

  // Count incidents in last 24h
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const incidents24hCount = incidents.filter(
    (inc) => new Date(inc.created_at).getTime() > oneDayAgo
  ).length;

  const geminiKey = process.env.GEMINI_API_KEY;
  const pagespeedKey = process.env.PAGESPEED_API_KEY;

  const now = Date.now();
  let geminiHealth = { live: false, pingMs: -1 };
  let pagespeedHealth = { live: false, pingMs: -1 };

  if (cachedLiveHealth && now - cachedLiveHealth.timestamp < 45000) {
    geminiHealth = cachedLiveHealth.gemini;
    pagespeedHealth = cachedLiveHealth.pagespeed;
  } else {
    const checks: [Promise<{ live: boolean; pingMs: number }>, Promise<{ live: boolean; pingMs: number }>] = [
      geminiKey ? checkLiveGeminiHealth(geminiKey) : Promise.resolve({ live: false, pingMs: -1 }),
      pagespeedKey ? checkLivePageSpeedHealth(pagespeedKey) : Promise.resolve({ live: false, pingMs: -1 }),
    ];

    const [geminiRes, pagespeedRes] = await Promise.allSettled(checks);

    geminiHealth = geminiRes.status === 'fulfilled' ? geminiRes.value : { live: false, pingMs: -1 };
    pagespeedHealth = pagespeedRes.status === 'fulfilled' ? pagespeedRes.value : { live: false, pingMs: -1 };

    cachedLiveHealth = {
      timestamp: now,
      gemini: geminiHealth,
      pagespeed: pagespeedHealth,
    };
  }

  const services = {
    geminiConfigured: Boolean(geminiKey),
    geminiLive: geminiHealth.live,
    geminiPingMs: geminiHealth.pingMs,
    pagespeedConfigured: Boolean(pagespeedKey),
    pagespeedLive: pagespeedHealth.live,
    pagespeedPingMs: pagespeedHealth.pingMs,
    authConfigured: Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    adminKeyConfigured: Boolean(process.env.ADMIN_SECRET_KEY),
  };

  const isGeminiHealthy = services.geminiConfigured ? services.geminiLive : true;
  const status: 'healthy' | 'degraded' =
    dbConnected && services.geminiConfigured && isGeminiHealthy && services.adminKeyConfigured
      ? 'healthy'
      : 'degraded';

  return {
    status,
    dbConnected,
    dbPingMs,
    uptimeSeconds,
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / (1024 * 1024)),
      heapTotalMB: Math.round(mem.heapTotal / (1024 * 1024)),
      rssMB: Math.round(mem.rss / (1024 * 1024)),
    },
    services,
    bannedIpsCount: bannedIps.length,
    incidents24hCount,
  };
}

export interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  level: 'banner_only' | 'strict_lock';
  expectedCompletion: string;
}

export interface AnnouncementBannerConfig {
  enabled: boolean;
  badge: string;
  text: string;
  linkText: string;
  linkUrl: string;
  variant: 'info' | 'promotion' | 'warning' | 'success';
  dismissable: boolean;
}

export interface CreditLimitsConfig {
  freeUserDailyCredits: number;
  proUserDailyCredits: number;
}

export interface SiteConfigurations {
  maintenance: MaintenanceConfig;
  announcement: AnnouncementBannerConfig;
  credits: CreditLimitsConfig;
}

const DEFAULT_SITE_CONFIG: SiteConfigurations = {
  maintenance: {
    enabled: false,
    title: 'Scheduled Platform Maintenance',
    message: 'We are currently performing routine infrastructure optimization. All diagnostic tools remain available.',
    level: 'banner_only',
    expectedCompletion: '',
  },
  announcement: {
    enabled: true,
    badge: 'Public Beta',
    text: 'Analyze up to 5 competitors simultaneously with live lexical & SERP parity benchmarks.',
    linkText: 'Start Free Audit',
    linkUrl: '/audit',
    variant: 'info',
    dismissable: true,
  },
  credits: {
    freeUserDailyCredits: 5,
    proUserDailyCredits: 50,
  },
};

// In-memory cache for O(1) sync access without DB query latency
let cachedSiteConfig: SiteConfigurations = { ...DEFAULT_SITE_CONFIG };
let isSiteConfigLoaded = false;

export async function getSiteConfigurations(): Promise<SiteConfigurations> {
  if (isSiteConfigLoaded) {
    return cachedSiteConfig;
  }

  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const [rows] = (await connection.execute(
          `SELECT config_key, config_value FROM site_configurations`
        )) as any;

        if (rows && rows.length > 0) {
          const loadedConfig: SiteConfigurations = {
            maintenance: { ...DEFAULT_SITE_CONFIG.maintenance },
            announcement: { ...DEFAULT_SITE_CONFIG.announcement },
            credits: { ...DEFAULT_SITE_CONFIG.credits },
          };

          rows.forEach((row: any) => {
            try {
              if (row.config_key === 'maintenance') {
                loadedConfig.maintenance = { ...DEFAULT_SITE_CONFIG.maintenance, ...JSON.parse(row.config_value) };
              } else if (row.config_key === 'announcement') {
                loadedConfig.announcement = { ...DEFAULT_SITE_CONFIG.announcement, ...JSON.parse(row.config_value) };
              } else if (row.config_key === 'credits') {
                loadedConfig.credits = { ...DEFAULT_SITE_CONFIG.credits, ...JSON.parse(row.config_value) };
              }
            } catch (err) {
              console.error(`[DB Error] Failed to parse site_configurations key ${row.config_key}:`, err);
            }
          });
          cachedSiteConfig = loadedConfig;
          isSiteConfigLoaded = true;
          return cachedSiteConfig;
        }
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to load site_configurations:', err);
    }
  }

  isSiteConfigLoaded = true;
  return cachedSiteConfig;
}

export async function updateSiteConfigurations(
  updates: Partial<SiteConfigurations>,
  applyToExistingFreeUsers: boolean = false
): Promise<SiteConfigurations> {
  const current = await getSiteConfigurations();

  const newConfig: SiteConfigurations = {
    maintenance: updates.maintenance ? { ...current.maintenance, ...updates.maintenance } : current.maintenance,
    announcement: updates.announcement ? { ...current.announcement, ...updates.announcement } : current.announcement,
    credits: updates.credits ? { ...current.credits, ...updates.credits } : current.credits,
  };

  cachedSiteConfig = newConfig;

  const db = getPool();
  if (db) {
    try {
      await initDatabaseTables();
      const connection = await db.getConnection();
      try {
        const queries: Promise<any>[] = [
          connection.execute(
            `INSERT INTO site_configurations (config_key, config_value) VALUES ('maintenance', ?)
             ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
            [JSON.stringify(newConfig.maintenance)]
          ),
          connection.execute(
            `INSERT INTO site_configurations (config_key, config_value) VALUES ('announcement', ?)
             ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
            [JSON.stringify(newConfig.announcement)]
          ),
          connection.execute(
            `INSERT INTO site_configurations (config_key, config_value) VALUES ('credits', ?)
             ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
            [JSON.stringify(newConfig.credits)]
          ),
        ];

        if (applyToExistingFreeUsers && newConfig.credits?.freeUserDailyCredits) {
          queries.push(
            connection.execute(
              `UPDATE users SET daily_ai_credits_limit = ? WHERE role != 'pro'`,
              [newConfig.credits.freeUserDailyCredits]
            )
          );
        }

        await Promise.all(queries);
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[DB Error] Failed to save site_configurations to MySQL:', err);
    }
  }

  if (applyToExistingFreeUsers && newConfig.credits?.freeUserDailyCredits) {
    for (const user of memoryUserStore.values()) {
      if (user.role !== 'pro') {
        user.daily_ai_credits_limit = newConfig.credits.freeUserDailyCredits;
      }
    }
  }

  return cachedSiteConfig;
}


