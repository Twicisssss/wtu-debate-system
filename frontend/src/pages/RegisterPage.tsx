import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import type { Department } from '../types';

const inpStyle = { width: '100%' as const, height: 50, padding: '0 18px', borderRadius: 12,
  border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 16,
  color: 'var(--color-text)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [sid, setSid] = useState(''); const [name, setName] = useState('');
  const [dept, setDept] = useState<Department>('赛事部'); const [grade, setGrade] = useState(new Date().getFullYear());
  const [pw, setPw] = useState(''); const [err, setErr] = useState('');

  const go = async () => {
    setErr('');
    if (!sid.trim()||!name.trim()||!pw.trim()) { setErr('请填写所有必填项'); return; }
    if (pw.length<4) { setErr('密码至少4位'); return; }
    const result = await register(sid.trim(),name.trim(),dept,grade,pw);
    if (result.success) navigate('/home');
    else setErr('该学号已被注册，请直接登录或找回密码');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(160deg, #FAF9F6 0%, #F0EDE8 100%)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 6 }}>注册账号</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>加入武汉纺织大学辩论队</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input style={inpStyle} placeholder="学号" value={sid} onChange={e=>setSid(e.target.value)} />
            <input style={inpStyle} placeholder="姓名" value={name} onChange={e=>setName(e.target.value)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <select style={{...inpStyle,flex:1,appearance:'none'}} value={dept} onChange={e=>setDept(e.target.value as Department)}>
                {(['赛事部','活动部','宣传部'] as Department[]).map(d=><option key={d}>{d}</option>)}
              </select>
              <input type="number" min={2000} max={2100} style={{...inpStyle,width:100}} value={grade} onChange={e=>setGrade(+e.target.value)} placeholder="年级" />
            </div>
            <input style={inpStyle} type="password" placeholder="设置密码（至少4位）" value={pw} onChange={e=>setPw(e.target.value)} />
            {err&&<p style={{fontSize:13,color:'var(--color-danger)',textAlign:'center'}}>{err}</p>}
            <button onClick={go}
              style={{ width:'100%',height:50,borderRadius:10,border:'none',cursor:'pointer',background:'var(--color-accent)',color:'#FFF',fontSize:17,fontWeight:600 }}>
              注册
            </button>
          </div>
          <p style={{ textAlign:'center',marginTop:20,color:'var(--color-muted)',fontSize:14 }}>
            已有账号？<button onClick={()=>navigate('/login')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-accent)',fontWeight:500,fontSize:14}}>返回登录</button>
          </p>
        </div>
      </div>
    </div>
  );
}
