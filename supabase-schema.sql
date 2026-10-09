-- 誠壹积分系统 数据库初始化脚本
--
-- 使用方法：
-- 1. 打开 https://supabase.com/dashboard/project/vlammjpllkjclozwjcsl/sql/new
-- 2. 完整粘贴此文件，点击 Run

-- ============================================================
-- 创建扩展
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. 队员表
-- ============================================================
CREATE TABLE members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL CHECK (department IN ('赛事部', '活动部', '宣传部')),
  grade         INTEGER NOT NULL,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('super_admin', 'captain', 'member')),
  is_coach      BOOLEAN DEFAULT false,
  coach_points  INTEGER DEFAULT 0,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. 积分记录表
-- ============================================================
CREATE TABLE points_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL,
  description     TEXT DEFAULT '',
  date            DATE NOT NULL,
  submitter_id    TEXT NOT NULL,
  coach_id        TEXT,
  coach_points    INTEGER DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by     TEXT,
  rejected_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. 积分项明细
-- ============================================================
CREATE TABLE points_record_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id   UUID NOT NULL REFERENCES points_records(id) ON DELETE CASCADE,
  member_id   TEXT NOT NULL,
  member_name TEXT NOT NULL,
  department  TEXT NOT NULL,
  label       TEXT NOT NULL,
  points      INTEGER NOT NULL
);

-- ============================================================
-- 4. 学年配置
-- ============================================================
CREATE TABLE academic_years (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  prize_pool  INTEGER DEFAULT 1000,
  is_active   BOOLEAN DEFAULT true
);

-- ============================================================
-- RLS 策略（允许所有操作，通过前端代码控制权限）
-- ============================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_record_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_all" ON members FOR ALL USING (true);
CREATE POLICY "records_all" ON points_records FOR ALL USING (true);
CREATE POLICY "items_all" ON points_record_items FOR ALL USING (true);
CREATE POLICY "years_all" ON academic_years FOR ALL USING (true);

-- ============================================================
-- 初始数据
-- ============================================================
-- 说明：队员账号请通过系统「注册」功能创建，或手动插入（密码需用 bcrypt 哈希）。
-- 首个超管账号需手动插入（role = 'super_admin'），密码哈希用 bcryptjs 生成。

-- 学年
INSERT INTO academic_years (name, start_date, end_date, prize_pool, is_active) VALUES
('2026-2027 学年', '2026-09-01', '2027-06-30', 1000, true);
