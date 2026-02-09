import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminApi } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface OrderDetail {
  orderId: string;
  email: string;
  phone: string;
  whatsapp: string;
  shipping: { firstName: string; lastName: string; address: string; city: string; state: string; country: string; postalCode?: string };
  status: string;
  totalNGN: number;
  totalUSD: number;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  items: { productName: string; slug: string; quantity: number; size?: string; priceNGN: number; priceUSD: number }[];
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = (await adminApi.orders.get(id)) as OrderDetail;
        setOrder(data);
      } catch (e) {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    try {
      await adminApi.orders.updateStatus(id, status);
      toast.success('Order updated');
      setOrder((o) => (o ? { ...o, status } : null));
    } catch (e) {
      toast.error('Update failed');
    }
  };

  if (loading || !order) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  const s = order.shipping || ({} as OrderDetail['shipping']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-display text-foreground">Order {order.orderId}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-display text-lg text-foreground">Contact</h2>
          <p><span className="text-muted-foreground">Email:</span> {order.email}</p>
          <p><span className="text-muted-foreground">Phone:</span> {order.phone}</p>
          <p><span className="text-muted-foreground">WhatsApp:</span> {order.whatsapp}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-display text-lg text-foreground">Shipping</h2>
          <p>{s.firstName} {s.lastName}</p>
          <p>{s.address}, {s.city}, {s.state} {s.postalCode}</p>
          <p>{s.country}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-foreground">Status</h2>
          <Select value={order.status} onValueChange={updateStatus}>
            <SelectTrigger className="w-40">
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
        </div>
        {order.paymentReference && (
          <p className="text-muted-foreground text-sm">Payment ref: {order.paymentReference}</p>
        )}
        {order.notes && (
          <p className="text-muted-foreground text-sm mt-2">Notes: {order.notes}</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-lg text-foreground mb-4">Items</h2>
        <ul className="space-y-2">
          {order.items?.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>{item.productName} {item.size && `(${item.size})`} × {item.quantity}</span>
              <span>₦{(item.priceNGN * item.quantity).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-border flex justify-between font-medium">
          <span>Total</span>
          <span>₦{order.totalNGN?.toLocaleString()} / ${order.totalUSD}</span>
        </div>
      </div>
    </motion.div>
  );
}
