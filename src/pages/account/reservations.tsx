import * as React from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/stores/auth-context";
import { supabase } from "@/lib/supabase";
import type { Reservation } from "@/types";

export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("reservations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setReservations(data as Reservation[] ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" /></div>;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">My Reservations</h1>
      <p className="mt-1 text-muted-foreground">Manage your table bookings.</p>
      {reservations.length === 0 ? (
        <Card className="mt-6 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No reservations yet</h3>
          <Button asChild className="mt-4"><Link to="/reservation">Book a Table</Link></Button>
        </Card>
      ) : (
        <div className="mt-6 space-y-3">
          {reservations.map((res) => (
            <Card key={res.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{res.reservation_number}</p>
                  <p className="text-sm text-muted-foreground">{new Date(res.reservation_date).toLocaleDateString("en-US", { dateStyle: "full" })} at {res.reservation_time}</p>
                  <p className="text-sm text-muted-foreground">{res.party_size} guests</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{res.status}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
