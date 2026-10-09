-- v3 迁移：密码重置码存储表
-- 在 Supabase SQL Editor 执行

CREATE TABLE IF NOT EXISTS settings (
  id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  reset_code TEXT NOT NULL DEFAULT '请修改',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 单行配置，初始重置码占位（部署后请在管理后台点「生成新码」换成随机值）
INSERT INTO settings (id, reset_code) VALUES (1, '请修改')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_all" ON settings FOR ALL USING (true);
