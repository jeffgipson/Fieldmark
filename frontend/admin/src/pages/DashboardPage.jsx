import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getStats } from "../api/stats";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import ChartTooltip from "../components/charts/ChartTooltip";
import { CHART_COLORS } from "../constants/chartColors";
import { formatCents, formatCompactCents } from "../utils/money";

const QUICK_LINKS = [
  { to: "/users", label: "Users", desc: "Accounts & roles" },
  { to: "/farms", label: "Farms", desc: "Fields & scenarios" },
  { to: "/vendors", label: "Vendors", desc: "Directory listings" },
  { to: "/benchmarks", label: "Benchmarks", desc: "MU Extension costs" },
  { to: "/payments", label: "Stripe", desc: "Subscriptions & fees" }
];

function ChartCard({ title, children, className = "" }) {
  return (
    <Card className={className}>
      <h2 className="font-display font-semibold text-fm-ink mb-4">{title}</h2>
      {children}
    </Card>
  );
}

function RecentList({ title, items, emptyMessage, renderItem, footerLink, footerLabel }) {
  return (
    <Card>
      <h2 className="font-display font-semibold text-fm-ink mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-fm-gray-medium">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {items.map(renderItem)}
        </ul>
      )}
      {footerLink && (
        <Link
          to={footerLink}
          className="mt-4 inline-block text-sm font-medium text-fm-teal hover:text-fm-teal-hover"
        >
          {footerLabel} →
        </Link>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const dashboard = await getStats();
        setData(dashboard);
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const subscriptionChartData = useMemo(() => {
    if (!data?.subscriptions) return [];
    const grouped = {};
    data.subscriptions.forEach(({ plan, status, count }) => {
      const key = plan.charAt(0).toUpperCase() + plan.slice(1);
      grouped[key] = grouped[key] || { plan: key, active: 0, past_due: 0, canceled: 0 };
      grouped[key][status] = count;
    });
    return Object.values(grouped);
  }, [data]);

  const revenueChartData = useMemo(() => {
    if (!data?.payments?.monthly_revenue) return [];
    return data.payments.monthly_revenue.map((m) => ({
      label: m.label,
      farmer: m.farmer_cents / 100,
      vendor: m.vendor_cents / 100
    }));
  }, [data]);

  const vendorPieData = useMemo(() => {
    if (!data?.vendors_by_category) return [];
    return data.vendors_by_category.slice(0, 6).map((v) => ({
      name: v.label,
      value: v.count
    }));
  }, [data]);

  if (loading) return <div>Loading dashboard…</div>;
  if (error && !data) return <p className="text-red-500">{error}</p>;
  if (!data) return null;

  const { counts, payments } = data;
  const needsSeed = counts.users <= 1 && counts.farms === 0;
  const paymentSummary = payments?.summary;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${counts.farmers} farmers · ${counts.farmer_farms} farms · ${counts.total_acres.toLocaleString()} acres tracked`}
      />

      {needsSeed && (
        <Card className="mb-6 border-l-4 border-l-fm-gold bg-fm-gold-muted">
          <p className="font-display font-semibold text-fm-ink">No sample data in this database</p>
          <p className="mt-2 text-sm text-fm-charcoal">
            Only the admin account exists. Load demo farmers, farms, and vendors:
          </p>
          <pre className="mt-3 rounded-lg bg-fm-gray-light/80 p-3 text-sm overflow-x-auto">
            cd api{"\n"}bin/rails db:seed
          </pre>
          <p className="mt-2 text-xs text-fm-gray-medium">
            Refresh this page after seeding (~1 minute for 100 farmers).
          </p>
        </Card>
      )}

      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-fm-md border border-fm-input-border bg-white px-4 py-3 shadow-fm-card transition hover:border-fm-teal hover:shadow-fm-card-hover"
          >
            <p className="font-display font-semibold text-fm-ink">{link.label}</p>
            <p className="text-xs text-fm-gray-medium mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <StatCard title="Farmers" value={counts.farmers} />
        <StatCard title="Farms" value={counts.farmer_farms} />
        <StatCard
          title="Total acres"
          value={counts.total_acres.toLocaleString()}
          hint="Farmer-owned farms"
        />
        <StatCard title="Fields" value={counts.fields} />
        <StatCard title="Scenarios" value={counts.scenarios} />
        <StatCard
          title="MRR"
          value={paymentSummary ? formatCents(paymentSummary.mrr_cents) : "—"}
          hint={paymentSummary ? `${paymentSummary.active_subscriptions} active subs` : undefined}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Vendors" value={counts.vendors} />
        <StatCard title="Benchmarks" value={counts.benchmarks} />
        <StatCard title="Decisions logged" value={counts.decisions} />
        <StatCard
          title="AI reports"
          value={counts.reports}
          hint={`${counts.conversations} conversations`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <ChartCard title="New farmer signups">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.signups_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Signups"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="New farms">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.farms_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Farms" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <ChartCard title="Farms by region">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.farms_by_region} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Farms" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Farms by commodity">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.farms_by_commodity.map((r) => ({ name: r.label, value: r.count }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    percent > 0.06 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {data.farms_by_commodity.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <ChartCard title="Revenue (last 6 months)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  content={
                    <ChartTooltip
                      valueFormatter={(v) => formatCents(Math.round(v * 100))}
                    />
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="farmer"
                  name="Farmers"
                  stackId="1"
                  stroke={CHART_COLORS[0]}
                  fill={CHART_COLORS[0]}
                  fillOpacity={0.5}
                />
                <Area
                  type="monotone"
                  dataKey="vendor"
                  name="Vendors"
                  stackId="1"
                  stroke={CHART_COLORS[1]}
                  fill={CHART_COLORS[1]}
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {paymentSummary && (
            <p className="mt-3 text-sm text-fm-gray-medium">
              30-day volume: {formatCompactCents(paymentSummary.total_volume_cents_30d)}
              {" · "}
              <Link to="/payments" className="text-fm-teal hover:underline">
                View all transactions
              </Link>
            </p>
          )}
        </ChartCard>

        <ChartCard title="Subscriptions by plan">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
                <XAxis dataKey="plan" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="active" name="Active" fill={CHART_COLORS[0]} stackId="a" />
                <Bar dataKey="past_due" name="Past due" fill={CHART_COLORS[4]} stackId="a" />
                <Bar dataKey="canceled" name="Canceled" fill={CHART_COLORS[2]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4 mb-8">
        <RecentList
          title="Recent signups"
          items={data.recent_users}
          emptyMessage="No users yet."
          footerLink="/users"
          footerLabel="All users"
          renderItem={(user) => (
            <li key={user.id} className="border-b border-fm-gray-light pb-3 last:border-0 last:pb-0">
              <p className="font-medium text-fm-ink">{user.name}</p>
              <p className="text-xs text-fm-gray-medium">{user.email}</p>
              <p className="text-xs text-fm-gray-medium mt-0.5 capitalize">
                {user.role} · {user.plan} · {new Date(user.created_at).toLocaleDateString()}
              </p>
            </li>
          )}
        />

        <RecentList
          title="Recent farms"
          items={data.recent_farms}
          emptyMessage="No farms yet."
          footerLink="/farms"
          footerLabel="All farms"
          renderItem={(farm) => (
            <li key={farm.id} className="border-b border-fm-gray-light pb-3 last:border-0 last:pb-0">
              <p className="font-medium text-fm-ink">{farm.name}</p>
              <p className="text-xs text-fm-gray-medium">
                {farm.county} · {farm.region} · {farm.total_acres} ac
              </p>
              <p className="text-xs text-fm-gray-medium mt-0.5">
                {farm.owner_name} · {new Date(farm.created_at).toLocaleDateString()}
              </p>
            </li>
          )}
        />

        <ChartCard title="Vendors by category">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vendorPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                >
                  {vendorPieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="AI report status">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.reports_by_status}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Reports" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
