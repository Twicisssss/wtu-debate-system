import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Member } from '../types';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export type LoginResult = { success: true } | { success: false; error: 'no_account' | 'wrong_password' };
export type RegisterResult = { success: true } | { success: false; error: 'duplicate' };
export type ResetResult = { success: true } | { success: false; error: 'no_account' | 'wrong_code' };

interface AuthContextType {
  user: Member | null;
  loading: boolean;
  login: (studentId: string, password: string) => Promise<LoginResult>;
  register: (studentId: string, name: string, department: Member['department'], grade: number, password: string) => Promise<RegisterResult>;
  checkAccount: (studentId: string) => Promise<boolean>;
  getResetCode: () => Promise<string>;
  generateNewResetCode: () => Promise<string>;
  resetPassword: (studentId: string, code: string, newPassword: string) => Promise<ResetResult>;
  logout: () => void;
  allMembers: Member[];
  refreshMembers: () => Promise<void>;
  updateMember: (member: Member) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMembers = useCallback(async () => {
    const { data } = await supabase.from('members').select('*').order('grade', { ascending: false }).order('student_id');
    if (data) {
      setAllMembers(data.map((m: any) => ({
        id: m.id,
        studentId: m.student_id,
        name: m.name,
        department: m.department,
        grade: m.grade,
        role: m.role,
        password: m.password_hash,
        isCoach: m.is_coach,
        coachPoints: m.coach_points,
        phone: m.phone,
        qq: m.qq,
        wechat: m.wechat,
        email: m.email,
        gender: m.gender,
        birthday: m.birthday,
      })));
    }
  }, []);

  // On mount, restore session & load members
  useEffect(() => {
    const init = async () => {
      await refreshMembers();
      const stored = localStorage.getItem('currentUser');
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    };
    init();
  }, [refreshMembers]);

  const login = useCallback(async (studentId: string, password: string): Promise<LoginResult> => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (!data) return { success: false, error: 'no_account' };

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) return { success: false, error: 'wrong_password' };

    const member: Member = {
      id: data.id, studentId: data.student_id, name: data.name,
      department: data.department, grade: data.grade, role: data.role,
      password: data.password_hash, isCoach: data.is_coach, coachPoints: data.coach_points,
      phone: data.phone, qq: data.qq, wechat: data.wechat, email: data.email,
      gender: data.gender, birthday: data.birthday,
    };

    setUser(member);
    localStorage.setItem('currentUser', JSON.stringify(member));
    return { success: true };
  }, []);

  const register = useCallback(async (studentId: string, name: string, department: Member['department'], grade: number, password: string): Promise<RegisterResult> => {
    // Check duplicate
    const { data: existing } = await supabase
      .from('members').select('id').eq('student_id', studentId).single();
    if (existing) return { success: false, error: 'duplicate' };

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from('members').insert({
      student_id: studentId,
      name,
      department,
      grade,
      role: 'member',
      is_coach: false,
      coach_points: 0,
      password_hash: passwordHash,
    }).select().single();

    if (error || !data) return { success: false, error: 'duplicate' };

    const member: Member = {
      id: data.id, studentId: data.student_id, name: data.name,
      department: data.department, grade: data.grade, role: data.role,
      password: data.password_hash, isCoach: data.is_coach, coachPoints: data.coach_points,
      phone: undefined, qq: undefined, wechat: undefined, email: undefined, gender: undefined, birthday: undefined,
    };

    setUser(member);
    localStorage.setItem('currentUser', JSON.stringify(member));
    await refreshMembers();
    return { success: true };
  }, [refreshMembers]);

  const checkAccount = useCallback(async (studentId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('members').select('id').eq('student_id', studentId).single();
    return !!data;
  }, []);

  const getResetCode = useCallback(async (): Promise<string> => {
    const { data } = await supabase.from('settings').select('reset_code').eq('id', 1).single();
    return data?.reset_code || '';
  }, []);

  const generateNewResetCode = useCallback(async (): Promise<string> => {
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    await supabase.from('settings').update({ reset_code: newCode, updated_at: new Date().toISOString() }).eq('id', 1);
    return newCode;
  }, []);

  const resetPassword = useCallback(async (studentId: string, code: string, newPassword: string): Promise<ResetResult> => {
    // 1. Fetch current reset code from database
    const currentCode = await getResetCode();
    if (code !== currentCode) return { success: false, error: 'wrong_code' };

    // 2. Check account exists
    const { data } = await supabase
      .from('members').select('id').eq('student_id', studentId).single();
    if (!data) return { success: false, error: 'no_account' };

    // 3. Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from('members').update({ password_hash: passwordHash }).eq('student_id', studentId);
    if (error) return { success: false, error: 'wrong_code' };

    return { success: true };
  }, [getResetCode]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('members').select('*').eq('student_id', user.studentId).single();
    if (data) {
      const refreshed: Member = {
        id: data.id, studentId: data.student_id, name: data.name,
        department: data.department, grade: data.grade, role: data.role,
        password: data.password_hash, isCoach: data.is_coach, coachPoints: data.coach_points,
        phone: data.phone, qq: data.qq, wechat: data.wechat, email: data.email,
        gender: data.gender, birthday: data.birthday,
      };
      setUser(refreshed);
      localStorage.setItem('currentUser', JSON.stringify(refreshed));
    }
  }, [user]);

  const updateMember = useCallback(async (member: Member) => {
    await supabase.from('members').update({
      name: member.name,
      department: member.department,
      grade: member.grade,
      role: member.role,
      is_coach: member.isCoach,
      coach_points: member.coachPoints,
      phone: member.phone,
      qq: member.qq,
      wechat: member.wechat,
      email: member.email,
      gender: member.gender,
      birthday: member.birthday,
    }).eq('student_id', member.studentId);
    await refreshMembers();
  }, [refreshMembers]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, checkAccount, getResetCode, generateNewResetCode, resetPassword, logout, allMembers, refreshMembers, updateMember, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
