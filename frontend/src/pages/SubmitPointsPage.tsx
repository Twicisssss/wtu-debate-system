import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { usePoints } from '../store/PointsContext';
import { activityCategories } from '../data/activityTypes';
import type { ActivityCategory, Member, PointsRecordItem, PointsRecord } from '../types';
import { Search, X, Check, ArrowLeft } from 'lucide-react';

const card = { background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' } as const;
const inp = { width: '100%' as const, height: 46, padding: '0 14px', borderRadius: 10, border: '1px solid var(--color-border)',
  background: 'var(--color-bg)', fontSize: 15, color: 'var(--color-text)', outline: 'none' };

export default function SubmitPointsPage() {
  const { user, allMembers } = useAuth();
  const { addRecord } = usePoints();
  const navigate = useNavigate();
  const [step, setStep] = useState<1|2>(1);
  const [cat, setCat] = useState<ActivityCategory|null>(null);
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [opts, setOpts] = useState<Record<string,boolean>>({});
  const [optMems, setOptMems] = useState<Record<string,string>>({});
  const [coachId, setCoachId] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const coaches = useMemo(() => allMembers.filter(m=>m.isCoach), [allMembers]);
  const results = useMemo(() => !search.trim()?[]:allMembers.filter(m=>(m.studentId.includes(search)||m.name.includes(search))&&!members.find(x=>x.id===m.id)).slice(0,5), [search,allMembers,members]);

  const reset = () => { setDesc(''); setDate(new Date().toISOString().split('T')[0]); setMembers([]); setOpts({}); setOptMems({}); setCoachId(''); setNote(''); setStep(1); setCat(null); setDone(false); };

  const preview = useMemo(() => {
    if (!cat) return { items: [] as PointsRecordItem[], total: 0, cp: 0 };
    const items: PointsRecordItem[] = []; let t = 0;
    cat.options.forEach(o => {
      if (!opts[o.key]) return;
      if (o.perPerson && cat.isBatch) { members.forEach(m=>{items.push({memberId:m.id,memberName:m.name,department:m.department,label:o.label,points:o.points});t+=o.points;}); }
      else if (o.needSelectMember) { const mid=optMems[o.key]; if(mid){const m=allMembers.find(x=>x.studentId===mid);if(m){items.push({memberId:m.id,memberName:m.name,department:m.department,label:o.label,points:o.points});t+=o.points;}} }
      else if (o.perPerson && members.length>0) { members.forEach(m=>{items.push({memberId:m.id,memberName:m.name,department:m.department,label:o.label,points:o.points});t+=o.points;}); }
    });
    return { items, total: t, cp: (cat.hasCoach&&coachId)?3:0 };
  }, [cat,opts,members,optMems,coachId,allMembers]);

  const submit = async () => {
    if (!cat||!user) return;
    await addRecord({id:crypto.randomUUID(),type:cat.name as PointsRecord['type'],description:desc||cat.name,date,submitterId:user.studentId,items:preview.items,coachId:cat.hasCoach?coachId:undefined,coachPoints:cat.hasCoach&&coachId?preview.cp:undefined,status:'pending',createdAt:new Date().toISOString()});
    setDone(true); setTimeout(()=>{reset();navigate('/records');},1500);
  };

  if (!user) return null;
  if (done) return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 0' }}>
      <div style={{width:64,height:64,borderRadius:99,background:'color-mix(in srgb, var(--color-success) 12%, transparent)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
        <Check size={32} style={{color:'var(--color-success)'}} />
      </div>
      <h2 style={{fontSize:20,fontWeight:600,marginBottom:4}}>提交成功</h2>
      <p style={{color:'var(--color-muted)'}}>等待队长审核</p>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {step===1&&(
        <>
          <h2 style={{fontSize:22,fontWeight:600}}>提交积分</h2>
          <p style={{fontSize:13,color:'var(--color-muted)',marginTop:-12}}>选择积分类型</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {activityCategories.map(c=>(
              <button key={c.id} onClick={()=>{setCat(c);setStep(2);}}
                className="card-hover"
                style={{...card,padding:'20px',textAlign:'left',cursor:'pointer',border:'1px solid var(--color-border)',transition:'all 0.2s',fontSize:32,lineHeight:1,background:'var(--color-surface)',minHeight:96}}>
                <span style={{display:'block',marginBottom:10}}>{c.icon}</span>
                <span style={{fontSize:15,fontWeight:600}}>{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step===2&&cat&&(
        <>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setStep(1)} style={{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',color:'var(--color-accent)',fontSize:14,fontWeight:500}}><ArrowLeft size={15}/>返回</button>
            <span style={{color:'var(--color-muted)',fontSize:13}}>{cat.icon} {cat.name}</span>
          </div>
          <h2 style={{fontSize:22,fontWeight:600}}>填写信息</h2>

          <div style={{...card,padding:'18px',display:'flex',flexDirection:'column',gap:14}}>
            {cat.fields.map(f=>(
              <div key={f.key}>
                <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:5}}>{f.label}</label>
                {f.type==='text'&&<input style={inp} placeholder={f.placeholder} value={desc} onChange={e=>setDesc(e.target.value)} />}
                {f.type==='date'&&<input style={inp} type="date" value={date} onChange={e=>setDate(e.target.value)} />}
                {f.type==='select'&&<select style={inp} value={desc} onChange={e=>setDesc(e.target.value)}>
                  <option value="">{f.placeholder||'请选择'}</option>
                  {f.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                </select>}
              </div>
            ))}
          </div>

          {cat.hasMembers&&(
            <div style={{...card,padding:'18px'}}>
              <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:8}}>添加队员</label>
              <div style={{position:'relative',marginBottom:10}}>
                <Search size={15} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--color-muted)'}}/>
                <input style={{...inp,paddingLeft:40}} placeholder="搜索学号或姓名" value={search} onChange={e=>setSearch(e.target.value)} />
                {results.length>0&&(
                  <div style={{position:'absolute',top:'100%',left:0,right:0,marginTop:2,background:'var(--color-surface)',borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,0.08)',zIndex:10,overflow:'hidden'}}>
                    {results.map(m=><button key={m.id} onClick={()=>{if(!members.find(x=>x.id===m.id))setMembers(p=>[...p,m]);setSearch('');}}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'10px 14px',border:'none',cursor:'pointer',background:'none',fontSize:14,textAlign:'left'}}>
                      <span style={{fontWeight:600,color:'var(--color-accent)'}}>+</span> {m.name} <span style={{fontSize:11,color:'var(--color-muted)'}}>{m.studentId}·{m.department}</span></button>)}
                  </div>
                )}
              </div>
              {members.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {members.map(m=><span key={m.id} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'5px 12px',borderRadius:99,background:'var(--color-bg)',fontSize:13}}>
                  {m.name} <button onClick={()=>setMembers(p=>p.filter(x=>x.id!==m.id))} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--color-muted)'}}><X size={12}/></button></span>)}
              </div>}
            </div>
          )}

          <div style={{...card,padding:'18px'}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:10}}>选择加分项</label>
            {cat.options.map(o=>{
              const chk = opts[o.key]||false;
              return (<div key={o.key}>
                <label style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,cursor:'pointer',background:chk?'color-mix(in srgb, var(--color-accent) 6%, transparent)':'transparent',fontSize:14}}>
                  <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${chk?'var(--color-accent)':'var(--color-muted)'}`,display:'flex',alignItems:'center',justifyContent:'center',background:chk?'var(--color-accent)':'transparent',flexShrink:0,transition:'all 0.15s'}}>
                    {chk&&<Check size={11} color="#FFF" strokeWidth={3}/>}
                  </div>
                  <input type="checkbox" checked={chk} onChange={()=>{setOpts(p=>({...p,[o.key]:!p[o.key]}));if(chk)setOptMems(p=>{const n={...p};delete n[o.key];return n;});}} style={{display:'none'}}/>
                  <span>{o.perPerson&&cat.isBatch?`${o.label}（${members.length}人×${o.points}=${members.length*o.points}分）`:`${o.label}（+${o.points}分）`}</span>
                </label>
                {chk&&o.needSelectMember&&(
                  <div style={{marginLeft:40,marginTop:4,marginBottom:6}}>
                    <select value={optMems[o.key]||''} onChange={e=>setOptMems(p=>({...p,[o.key]:e.target.value}))}
                      style={{...inp,height:38,fontSize:14}}>
                      <option value="">选择队员</option>
                      {(cat.isBatch?members:allMembers).map(m=><option key={m.id} value={m.studentId}>{m.name}·{m.department}</option>)}
                    </select>
                  </div>
                )}
              </div>);
            })}
          </div>

          {cat.hasCoach&&(
            <div style={{...card,padding:'18px'}}>
              <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>负责教练 <span style={{fontWeight:400,color:'var(--color-muted)'}}>（可选）</span></label>
              <select value={coachId} onChange={e=>setCoachId(e.target.value)} style={inp}>
                <option value="">不选择教练</option>
                {coaches.map(c=><option key={c.id} value={c.studentId}>{c.name}（教练积分{c.coachPoints}）</option>)}
              </select>
              {coachId&&<p style={{fontSize:12,color:'var(--color-muted)',marginTop:6}}>教练将获得 +3 教练积分</p>}
            </div>
          )}

          {preview.items.length>0&&(
            <div style={{...card,padding:'18px'}}>
              <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:10}}>积分预览</label>
              {Object.entries(preview.items.reduce((acc,i)=>{if(!acc[i.memberId])acc[i.memberId]={name:i.memberName,labels:[],total:0};acc[i.memberId].labels.push(i.label);acc[i.memberId].total+=i.points;return acc;},{} as Record<string,{name:string;labels:string[];total:number}>)).map(([mid,d])=>(
                <div key={mid} style={{fontSize:13,padding:'3px 0'}}>
                  <span style={{fontWeight:600}}>{d.name}</span>
                  <span style={{color:'var(--color-muted)',marginLeft:6}}>{d.labels.join('+')} = <span style={{fontWeight:600,color:'var(--color-text)'}}>{d.total} 分</span></span>
                </div>
              ))}
              <div style={{borderTop:'1px solid var(--color-border)',marginTop:8,paddingTop:8,display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:700}}>
                <span>奖金池积分合计</span><span>{preview.total} 分</span>
              </div>
              {preview.cp>0&&<div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginTop:4}}><span style={{color:'var(--color-muted)'}}>教练积分</span><span style={{color:'var(--color-accent)',fontWeight:600}}>+{preview.cp}</span></div>}
            </div>
          )}

          <div style={{...card,padding:'18px'}}>
            <label style={{fontSize:12,fontWeight:600,display:'block',marginBottom:6}}>备注</label>
            <textarea style={{...inp,height:60,paddingTop:10,resize:'none'}} placeholder="补充说明..." value={note} onChange={e=>setNote(e.target.value)} />
            <button onClick={submit} disabled={preview.items.length===0}
              style={{width:'100%',height:48,marginTop:14,borderRadius:10,border:'none',cursor:preview.items.length===0?'not-allowed':'pointer',
                background:preview.items.length===0?'var(--color-border)':'var(--color-accent)',color:'#FFF',fontSize:16,fontWeight:600,opacity:preview.items.length===0?0.4:1}}>
              确认提交
            </button>
          </div>
        </>
      )}
    </div>
  );
}
