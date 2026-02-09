import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface OrderRow {
  id: string;
  orderId: string;
  email: string;
  status: string;
  totalNGN: number;
  totalUSD: number;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const load = async () => {
    setLoading(true);
    try {
      const data = (await adminApi.orders.list(statusFilter || undefined)) as OrderRow[];
      setOrders(data);
    } catch (e) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.orders.updateStatus(orderId, status);
      toast.success('Order updated');
      load();
    } catch (e) {
      toast.error('Update failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-foreground">Orders</h1>
        <Select
          value={statusFilter || 'all'}
          onValueChange={(v) => setSearchParams(v === 'all' ? {} : { status: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total (NGN)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <Link to={`/orders/${o.orderId}`} className="text-gold hover:underline">
                      {o.orderId}
                    </Link>
                  </TableCell>
                  <TableCell>{o.email}</TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => updateStatus(o.orderId, v)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">₦{o.totalNGN?.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </TableCell>
                  <TableCell>
                    <Link to={`/orders/${o.orderId}`}>
                      <span className="text-gold hover:underline text-sm">View</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
