import { useMemo, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { usePoints } from '../store/PointsContext';
import { Users, X } from 'lucide-react';
import type { Department, Member } from '../types';

const card = { background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' } as const;

const deptColors: Record<Department, string> = {
  '赛事部': 'var(--color-accent)',
  '活动部': 'var(--color-gold)',
  '宣传部': '#8E7DBE',
};

export default function RosterPage() {
  const { allMembers } = useAuth();
  const { getMemberPoints } = usePoints();
  const [selected, setSelected] = useState<Member | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<number, typeof allMembers>();
    allMembers.forEach(m => {
      const g = map.get(m.grade) || [];
      g.push(m);
      map.set(m.grade, g);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [allMembers]);

  return (
    <div className="page-enter">
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>队员名录</h2>

      {grouped.map(([grade, members]) => (
        <div key={grade} style={{ ...card, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Users size={15} style={{ color: 'var(--color-muted)' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{grade} 级</span>
            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>· {members.length} 人</span>
          </div>
          {members.map(m => {
            const points = getMemberPoints(m.id);
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', padding: '9px 10px', borderRadius: 10, border: 'none',
                  cursor: 'pointer', background: 'transparent', transition: 'background 0.15s', textAlign: 'left',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `color-mix(in srgb, ${deptColors[m.department]} 12%, transparent)`,
                    color: deptColors[m.department], fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>
                    {m.name[0]}
                  </div>
                  <span style={{ fontSize: 14 }}>{m.name}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, fontWeight: 500,
                    background: `color-mix(in srgb, ${deptColors[m.department]} 10%, transparent)`,
                    color: deptColors[m.department], flexShrink: 0 }}>
                    {m.department}
                  </span>
                  {m.role === 'captain' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'var(--color-accent)/10', color: 'var(--color-accent)', flexShrink: 0 }}>队长</span>}
                  {m.isCoach && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'var(--color-success)/10', color: 'var(--color-success)', flexShrink: 0 }}>教练</span>}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{points} 分</span>
              </button>
            );
          })}
        </div>
      ))}

      {/* Detail overlay — full screen on mobile */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
            background: 'var(--color-surface)', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px',
            maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>队员信息</span>
              <button onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `color-mix(in srgb, ${deptColors[selected.department]} 12%, transparent)`,
                color: deptColors[selected.department], fontSize: 18, fontWeight: 600 }}>
                {selected.name[0]}
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 600 }}>{selected.name}</p>
                <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>{selected.studentId}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>部门</span><span>{selected.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>年级</span><span>{selected.grade} 级</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted)' }}>角色</span><span>{selected.role === 'super_admin' ? '超级管理员' : selected.role === 'captain' ? '队长' : '队员'}</span>
              </div>
              {selected.gender && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-muted)' }}>性别</span><span>{selected.gender}</span></div>}
              {selected.birthday && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-muted)' }}>生日</span><span>{selected.birthday}</span></div>}

              {(selected.phone || selected.qq || selected.wechat || selected.email) && (
                <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  {selected.phone && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: 'var(--color-muted)' }}>手机</span><span>{selected.phone}</span></div>}
                  {selected.qq && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: 'var(--color-muted)' }}>QQ</span><span>{selected.qq}</span></div>}
                  {selected.wechat && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: 'var(--color-muted)' }}>微信</span><span>{selected.wechat}</span></div>}
                  {selected.email && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-muted)' }}>邮箱</span><span>{selected.email}</span></div>}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
