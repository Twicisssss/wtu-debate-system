import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { usePoints } from '../store/PointsContext';
import { supabase } from '../lib/supabase';
import { prizeDistribution } from '../data/config';
import type { Department } from '../types';
import { Check, X, AlertCircle, Users, ClipboardList, UserCog, Lock, Trophy, Download, RefreshCw } from 'lucide-react';

type Tab = '审核' | '录入' | '队员' | '结算' | '换届';

const card = { background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' } as const;
const segCtrl = { background: 'var(--color-border)', borderRadius: 10, padding: 3, display: 'flex' } as const;
const segBtn = (a: boolean) => ({ flex: 1, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
  fontSize: 13, fontWeight: a ? 600 : 400, background: a ? 'var(--color-surface)' : 'transparent',
  color: a ? 'var(--color-text)' : 'var(--color-muted)', transition: 'all 0.2s',
  boxShadow: a ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 });

export default function AdminPage() {
  const { user, allMembers, updateMember, logout, refreshMembers, getResetCode, generateNewResetCode } = useAuth();
  const { records, approveRecord, rejectRecord, getMemberRanking, refreshRecords } = usePoints();
  const [tab, setTab] = useState<Tab>('审核');
  const [settled, setSettled] = useState(() => localStorage.getItem('settlement_locked') === 'true');
  const [published, setPublished] = useState(() => localStorage.getItem('settlement_published') === 'true');
  const [resetCode, setResetCode] = useState('');
  const [resetCodeVisible, setResetCodeVisible] = useState(false);

  useEffect(() => {
    const load = async () => { setResetCode(await getResetCode()); };
    load();
  }, [getResetCode, tab]);

  const handleGenerateCode = async () => {
    const newCode = await generateNewResetCode();
    setResetCode(newCode);
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'captain')) {
    return <div style={{ textAlign: 'center', padding: 60 }}><p style={{ color: 'var(--color-muted)' }}>无访问权限</p></div>;
  }

  const pending = records.filter(r => r.status === 'pending');
  const ranking = getMemberRanking();

  // Settlement: compute final prize distribution
  const settlement = useMemo(() => {
    const out: { rank: number; name: string; dept: string; studentId: string; points: number; prize: number; source: string }[] = [];
    const used = new Set<string>(); let r = 1;
    const top5 = ranking.filter(x => !used.has(x.member.id)).slice(0, 5);
    top5.forEach(x => { out.push({ rank: r, name: x.member.name, dept: x.member.department, studentId: x.member.studentId, points: x.points, prize: prizeDistribution[r-1]?.amount||0, source: '跨部门 Top 5' }); used.add(x.member.id); r++; });
    const act = ranking.find(x => x.member.department==='活动部'&&!used.has(x.member.id));
    if (act) { out.push({ rank: r, name: act.member.name, dept: act.member.department, studentId: act.member.studentId, points: act.points, prize: prizeDistribution[r-1]?.amount||0, source: '活动部保底' }); used.add(act.member.id); r++; }
    const pub = ranking.find(x => x.member.department==='宣传部'&&!used.has(x.member.id));
    if (pub) { out.push({ rank: r, name: pub.member.name, dept: pub.member.department, studentId: pub.member.studentId, points: pub.points, prize: prizeDistribution[r-1]?.amount||0, source: '宣传部保底' }); used.add(pub.member.id); r++; }
    const flx = ranking.find(x => !used.has(x.member.id));
    if (flx && r <= 8) { out.push({ rank: r, name: flx.member.name, dept: flx.member.department, studentId: flx.member.studentId, points: flx.points, prize: prizeDistribution[r-1]?.amount||0, source: '机动名额' }); }
    return out;
  }, [ranking]);

  const totalPrize = settlement.reduce((s, x) => s + x.prize, 0);

  const lockSettlement = () => {
    localStorage.setItem('settlement_locked', 'true');
    localStorage.setItem('settlement_data', JSON.stringify(settlement));
    setSettled(true);
  };

  const publishSettlement = () => {
    localStorage.setItem('settlement_published', 'true');
    setPublished(true);
  };

  const resetSettlement = () => {
    localStorage.removeItem('settlement_locked');
    localStorage.removeItem('settlement_data');
    localStorage.removeItem('settlement_published');
    setSettled(false);
    setPublished(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>管理后台</h2>

      <div style={{ ...segCtrl, flexWrap: 'wrap' }}>
        {[
          { k: '审核' as Tab, i: ClipboardList, l: '审核', b: pending.length },
          { k: '录入' as Tab, i: UserCog, l: '录入' },
          { k: '队员' as Tab, i: Users, l: '队员' },
          { k: '结算' as Tab, i: Lock, l: '结算' },
          { k: '换届' as Tab, i: RefreshCw, l: '换届' },
        ].map(({ k, i: I, l, b }) => (
          <button key={k} style={segBtn(tab === k)} onClick={() => setTab(k)}>
            <I size={13} />
            {l}{b ? <span style={{ marginLeft: 5, background: 'var(--color-danger)', color: '#FFF', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 600 }}>{b}</span> : null}
          </button>
        ))}
      </div>

      {tab === '审核' && (
        pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <AlertCircle size={32} style={{ color: 'var(--color-muted)', marginBottom: 8 }} />
            <p style={{ color: 'var(--color-muted)' }}>暂无待审核申请</p>
          </div>
        ) : pending.map(r => (
          <div key={r.id} style={{ ...card, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{r.type} <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>{r.description}</span></span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-warning)', background: 'color-mix(in srgb, var(--color-warning) 10%, transparent)', padding: '3px 10px', borderRadius: 99 }}>待审核</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 10 }}>
              提交人：{allMembers.find(m => m.studentId === r.submitterId)?.name || r.submitterId} · {new Date(r.date).toLocaleDateString('zh-CN')}
            </p>
            <div style={{ background: 'var(--color-bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              {r.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0' }}>
                  <span>{item.memberName} <span style={{ color: 'var(--color-muted)' }}>{item.label}</span></span>
                  <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>+{item.points}</span>
                </div>
              ))}
              {r.coachPoints ? <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0', borderTop: '1px solid var(--color-border)', marginTop: 4, paddingTop: 4 }}>
                <span style={{ color: 'var(--color-muted)' }}>教练：{allMembers.find(m => m.studentId === r.coachId)?.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>+{r.coachPoints}</span>
              </div> : null}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, borderTop: '1px solid var(--color-border)', marginTop: 4, paddingTop: 4 }}>
                <span>合计</span><span>{r.items.reduce((s,i)=>s+i.points,0)+(r.coachPoints||0)} 分</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => approveRecord(r.id, user.studentId)}
                style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--color-success)', color: '#FFF', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Check size={16} />通过</button>
              <button onClick={() => { const re = prompt('驳回理由：'); if (re) rejectRecord(r.id, re, user.studentId); }}
                style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--color-danger)', color: '#FFF', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <X size={16} />驳回</button>
            </div>
          </div>
        ))
      )}

      {tab === '录入' && (
        <div style={{ ...card, padding: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>队长可直接通过「提交积分」操作</p>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>后续支持批量导入</p>
        </div>
      )}

      {tab === '队员' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Reset code card */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>密码重置码</span>
            <button onClick={handleGenerateCode}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'var(--color-accent)', color: '#FFF', fontSize: 12, fontWeight: 600 }}>
              <RefreshCw size={13} /> 生成新码
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 12 }}>
            队员忘记密码时，告知其学号对应的当前重置码，即可在登录页「忘记密码」中重置。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, fontFamily: 'monospace', color: 'var(--color-accent)' }}>
              {resetCodeVisible ? resetCode : '••••••'}
            </span>
            <button onClick={() => setResetCodeVisible(!resetCodeVisible)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: 12 }}>
              {resetCodeVisible ? '隐藏' : '显示'}
            </button>
          </div>
        </div>

        <div style={{ ...card, padding: '20px' }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>队员列表 · {allMembers.length} 人</p>
          {allMembers.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 99, background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>{m.name[0]}</div>
                <div>
                  <span style={{ fontSize: 14 }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)', marginLeft: 6 }}>{m.studentId}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>{m.department} · {m.grade}级</span>
                {m.role === 'super_admin' && <span style={{ fontSize: 10, color: 'var(--color-gold)', background: 'color-mix(in srgb, var(--color-gold) 12%, transparent)', padding: '2px 7px', borderRadius: 99 }}>超管</span>}
                {m.role === 'captain' && <span style={{ fontSize: 10, color: 'var(--color-accent)', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', padding: '2px 7px', borderRadius: 99 }}>队长</span>}
                {m.isCoach && <span style={{ fontSize: 10, color: 'var(--color-success)', background: 'color-mix(in srgb, var(--color-success) 10%, transparent)', padding: '2px 7px', borderRadius: 99 }}>教练</span>}
                {m.role !== 'super_admin' && (
                  <button
                    onClick={async () => {
                      await updateMember({ ...m, isCoach: !m.isCoach });
                    }}
                    style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, border: 'none', cursor: 'pointer',
                      background: m.isCoach ? 'var(--color-danger)/10' : 'var(--color-success)/10',
                      color: m.isCoach ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                    {m.isCoach ? '撤销教练' : '任命教练'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
      )}

      {tab === '结算' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status banner */}
          {settled && (
            <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10,
              background: 'color-mix(in srgb, var(--color-success) 6%, var(--color-surface))' }}>
              <Lock size={16} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-success)' }}>
                排名已锁定 · {published ? '已发布公示' : '待发布公示'}
              </span>
              {user.role === 'super_admin' && (
                <button onClick={resetSettlement}
                  style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'var(--color-danger)', color: '#FFF', fontSize: 12, fontWeight: 600 }}>
                  重置
                </button>
              )}
            </div>
          )}

          {/* Prize distribution table */}
          <div style={{ ...card, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Trophy size={17} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontSize: 15, fontWeight: 600 }}>学年奖金分配表</span>
              <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>· 合计 ¥{totalPrize} / ¥1000</span>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -4px', padding: '0 4px' }}>
              <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--color-muted)' }}>排名</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--color-muted)' }}>姓名</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--color-muted)' }}>部门</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12, color: 'var(--color-muted)' }}>积分</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, fontSize: 12, color: 'var(--color-muted)' }}>奖金</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, fontSize: 12, color: 'var(--color-muted)' }}>来源</th>
                  </tr>
                </thead>
                <tbody>
                  {settlement.map((s, i) => (
                    <tr key={s.rank} style={{ borderBottom: '1px solid var(--color-border)',
                      background: i === 0 ? 'color-mix(in srgb, var(--color-gold) 5%, transparent)' : 'transparent' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: i===0?'var(--color-gold)':'var(--color-muted)' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''} {s.rank}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '12px', color: 'var(--color-muted)', fontSize: 13 }}>{s.dept}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>{s.points}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--color-gold)' }}>¥{s.prize}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: 11, color: 'var(--color-accent)' }}>{s.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {settlement.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 30 }}>暂无排名数据</p>
            )}
          </div>

          {/* Action buttons */}
          {!settled ? (
            <button onClick={lockSettlement} disabled={settlement.length === 0}
              style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', cursor: settlement.length===0?'not-allowed':'pointer',
                background: settlement.length===0 ? 'var(--color-border)' : 'var(--color-accent)', color: '#FFF',
                fontSize: 16, fontWeight: 600, opacity: settlement.length===0?0.4:1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Lock size={18} />
              锁定排名，完成学年结算
            </button>
          ) : !published ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={publishSettlement}
                style={{ flex: 1, height: 50, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'var(--color-gold)', color: '#FFF', fontSize: 16, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Download size={18} />
                发布公示
              </button>
            </div>
          ) : (
            <div style={{ ...card, padding: '20px', textAlign: 'center' }}>
              <Trophy size={32} style={{ color: 'var(--color-gold)', marginBottom: 10 }} />
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>年度奖金已发布</p>
              <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>学年结算完成，获奖名单已公示</p>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 8 }}>
                机动结余 ¥{1000 - totalPrize} 由活动部记录支出
              </p>

              {/* Start new year */}
                <button
                  onClick={async () => {
                    if (!confirm('确认开启新学年？\n\n所有队员积分（含教练积分）将清零，当前排名将存档。\n此操作不可撤销。')) return;
                    // Archive settlement
                    const archive = { date: new Date().toISOString(), settlement, totalPrize };
                    const archives = JSON.parse(localStorage.getItem('settlement_archives') || '[]');
                    archives.push(archive);
                    localStorage.setItem('settlement_archives', JSON.stringify(archives));
                    // Delete all records
                    await supabase.from('points_record_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                    await supabase.from('points_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                    // Reset coach points
                    await supabase.from('members').update({ coach_points: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
                    // Reset settlement state
                    resetSettlement();
                    await refreshRecords();
                    await refreshMembers();
                    alert('新学年已开启！所有积分已清零，数据已存档。');
                  }}
                  style={{ marginTop: 20, width: '100%', height: 46, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: 'var(--color-accent)', color: '#FFF', fontSize: 15, fontWeight: 600 }}>
                  开启新学年，清零所有积分
                </button>
            </div>
          )}
        </div>
      )}

      {tab === '换届' && (
        <div style={{ ...card, padding: '20px' }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>队长换届</p>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>
            将队长身份转让给同部门的另一位队员。转让后，你将变为普通队员。
          </p>

          {(['赛事部', '活动部', '宣传部'] as Department[]).map(dept => {
            const currentCaptain = allMembers.find(m => m.department === dept && m.role === 'captain');
            const deptMembers = allMembers.filter(m => m.department === dept && m.role !== 'captain' && m.role !== 'super_admin');

            return (
              <div key={dept} style={{ marginBottom: 16, padding: '14px', borderRadius: 10, background: 'var(--color-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{dept}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>
                    现任队长：{currentCaptain ? <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{currentCaptain.name}</span> : '无'}
                  </span>
                </div>

                {currentCaptain && deptMembers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {deptMembers.map(m => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--color-surface)' }}>
                        <div>
                          <span style={{ fontSize: 13 }}>{m.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--color-muted)', marginLeft: 6 }}>{m.studentId}</span>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm(`确认将 ${dept} 队长从 ${currentCaptain.name} 转让给 ${m.name}？`)) {
                              await updateMember({ ...currentCaptain, role: 'member' });
                              await updateMember({ ...m, role: 'captain' });
                              if (user.studentId === currentCaptain.studentId) {
                                logout();
                                alert('你的队长身份已转让，请重新登录');
                              } else {
                                alert('队长转让完成');
                              }
                            }
                          }}
                          style={{ padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'var(--color-accent)', color: '#FFF', fontSize: 12, fontWeight: 600 }}>
                          转让给 Ta
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--color-muted)', textAlign: 'center', padding: 12 }}>
                    {!currentCaptain ? '该部门暂无队长' : '该部门没有其他队员可供转让'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
