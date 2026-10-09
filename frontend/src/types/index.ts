export type Department = '赛事部' | '活动部' | '宣传部';
export type Role = 'super_admin' | 'captain' | 'member';

export interface Member {
  id: string;
  studentId: string;
  name: string;
  department: Department;
  grade: number;
  role: Role;
  password: string;
  isCoach: boolean;
  coachPoints: number;
  phone?: string;
  qq?: string;
  wechat?: string;
  email?: string;
  gender?: string;
  birthday?: string;
}

export interface PointsRecord {
  id: string;
  type: '参加比赛' | '参加模辩/训练赛/培训' | '宣传工作' | '活动组织' | '通用加分' | '周期性积分';
  description: string;        // 活动名称/简述
  date: string;               // ISO date
  submitterId: string;        // 提交人学号
  items: PointsRecordItem[];  // 每个队员的加分明细
  coachId?: string;           // 负责教练学号（仅比赛类）
  coachPoints?: number;       // 教练加分
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  rejectedReason?: string;
  createdAt: string;
}

export interface PointsRecordItem {
  memberId: string;
  memberName: string;
  department: Department;
  label: string;    // 加分项名称，如 '网辩赛上场'、'最佳辩手'
  points: number;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  isActive: boolean;
}

// 积分大类定义
export interface ActivityCategory {
  id: string;
  name: string;
  icon: string;
  fields: ActivityField[];
  options: ActivityOption[];
  hasCoach?: boolean;    // 是否可选负责教练
  hasMembers?: boolean;  // 是否需要添加队员
  isBatch?: boolean;     // 是否批量（多人）
}

export interface ActivityField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select';
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface ActivityOption {
  key: string;
  label: string;
  points: number;
  perPerson: boolean;     // 是否每人加分（vs 总共加分）
  maxSelect?: number;     // 最多可选人数（如备赛支持限2人）
  needSelectMember?: boolean; // 是否需要指定队员（如最佳辩手）
}
