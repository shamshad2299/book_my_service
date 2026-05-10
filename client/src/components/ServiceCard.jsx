import { BriefcaseBusiness, CalendarCheck, MapPin, Star } from 'lucide-react';
import { currency } from '../utils/format.js';

const fallbackImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80';

export default function ServiceCard({ service, onBook }) {
  const ratingLabel = service.ratingCount ? `${service.averageRating} (${service.ratingCount})` : 'New';

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-900">
      <div className="relative">
        <img src={service.imageUrl || fallbackImage} alt={service.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-sm backdrop-blur">
          {service.category}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white">
          <Star size={14} className={service.ratingCount ? 'fill-amber-400 text-amber-400' : 'text-amber-400'} /> {ratingLabel}
        </div>
      </div>
      <div className="space-y-4 p-3 min-[360px]:p-5">
        <div>
          <h3 className="text-lg font-black">{service.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <MapPin size={15} /> {service.city}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-sky-700 dark:text-sky-200">
            <BriefcaseBusiness size={15} /> {service.vendor?.businessName || service.vendor?.name || 'Verified vendor'}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{service.description}</p>
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 min-[300px]:flex-row min-[300px]:items-center min-[300px]:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Starting at</p>
            <p className="text-xl font-black">{currency(service.price)}</p>
          </div>
          <button className="btn-primary" onClick={() => onBook(service)}>
            <CalendarCheck size={18} /> Book
          </button>
        </div>
      </div>
    </article>
  );
}
