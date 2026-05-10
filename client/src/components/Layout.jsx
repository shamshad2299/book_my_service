import { BriefcaseBusiness, Moon, Sun, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const dashboard = user?.role === 'vendor' ? '/vendor' : '/customer';

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-2 py-3 min-[360px]:px-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-base font-black tracking-tight min-[360px]:text-xl">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-600 text-white shadow-glow min-[360px]:h-9 min-[360px]:w-9">
              <BriefcaseBusiness size={19} />
            </span>
            <span className="truncate max-[260px]:hidden">BookMyService</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-bold text-slate-600 dark:text-slate-300 md:flex">
            <Link to="/">Services</Link>
            <Link to="/login">Customer login</Link>
            <Link to="/login">Vendor login</Link>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <button className="btn-secondary !px-3" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <>
                <Link to={dashboard} className="btn-secondary flex max-w-36 items-center gap-2 min-[360px]:max-w-48">
                  <UserRound size={18} className="shrink-0" /> <span className="truncate">{user.name}</span>
                </Link>
                <button
                  className="btn-primary"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
