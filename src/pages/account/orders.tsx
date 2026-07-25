import * as React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setOrders(data as Order[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Order History</h1>
      <p className="mt-1 text-muted-foreground">View and track all your orders.</p>
      {orders.length === 0 ? (
        <Card className="mt-6 p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No orders yet</h3>
          <p className="mt-2 text-muted-foreground">When you place an order, it will appear here.</p>
          <Button asChild className="mt-4"><Link to="/menu">Browse Menu <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })} · {order.order_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{order.total.toFixed(0)}</p>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{order.status.replace("_", " ")}</span>
                </div>
                <Button variant="outline" size="sm" asChild><Link to={`/order-tracking/${order.order_number}`}>Track Order</Link></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
