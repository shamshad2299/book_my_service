import Badge from '../ui/Badge.jsx';
import { currency, dateTime } from '../../utils/format.js';
import { Star } from 'lucide-react';

export default function BookingRow({ booking, actions }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 transition hover:border-sky-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-900 min-[360px]:p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="truncate font-black">{booking.service?.title || 'Service request'}</h3>
            <Badge tone={booking.status}>{booking.status}</Badge>
          </div>
          <div className="grid gap-1 text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-2">
            <p>{dateTime(booking.scheduledAt)}</p>
            <p>{currency(booking.amount)}</p>
            <p>Customer: {booking.customer?.name || '-'}</p>
            <p>Vendor: {booking.vendor?.businessName || 'Awaiting assignment'}</p>
          </div>
          {booking.address && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{booking.address}</p>}
          {booking.rating && (
            <p className="mt-2 flex items-center gap-1 text-sm font-bold text-amber-600 dark:text-amber-300">
              <Star size={15} className="fill-amber-400 text-amber-400" /> {booking.rating}/5 {booking.review ? `- ${booking.review}` : ''}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div>}
      </div>
    </div>
  );
}
