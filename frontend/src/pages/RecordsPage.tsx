import { useState, useMemo } from 'react';
import { useAuth } from '../store/AuthContext';
import { usePoints } from '../store/PointsContext';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

const card = { background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' } as const;

const statusCfg: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  approved:  { icon: CheckCircle2, color: 'var(--color-success)', bg: 'color-mix(in srgb, var(--color-success) 8%, transparent)', label: '已通过' },
  pending:   { icon: AlertCircle,  color: 'var(--color-warning)', bg: 'color-mix(in srgb, var(--color-warning) 8%, transparent)', label: '审核中' },
  rejected:  { icon: XCircle,      color: 'var(--color-danger)',  bg: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',  label: '已驳回' },
};

export default function RecordsPage() {
  const { user } = useAuth();
  const { records, getMemberPoints, getMemberCoachPoints } = usePoints();
  const [filter, setFilter] = useState<'全部'|'已通过'|'审核中'|'已驳回'>('全部');
  if (!user) return null;

  const myPoints = getMemberPoints(user.id);
  const myCoach = user.isCoach ? getMemberCoachPoints(user.id) : 0;

  const myRecords = useMemo(() => records
    .filter(r => r.submitterId === user.studentId || r.items.some(i => i.memberId === user.id) || r.coachId === user.studentId)
    .filter(r => {
      if (filter==='全部') return true;
      if (filter==='已通过') return r.status==='approved';
      if (filter==='审核中') return r.status==='pending';
      if (filter==='已驳回') return r.status==='rejected';
      return true;
    })
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  [records, user, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>我的记录</h2>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ ...card, padding: '18px', flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4, fontWeight: 500 }}>奖金池积分</p>
          <p style={{ fontSize: 32, fontWeight: 600, lineHeight: 1 }}>{myPoints}</p>
        </div>
        {user.isCoach && (
          <div style={{ ...card, padding: '18px', flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4, fontWeight: 500 }}>教练积分</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>{myCoach}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {(['全部','已通过','审核中','已驳回'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ height: 32, padding: '0 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: filter===f ? 600 : 400,
              background: filter===f ? 'var(--color-text)' : 'var(--color-surface)',
              color: filter===f ? '#FFF' : 'var(--color-muted)' }}>{f}</button>
        ))}
      </div>

      {myRecords.map(r => {
        const myItems = r.items.filter(i => i.memberId === user.id);
        const isSubmitter = r.submitterId === user.studentId;
        const isCoach = r.coachId === user.studentId;
        const cfg = statusCfg[r.status]; const Icon = cfg.icon;
        return (
          <div key={r.id} style={{ ...card, padding: '18px' }} className="card-hover">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{r.type}{isSubmitter && <span style={{ fontSize: 11, color:'var(--color-muted)', marginLeft: 6, fontWeight: 400 }}>我提交的</span>}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: cfg.bg, color: cfg.color }}>
                <Icon size={12} />{cfg.label}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 8 }}>{r.description}</p>
            {myItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                <span style={{ color: 'var(--color-muted)' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{item.points}</span>
              </div>
            ))}
            {isCoach && r.coachPoints && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                <span style={{ color: 'var(--color-muted)' }}>负责教练</span>
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>+{r.coachPoints} 教练分</span>
              </div>
            )}
            {r.status==='rejected' && r.rejectedReason && (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'color-mix(in srgb, var(--color-danger) 6%, transparent)', fontSize: 12, color: 'var(--color-danger)' }}>
                驳回原因：{r.rejectedReason}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 11, color: 'var(--color-muted)' }}>
              <Clock size={11} /> {new Date(r.date).toLocaleDateString('zh-CN')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
