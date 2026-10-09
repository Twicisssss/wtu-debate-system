import { useState, useMemo } from 'react';
import { usePoints } from '../store/PointsContext';
import { useAuth } from '../store/AuthContext';
import { prizeDistribution } from '../data/config';
import { Trophy, Medal, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const card = { background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' } as const;
const segCtrl = { background: 'var(--color-border)', borderRadius: 10, padding: 3, display: 'flex' } as const;
const segBtn = (active: boolean) => ({
  flex: 1, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
  fontSize: 14, fontWeight: active ? 600 : 400,
  background: active ? 'var(--color-surface)' : 'transparent',
  color: active ? 'var(--color-text)' : 'var(--color-muted)',
  transition: 'all 0.2s', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
});

export default function RankingPage() {
  const { user } = useAuth();
  const { getMemberRanking, getCoachRanking, records } = usePoints();
  const [tab, setTab] = useState<'prize' | 'coach' | 'charts'>('prize');
  const [dept, setDept] = useState('全部');
  const [grade] = useState('全部');

  const ranking = getMemberRanking();
  const coaches = getCoachRanking();

  const filtered = useMemo(() => ranking.filter(r => {
    if (dept !== '全部' && r.member.department !== dept) return false;
    if (grade !== '全部' && String(r.member.grade) !== grade) return false;
    return true;
  }), [ranking, dept, grade]);

  const prizePreview = useMemo(() => {
    const out: { rank: number; name: string; dept: string; points: number; prize: number; source: string }[] = [];
    const used = new Set<string>(); let r = 1;
    const top5 = ranking.filter(x => !used.has(x.member.id)).slice(0, 5);
    top5.forEach(x => { out.push({ rank: r, name: x.member.name, dept: x.member.department, points: x.points, prize: prizeDistribution[r-1]?.amount||0, source: 'Top 5' }); used.add(x.member.id); r++; });
    const act = ranking.find(x => x.member.department==='活动部'&&!used.has(x.member.id));
    if (act) { out.push({ rank: r, name: act.member.name, dept: act.member.department, points: act.points, prize: prizeDistribution[r-1]?.amount||0, source: '活动保底' }); used.add(act.member.id); r++; }
    const pub = ranking.find(x => x.member.department==='宣传部'&&!used.has(x.member.id));
    if (pub) { out.push({ rank: r, name: pub.member.name, dept: pub.member.department, points: pub.points, prize: prizeDistribution[r-1]?.amount||0, source: '宣传保底' }); used.add(pub.member.id); r++; }
    const flx = ranking.find(x => !used.has(x.member.id));
    if (flx && r <= 8) { out.push({ rank: r, name: flx.member.name, dept: flx.member.department, points: flx.points, prize: prizeDistribution[r-1]?.amount||0, source: '机动' }); }
    return out;
  }, [ranking]);

  // ─── Chart data ────────────────────────────────────────
  const deptChartData = useMemo(() => {
    const map: Record<string, number> = { '赛事部': 0, '活动部': 0, '宣传部': 0 };
    ranking.forEach(r => { map[r.member.department] += r.points; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [ranking]);

  const trendChartData = useMemo(() => {
    const approved = records.filter(r => r.status === 'approved').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const months = new Set<string>();
    approved.forEach(r => { const d = new Date(r.date); months.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); });
    const sorted = Array.from(months).sort();
    const topIds = ranking.slice(0, 5).map(r => r.member.id);

    return sorted.map(m => {
      const point: Record<string, number|string> = { month: m };
      topIds.forEach(id => { point[id] = 0; });
      approved.filter(r => {
        const d = new Date(r.date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` === m;
      }).forEach(r => {
        r.items.forEach(item => {
          if (topIds.includes(item.memberId)) {
            (point[item.memberId] as number) += item.points;
          }
        });
      });
      // Accumulate
      return point;
    }).reduce((acc, curr) => {
      const prev = acc.length > 0 ? acc[acc.length-1] : {};
      const entry: Record<string, number|string> = { month: curr.month };
      topIds.forEach(id => {
        entry[id] = ((prev[id] as number) || 0) + ((curr[id] as number) || 0);
      });
      acc.push(entry);
      return acc;
    }, [] as Record<string, number|string>[]);
  }, [records, ranking]);

  const top5Names = useMemo(() => {
    const map: Record<string, string> = {};
    ranking.slice(0, 5).forEach(r => { map[r.member.id] = r.member.name; });
    return map;
  }, [ranking]);

  const lineColors = ['var(--color-accent)', 'var(--color-gold)', '#6B8E8A', '#C49070', '#8E9AAF'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>积分排行</h2>

      <div style={segCtrl}>
        <button style={segBtn(tab === 'prize')} onClick={() => setTab('prize')}>奖金池排行</button>
        <button style={segBtn(tab === 'coach')} onClick={() => setTab('coach')}>教练排行榜</button>
        <button style={segBtn(tab === 'charts')} onClick={() => setTab('charts')}>
          <BarChart3 size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />数据统计
        </button>
      </div>

      {tab === 'prize' && (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            {['全部','赛事部','活动部','宣传部'].map(d =>
              <button key={d} onClick={() => setDept(d)}
                style={{ height: 32, paddingInline: 12, borderRadius: 99, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: dept===d ? 600 : 400,
                  background: dept===d ? 'var(--color-text)' : 'var(--color-surface)',
                  color: dept===d ? '#FFF' : 'var(--color-muted)' }}>{d}</button>)}
          </div>

          <div style={{ ...card, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Trophy size={17} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>当前获奖预测</span>
            </div>
            {prizePreview.map(p => (
              <div key={p.rank} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, width: 20, color: 'var(--color-muted)' }}>{p.rank}</span>
                  <span style={{ fontSize: 14 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{p.dept}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-accent)', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', padding: '2px 8px', borderRadius: 99, fontWeight: 500 }}>{p.source}</span>
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{p.points} 分</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gold)', marginLeft: 8 }}>¥{p.prize}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Medal size={17} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>全队积分榜</span>
            </div>
            {filtered.map((r, i) => {
              const isMe = r.member.id === user?.id;
              const rankColors = ['var(--color-gold)','#A0A0A0','#CD7F32'];
              const rc = i < 3 ? rankColors[i] : 'var(--color-muted)';
              return (
                <div key={r.member.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
                  borderRadius: 10, background: isMe ? 'color-mix(in srgb, var(--color-accent) 6%, transparent)' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, width: 20, textAlign: 'center', color: rc }}>{i+1}</span>
                    <span style={{ fontSize: 14 }}>{r.member.name}{isMe && ' ←'}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{r.member.department}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.points} 分</span>
                </div>
              );
            })}
            {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 20 }}>暂无数据</p>}
          </div>
        </>
      )}

      {tab === 'coach' && (
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Trophy size={17} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>教练排行榜</span>
            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>· 不参与奖金池</span>
          </div>
          {coaches.map((c, i) => (
            <div key={c.member.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, width: 20, color: 'var(--color-muted)' }}>{i+1}</span>
                <span style={{ fontSize: 14 }}>{c.member.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{c.member.department}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}>{c.coachPoints} 教练分</span>
            </div>
          ))}
          {coaches.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 20 }}>暂无教练数据</p>}
        </div>
      )}

      {tab === 'charts' && (
        <>
          {/* Department distribution */}
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>各部门积分分布</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptChartData} layout="vertical" margin={{ left: 40, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: 'var(--color-text)' }} width={60} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13 }} />
                <Bar dataKey="value" name="积分" radius={[0, 6, 6, 0]}
                  fill="var(--color-accent)" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly trend */}
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Top 5 积分增长趋势</h3>
            <p style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 16 }}>按月累计积分变化</p>
            <ResponsiveContainer width="100%" height={280}>
              {trendChartData.length > 1 ? (
                <LineChart data={trendChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {Object.entries(top5Names).map(([id, name], i) => (
                    <Line key={id} type="monotone" dataKey={id} name={name}
                      stroke={lineColors[i]} strokeWidth={2} dot={{ r: 3 }} />
                  ))}
                </LineChart>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 60 }}>需要更多数据来生成趋势图</p>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
