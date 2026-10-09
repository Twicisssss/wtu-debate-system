# 武汉纺织大学辩论队 · 积分系统

辩论队内部积分奖励系统，用于量化队员贡献、管理奖金池、学年末按排名发放奖金。

- **线上地址**：https://wtu-debate.top
- **奖金池**：每学年 1000 元（赞助人：黄成意）
- **结算日期**：每年 6 月 1 日

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS（Apple 风格定制） |
| 数据库 | Supabase（PostgreSQL） |
| 鉴权 | bcrypt 密码哈希 + 自定义登录 |
| 图表 | Recharts |
| 部署 | Netlify |

## 快速开始

```bash
cd frontend
npm install
npm run dev
```

本地开发服务器默认运行在 http://localhost:5173

## 项目结构

```
frontend/
├── src/
│   ├── components/    # 布局组件（侧边栏、导航）
│   ├── pages/         # 页面（首页、积分榜、提交、记录、管理、名录、个人信息、登录注册）
│   ├── store/         # Context 状态管理（AuthContext、PointsContext）
│   ├── data/          # 积分规则配置、种子数据
│   ├── lib/           # Supabase 客户端
│   └── types/         # TypeScript 类型定义
├── public/            # 静态资源（favicon 等）
└── index.html
```

## 数据库

数据库托管在 Supabase，表结构见根目录 SQL 文件：

- `supabase-schema.sql` — 建表 + 初始种子数据
- `supabase-migration-v2.sql` — 增加个人信息字段
- `supabase-migration-v3.sql` — 密码重置码表

**重要**：Supabase 的 anon key（`src/lib/supabase.ts` 中）是公开的 publishable key，可在浏览器中使用，上传到仓库安全。但数据库的 `service_role` key 绝不能泄露。

## 部署

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/`，拖到 Netlify Drop 即可部署（https://app.netlify.com/drop）。

## 积分规则

积分规则详见 `武汉纺织大学辩论队奖金池积分制度.md`，核心规则：

- 6 大类积分：参加比赛、模辩/训练赛/培训、宣传、活动组织、通用、周期性
- 奖金池：跨部门 Top 5 + 活动部/宣传部各保底 1 名 + 机动 1 名
- 教练排行榜独立于奖金池
- 密码重置码存数据库，队长在管理后台可见、可换

## 维护说明

- 新学年开始时，队长在「管理后台 → 结算」中点「开启新学年」清零积分
- 忘记密码：队长在「管理后台 → 队员」查看重置码，队员在登录页「忘记密码」里重置
- 修改积分规则：编辑 `src/data/activityTypes.ts` 后重新 build + 部署
