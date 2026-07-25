import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const STATUSES = ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  seated: "bg-green-500/10 text-green-600 border-green-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  no_show: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function AdminReservations() {
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const fetchReservations = React.useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reservations")
      .select("id, reservation_number, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, occasion, created_at")
      .order("reservation_date", { ascending: false });

    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search.trim()) query = query.or(`guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,reservation_number.ilike.%${search}%`);

    const { data, error } = await query.limit(50);
    if (error) { toast.error(error.message); setLoading(false); return; }
    setReservations(data ?? []);
    setLoading(false);
  }, [statusFilter, search]);

  React.useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Reservation ${status.replace(/_/g, " ")}`);
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Reservations</h1>
      <p className="mt-1 text-muted-foreground">Manage restaurant table reservations.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, or reservation #..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Res #</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Guest</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Party</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Occasion</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : reservations.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground"><Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />No reservations found</td></tr>
              ) : (
                reservations.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{r.reservation_number ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{r.guest_name}</p>
                      <p className="text-xs text-muted-foreground">{r.guest_email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{r.party_size}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(r.reservation_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.reservation_time?.slice(0, 5)}</td>
                    <td className="px-4 py-3 text-sm capitalize">{r.occasion ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-medium capitalize ${statusColor[r.status] ?? ""}`}>{r.status.replace(/_/g, " ")}</span></td>
                    <td className="px-4 py-3">
                      <Select onValueChange={(v) => updateStatus(r.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Update" /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace(/_/g, " ")}</SelectItem>)}
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
    </div>
  );
}
