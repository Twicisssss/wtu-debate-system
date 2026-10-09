import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { PointsRecord, Member } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface PointsContextType {
  records: PointsRecord[];
  loading: boolean;
  addRecord: (record: PointsRecord) => Promise<void>;
  approveRecord: (recordId: string, approverId: string) => Promise<void>;
  rejectRecord: (recordId: string, reason: string, approverId: string) => Promise<void>;
  getMemberPoints: (memberId: string) => number;
  getMemberCoachPoints: (memberId: string) => number;
  getMemberRanking: () => { member: Member; points: number; department: string }[];
  getCoachRanking: () => { member: Member; coachPoints: number }[];
  refreshRecords: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | null>(null);

export function PointsProvider({ children }: { children: ReactNode }) {
  const { allMembers, refreshMembers } = useAuth();
  const [records, setRecords] = useState<PointsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRecords = useCallback(async () => {
    const { data } = await supabase
      .from('points_records')
      .select('*, items:points_record_items(*)')
      .order('created_at', { ascending: false });

    if (data) {
      setRecords(data.map((r: any) => ({
        id: r.id,
        type: r.type,
        description: r.description || '',
        date: r.date,
        submitterId: r.submitter_id,
        items: (r.items || []).map((i: any) => ({
          memberId: i.member_id,
          memberName: i.member_name,
          department: i.department,
          label: i.label,
          points: i.points,
        })),
        coachId: r.coach_id || undefined,
        coachPoints: r.coach_points || 0,
        status: r.status,
        approvedBy: r.approved_by || undefined,
        rejectedReason: r.rejected_reason || undefined,
        createdAt: r.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refreshRecords(); }, [refreshRecords]);

  const addRecord = useCallback(async (record: PointsRecord) => {
    // Insert record
    const { data: recData, error: recError } = await supabase
      .from('points_records')
      .insert({
        id: record.id,
        type: record.type,
        description: record.description,
        date: record.date,
        submitter_id: record.submitterId,
        coach_id: record.coachId || null,
        coach_points: record.coachPoints || 0,
        status: record.status,
      })
      .select()
      .single();

    if (recError || !recData) return;

    // Insert items
    const items = record.items.map(item => ({
      record_id: recData.id,
      member_id: item.memberId,
      member_name: item.memberName,
      department: item.department,
      label: item.label,
      points: item.points,
    }));

    await supabase.from('points_record_items').insert(items);

    // If approved + coach, update coach points
    if (record.status === 'approved' && record.coachId && record.coachPoints) {
      const { data: coachData } = await supabase
        .from('members').select('coach_points').eq('student_id', record.coachId).single();
      if (coachData) {
        await supabase.from('members').update({
          coach_points: coachData.coach_points + record.coachPoints,
        }).eq('student_id', record.coachId);
        await refreshMembers();
      }
    }

    await refreshRecords();
  }, [refreshRecords, refreshMembers]);

  const approveRecord = useCallback(async (recordId: string, approverId: string) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    await supabase.from('points_records').update({
      status: 'approved',
      approved_by: approverId,
    }).eq('id', recordId);

    // Update coach points
    if (record.coachId && record.coachPoints) {
      const { data: coachData } = await supabase
        .from('members').select('coach_points').eq('student_id', record.coachId).single();
      if (coachData) {
        await supabase.from('members').update({
          coach_points: coachData.coach_points + record.coachPoints,
        }).eq('student_id', record.coachId);
        await refreshMembers();
      }
    }

    await refreshRecords();
  }, [records, refreshRecords, refreshMembers]);

  const rejectRecord = useCallback(async (recordId: string, reason: string, approverId: string) => {
    await supabase.from('points_records').update({
      status: 'rejected',
      rejected_reason: reason,
      approved_by: approverId,
    }).eq('id', recordId);
    await refreshRecords();
  }, [refreshRecords]);

  const getMemberPoints = useCallback((memberId: string): number => {
    let total = 0;
    records.forEach(r => {
      if (r.status !== 'approved') return;
      r.items.forEach(item => {
        if (item.memberId === memberId) total += item.points;
      });
    });
    return total;
  }, [records]);

  const getMemberCoachPoints = useCallback((memberId: string): number => {
    const member = allMembers.find(m => m.id === memberId);
    return member?.coachPoints || 0;
  }, [allMembers]);

  const getMemberRanking = useCallback(() => {
    const pointMap = new Map<string, { memberId: string; points: number; department: string; name: string }>();
    allMembers.forEach(m => {
      pointMap.set(m.id, { memberId: m.id, points: 0, department: m.department, name: m.name });
    });
    records.filter(r => r.status === 'approved').forEach(r => {
      r.items.forEach(item => {
        const existing = pointMap.get(item.memberId);
        if (existing) existing.points += item.points;
      });
    });
    return Array.from(pointMap.values())
      .filter(p => p.points > 0)
      .sort((a, b) => b.points - a.points)
      .map(p => ({ member: allMembers.find(m => m.id === p.memberId)!, points: p.points, department: p.department }));
  }, [records, allMembers]);

  const getCoachRanking = useCallback(() => {
    return allMembers
      .filter(m => m.isCoach && m.coachPoints > 0)
      .sort((a, b) => b.coachPoints - a.coachPoints)
      .map(m => ({ member: m, coachPoints: m.coachPoints }));
  }, [allMembers]);

  return (
    <PointsContext.Provider value={{
      records, loading, addRecord, approveRecord, rejectRecord,
      getMemberPoints, getMemberCoachPoints, getMemberRanking, getCoachRanking, refreshRecords,
    }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error('usePoints must be inside PointsProvider');
  return ctx;
}
