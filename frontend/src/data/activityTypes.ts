import type { ActivityCategory } from '../types';

export const activityCategories: ActivityCategory[] = [
  {
    id: '比赛',
    name: '参加比赛',
    icon: '🏆',
    fields: [
      { key: 'description', label: '比赛名称', type: 'text', required: true, placeholder: '如：第十六届华语辩论锦标赛' },
      { key: 'date', label: '比赛日期', type: 'date', required: true },
    ],
    options: [
      { key: 'online', label: '网辩赛（上场）', points: 7, perPerson: true },
      { key: 'offline', label: '实体赛（上场）', points: 7, perPerson: true },
      { key: 'win', label: '获胜（上场队员每人）', points: 4, perPerson: true },
      { key: 'bestDebater', label: '最佳辩手', points: 7, perPerson: false, maxSelect: 1, needSelectMember: true },
      { key: 'overallBest', label: '全程最佳辩手', points: 15, perPerson: false, maxSelect: 1, needSelectMember: true },
      { key: 'support', label: '备赛支持（非上场）', points: 2, perPerson: false, maxSelect: 2, needSelectMember: true },
    ],
    hasCoach: true,
    hasMembers: true,
    isBatch: true,
  },
  {
    id: '模辩',
    name: '参加模辩/训练赛/培训',
    icon: '📝',
    fields: [
      { key: 'description', label: '活动简述', type: 'text', required: false, placeholder: '如：队内训练赛 / 集中培训' },
      { key: 'date', label: '日期', type: 'date', required: true },
    ],
    options: [
      { key: 'sparring', label: '上场', points: 3, perPerson: true },
      { key: 'training', label: '参加培训', points: 5, perPerson: true },
    ],
    hasMembers: true,
    isBatch: true,
  },
  {
    id: '宣传',
    name: '宣传工作',
    icon: '📣',
    fields: [
      { key: 'description', label: '内容简述', type: 'text', required: true, placeholder: '如：招新预热推文' },
      { key: 'date', label: '日期', type: 'date', required: true },
    ],
    options: [
      { key: 'articleFull', label: '独立完成推文', points: 3, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'articlePartial', label: '推文供稿/素材', points: 2, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'poster', label: '海报设计', points: 3, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'photo', label: '摄影/录像整理', points: 3, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'socialMedia', label: '官号运营达标（学期）', points: 10, perPerson: false, needSelectMember: true, maxSelect: 1 },
    ],
    hasMembers: true,
  },
  {
    id: '活动',
    name: '活动组织',
    icon: '📋',
    fields: [
      { key: 'description', label: '事项简述', type: 'text', required: true, placeholder: '如：策划新生赛' },
      { key: 'date', label: '日期', type: 'date', required: true },
    ],
    options: [
      { key: 'planContest', label: '主责策划校内赛', points: 10, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'execContest', label: '校内赛执行', points: 3, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'finance', label: '财务报销/报表', points: 2, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'liaison', label: '对外联络', points: 3, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'database', label: '数据库维护', points: 2, perPerson: false, needSelectMember: true, maxSelect: 1 },
    ],
    hasMembers: true,
  },
  {
    id: '通用',
    name: '通用加分',
    icon: '🤝',
    fields: [
      { key: 'description', label: '事项简述', type: 'text', required: true, placeholder: '如：参加总结会' },
      { key: 'date', label: '日期', type: 'date', required: true },
    ],
    options: [
      { key: 'gathering', label: '团建/总结会/换届会', points: 2, perPerson: true },
      { key: 'schoolEvent', label: '校级活动代表', points: 5, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'crossDept', label: '跨部门协助', points: 2, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'resource', label: '争取外部资源', points: 10, perPerson: false, needSelectMember: true, maxSelect: 1 },
    ],
    hasMembers: true,
    isBatch: true,
  },
  {
    id: '周期',
    name: '周期性积分',
    icon: '📅',
    fields: [
      { key: 'description', label: '学期', type: 'select', required: true, placeholder: '选择学期',
        options: [
          { label: '秋季学期（9月-次年1月）', value: '秋季学期' },
          { label: '春季学期（2月-6月）', value: '春季学期' },
        ] },
      { key: 'date', label: '评定日期', type: 'date', required: true },
    ],
    options: [
      { key: 'captainDuty', label: '队长履职', points: 8, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'competitionFull', label: '赛事部全勤', points: 12, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'activityFull', label: '活动部全勤', points: 8, perPerson: false, needSelectMember: true, maxSelect: 1 },
      { key: 'publicityFull', label: '宣传部全勤', points: 8, perPerson: false, needSelectMember: true, maxSelect: 1 },
    ],
    hasMembers: false,
  },
];
