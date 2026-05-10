import { ArrowRight, MapPin, Search, ShieldCheck, Tags, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/http.js';
import ServiceCard from '../components/ServiceCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const [services, setServices] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadServices = (nextCategory = category) => {
    setLoading(true);
    api
      .get('/services', { params: { q, category: nextCategory === 'All' ? undefined : nextCategory } })
      .then(({ data }) => setServices(data))
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load services'))
      .finally(() => setLoading(false));
  };

  useEffect(loadServices, []);

  const categories = useMemo(() => ['All', ...new Set(services.map((service) => service.category).filter(Boolean))], [services]);
  const cityCount = useMemo(() => new Set(services.map((service) => service.city).filter(Boolean)).size, [services]);
  const categoryCount = Math.max(categories.length - 1, 0);

  const book = (service) => {
    if (!user) return navigate('/login');
    if (user.role !== 'customer') return toast.error('Use a customer account to book services');
    navigate('/customer', { state: { service } });
  };

  return (
    <main>
      <section className="premium-band">
        <div className="mx-auto grid max-w-7xl gap-7 px-2 py-8 min-[360px]:px-4 min-[360px]:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:py-16">
          <div className="space-y-5 min-[360px]:space-y-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-2 text-sm font-bold text-sky-700 shadow-sm dark:border-sky-900 dark:bg-slate-900/70 dark:text-sky-200 min-[360px]:px-4">
               Premium doorstep service network
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-black leading-[1.08] tracking-tight min-[360px]:text-4xl md:text-6xl">
                Book verified professionals with travel-grade service tracking.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 min-[360px]:text-lg min-[360px]:leading-8">
                A MakeMyTrip-inspired platform for discovering services, scheduling bookings, assigning vendors and tracking every status in one polished workflow.
              </p>
            </div>

            <div className="glass rounded-lg p-2 min-[360px]:p-3">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-2 rounded-lg bg-white px-2 dark:bg-slate-950 min-[360px]:gap-3 min-[360px]:px-4">
                  <Search className="shrink-0 text-slate-400" size={20} />
                  <input
                    className="min-h-12 min-w-0 flex-1 bg-transparent outline-none"
                    placeholder="Search available services"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && loadServices()}
                  />
                </div>
                <button className="btn-primary min-h-12 px-4 min-[360px]:px-6" onClick={() => loadServices()}>
                  Search services <ArrowRight size={18} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      category === item
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => {
                      setCategory(item);
                      loadServices(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Live services" value={services.length} helper="Vendor-created listings" icon={ShieldCheck} tone="sky" />
              <StatCard label="Cities" value={cityCount} helper="From active listings" icon={MapPin} tone="emerald" />
              <StatCard label="Categories" value={categoryCount} helper="From active listings" icon={Tags} tone="amber" />
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1100&q=85"
              alt="Premium service booking desk"
              className="aspect-[4/5] w-full rounded-lg object-cover shadow-soft"
            />
            <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/92 p-3 shadow-soft backdrop-blur dark:bg-slate-950/90 min-[360px]:bottom-5 min-[360px]:left-5 min-[360px]:right-5 min-[360px]:p-4">
              <div className="flex items-center justify-between gap-2 min-[360px]:gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500">Today</p>
                  <p className="mt-1 font-black">{services.length} services available</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Listings appear after vendors add services.</p>
                </div>
                <div className="hidden rounded-lg bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-200 min-[300px]:block">
                  <UsersRound size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-2 py-8 min-[360px]:px-4 min-[360px]:py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-sky-500">Marketplace</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">Available services</h2>
          </div>
          {loading && <span className="text-sm font-semibold text-slate-500">Refreshing inventory...</span>}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-96" />
            ))}
          </div>
        ) : services.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} onBook={book} />
            ))}
          </div>
        ) : (
          <EmptyState title="No services found" description="Try a different keyword or category." />
        )}
      </section>
    </main>
  );
}
