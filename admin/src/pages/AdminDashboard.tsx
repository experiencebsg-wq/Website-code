import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  Mail,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { adminApi } from '@/services/adminApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  size?: string;
  priceNGN: number;
  priceUSD: number;
}

export interface Order {
  id: string;
  orderId: string;
  email: string;
  phone: string;
  whatsapp?: string;
  shipping: Record<string, unknown>;
  notes?: string;
  paymentReference?: string;
  status: string;
  totalNGN: number;
  totalUSD: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(38, 92%, 50%)',
  paid: 'hsl(142, 76%, 36%)',
  processing: 'hsl(199, 89%, 48%)',
  shipped: 'hsl(262, 83%, 58%)',
  delivered: 'hsl(142, 76%, 36%)',
  cancelled: 'hsl(0, 72%, 51%)',
};

function formatNGN(value: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const data = (await adminApi.orders.list()) as Order[];
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalNGN = orders.reduce((s, o) => s + (o.totalNGN ?? 0), 0);
    const totalUSD = orders.reduce((s, o) => s + (o.totalUSD ?? 0), 0);
    const pending = orders.filter((o) => o.status === 'pending').length;
    const paidOrComplete = orders.filter((o) =>
      ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)
    ).length;
    return { totalOrders, totalNGN, totalUSD, pending, paidOrComplete };
  }, [orders]);

  const salesByDay = useMemo(() => {
    const days: Record<string, { ngn: number; count: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      days[key] = { ngn: 0, count: 0 };
    }
    orders.forEach((o) => {
      const key = o.createdAt.slice(0, 10);
      if (days[key]) {
        days[key].ngn += o.totalNGN ?? 0;
        days[key].count += 1;
      }
    });
    return Object.entries(days)
      .map(([date, v]) => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        fullDate: date,
        revenue: stats.totalNGN ? Math.round((v.ngn / stats.totalNGN) * 100) : 0,
        ngn: v.ngn,
        orders: v.count,
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [orders, stats.totalNGN]);

  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.status || 'pending';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [orders]
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[40vh]"
      >
        <p className="text-muted-foreground">Loading dashboard…</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive"
      >
        <p>{error}</p>
        <p className="text-sm mt-2 text-muted-foreground">Ensure the API server is running.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-display font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Sales analytics and overview
        </p>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/products"
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 hover:border-gold transition-colors"
        >
          <Package className="h-10 w-10 text-gold" />
          <div>
            <p className="font-medium text-foreground">Products</p>
            <p className="text-sm text-muted-foreground">Manage catalog</p>
          </div>
        </Link>
        <Link
          to="/orders"
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 hover:border-gold transition-colors"
        >
          <ShoppingBag className="h-10 w-10 text-gold" />
          <div>
            <p className="font-medium text-foreground">Orders</p>
            <p className="text-sm text-muted-foreground">View & update orders</p>
          </div>
        </Link>
        <Link
          to="/contacts"
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 hover:border-gold transition-colors"
        >
          <Mail className="h-10 w-10 text-gold" />
          <div>
            <p className="font-medium text-foreground">Contacts</p>
            <p className="text-sm text-muted-foreground">Customer messages</p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-sm font-medium">Total Orders</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium">Revenue (NGN)</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{formatNGN(stats.totalNGN)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total sales</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Revenue (USD)</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{formatUSD(stats.totalUSD)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total sales</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
          <p className="text-xs text-muted-foreground mt-1">Awaiting action</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Sales over time (last 30 days)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(0, 0%, 18%)' }}
                />
                <YAxis
                  tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(0, 0%, 18%)' }}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 8%)',
                    border: '1px solid hsl(0, 0%, 18%)',
                    borderRadius: '4px',
                  }}
                  labelStyle={{ color: 'hsl(0, 0%, 98%)' }}
                  formatter={(value: number) => [formatNGN(value), 'Revenue']}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date ? `Date: ${payload[0].payload.date}` : ''
                  }
                />
                <Area
                  type="monotone"
                  dataKey="ngn"
                  name="Revenue"
                  stroke="hsl(43, 74%, 49%)"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Daily revenue in NGN</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Orders by status</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {ordersByStatus.length > 0 ? (
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: 'hsl(0, 0%, 65%)' }}
                  >
                    {ordersByStatus.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[entry.name] || `hsl(${200 + i * 40}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 8%)',
                      border: '1px solid hsl(0, 0%, 18%)',
                      borderRadius: '4px',
                    }}
                    formatter={(value: number) => [value, 'Orders']}
                  />
                  <Legend
                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No orders yet
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">Recent orders</h3>
          <Link
            to="/orders"
            className="text-sm text-gold hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Order ID</TableHead>
              <TableHead className="text-muted-foreground">Customer</TableHead>
              <TableHead className="text-muted-foreground">Total (NGN)</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No orders yet
                </TableCell>
              </TableRow>
            ) : (
              recentOrders.map((order) => (
                <TableRow key={order.id} className="border-border">
                  <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell>{formatNGN(order.totalNGN)}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize"
                      style={{
                        backgroundColor: `${STATUS_COLORS[order.status] || 'hsl(0,0%,30%)'}22`,
                        color: STATUS_COLORS[order.status] || 'hsl(0, 0%, 80%)',
                      }}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/orders"
                      className="text-gold hover:underline text-sm inline-flex items-center"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
