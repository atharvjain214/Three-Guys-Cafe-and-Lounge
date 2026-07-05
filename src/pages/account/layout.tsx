import * as React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, User, ShoppingBag, Calendar, Heart, Award, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/account", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/orders", label: "Orders", icon: ShoppingBag },
  { to: "/account/reservations", label: "Reservations", icon: Calendar },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/loyalty", label: "Loyalty", icon: Award },
  { to: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountLayout() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) navigate("/auth/sign-in");
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center pt-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Member</p>
                </div>
              </div>
              <nav className="mt-4 flex flex-col gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
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
                <Button variant="ghost" className="mt-2 justify-start gap-3 text-destructive hover:text-destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
