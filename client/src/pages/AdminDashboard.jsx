import { BriefcaseBusiness, CalendarClock, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/http.js';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionCard from '../components/ui/SectionCard.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import DashboardShell from '../components/dashboard/DashboardShell.jsx';
import { currency, dateTime, titleCase } from '../utils/format.js';

export default function AdminDashboard() {
  const [overview, setOverview] = useState({});
  const [bookings, setBookings] = useState([]);
  const [vendors, setVendors] = useState([]);

  const load = async () => {
    const [overviewRes, bookingsRes, vendorsRes] = await Promise.all([
      api.get('/admin/overview'),
      api.get('/admin/bookings'),
      api.get('/admin/vendors')
    ]);
    setOverview(overviewRes.data);
    setBookings(bookingsRes.data);
    setVendors(vendorsRes.data);
  };

  useEffect(() => {
    load().catch(() => toast.error('Could not load admin dashboard'));
  }, []);

  const assign = async (bookingId, vendorId) => {
    if (!vendorId) return;
    try {
      await api.patch(`/admin/bookings/${bookingId}/assign`, { vendorId });
      toast.success('Vendor assigned');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <DashboardShell eyebrow="Admin" title="Platform command center" description="Manage customers, vendors, service inventory and booking assignments.">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Customers" value={overview.users || 0} helper="Verified users" icon={UsersRound} />
        <StatCard label="Vendors" value={overview.vendors || 0} helper="Supply partners" icon={BriefcaseBusiness} tone="emerald" />
        <StatCard label="Bookings" value={overview.bookings || 0} helper="Total requests" icon={CalendarClock} tone="amber" />
        <StatCard label="Services" value={overview.services || 0} helper="Listed products" icon={ShieldCheck} tone="rose" />
      </div>

      <SectionCard title="Booking assignment board" description="Assign vendors and monitor platform fulfillment.">
        {bookings.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Schedule</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Vendor</th>
                  <th className="px-3 py-2">Assign</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="bg-slate-50 shadow-sm dark:bg-slate-950">
                    <td className="rounded-l-lg px-3 py-4 font-bold">{booking.customer?.name || '-'}</td>
                    <td className="px-3 py-4">
                      <p className="font-bold">{booking.service?.title || '-'}</p>
                      <p className="text-xs text-slate-500">{booking.service?.category}</p>
                    </td>
                    <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{dateTime(booking.scheduledAt)}</td>
                    <td className="px-3 py-4 font-black">{currency(booking.amount)}</td>
                    <td className="px-3 py-4">
                      <Badge tone={booking.status}>{titleCase(booking.status)}</Badge>
                    </td>
                    <td className="px-3 py-4">{booking.vendor?.businessName || 'Unassigned'}</td>
                    <td className="rounded-r-lg px-3 py-4">
                      <select className="input min-w-44" defaultValue="" onChange={(e) => assign(booking._id, e.target.value)}>
                        <option value="">Choose vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor._id}>
                            {vendor.businessName}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No bookings yet" description="Customer booking requests will appear here." />
        )}
      </SectionCard>
    </DashboardShell>
  );
}
