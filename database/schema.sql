PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 80),
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  normalized_domain TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL CHECK(length(description) BETWEEN 50 AND 350),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK(status IN ('pending','approved','rejected','suspended')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK(featured IN (0,1)),
  submitter_email_hash TEXT NOT NULL,
  submitter_ip_hash TEXT NOT NULL,
  submission_day TEXT NOT NULL,
  rejection_reason TEXT NOT NULL DEFAULT '',
  report_count INTEGER NOT NULL DEFAULT 0 CHECK(report_count >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sites_public ON sites(status, featured, approved_at DESC);
CREATE INDEX IF NOT EXISTS idx_sites_category ON sites(status, category, approved_at DESC);
CREATE INDEX IF NOT EXISTS idx_sites_created ON sites(created_at DESC);

CREATE TABLE IF NOT EXISTS submission_limits (
  limit_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK(count BETWEEN 1 AND 2),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(limit_key, day_key)
);

CREATE TABLE IF NOT EXISTS report_limits (
  limit_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK(count BETWEEN 1 AND 5),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(limit_key, day_key)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  reporter_ip_hash TEXT NOT NULL,
  day_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE,
  UNIQUE(site_id, reporter_ip_hash, day_key)
);

CREATE INDEX IF NOT EXISTS idx_reports_site ON reports(site_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contact_limits (
  limit_key TEXT NOT NULL,
  day_key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK(count BETWEEN 1 AND 5),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(limit_key, day_key)
);
