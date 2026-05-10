import { Building2, KeyRound, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/http.js';
import { useAuth } from '../context/AuthContext.jsx';

const roles = [
  { id: 'customer', label: 'Customer', icon: UserRound },
  { id: 'vendor', label: 'Vendor', icon: Building2 }
];

export default function Login() {
  const [role, setRole] = useState('customer');
  const [mode, setMode] = useState('login');
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', businessName: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const redirect = (nextUser) => {
    navigate(nextUser.role === 'vendor' ? '/vendor' : '/customer');
  };

  const update = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
    if (field === 'email') setOtpSent(false);
  };

  const resetAuthFlow = (nextRole, nextMode = 'login') => {
    setRole(nextRole);
    setMode(nextMode);
    setOtpSent(false);
    setForm({ name: '', email: '', phone: '', password: '', businessName: '', otp: '' });
  };

  const payload = {
    ...form,
    email: form.email.trim().toLowerCase(),
    name: form.name.trim(),
    phone: form.phone.trim(),
    businessName: form.businessName.trim(),
    otp: form.otp.trim()
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (role === 'customer' && !otpSent) {
        const url = mode === 'signup' ? '/auth/customer/request-otp' : '/auth/customer/login-otp';
        await api.post(url, payload);
        setOtpSent(true);
        toast.success('OTP sent');
        return;
      }

      if (role === 'customer') {
        const { data } = await api.post('/auth/customer/verify-otp', payload);
        saveSession(data);
        redirect(data.user);
        return;
      }

      const url = mode === 'signup' ? '/auth/vendor/signup' : '/auth/vendor/login';
      const { data } = await api.post(url, payload);
      saveSession(data);
      redirect(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="premium-band min-h-[calc(100vh-65px)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-2 py-8 min-[360px]:px-4 min-[360px]:py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <section className="glass rounded-lg p-3 min-[360px]:p-5">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-500">Secure access</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight min-[360px]:text-3xl">Continue to your workspace</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Customers use OTP sign-up and login. Vendors can create an account, add services, and approve customer requests.
            </p>
          </div>

          <div className="mb-5 grid gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 min-[300px]:grid-cols-2">
            {roles.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-black transition ${
                  role === id ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-950' : 'text-slate-500 dark:text-slate-300'
                }`}
                onClick={() => {
                  resetAuthFlow(id);
                }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2 min-[300px]:grid-cols-2">
              <button type="button" className={mode === 'login' ? 'btn-primary' : 'btn-secondary'} onClick={() => resetAuthFlow(role, 'login')}>
                Login
              </button>
              <button type="button" className={mode === 'signup' ? 'btn-primary' : 'btn-secondary'} onClick={() => resetAuthFlow(role, 'signup')}>
                Signup
              </button>
            </div>
            {mode === 'signup' && (
              <input className="input" placeholder="Full name" value={form.name} onChange={update('name')} required />
            )}
            {mode === 'signup' && role === 'vendor' && (
              <>
                <input className="input" placeholder="Business name" value={form.businessName} onChange={update('businessName')} required />
                <input className="input" placeholder="Phone" value={form.phone} onChange={update('phone')} />
              </>
            )}
            {mode === 'signup' && role === 'customer' && (
              <input className="input" placeholder="Phone" value={form.phone} onChange={update('phone')} />
            )}
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
              <input className="input pl-10" placeholder="Email" type="email" value={form.email} onChange={update('email')} required />
            </div>
            {role === 'vendor' && (
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} />
                <input className="input pl-10" placeholder="Password" type="password" value={form.password} onChange={update('password')} required minLength={8} />
              </div>
            )}
            {role === 'customer' && otpSent && (
              <input className="input" placeholder="6 digit OTP" inputMode="numeric" maxLength={6} value={form.otp} onChange={update('otp')} required />
            )}
            <button className="btn-primary min-h-12 w-full" disabled={loading}>
              {loading ? 'Please wait...' : role === 'customer' && !otpSent ? 'Send OTP' : mode === 'signup' && role === 'vendor' ? 'Create vendor account' : 'Continue'}
            </button>
          </form>
        </section>

        <section className="hidden overflow-hidden rounded-lg shadow-soft lg:block">
          <img
            className="h-[680px] w-full object-cover"
            alt="Premium service operations"
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1300&q=85"
          />
        </section>
      </div>
    </main>
  );
}
