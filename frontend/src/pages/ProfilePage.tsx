import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { User, Phone, Mail, MessageCircle } from 'lucide-react';
import type { Department } from '../types';

const card = { background: 'var(--color-surface)', borderRadius: 14, border: '1px solid var(--color-border)' } as const;
const inp = { width: '100%' as const, height: 46, padding: '0 14px', borderRadius: 10,
  border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 15,
  color: 'var(--color-text)', outline: 'none' };

export default function ProfilePage() {
  const { user, updateMember, refreshUser } = useAuth();

  useEffect(() => { refreshUser(); }, []);

  const [phone, setPhone] = useState(user?.phone || '');
  const [qq, setQq] = useState(user?.qq || '');
  const [wechat, setWechat] = useState(user?.wechat || '');
  const [email, setEmail] = useState(user?.email || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [department, setDepartment] = useState<Department>(user?.department || '赛事部');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPhone(user?.phone || '');
    setQq(user?.qq || '');
    setWechat(user?.wechat || '');
    setEmail(user?.email || '');
    setGender(user?.gender || '');
    setBirthday(user?.birthday || '');
    setDepartment(user?.department || '赛事部');
  }, [user]);

  if (!user) return null;

  const save = async () => {
    await updateMember({ ...user, department, phone: phone || undefined, qq: qq || undefined, wechat: wechat || undefined, email: email || undefined, gender: gender || undefined, birthday: birthday || undefined });
    await refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="page-enter">
      <h2 style={{ fontSize: 22, fontWeight: 600 }}>个人信息</h2>

      {/* Read-only info */}
      <div style={{ ...card, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: 'var(--color-accent)/10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={22} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>{user.name}</p>
            <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>{user.studentId} · {user.department} · {user.grade}级</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-bg)' }}>
            <span style={{ color: 'var(--color-muted)' }}>角色：</span>
            {user.role === 'super_admin' ? '超级管理员' : user.role === 'captain' ? '队长' : '队员'}
          </div>
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--color-bg)' }}>
            <span style={{ color: 'var(--color-muted)' }}>教练：</span>
            {user.isCoach ? '是' : '否'}
          </div>
        </div>
      </div>

      {/* Gender & Birthday — placed first so date picker opens upward on mobile */}
      <div style={{ ...card, padding: '20px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          基本信息 <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 400 }}>（选填）</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--color-muted)' }}>部门</label>
            <select style={inp} value={department} onChange={e => setDepartment(e.target.value as Department)}>
              {(['赛事部','活动部','宣传部'] as Department[]).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--color-muted)' }}>性别</label>
            <select style={inp} value={gender} onChange={e => setGender(e.target.value)}>
              <option value="">不填写</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--color-muted)' }}>生日</label>
            <input type="date" style={inp} value={birthday} onChange={e => setBirthday(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div style={{ ...card, padding: '20px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          联系方式 <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 400 }}>（选填，仅队员间可见）</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--color-muted)' }}>
              <Phone size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />手机号
            </label>
            <input style={inp} placeholder="输入手机号" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--color-muted)' }}>
              <MessageCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />QQ
            </label>
            <input style={inp} placeholder="输入QQ号" value={qq} onChange={e => setQq(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--color-muted)' }}>
              <MessageCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />微信
            </label>
            <input style={inp} placeholder="输入微信号" value={wechat} onChange={e => setWechat(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5, color: 'var(--color-muted)' }}>
              <Mail size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />邮箱
            </label>
            <input style={inp} placeholder="输入邮箱" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Save */}
      <div style={{ ...card, padding: '20px' }}>
        <button onClick={save}
          style={{ width: '100%', height: 46, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: saved ? 'var(--color-success)' : 'var(--color-accent)', color: '#FFF',
            fontSize: 15, fontWeight: 600, transition: 'background 0.3s' }}>
          {saved ? '✅ 已保存' : '保存'}
        </button>
      </div>
    </div>
  );
}
