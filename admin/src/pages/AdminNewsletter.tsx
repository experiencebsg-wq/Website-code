import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface SubscriberRow {
  id: string;
  email: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = (await adminApi.newsletter.list()) as SubscriberRow[];
      setSubscribers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load mailing list');
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display text-foreground">Mailing list</h1>
        <span className="text-sm text-muted-foreground">
          {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : subscribers.length === 0 ? (
        <p className="text-muted-foreground">No subscribers yet. Signups from the home page will appear here.</p>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="text-muted-foreground">Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
