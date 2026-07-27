import { CONTACTS_PER_DAY } from "./constants.js";

export async function ensureContactInboxTables(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contact_limits (
      limit_key TEXT NOT NULL,
      day_key TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1 CHECK(count BETWEEN 1 AND ${CONTACTS_PER_DAY}),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(limit_key, day_key)
    )
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 80),
      reply_email TEXT NOT NULL CHECK(length(reply_email) BETWEEN 3 AND 254),
      subject TEXT NOT NULL CHECK(length(subject) BETWEEN 3 AND 120),
      message TEXT NOT NULL CHECK(length(message) BETWEEN 20 AND 2000),
      listing_id INTEGER,
      listing_name TEXT NOT NULL DEFAULT '',
      listing_domain TEXT NOT NULL DEFAULT '',
      listing_path TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
      submitter_email_hash TEXT NOT NULL,
      submitter_ip_hash TEXT NOT NULL,
      day_key TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT
    )
  `).run();

  await db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
    ON contact_messages(status, created_at DESC)
  `).run();
}
