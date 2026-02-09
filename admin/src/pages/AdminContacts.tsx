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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = (await adminApi.contacts.list()) as ContactRow[];
      setContacts(data);
    } catch (e) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = async (c: ContactRow) => {
    setSelected(c);
    if (!c.read) {
      try {
        await adminApi.contacts.markRead(c.id);
        setContacts((prev) => prev.map((x) => (x.id === c.id ? { ...x, read: true } : x)));
      } catch {
        toast.error('Could not mark message as read');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-display text-foreground">Contact messages</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((c) => (
                <TableRow
                  key={c.id}
                  className={c.read ? '' : 'bg-muted/50'}
                  onClick={() => open(c)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.subject}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                  </TableCell>
                  <TableCell>{c.read ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(isOpen) => !isOpen && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.subject ?? 'Message'}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">From:</span> {selected.name ?? ''} &lt;{selected.email ?? ''}&gt;</p>
              {selected.phone && <p><span className="text-muted-foreground">Phone:</span> {selected.phone}</p>}
              <p className="pt-4 whitespace-pre-wrap">{selected.message ?? ''}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
