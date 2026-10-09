import type { AcademicYear } from '../types';

export const academicYear: AcademicYear = {
  id: '2026-2027',
  name: '2026-2027 学年',
  startDate: '2026-09-01',
  endDate: '2027-06-01',
  prizePool: 1000,
  isActive: true,
};

export const prizeDistribution = [
  { rank: 1, amount: 300, label: '第 1 名' },
  { rank: 2, amount: 200, label: '第 2 名' },
  { rank: 3, amount: 120, label: '第 3 名' },
  { rank: 4, amount: 80, label: '第 4 名' },
  { rank: 5, amount: 80, label: '第 5 名' },
  { rank: 6, amount: 40, label: '第 6 名' },
  { rank: 7, amount: 40, label: '第 7 名' },
  { rank: 8, amount: 40, label: '第 8 名' },
];

export const departmentQuotas = {
  activity: 1,
  publicity: 1,
  flexible: 1,
  crossTop: 5,
};

export const topRankRewards = {
  top1: ['指定任意教练一对一赛后复盘', '教练优先协助备赛', '优先选择外赛参赛场次'],
  top23: ['指定任意教练一对一赛后复盘', '教练优先协助备赛'],
  top45: ['指定任意教练一对一赛后复盘（每学期限1次）'],
};
