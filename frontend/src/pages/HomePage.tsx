import { useAuth } from '../store/AuthContext';
import { usePoints } from '../store/PointsContext';
import { useNavigate } from 'react-router-dom';
import { prizeDistribution, academicYear } from '../data/config';
import { Trophy } from 'lucide-react';

const cardBase = {
  background: 'var(--color-surface)', borderRadius: 14,
  border: '1px solid var(--color-border)', transition: 'transform 0.18s ease, box-shadow 0.18s ease',
};

export default function HomePage() {
  const { user } = useAuth();
  const { getMemberPoints, getMemberRanking, records } = usePoints();
  const navigate = useNavigate();
  if (!user) return null;

  const myPoints = getMemberPoints(user.id);
  const ranking = getMemberRanking();
  const myRank = ranking.findIndex(r => r.member.id === user.id) + 1;
  const total = ranking.length;

  const now = new Date();
  const thisMonth = records
    .filter(r => r.status === 'approved' && new Date(r.date).getMonth() === now.getMonth())
    .reduce((sum, r) => sum + r.items.filter(i => i.memberId === user.id).reduce((s, i) => s + i.points, 0), 0);

  let prizeHint: string | null = null;
  if (myRank > 0 && myRank <= 8) {
    const p = prizeDistribution[myRank - 1];
    prizeHint = `${myRank === 1 ? '🥇' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : ''} ¥${p.amount}`;
  }

  const top5 = ranking.slice(0, 5);
  const recent = records.filter(r => r.status === 'approved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const daysLeft = Math.max(0, Math.ceil((new Date(academicYear.endDate).getTime() - Date.now()) / 86400000));
  const progressPct = Math.min(100, Math.max(0, ((365 - daysLeft) / 365) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="page-enter">

      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: '我的积分', value: myPoints, color: 'var(--color-text)' },
          { label: '本月新增', value: `+${thisMonth}`, color: 'var(--color-success)' },
          { label: '全队排名', value: myRank > 0 ? `#${myRank}` : '-', sub: ` / ${total}`, hint: prizeHint },
        ].map((s, i) => (
          <div key={i}
            style={{ ...cardBase, padding: '16px 12px sm:padding:18px 14px', textAlign: 'center', cursor: 'default' }}
            className="card-hover">
            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 5, fontWeight: 500 }}>{s.label}</p>
            <p style={{ fontSize: 'clamp(24px, 8vw, 34px)', fontWeight: 600, color: s.color, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              {s.value}
              {s.sub && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-muted)' }}>{s.sub}</span>}
            </p>
            {s.hint && <p style={{ fontSize: 11, color: 'var(--color-gold)', marginTop: 2, fontWeight: 600 }}>{s.hint}</p>}
          </div>
        ))}
      </div>

      {/* Prize pool progress */}
      <div style={{ ...cardBase, padding: '18px 20px' }} className="card-hover">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={15} style={{ color: 'var(--color-gold)' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>学年奖池 ¥{academicYear.prizePool}</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>距结算 {daysLeft} 天</span>
        </div>
        <div style={{ width: '100%', height: 3, borderRadius: 99, background: 'var(--color-border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 99,
            background: `linear-gradient(90deg, var(--color-accent), var(--color-gold))`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
      </div>

      {/* Quick submit button */}
      <button onClick={() => navigate('/submit')}
        className="btn-pulse"
        style={{ width: '100%', height: 48, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'var(--color-accent)', color: '#FFF', fontSize: 15, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: 'var(--shadow-accent)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> 提交积分
      </button>

      {/* Top 5 */}
      <div style={{ ...cardBase, padding: '18px 20px' }} className="card-hover">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>全队排行</h3>
          <button onClick={() => navigate('/ranking')}
            style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', minHeight: 44 }}>
            查看全部 →
          </button>
        </div>
        {top5.map((r, i) => {
          const isMe = r.member.id === user.id;
          const rc = i === 0 ? 'var(--color-gold)' : i === 1 ? '#A0A0A0' : i === 2 ? '#CD7F32' : 'var(--color-muted)';
          return (
            <div key={r.member.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 10px',
                borderRadius: 10, background: isMe ? 'color-mix(in srgb, var(--color-accent) 5%, transparent)' : 'transparent',
                transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, width: 22, textAlign: 'center', color: rc, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.member.name}
                  {isMe && <span style={{ color: 'var(--color-accent)', fontSize: 11, marginLeft: 3, fontWeight: 600 }}>你</span>}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)', flexShrink: 0 }}>{r.member.department}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{r.points}</span>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div style={{ ...cardBase, padding: '18px 20px' }} className="card-hover">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>最近动态</h3>
          <button onClick={() => navigate('/records')}
            style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', minHeight: 44 }}>
            查看全部 →
          </button>
        </div>
        {recent.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.map(r => {
              const pts = r.items.reduce((s, i) => s + i.points, 0);
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--color-success)', flexShrink: 0 }} className="dot-pulse" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.items[0]?.memberName} {r.type === '参加比赛' ? `·「${r.description}」` : `· ${r.type}`}
                  </span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600, flexShrink: 0 }}>+{pts}</span>
                  <span style={{ color: 'var(--color-muted)', fontSize: 11, flexShrink: 0 }}>
                    {new Date(r.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 28 }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
            <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>暂无动态，去提交积分吧</p>
          </div>
        )}
      </div>

    </div>
  );
}
