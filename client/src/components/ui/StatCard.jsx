export default function StatCard({ label, value, helper, icon: Icon, tone = 'sky' }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-200',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-200',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-200',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-200'
  };

  return (
    <div className="panel p-3 transition duration-300 hover:-translate-y-0.5 hover:shadow-soft min-[360px]:p-5">
      <div className="flex items-start justify-between gap-2 min-[360px]:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-black tracking-tight min-[360px]:text-3xl">{value}</p>
          {helper && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helper}</p>}
        </div>
        {Icon && (
          <div className={`hidden shrink-0 rounded-lg p-3 min-[300px]:block ${tones[tone]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
