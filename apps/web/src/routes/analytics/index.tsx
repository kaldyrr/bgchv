import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { qwikify$ } from '@builder.io/qwik-react';
import type React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

type Overview = {
  companies: number; contacts: number; deals: number; dealsOpen: number; dealsWon: number; dealsLost: number;
  revenueTotal: number; avgDealValue: number; avgDaysToClose: number | null; conversionRate: number;
};

type RevenuePoint = { month: string; revenue: number };
type TopCompany = { companyId: string; name: string; revenue: number };
type EventsPoint = { day: string; events: number };

// Lazy React charts via qwik-react
const Charts = qwikify$<{
  revenue: RevenuePoint[];
  topCompanies: TopCompany[];
  events: EventsPoint[];
}>(({ revenue, topCompanies, events }) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={revenue} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={topCompanies} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <LineChart data={events} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="events" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

export default component$(() => {
  const overview = useSignal<Overview | null>(null);
  const revenue = useSignal<RevenuePoint[]>([]);
  const topCompanies = useSignal<TopCompany[]>([]);
  const events = useSignal<EventsPoint[]>([]);

  useVisibleTask$(async () => {
    const [o, r, t, e] = await Promise.all([
      fetch('/api/analytics/overview').then((r) => r.json()),
      fetch('/api/analytics/revenue-monthly').then((r) => r.json()),
      fetch('/api/analytics/top-companies').then((r) => r.json()),
      fetch('/api/analytics/events-summary').then((r) => r.json())
    ]);
    overview.value = o;
    revenue.value = r;
    topCompanies.value = t;
    events.value = e;
  });

  return (
    <div class="mx-auto max-w-6xl p-4 space-y-6">
      <h1 class="text-xl font-semibold">Analytics</h1>

      {overview.value && (
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="rounded-md border p-3 bg-white">
            <div class="text-xs text-neutral-500">Companies</div>
            <div class="text-lg font-semibold">{overview.value.companies}</div>
          </div>
          <div class="rounded-md border p-3 bg-white">
            <div class="text-xs text-neutral-500">Contacts</div>
            <div class="text-lg font-semibold">{overview.value.contacts}</div>
          </div>
          <div class="rounded-md border p-3 bg-white">
            <div class="text-xs text-neutral-500">Deals (Open)</div>
            <div class="text-lg font-semibold">{overview.value.dealsOpen}</div>
          </div>
          <div class="rounded-md border p-3 bg-white">
            <div class="text-xs text-neutral-500">Revenue</div>
            <div class="text-lg font-semibold">${'{'}overview.value.revenueTotal.toLocaleString(){'}'}</div>
          </div>
          <div class="rounded-md border p-3 bg-white">
            <div class="text-xs text-neutral-500">Avg Deal Value</div>
            <div class="text-lg font-semibold">${'{'}overview.value.avgDealValue.toLocaleString(){'}'}</div>
          </div>
          <div class="rounded-md border p-3 bg-white">
            <div class="text-xs text-neutral-500">Avg Days to Close</div>
            <div class="text-lg font-semibold">{overview.value.avgDaysToClose ?? '-'}</div>
          </div>
          <div class="rounded-md border p-3 bg-white">
            <div class="text-xs text-neutral-500">Conversion</div>
            <div class="text-lg font-semibold">{Math.round(overview.value.conversionRate * 100)}%</div>
          </div>
        </div>
      )}

      <Charts revenue={revenue.value} topCompanies={topCompanies.value} events={events.value} />
    </div>
  );
});
