import * as React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Utensils, ShoppingBag, Calendar, Users, Package, TicketPercent, Image, FileText, Settings, LogOut, Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/reservations", label: "Reservations", icon: Calendar },
  { to: "/admin/menu", label: "Menu Management", icon: Utensils },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/cms", label: "CMS", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) navigate("/auth/sign-in");
    if (!loading && user && role && role !== "admin" && role !== "manager" && role !== "staff") {
      navigate("/account");
    }
  }, [user, role, loading, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground">
            <span className="font-display text-sm font-bold">3</span>
          </div>
          <span className="font-display font-semibold">Admin</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
          {sidebarOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-card transition-transform lg:sticky lg:top-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="hidden items-center gap-2 border-b p-6 lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground">
                <span className="font-display text-lg font-bold">3</span>
              </div>
              <div>
                <p className="font-display font-semibold">Three Guys</p>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="border-t p-4">
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={async () => { await signOut(); navigate("/"); }}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
