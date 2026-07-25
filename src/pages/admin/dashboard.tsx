import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Calendar, Users, DollarSign, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({ totalOrders: 0, totalRevenue: 0, totalReservations: 0, totalCustomers: 0, pendingOrders: 0, todayRevenue: 0 });
  const [recentOrders, setRecentOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const [ordersRes, reservationsRes, usersRes] = await Promise.all([
        supabase.from("orders").select("total, status, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("reservations").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }),
      ]);

      const orders = ordersRes.data ?? [];
      const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const today = new Date().toISOString().split("T")[0];
      const todayOrders = orders.filter((o) => o.created_at.startsWith(today));
      const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalReservations: reservationsRes.count ?? 0,
        totalCustomers: usersRes.count ?? 0,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        todayRevenue,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success" },
    { label: "Today's Revenue", value: `₹${stats.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-accent" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-info" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "text-warning" },
    { label: "Reservations", value: stats.totalReservations, icon: Calendar, color: "text-primary" },
    { label: "Customers", value: stats.totalCustomers, icon: Users, color: "text-destructive" },
  ];

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Welcome to the Three Guys admin panel.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <card.icon className={`h-8 w-8 ${card.color}`} />
                <span className="font-display text-2xl font-bold">{card.value}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold">Recent Orders</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td></tr>
                ) : (
                  recentOrders.map((order, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3 text-sm font-medium">{order.order_number ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm">₹{Number(order.total).toFixed(0)}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">{order.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
