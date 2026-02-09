import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingBag, Mail, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { email, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const nav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/contacts', label: 'Contacts', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-gold text-lg">BSG Admin</h2>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted hover:text-foreground ${
                  isActive ? 'bg-muted text-foreground text-gold' : 'text-muted-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
