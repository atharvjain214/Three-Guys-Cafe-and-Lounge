import * as React from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { toast } from "sonner";

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "completed", "cancelled", "refunded"];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  preparing: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  ready: "bg-green-500/10 text-green-600 border-green-500/20",
  out_for_delivery: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function AdminOrders() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(0);
  const pageSize = 20;

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("id, order_number, status, total, payment_status, order_type, contact_email, contact_phone, created_at")
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search.trim()) query = query.or(`order_number.ilike.%${search}%,contact_email.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) { toast.error(error.message); setLoading(false); return; }
    setOrders(data ?? []);
    setLoading(false);
  }, [page, statusFilter, search]);

  React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await api.updateOrderStatus({ order_id: id, status });
    if (error) { toast.error(error); return; }
    toast.success(`Order marked as ${status}`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Orders</h1>
          <p className="mt-1 text-muted-foreground">Manage and track all customer orders.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order # or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Order #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Payment</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground"><ShoppingBag className="mx-auto mb-2 h-8 w-8 opacity-50" />No orders found</td></tr>
              ) : (
                orders.map((order, i) => (
                  <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{order.order_number ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.contact_email ?? "—"}</td>
                    <td className="px-4 py-3 text-sm capitalize">{order.order_type?.replace(/_/g, " ") ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-medium">₹{Number(order.total).toFixed(0)}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{order.payment_status}</Badge></td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-medium capitalize ${statusColor[order.status] ?? ""}`}>{order.status.replace(/_/g, " ")}</span></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Select onValueChange={(v) => updateStatus(order.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace(/_/g, " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page + 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={orders.length < pageSize} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
