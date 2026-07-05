import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Calendar, Heart, Award, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth-context";
import { useWishlistStore } from "@/stores/wishlist-store";
import { supabase } from "@/lib/supabase";
import type { Order, Reservation } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const [ordersRes, resRes, loyaltyRes] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("reservations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("loyalty_ledger").select("points, type").eq("user_id", user.id),
      ]);
      setOrders(ordersRes.data as Order[] ?? []);
      setReservations(resRes.data as Reservation[] ?? []);
      const ledger = loyaltyRes.data ?? [];
      const total = ledger.reduce((sum, e) => sum + (e.type === "earned" ? e.points : -e.points), 0);
      setLoyaltyPoints(total);
    })();
  }, [user]);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-accent" },
    { label: "Reservations", value: reservations.length, icon: Calendar, color: "text-info" },
    { label: "Wishlist Items", value: wishlistCount, icon: Heart, color: "text-destructive" },
    { label: "Loyalty Points", value: loyaltyPoints, icon: Award, color: "text-success" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Welcome back!</h1>
      <p className="mt-1 text-muted-foreground">Here's what's happening with your account.</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="font-display text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/account/orders">View All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No orders yet</p>
            <Button asChild className="mt-4"><Link to="/menu">Start Ordering</Link></Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} · ₹{order.total.toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{order.status}</span>
                  <Button variant="outline" size="sm" asChild><Link to={`/order-tracking/${order.order_number}`}>Track</Link></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Reservations */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Upcoming Reservations</h2>
          <Button variant="ghost" size="sm" asChild><Link to="/account/reservations">View All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        {reservations.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No reservations yet</p>
            <Button asChild className="mt-4"><Link to="/reservation">Book a Table</Link></Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {reservations.map((res) => (
              <Card key={res.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{res.reservation_number}</p>
                  <p className="text-sm text-muted-foreground">{new Date(res.reservation_date).toLocaleDateString()} at {res.reservation_time} · {res.party_size} guests</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{res.status}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
