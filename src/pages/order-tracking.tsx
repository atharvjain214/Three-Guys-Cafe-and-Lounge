import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, Package, ChefHat, Bike, Home, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Order, OrderTimelineEntry } from "@/types";
import { cn } from "@/lib/utils";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [timeline, setTimeline] = React.useState<OrderTimelineEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!orderNumber) return;
      const { data: orderData } = await supabase.from("orders").select("*, order_items(*)").eq("order_number", orderNumber).maybeSingle();
      if (orderData) {
        setOrder(orderData as Order);
        const { data: timelineData } = await supabase.from("order_timeline").select("*").eq("order_id", orderData.id).order("created_at");
        setTimeline(timelineData as OrderTimelineEntry[] ?? []);
      }
      setLoading(false);
    })();
  }, [orderNumber]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center pt-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-20 text-center">
        <h1 className="font-display text-3xl font-bold">Order not found</h1>
        <Button asChild className="mt-4"><Link to="/account/orders">View My Orders</Link></Button>
      </div>
    );
  }

  const currentStepIndex = order.status === "cancelled" ? -1 : statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="pt-20">
      <div className="container mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold">Order Tracking</h1>
          <p className="mt-2 text-muted-foreground">Order #{order.order_number}</p>
        </div>

        {isCancelled ? (
          <Card className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold">Order Cancelled</h2>
            <p className="mt-2 text-muted-foreground">This order has been cancelled.</p>
          </Card>
        ) : (
          <Card className="p-6 md:p-8">
            {/* Timeline */}
            <div className="flex justify-between">
              {statusSteps.map((step, i) => {
                const isComplete = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                          isComplete ? "bg-gradient-gold text-primary-foreground" : "bg-muted text-muted-foreground",
                          isCurrent && "animate-glow-pulse"
                        )}
                      >
                        <step.icon className="h-5 w-5" />
                      </motion.div>
                      <span className={cn("mt-2 text-center text-xs", isComplete ? "font-medium text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className="mt-6 flex-1">
                        <div className={cn("h-1 rounded-full transition-colors", i < currentStepIndex ? "bg-accent" : "bg-muted")} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Order details */}
            <div className="mt-8 rounded-xl border p-4">
              <h3 className="mb-3 font-semibold">Order Items</h3>
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.menu_item_name}</span>
                  <span>₹{item.line_total.toFixed(0)}</span>
                </div>
              ))}
              <div className="mt-3 border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{order.total.toFixed(0)}</span>
              </div>
            </div>

            {/* Timeline entries */}
            {timeline.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-semibold">Status Updates</h3>
                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-accent" />
                      <div>
                        <p className="font-medium capitalize">{entry.status.replace("_", " ")}</p>
                        {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
