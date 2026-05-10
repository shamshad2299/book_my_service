import { CalendarPlus, Clock3, ClipboardList, MapPinned, Send, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { api } from '../api/http.js';
import BookingRow from '../components/dashboard/BookingRow.jsx';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import StatCard from '../components/ui/StatCard.jsx';

export default function CustomerDashboard() {
  const { state } = useLocation();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ serviceId: state?.service?._id || state?.service?.id || '', scheduledAt: '', address: '', notes: '' });
  const [ratingForms, setRatingForms] = useState({});
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(null);

  const load = () => api.get('/bookings').then(({ data }) => setBookings(data));
  useEffect(() => {
    load().catch(() => toast.error('Could not load bookings'));
    api
      .get('/services')
      .then(({ data }) => setServices(data))
      .catch(() => toast.error('Could not load services'));
  }, []);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      active: bookings.filter((booking) => !['delivered', 'cancelled', 'rejected'].includes(booking.status)).length,
      delivered: bookings.filter((booking) => booking.status === 'delivered').length
    }),
    [bookings]
  );

  const submit = async (event) => {
    event.preventDefault();
    const serviceId = form.serviceId.trim();
    if (!/^[a-f\d]{24}$/i.test(serviceId)) {
      toast.error('Select a valid service');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        ...form,
        serviceId,
        address: form.address.trim(),
        notes: form.notes.trim()
      });
      toast.success('Booking created');
      setForm({ serviceId: '', scheduledAt: '', address: '', notes: '' });
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const updateRatingForm = (bookingId, patch) => {
    setRatingForms((current) => ({
      ...current,
      [bookingId]: { rating: 5, review: '', ...(current[bookingId] || {}), ...patch }
    }));
  };

  const rate = async (bookingId) => {
    const ratingForm = ratingForms[bookingId] || { rating: 5, review: '' };
    setRatingLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/rating`, {
        rating: ratingForm.rating,
        review: ratingForm.review.trim()
      });
      toast.success('Rating submitted');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rating failed');
    } finally {
      setRatingLoading(null);
    }
  };

  return (
    <DashboardShell
      eyebrow="Customer"
      title="Booking cockpit"
      description="Create service requests, monitor vendor assignment and track every booking status from one place."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total bookings" value={stats.total} helper="All requests" icon={ClipboardList} />
        <StatCard label="Active" value={stats.active} helper="In progress" icon={Clock3} tone="amber" />
        <StatCard label="Delivered" value={stats.delivered} helper="Completed jobs" icon={MapPinned} tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <SectionCard title="New booking" description={state?.service ? `Selected: ${state.service.title}` : 'Choose a service and schedule a visit.'}>
          <form onSubmit={submit} className="space-y-3">
            <select className="input" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} required>
              <option value="">{services.length ? 'Select service' : 'No services available'}</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.title} - {service.vendor?.businessName || service.vendor?.name || 'Vendor'} - {service.city}
                </option>
              ))}
            </select>
            <input className="input" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
            <textarea className="input" placeholder="Full service address" rows="4" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            <textarea className="input" placeholder="Notes for vendor" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="btn-primary min-h-12 w-full" disabled={loading}>
              <CalendarPlus size={18} /> {loading ? 'Booking...' : 'Confirm booking'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Booking history" description="Latest requests and fulfillment status.">
          <div className="space-y-3">
            {bookings.length ? (
              bookings.map((booking) => (
                <BookingRow
                  key={booking._id}
                  booking={booking}
                  actions={
                    booking.status === 'delivered' &&
                    (booking.rating ? (
                      <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                        Rated {booking.rating}/5
                      </div>
                    ) : (
                      <div className="w-full space-y-2 lg:w-72">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((value) => {
                            const activeRating = ratingForms[booking._id]?.rating || 5;
                            return (
                              <button
                                key={value}
                                type="button"
                                className="rounded-md p-1 text-amber-400 transition hover:bg-amber-50 dark:hover:bg-amber-950"
                                onClick={() => updateRatingForm(booking._id, { rating: value })}
                                aria-label={`Rate ${value} stars`}
                              >
                                <Star size={20} className={value <= activeRating ? 'fill-amber-400' : ''} />
                              </button>
                            );
                          })}
                        </div>
                        <textarea
                          className="input min-h-20 text-sm"
                          placeholder="Review"
                          value={ratingForms[booking._id]?.review || ''}
                          onChange={(event) => updateRatingForm(booking._id, { review: event.target.value })}
                        />
                        <button className="btn-primary w-full" onClick={() => rate(booking._id)} disabled={ratingLoading === booking._id}>
                          <Send size={16} /> {ratingLoading === booking._id ? 'Submitting...' : 'Submit rating'}
                        </button>
                      </div>
                    ))
                  }
                />
              ))
            ) : (
              <EmptyState title="No bookings yet" description="Book a service to start tracking your request here." />
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
