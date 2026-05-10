import { Check, ClipboardCheck, IndianRupee, PackageCheck, Pencil, Plus, Save, TimerReset, X, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/http.js';
import BookingRow from '../components/dashboard/BookingRow.jsx';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { currency } from '../utils/format.js';

export default function VendorDashboard() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: '',
    description: '',
    city: '',
    price: '',
    imageUrl: ''
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    description: '',
    city: '',
    price: '',
    imageUrl: ''
  });
  const [savingService, setSavingService] = useState(false);
  const [updatingService, setUpdatingService] = useState(false);

  const load = async () => {
    const [{ data: bookingData }, { data: statData }, { data: serviceData }] = await Promise.all([
      api.get('/vendor/bookings'),
      api.get('/vendor/stats'),
      api.get('/vendor/services')
    ]);
    setBookings(bookingData);
    setStats(statData.stats);
    setServices(serviceData);
  };

  useEffect(() => {
    load().catch(() => toast.error('Could not load vendor dashboard'));
  }, []);

  const totals = useMemo(() => {
    const revenue = stats.reduce((sum, stat) => sum + (stat.revenue || 0), 0);
    return {
      assigned: bookings.length,
      pending: bookings.filter((booking) => ['assigned', 'accepted'].includes(booking.status)).length,
      revenue,
      services: services.length
    };
  }, [bookings, services.length, stats]);

  const update = async (id, status) => {
    try {
      await api.patch(`/vendor/bookings/${id}`, { status });
      toast.success(`Marked ${status}`);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const createService = async (event) => {
    event.preventDefault();
    const payload = {
      ...serviceForm,
      title: serviceForm.title.trim(),
      category: serviceForm.category.trim(),
      description: serviceForm.description.trim(),
      city: serviceForm.city.trim(),
      imageUrl: serviceForm.imageUrl.trim(),
      price: Number(serviceForm.price)
    };

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      toast.error('Enter a valid service price');
      return;
    }

    setSavingService(true);
    try {
      await api.post('/vendor/services', payload);
      toast.success('Service added');
      setServiceForm({ title: '', category: '', description: '', city: '', price: '', imageUrl: '' });
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add service');
    } finally {
      setSavingService(false);
    }
  };

  const startEdit = (service) => {
    setEditingServiceId(service._id);
    setEditForm({
      title: service.title || '',
      category: service.category || '',
      description: service.description || '',
      city: service.city || '',
      price: service.price?.toString() || '',
      imageUrl: service.imageUrl || ''
    });
  };

  const cancelEdit = () => {
    setEditingServiceId(null);
    setEditForm({ title: '', category: '', description: '', city: '', price: '', imageUrl: '' });
  };

  const saveService = async (event) => {
    event.preventDefault();
    const payload = {
      ...editForm,
      title: editForm.title.trim(),
      category: editForm.category.trim(),
      description: editForm.description.trim(),
      city: editForm.city.trim(),
      imageUrl: editForm.imageUrl.trim(),
      price: Number(editForm.price)
    };

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      toast.error('Enter a valid service price');
      return;
    }

    setUpdatingService(true);
    try {
      await api.patch(`/vendor/services/${editingServiceId}`, payload);
      toast.success('Service updated');
      cancelEdit();
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update service');
    } finally {
      setUpdatingService(false);
    }
  };

  return (
    <DashboardShell eyebrow="Vendor" title="Service operations" description="Add services, approve customer requests and mark completed work.">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Assigned jobs" value={totals.assigned} helper="All bookings" icon={ClipboardCheck} />
        <StatCard label="Active queue" value={totals.pending} helper="Needs action" icon={TimerReset} tone="amber" />
        <StatCard label="Revenue" value={currency(totals.revenue)} helper={`${totals.services} listed services`} icon={IndianRupee} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <SectionCard title="Add service" description="Create services under your vendor account. Customers will see your business name on each listing.">
          <form onSubmit={createService} className="space-y-3">
            <input className="input" placeholder="Service title" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Category" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} required />
              <input className="input" placeholder="City" value={serviceForm.city} onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })} required />
            </div>
            <input className="input" type="number" min="0" step="1" placeholder="Price" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} required />
            <input className="input" type="url" placeholder="Image URL" value={serviceForm.imageUrl} onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })} />
            <textarea className="input" placeholder="Description" rows="4" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} required />
            <button className="btn-primary min-h-12 w-full" disabled={savingService}>
              <Plus size={18} /> {savingService ? 'Adding...' : 'Add service'}
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Your services" description="Services listed from this vendor login.">
          <div className="space-y-3">
            {services.length ? (
              services.map((service) => (
                <div key={service._id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  {editingServiceId === service._id ? (
                    <form onSubmit={saveService} className="space-y-3">
                      <input className="input" placeholder="Service title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input className="input" placeholder="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required />
                        <input className="input" placeholder="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} required />
                      </div>
                      <input className="input" type="number" min="0" step="1" placeholder="Price" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required />
                      <input className="input" type="url" placeholder="Image URL" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} />
                      <textarea className="input" placeholder="Description" rows="3" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
                      <div className="flex flex-wrap gap-2">
                        <button className="btn-primary" disabled={updatingService}>
                          <Save size={16} /> {updatingService ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={updatingService}>
                          <X size={16} /> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-black">{service.title}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {service.category} in {service.city}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <div className="flex items-center gap-2 font-black text-sky-700 dark:text-sky-200">
                            <Wrench size={17} /> {currency(service.price)}
                          </div>
                          <button className="btn-secondary" onClick={() => startEdit(service)}>
                            <Pencil size={16} /> Edit
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{service.description}</p>
                    </>
                  )}
                </div>
              ))
            ) : (
              <EmptyState title="No services listed" description="Add your first service so customers can book this vendor." />
            )}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="Customer requests" description="Approve requests for the services listed under this vendor account.">
          <div className="space-y-3">
            {bookings.length ? (
              bookings.map((booking) => (
                <BookingRow
                  key={booking._id}
                  booking={booking}
                  actions={
                    <>
                      {['pending', 'assigned'].includes(booking.status) && (
                        <button className="btn-secondary" onClick={() => update(booking._id, 'accepted')}>
                          <Check size={16} /> Approve
                        </button>
                      )}
                      {booking.status === 'accepted' && (
                        <button className="btn-primary" onClick={() => update(booking._id, 'delivered')}>
                          <PackageCheck size={16} /> Delivered
                        </button>
                      )}
                    </>
                  }
                />
              ))
            ) : (
              <EmptyState title="No assigned bookings" description="Customer requests for your services will appear here." />
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
