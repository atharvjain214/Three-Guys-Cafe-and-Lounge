import * as React from "react";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminCustomers() {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, created_at, user:auth.users!user_roles_user_id_fkey(email)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) { toast.error(error.message); setLoading(false); return; }
      setCustomers(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = customers.filter((c: any) => {
    const email = c.user?.email ?? "";
    return email.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Customers</h1>
      <p className="mt-1 text-muted-foreground">View and manage customer accounts and roles.</p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by email or role..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => <Card key={i} className="h-40 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <Card className="col-span-full p-12 text-center text-muted-foreground"><Users className="mx-auto mb-2 h-8 w-8 opacity-50" />No customers found</Card>
        ) : (
          filtered.map((c: any, i) => (
            <motion.div key={c.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground">
                    <span className="font-display text-sm font-bold">{(c.user?.email ?? "?")[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.user?.email ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant="outline" className="capitalize">{c.role}</Badge>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
