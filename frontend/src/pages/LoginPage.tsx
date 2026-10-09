import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogIn, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login, checkAccount, getResetCode, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [forgot, setForgot] = useState(false);
  const [resetStep, setResetStep] = useState<'account' | 'code' | 'newpw'>('account');
  const [resetId, setResetId] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!studentId.trim() || !password.trim()) { setError('请填写学号和密码'); return; }
    setLoading(true);
    const result = await login(studentId.trim(), password);
    if (result.success) { navigate('/home'); }
    else {
      setError(result.error === 'no_account' ? '此学号未注册，请先注册' : '密码错误，请重试');
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetMsg('');
    if (resetStep === 'account') {
      if (!resetId.trim()) { setResetMsg('请输入学号'); return; }
      const exists = await checkAccount(resetId.trim());
      if (!exists) { setResetMsg('此学号未注册'); return; }
      setResetStep('code');
    } else if (resetStep === 'code') {
      if (!resetCodeInput.trim()) { setResetMsg('请输入重置码'); return; }
      const currentCode = await getResetCode();
      if (resetCodeInput.trim() !== currentCode) { setResetMsg('重置码错误'); return; }
      setResetStep('newpw');
    } else if (resetStep === 'newpw') {
      if (!newPassword || newPassword.length < 4) { setResetMsg('密码至少 4 位'); return; }
      if (newPassword !== confirmPassword) { setResetMsg('两次输入的密码不一致'); return; }
      const result = await resetPassword(resetId.trim(), resetCodeInput.trim(), newPassword);
      if (result.success) {
        setResetMsg('✅ 密码重置成功，请返回登录');
        setTimeout(() => { setForgot(false); setResetStep('account'); setResetId(''); setResetCodeInput(''); setNewPassword(''); setConfirmPassword(''); setResetMsg(''); }, 2000);
      } else {
        setResetMsg('重置失败，请重试');
      }
    }
  };

  const inputStyle = {
    width: '100%', height: 52, padding: '0 18px', borderRadius: 12,
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    color: 'var(--color-text)', fontSize: 16, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  if (forgot) {
    return (
      <div className="min-h-screen flex page-enter" style={{ background: 'linear-gradient(160deg, #FAF9F6 0%, #F0EDE8 100%)' }}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[360px]">
            <div className="flex items-center gap-2 mb-8">
              <button onClick={() => { setForgot(false); setResetStep('account'); setResetMsg(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={18} /> 返回登录
              </button>
            </div>
            <h1 className="text-[24px] font-semibold text-[var(--color-text)] mb-2">忘记密码</h1>
            <p className="text-[14px] text-[var(--color-muted)] mb-8">
              {resetStep === 'account' && '输入学号，确认账号'}
              {resetStep === 'code' && '输入密码重置码'}
              {resetStep === 'newpw' && '设置新密码'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resetStep === 'account' && (
                <input type="text" placeholder="学号" value={resetId}
                  onChange={e => setResetId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  style={inputStyle} />
              )}
              {resetStep === 'code' && (
                <input type="password" placeholder="密码重置码" value={resetCodeInput}
                  onChange={e => setResetCodeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  style={inputStyle} />
              )}
              {resetStep === 'newpw' && (
                <>
                  <input type="password" placeholder="新密码（至少4位）" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
                  <input type="password" placeholder="确认新密码" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                    style={inputStyle} />
                </>
              )}

              {resetMsg && (
                <p className="text-[13px] text-center" style={{ color: resetMsg.startsWith('✅') ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {resetMsg}
                </p>
              )}

              <button onClick={handleReset}
                className="w-full font-medium text-[17px] btn-pulse transition-all"
                style={{ height: 52, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--color-accent)', color: '#FFF' }}>
                {resetStep === 'account' ? '下一步' : resetStep === 'code' ? '验证' : '确认重置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex page-enter" style={{ background: 'linear-gradient(160deg, #FAF9F6 0%, #F0EDE8 100%)' }}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[360px]">

          <div className="text-center mb-10">
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[var(--color-text)] mb-2">
              武汉纺织大学辩论队
            </h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="学号" value={studentId}
              onChange={e => setStudentId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle} />

            <input type="password" placeholder="密码" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle} />

            {error && (
              <p className="text-[13px] text-center animate-fadeSlideIn" style={{ color: 'var(--color-danger)' }}>
                {error}
              </p>
            )}

            <button onClick={handleLogin} disabled={loading}
              className="w-full font-medium text-[17px] btn-pulse transition-all"
              style={{ height: 52, borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
                background: loading ? 'var(--color-accent-dim)' : 'var(--color-accent)',
                color: '#FFF', opacity: loading ? 0.8 : 1 }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <LogIn size={18} />
                {loading ? '登录中...' : '登录'}
              </span>
            </button>
          </div>

          <div className="text-center mt-5 flex justify-between items-center">
            <button onClick={() => setForgot(true)}
              style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              忘记密码？
            </button>
            <span className="text-[14px]" style={{ color: 'var(--color-muted)' }}>
              还没有账号？{' '}
              <button onClick={() => navigate('/register')}
                style={{ color: 'var(--color-accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                立即注册
              </button>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
