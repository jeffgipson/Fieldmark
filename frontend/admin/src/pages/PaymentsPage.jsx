import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getStripeDashboard } from "../api/stripe";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import ChartTooltip from "../components/charts/ChartTooltip";
import { CHART_COLORS } from "../constants/chartColors";
import { formatCents, formatCompactCents } from "../utils/money";
const STATUS_STYLES = {
  succeeded: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-slate-100 text-slate-700"
};

function SortHeader({ label, column, sortKey, sortDir, onSort }) {
  const active = sortKey === column;
  return (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-fm-gray-medium">
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-fm-teal"
      >
        {label}
        <span className="text-[10px]">{active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

export default function PaymentsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getStripeDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err?.message || "Failed to load Stripe dashboard.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  function handleSort(column) {
    if (sortKey === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column);
      setSortDir(column === "party_name" ? "asc" : "desc");
    }
  }

  const filteredTransactions = useMemo(() => {
    if (!dashboard?.transactions) return [];
    let rows = [...dashboard.transactions];

    if (categoryFilter !== "all") {
      rows = rows.filter((t) => t.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      rows = rows.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (t) =>
          t.party_name?.toLowerCase().includes(q) ||
          t.party_email?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.stripe_id?.toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "amount_cents":
          cmp = a.amount_cents - b.amount_cents;
          break;
        case "party_name":
          cmp = (a.party_name || "").localeCompare(b.party_name || "");
          break;
        case "status":
          cmp = (a.status || "").localeCompare(b.status || "");
          break;
        case "type":
          cmp = (a.type || "").localeCompare(b.type || "");
          break;
        case "category":
          cmp = (a.category || "").localeCompare(b.category || "");
          break;
        default:
          cmp = new Date(a.created_at) - new Date(b.created_at);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [dashboard, categoryFilter, statusFilter, search, sortKey, sortDir]);

  const monthlyChartData = useMemo(() => {
    if (!dashboard?.monthly_revenue) return [];
    return dashboard.monthly_revenue.map((m) => ({
      ...m,
      farmer: m.farmer_cents / 100,
      vendor: m.vendor_cents / 100,
      total: m.total_cents / 100
    }));
  }, [dashboard]);

  const pieData = useMemo(() => {
    if (!dashboard?.revenue_by_type) return [];
    return dashboard.revenue_by_type.map((r) => ({
      name: r.label,
      value: Math.max(r.amount_cents, 0) / 100
    }));
  }, [dashboard]);

  const subscriptionChartData = useMemo(() => {
    if (!dashboard?.subscription_breakdown) return [];
    const grouped = {};
    dashboard.subscription_breakdown.forEach(({ plan, status, count }) => {
      const key = plan.charAt(0).toUpperCase() + plan.slice(1);
      grouped[key] = grouped[key] || { plan: key, active: 0, past_due: 0, canceled: 0 };
      grouped[key][status] = count;
    });
    return Object.values(grouped);
  }, [dashboard]);

  if (loading) return <div>Loading Stripe data…</div>;
  if (error && !dashboard) return <p className="text-red-500">{error}</p>;
  if (!dashboard) return null;

  const { summary } = dashboard;

  return (
    <div>
      <PageHeader
        title="Stripe"
        subtitle="Subscription and vendor payment activity"
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="MRR" value={formatCents(summary.mrr_cents)} hint="Active farmer subs" />
        <StatCard
          title="30-day volume"
          value={formatCompactCents(summary.total_volume_cents_30d)}
        />
        <StatCard title="Transactions" value={summary.transaction_count} />
        <StatCard title="Farmer payments" value={summary.farmer_transaction_count} />
        <StatCard title="Vendor payments" value={summary.vendor_transaction_count} />
        <StatCard
          title="Failed (30d)"
          value={summary.failed_payments_30d}
          hint={`${summary.active_subscriptions} active subs`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <h2 className="font-display font-semibold text-fm-ink mb-4">Revenue by month</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
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
        </Card>

        <Card>
          <h2 className="font-display font-semibold text-fm-ink mb-4">Revenue by type</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCents(v * 100)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <h2 className="font-display font-semibold text-fm-ink mb-4">Subscriptions by plan</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subscriptionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe8e3" />
              <XAxis dataKey="plan" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="active" name="Active" fill={CHART_COLORS[0]} stackId="a" />
              <Bar dataKey="past_due" name="Past due" fill={CHART_COLORS[4]} stackId="a" />
              <Bar dataKey="canceled" name="Canceled" fill={CHART_COLORS[2]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <h2 className="font-display font-semibold text-fm-ink">Transactions</h2>
          <p className="text-sm text-fm-gray-medium">
            Showing {filteredTransactions.length} of {dashboard.transactions.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-fm-sm border border-fm-input-border px-3 py-2 text-sm"
          >
            <option value="all">All parties</option>
            <option value="farmer">Farmers</option>
            <option value="vendor">Vendors</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-fm-sm border border-fm-input-border px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            type="search"
            placeholder="Search name, email, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-fm-sm border border-fm-input-border px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-fm-input-border bg-fm-gray-light/50">
              <tr>
                <SortHeader label="Date" column="created_at" {...{ sortKey, sortDir, onSort: handleSort }} />
                <SortHeader label="Party" column="party_name" {...{ sortKey, sortDir, onSort: handleSort }} />
                <SortHeader label="Type" column="type" {...{ sortKey, sortDir, onSort: handleSort }} />
                <SortHeader label="Category" column="category" {...{ sortKey, sortDir, onSort: handleSort }} />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-fm-gray-medium">
                  Description
                </th>
                <SortHeader label="Amount" column="amount_cents" {...{ sortKey, sortDir, onSort: handleSort }} />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-fm-gray-medium">
                  Net
                </th>
                <SortHeader label="Status" column="status" {...{ sortKey, sortDir, onSort: handleSort }} />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-fm-gray-medium">
                  Stripe ID
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-fm-gray-light hover:bg-fm-teal-subtle/40">
                  <td className="px-3 py-2 whitespace-nowrap text-fm-charcoal">
                    {new Date(t.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-fm-ink">{t.party_name}</p>
                    {t.party_email && (
                      <p className="text-xs text-fm-gray-medium">{t.party_email}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 capitalize">{t.type?.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2 capitalize">{t.category}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate" title={t.description}>
                    {t.description}
                  </td>
                  <td
                    className={`px-3 py-2 font-mono whitespace-nowrap ${
                      t.amount_cents < 0 ? "text-red-600" : "text-fm-ink"
                    }`}
                  >
                    {formatCents(t.amount_cents)}
                  </td>
                  <td className="px-3 py-2 font-mono whitespace-nowrap text-fm-gray-medium">
                    {formatCents(t.net_cents)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_STYLES[t.status] || "bg-slate-100"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-fm-gray-medium max-w-[140px] truncate">
                    {t.stripe_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <p className="py-8 text-center text-fm-gray-medium">No transactions match your filters.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
